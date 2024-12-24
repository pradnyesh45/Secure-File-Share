import os
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from cryptography.fernet import Fernet
from .services.file_handler import FileHandler
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile

def get_file_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return os.path.join('uploads', filename)

class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to=get_file_path)
    encrypted_key = models.BinaryField()
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    content_type = models.CharField(max_length=100)
    size = models.BigIntegerField()
    preview = models.FileField(
        upload_to='previews/',
        null=True,
        blank=True
    )
    preview_type = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )
    tags = models.ManyToManyField('Tag', related_name='files', blank=True)

    def save(self, *args, **kwargs):
        if not self.id:
            file_handler = FileHandler()
            
            # Validate file size
            if self.file.size > settings.MAX_UPLOAD_SIZE:
                raise ValidationError('File size too large')
                
            # Validate file extension
            ext = os.path.splitext(self.file.name)[1].lower()
            if ext not in settings.ALLOWED_UPLOAD_EXTENSIONS:
                raise ValidationError('File type not allowed')
            
            # Process the file
            file_data = file_handler.save_file(self.file, self.owner)
            
            # Update model fields
            self.name = self.file.name
            self.file.name = file_data['path']
            self.encrypted_key = file_data['key']
            self.content_type = file_data['content_type']
            self.size = file_data['size']
            
        super().save(*args, **kwargs)

    def get_decrypted_content(self):
        file_handler = FileHandler()
        return file_handler.read_file(self.file.name, self.encrypted_key)

    def delete(self, *args, **kwargs):
        # Delete the physical file
        file_handler = FileHandler()
        file_handler.delete_file(self.file.name)
        
        super().delete(*args, **kwargs)

    def generate_preview(self):
        """Generate and save a preview for the file."""
        from .services.preview import FilePreviewService
        
        preview_service = FilePreviewService()
        preview_data = preview_service.generate_preview(
            self.file,
            self.content_type
        )
        
        if preview_data:
            # Determine preview type
            if isinstance(preview_data, bytes):
                if self.content_type.startswith('text/'):
                    preview_type = 'text'
                else:
                    preview_type = 'image'
            else:
                preview_type = 'none'
                
            # Save preview
            if preview_type != 'none':
                preview_path = f'previews/{self.id}.preview'
                preview_file = ContentFile(preview_data)
                self.preview.save(preview_path, preview_file, save=False)
                self.preview_type = preview_type
                self.save()

class FileShare(models.Model):
    SHARE_TYPES = (
        ('LINK', 'Shareable Link'),
        ('USER', 'User Share'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shares_created'
    )
    shared_with = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='shares_received'
    )
    share_type = models.CharField(max_length=10, choices=SHARE_TYPES)
    access_token = models.UUIDField(default=uuid.uuid4, editable=False)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def is_expired(self):
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False

    def generate_share_link(self):
        return f"/share/{self.access_token}" 

class FilePermissionType(models.Model):
    READ = 'READ'
    WRITE = 'WRITE'
    SHARE = 'SHARE'
    
    PERMISSION_CHOICES = [
        (READ, 'Read'),
        (WRITE, 'Write'),
        (SHARE, 'Share'),
    ]
    
    name = models.CharField(max_length=10, choices=PERMISSION_CHOICES, unique=True)
    description = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class FileUserPermission(models.Model):
    file = models.ForeignKey('File', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    permission_type = models.ForeignKey(FilePermissionType, on_delete=models.CASCADE)
    granted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='permissions_granted'
    )
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('file', 'user', 'permission_type')

    @property
    def is_active(self):
        if self.expires_at:
            return timezone.now() <= self.expires_at
        return True 

class FileVersion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ForeignKey(
        'File',
        on_delete=models.CASCADE,
        related_name='versions'
    )
    version_number = models.IntegerField()
    file_data = models.FileField(upload_to='versions/')
    encrypted_key = models.BinaryField()
    size = models.BigIntegerField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    comment = models.TextField(blank=True)

    class Meta:
        unique_together = ('file', 'version_number')
        ordering = ['-version_number']

    def get_decrypted_content(self):
        file_handler = FileHandler()
        return file_handler.read_file(self.file_data.name, self.encrypted_key) 

class Tag(models.Model):
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7)  # Hex color code
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tags'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['name', 'owner']

    def __str__(self):
        return self.name 