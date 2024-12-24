from rest_framework import serializers
from .models import File, FileShare, FilePermissionType, FileUserPermission, FileVersion, Tag
from django.contrib.auth.models import User

class FileSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Tag.objects.all(),
        required=False
    )
    
    class Meta:
        model = File
        fields = [
            'id', 'name', 'uploaded_at', 'content_type',
            'size', 'download_url', 'tags', 'tag_ids'
        ]
        read_only_fields = ['id', 'uploaded_at', 'download_url']
    
    def get_download_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/files/{obj.id}/download/')
        return None

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids', None)
        if tag_ids is not None:
            instance.tags.set(tag_ids)
        return super().update(instance, validated_data)

class FileShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileShare
        fields = ['id', 'file', 'share_type', 'expires_at', 'created_at']
        read_only_fields = ['id', 'created_at']

class ShareLinkSerializer(serializers.Serializer):
    expiration_hours = serializers.IntegerField(min_value=1, max_value=720)  # Max 30 days

class UserShareSerializer(serializers.Serializer):
    email = serializers.EmailField() 

class FilePermissionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FilePermissionType
        fields = ['id', 'name', 'description']

class FileUserPermissionSerializer(serializers.ModelSerializer):
    permission_type_name = serializers.CharField(source='permission_type.name', read_only=True)
    user_email = serializers.EmailField(write_only=True)
    
    class Meta:
        model = FileUserPermission
        fields = [
            'id', 'file', 'user_email', 'permission_type',
            'permission_type_name', 'expires_at'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        user_email = validated_data.pop('user_email')
        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            raise serializers.ValidationError({'user_email': 'User not found'})
            
        validated_data['user'] = user
        validated_data['granted_by'] = self.context['request'].user
        return super().create(validated_data) 

class FileVersionSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = FileVersion
        fields = [
            'id', 'version_number', 'size', 'created_at',
            'created_by_username', 'comment'
        ]
        read_only_fields = ['id', 'version_number', 'size', 'created_at']

class VersionCreateSerializer(serializers.Serializer):
    file = serializers.FileField()
    comment = serializers.CharField(required=False, allow_blank=True) 

class TagSerializer(serializers.ModelSerializer):
    file_count = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'color', 'file_count']
        read_only_fields = ['id']

    def get_file_count(self, obj):
        return obj.files.count() 