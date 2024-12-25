from rest_framework import serializers
from .models import FileShare
from secure_file_share.apps.files.serializers import FileSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class FileShareSerializer(serializers.ModelSerializer):
    file_details = FileSerializer(source='file', read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    shared_with_username = serializers.CharField(source='shared_with.username', read_only=True)

    class Meta:
        model = FileShare
        fields = ['id', 'file', 'file_details', 'owner', 'owner_username', 
                 'shared_with', 'shared_with_username', 'created_at', 
                 'updated_at', 'can_edit']
        read_only_fields = ['owner', 'created_at', 'updated_at'] 