from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from ..models import File, FileShare, Tag
from ..services.encryption import FileEncryptionService

User = get_user_model()

class FileModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.encryption_service = FileEncryptionService()

    def test_file_creation(self):
        """Test file creation with encryption"""
        file_content = b'Test file content'
        test_file = SimpleUploadedFile(
            "test.txt",
            file_content,
            content_type="text/plain"
        )

        file = File.objects.create(
            name="test.txt",
            file=test_file,
            owner=self.user
        )

        self.assertEqual(file.name, "test.txt")
        self.assertEqual(file.owner, self.user)
        self.assertTrue(file.encrypted_key)

    def test_file_sharing(self):
        """Test file sharing functionality"""
        file = File.objects.create(
            name="share_test.txt",
            file=SimpleUploadedFile("share_test.txt", b"content"),
            owner=self.user
        )

        share = FileShare.objects.create(
            file=file,
            created_by=self.user,
            share_type='LINK',
            expires_at=timezone.now() + timedelta(days=1)
        )

        self.assertFalse(share.is_expired)
        self.assertEqual(share.file, file)

    def test_file_tags(self):
        """Test file tagging functionality"""
        file = File.objects.create(
            name="tagged_file.txt",
            file=SimpleUploadedFile("tagged_file.txt", b"content"),
            owner=self.user
        )

        tag = Tag.objects.create(
            name="test_tag",
            color="#FF0000",
            owner=self.user
        )

        file.tags.add(tag)
        self.assertIn(tag, file.tags.all()) 