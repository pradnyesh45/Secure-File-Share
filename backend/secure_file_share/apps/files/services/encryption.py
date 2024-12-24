import os
from base64 import b64encode, b64decode
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
from django.conf import settings

class FileEncryptionService:
    def __init__(self):
        self.master_key = settings.ENCRYPTION_MASTER_KEY.encode()

    def _derive_key(self, salt):
        """Derive a key using PBKDF2 with the master key."""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        return b64encode(kdf.derive(self.master_key))

    def generate_file_key(self):
        """Generate a unique encryption key for a file."""
        salt = os.urandom(16)
        key = self._derive_key(salt)
        return {
            'key': key,
            'salt': salt
        }

    def encrypt_file(self, file_content, key):
        """Encrypt file content using the provided key."""
        f = Fernet(key)
        return f.encrypt(file_content)

    def decrypt_file(self, encrypted_content, key):
        """Decrypt file content using the provided key."""
        f = Fernet(key)
        return f.decrypt(encrypted_content)

    def encrypt_file_key(self, file_key, user_public_key):
        """Encrypt the file key with user's public key for secure storage."""
        # In a real implementation, you would use the user's public key
        # to encrypt the file key. For this example, we'll use a simplified version.
        return file_key

    def decrypt_file_key(self, encrypted_file_key, user_private_key):
        """Decrypt the file key using user's private key."""
        # In a real implementation, you would use the user's private key
        # to decrypt the file key. For this example, we'll use a simplified version.
        return encrypted_file_key 