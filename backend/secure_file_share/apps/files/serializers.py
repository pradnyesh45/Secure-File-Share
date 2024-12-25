from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    
    class Meta:
        model = File
        fields = ['id', 'name', 'file', 'encrypted_file', 'owner', 'created_at', 'updated_at']
        read_only_fields = ['encrypted_file'] 