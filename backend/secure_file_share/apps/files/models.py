import uuid
from django.db import models
from django.conf import settings

class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')
    encrypted_file = models.BinaryField(null=True)  # For storing encrypted file content
    encryption_salt = models.BinaryField(null=True)  # For storing the salt used in encryption
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_files'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'files'

    def __str__(self):
        return self.name 