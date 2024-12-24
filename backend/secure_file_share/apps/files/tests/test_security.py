from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from ..models import File, FileShare
import jwt
from django.conf import settings

User = get_user_model()

class SecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        response = self.client.get('/api/files/')
        self.assertEqual(response.status_code, 401)

    def test_jwt_expiration(self):
        """Test JWT token expiration"""
        # Get valid token
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        token = response.data['access']

        # Decode and modify exp
        decoded = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=['HS256']
        )
        decoded['exp'] = 1  # Expired timestamp

        # Create expired token
        expired_token = jwt.encode(
            decoded,
            settings.SECRET_KEY,
            algorithm='HS256'
        )

        # Try to access with expired token
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {expired_token}'
        )
        response = self.client.get('/api/files/')
        self.assertEqual(response.status_code, 401)

    def test_file_access_permissions(self):
        """Test file access permissions"""
        other_user = User.objects.create_user(
            username='other',
            email='other@example.com',
            password='other123'
        )

        # Create file as first user
        self.client.force_authenticate(user=self.user)
        file = File.objects.create(
            name="test.txt",
            owner=self.user
        )

        # Try to access as other user
        self.client.force_authenticate(user=other_user)
        response = self.client.get(f'/api/files/{file.id}/')
        self.assertEqual(response.status_code, 403)

    def test_share_link_expiration(self):
        """Test share link expiration"""
        self.client.force_authenticate(user=self.user)
        file = File.objects.create(
            name="test.txt",
            owner=self.user
        )

        # Create expired share
        share = FileShare.objects.create(
            file=file,
            created_by=self.user,
            share_type='LINK',
            expires_at='2000-01-01T00:00:00Z'
        )

        response = self.client.get(
            f'/api/files/share/{share.access_token}/'
        )
        self.assertEqual(response.status_code, 404) 