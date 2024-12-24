from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from datetime import timedelta

from .models import File, FileShare, FileUserPermission, FileVersion, Tag
from .serializers import (
    FileSerializer,
    FileShareSerializer,
    ShareLinkSerializer,
    UserShareSerializer,
    FileUserPermissionSerializer,
    FileVersionSerializer,
    VersionCreateSerializer,
    TagSerializer
)
from .services import VersionControlService
from .services.search import FileSearchService

User = get_user_model()

class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = File.objects.filter(owner=self.request.user)
        if self.request.query_params:
            search_service = FileSearchService()
            return search_service.search_files(queryset, self.request.query_params)
        return queryset

    def perform_create(self, serializer):
        file_obj = self.request.FILES.get('file')
        serializer.save(
            owner=self.request.user,
            content_type=file_obj.content_type,
            size=file_obj.size
        )

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        file = self.get_object()
        share_type = request.data.get('type', 'link')

        if share_type == 'link':
            serializer = ShareLinkSerializer(data=request.data)
            if serializer.is_valid():
                expiration_hours = serializer.validated_data['expiration_hours']
                share = FileShare.objects.create(
                    file=file,
                    created_by=request.user,
                    share_type='LINK',
                    expires_at=timezone.now() + timedelta(hours=expiration_hours)
                )
                return Response({
                    'share_link': request.build_absolute_uri(share.generate_share_link())
                })
        else:
            serializer = UserShareSerializer(data=request.data)
            if serializer.is_valid():
                try:
                    user = User.objects.get(email=serializer.validated_data['email'])
                    share = FileShare.objects.create(
                        file=file,
                        created_by=request.user,
                        shared_with=user,
                        share_type='USER'
                    )
                    return Response(FileShareSerializer(share).data)
                except User.DoesNotExist:
                    return Response(
                        {'error': 'User not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        file = self.get_object()
        content = file.get_decrypted_content()
        
        response = Response(content)
        response['Content-Type'] = file.content_type
        response['Content-Disposition'] = f'attachment; filename="{file.name}"'
        return response

    @action(detail=True, methods=['post'])
    def manage_permissions(self, request, pk=None):
        file = self.get_object()
        serializer = FileUserPermissionSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            # Check if user has permission to grant permissions
            if not request.user == file.owner:
                return Response(
                    {'error': 'Only file owner can manage permissions'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer.save(file=file)
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def permissions(self, request, pk=None):
        file = self.get_object()
        permissions = FileUserPermission.objects.filter(file=file)
        serializer = FileUserPermissionSerializer(permissions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'])
    def revoke_permission(self, request, pk=None):
        file = self.get_object()
        permission_id = request.data.get('permission_id')
        
        try:
            permission = FileUserPermission.objects.get(
                id=permission_id,
                file=file
            )
            if request.user == file.owner or request.user == permission.granted_by:
                permission.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            return Response(
                {'error': 'Not authorized to revoke this permission'},
                status=status.HTTP_403_FORBIDDEN
            )
        except FileUserPermission.DoesNotExist:
            return Response(
                {'error': 'Permission not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Get a preview of the file."""
        file = self.get_object()
        
        if not file.preview:
            file.generate_preview()
        
        if not file.preview:
            return Response(
                {'error': 'Preview not available'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if file.preview_type == 'text':
            return Response({
                'type': 'text',
                'content': file.preview.read().decode('utf-8')
            })
        
        # For images, return the URL
        return Response({
            'type': 'image',
            'url': request.build_absolute_uri(file.preview.url)
        })

    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """Get all versions of a file."""
        file = self.get_object()
        versions = file.versions.all()
        serializer = FileVersionSerializer(versions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def create_version(self, request, pk=None):
        """Create a new version of a file."""
        file = self.get_object()
        serializer = VersionCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            version_service = VersionControlService()
            version = version_service.create_version(
                file,
                serializer.validated_data['file'],
                request.user,
                serializer.validated_data.get('comment', '')
            )
            return Response(FileVersionSerializer(version).data)
        
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['post'])
    def restore_version(self, request, pk=None):
        """Restore a file to a specific version."""
        file = self.get_object()
        version_number = request.data.get('version_number')
        
        if not version_number:
            return Response(
                {'error': 'Version number is required'},
                status=400
            )
        
        version_service = VersionControlService()
        version = version_service.restore_version(
            file,
            version_number,
            request.user
        )
        
        if not version:
            return Response(
                {'error': 'Version not found'},
                status=404
            )
        
        return Response(FileVersionSerializer(version).data)

class SharedFileViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return File.objects.filter(
            fileshare__shared_with=self.request.user,
            fileshare__expires_at__gt=timezone.now()
        ).distinct() 

class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Tag.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

# Add to urls.py
router.register(r'tags', TagViewSet, basename='tag') 