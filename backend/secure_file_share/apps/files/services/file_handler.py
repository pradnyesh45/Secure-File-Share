import os
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from cryptography.fernet import Fernet

class FileHandler:
    def __init__(self):
        self.key = settings.FILE_ENCRYPTION_KEY.encode()
        self.cipher_suite = Fernet(self.key)

    def save_file(self, file, owner):
        """Save and encrypt a file."""
        # Read file content
        file_content = file.read()
        
        # Encrypt the content
        encrypted_content = self.cipher_suite.encrypt(file_content)
        
        # Generate a unique file path
        file_path = f'uploads/{owner.id}/{file.name}'
        
        # Save the encrypted content
        default_storage.save(file_path, ContentFile(encrypted_content))
        
        return {
            'path': file_path,
            'key': self.key,
            'content_type': file.content_type,
            'size': file.size
        }

    def read_file(self, file_path, encryption_key):
        """Read and decrypt a file."""
        if not default_storage.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        # Read the encrypted content
        with default_storage.open(file_path, 'rb') as f:
            encrypted_content = f.read()
            
        # Decrypt the content
        cipher_suite = Fernet(encryption_key)
        decrypted_content = cipher_suite.decrypt(encrypted_content)
        
        return decrypted_content

    def delete_file(self, file_path):
        """Delete a file from storage."""
        if default_storage.exists(file_path):
            default_storage.delete(file_path) 