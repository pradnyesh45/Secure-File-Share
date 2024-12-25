from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import File
from secure_file_share.apps.sharing.models import FileShare
from .serializers import FileSerializer
from .utils import encrypt_file, decrypt_file

class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return File.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        file_obj = self.request.FILES['file']
        file_data = file_obj.read()
        
        # Encrypt the file data
        encrypted_data, salt = encrypt_file(file_data)
        
        serializer.save(
            owner=self.request.user,
            encrypted_file=encrypted_data,
            encryption_salt=salt
        )

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        file_obj = self.get_object()
        
        if not file_obj.encrypted_file:
            return Response(
                {'error': 'No encrypted file found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Decrypt the file
        decrypted_data = decrypt_file(file_obj.encrypted_file, file_obj.encryption_salt)
        
        response = Response(decrypted_data, content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{file_obj.name}"'
        return response

class SharedFileViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return File.objects.filter(
            fileshare__shared_with=self.request.user,
            fileshare__expires_at__gt=timezone.now()
        ).distinct()

    @action(detail=True, methods=['post'])
    def download(self, request, pk=None):
        file = self.get_object()
        share = FileShare.objects.get(
            file=file,
            shared_with=request.user,
            expires_at__gt=timezone.now()
        )
        
        if share.share_type != 'DOWNLOAD':
            return Response(
                {'error': 'Download not allowed'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not file.encrypted_file:
            return Response(
                {'error': 'No encrypted file found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Decrypt the file
        decrypted_data = decrypt_file(file.encrypted_file, file.encryption_salt)
        
        response = Response(decrypted_data, content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{file.name}"'
        return response 