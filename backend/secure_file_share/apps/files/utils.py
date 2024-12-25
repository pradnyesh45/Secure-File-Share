from cryptography.fernet import Fernet
from django.conf import settings
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os

def generate_key(salt=None):
    """Generate a Fernet key using PBKDF2."""
    if salt is None:
        salt = os.urandom(16)
    
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    
    key = base64.urlsafe_b64encode(kdf.derive(settings.SECRET_KEY.encode()))
    return key, salt

def encrypt_file(file_data):
    """Encrypt file data using Fernet symmetric encryption."""
    key, salt = generate_key()
    f = Fernet(key)
    encrypted_data = f.encrypt(file_data)
    return encrypted_data, salt

def decrypt_file(encrypted_data, salt):
    """Decrypt file data using Fernet symmetric encryption."""
    key, _ = generate_key(salt)
    f = Fernet(key)
    return f.decrypt(encrypted_data) 