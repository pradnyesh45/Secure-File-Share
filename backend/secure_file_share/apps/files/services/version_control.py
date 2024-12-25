from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os

class VersionControlService:
    @staticmethod
    def save_version(file_obj, version):
        """Save a new version of a file"""
        file_path = os.path.join(
            'versions',
            str(version.file.id),
            f'v{version.version_number}_{file_obj.name}'
        )
        
        path = default_storage.save(file_path, ContentFile(file_obj.read()))
        version.file_path = path
        version.save()
        
        return path

    @staticmethod
    def get_version_path(version):
        """Get the file path for a specific version"""
        return version.file_path

    @staticmethod
    def delete_version(version):
        """Delete a specific version's file"""
        if version.file_path and default_storage.exists(version.file_path):
            default_storage.delete(version.file_path) 