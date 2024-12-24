import os
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .encryption import FileEncryptionService

class FileHandler:
    def __init__(self):
        self.encryption_service = FileEncryptionService()

    def save_file(self, file_obj, user):
        """Save and encrypt a file."""
        # Read the file content
        file_content = file_obj.read()
        
        # Generate encryption key for this file
        key_data = self.encryption_service.generate_file_key()
        
        # Encrypt the file content
        encrypted_content = self.encryption_service.encrypt_file(
            file_content,
            key_data['key']
        )
        
        # Generate a secure filename
        filename = f"{os.urandom(16).hex()}{os.path.splitext(file_obj.name)[1]}"
        
        # Save the encrypted file
        path = default_storage.save(
            f"uploads/{filename}",
            ContentFile(encrypted_content)
        )
        
        return {
            'path': path,
            'key': key_data['key'],
            'salt': key_data['salt'],
            'original_name': file_obj.name,
            'content_type': file_obj.content_type,
            'size': file_obj.size
        }

    def read_file(self, file_path, encryption_key):
        """Read and decrypt a file."""
        with default_storage.open(file_path, 'rb') as f:
            encrypted_content = f.read()
            
        return self.encryption_service.decrypt_file(
            encrypted_content,
            encryption_key
        )

    def delete_file(self, file_path):
        """Securely delete a file."""
        if default_storage.exists(file_path):
            # In a production environment, you might want to implement
            # secure deletion by overwriting the file before deleting
            default_storage.delete(file_path) 