from django.test import TestCase
from django.contrib.auth import get_user_model
from ..services.encryption import FileEncryptionService
from ..services.file_handler import FileHandler
from ..services.sharing import FileShareService

User = get_user_model()

class ServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.encryption_service = FileEncryptionService()
        self.file_handler = FileHandler()
        self.share_service = FileShareService()

    def test_file_encryption(self):
        """Test file encryption and decryption"""
        test_content = b"Test content"
        key = self.encryption_service.generate_file_key()
        
        # Test encryption
        encrypted = self.encryption_service.encrypt_file(test_content, key)
        self.assertNotEqual(encrypted, test_content)
        
        # Test decryption
        decrypted = self.encryption_service.decrypt_file(encrypted, key)
        self.assertEqual(decrypted, test_content)

    def test_share_link_generation(self):
        """Test share link generation and validation"""
        file = File.objects.create(
            name="test.txt",
            file=SimpleUploadedFile("test.txt", b"content"),
            owner=self.user
        )

        share_data = self.share_service.create_share_link(
            file,
            self.user,
            24
        )

        self.assertIn('token', share_data)
        self.assertIn('expires_at', share_data)

        # Validate token
        share = self.share_service.validate_share_token(share_data['token'])
        self.assertIsNotNone(share)
        self.assertEqual(share.file, file) 