from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from ..models import File, FileShare

User = get_user_model()

class FileViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_file_upload(self):
        """Test file upload endpoint"""
        file_content = b'Test file content'
        upload_file = SimpleUploadedFile(
            "test.txt",
            file_content,
            content_type="text/plain"
        )

        response = self.client.post(
            '/api/files/',
            {'file': upload_file},
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(File.objects.count(), 1)
        self.assertEqual(File.objects.first().owner, self.user)

    def test_file_sharing(self):
        """Test file sharing endpoint"""
        file = File.objects.create(
            name="share_test.txt",
            file=SimpleUploadedFile("share_test.txt", b"content"),
            owner=self.user
        )

        response = self.client.post(
            f'/api/files/{file.id}/share/',
            {'expiration_hours': 24}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('share_id', response.data)
        self.assertIn('token', response.data)

    def test_file_download(self):
        """Test file download endpoint"""
        file = File.objects.create(
            name="download_test.txt",
            file=SimpleUploadedFile("download_test.txt", b"content"),
            owner=self.user
        )

        response = self.client.get(f'/api/files/{file.id}/download/')
        self.assertEqual(response.status_code, status.HTTP_200_OK) 