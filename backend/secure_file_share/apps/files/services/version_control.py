from django.db import transaction
from ..models import File, FileVersion
from .file_handler import FileHandler

class VersionControlService:
    def __init__(self):
        self.file_handler = FileHandler()

    @transaction.atomic
    def create_version(self, file, new_file_obj, user, comment=''):
        """Create a new version of a file."""
        # Get the next version number
        latest_version = file.versions.first()
        next_version = 1 if not latest_version else latest_version.version_number + 1

        # Process the new file
        file_data = self.file_handler.save_file(new_file_obj, user)

        # Create the version record
        version = FileVersion.objects.create(
            file=file,
            version_number=next_version,
            file_data=file_data['path'],
            encrypted_key=file_data['key'],
            size=file_data['size'],
            created_by=user,
            comment=comment
        )

        # Update the current file
        file.file.name = file_data['path']
        file.encrypted_key = file_data['key']
        file.size = file_data['size']
        file.save()

        return version

    def get_version(self, file, version_number):
        """Get a specific version of a file."""
        try:
            return file.versions.get(version_number=version_number)
        except FileVersion.DoesNotExist:
            return None

    def restore_version(self, file, version_number, user):
        """Restore a file to a previous version."""
        version = self.get_version(file, version_number)
        if not version:
            return None

        # Create a new version with the current state
        current_version = self.create_version(
            file,
            file.file,
            user,
            f"Automatic version before restoring to v{version_number}"
        )

        # Restore the file to the selected version
        file.file = version.file_data
        file.encrypted_key = version.encrypted_key
        file.size = version.size
        file.save()

        return current_version 