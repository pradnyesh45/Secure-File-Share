from django.db import models
from django.conf import settings
from secure_file_share.apps.files.models import File

class FileShare(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='shares')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shared_files')
    shared_with = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_shares')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    can_edit = models.BooleanField(default=False)

    class Meta:
        unique_together = ['file', 'shared_with']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.file.name} shared by {self.owner.username} with {self.shared_with.username}" 