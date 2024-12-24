from datetime import timedelta
from django.utils import timezone
from django.core.signing import TimestampSigner, BadSignature
from django.conf import settings
from ..models import FileShare, FileUserPermission

class FileShareService:
    def __init__(self):
        self.signer = TimestampSigner()

    def create_share_link(self, file, user, expiration_hours):
        """Create a temporary share link for a file."""
        share = FileShare.objects.create(
            file=file,
            created_by=user,
            share_type='LINK',
            expires_at=timezone.now() + timedelta(hours=expiration_hours)
        )
        
        # Create a signed token that includes the share ID
        token = self.signer.sign(str(share.id))
        
        return {
            'share_id': share.id,
            'token': token,
            'expires_at': share.expires_at
        }

    def share_with_user(self, file, owner, target_user, permissions=None):
        """Share a file with a specific user."""
        # Create the file share record
        share = FileShare.objects.create(
            file=file,
            created_by=owner,
            shared_with=target_user,
            share_type='USER'
        )
        
        # Set default permissions if none provided
        if permissions is None:
            permissions = ['READ']
            
        # Create permission records
        for perm in permissions:
            FileUserPermission.objects.create(
                file=file,
                user=target_user,
                permission_type_id=perm,
                granted_by=owner
            )
            
        return share

    def validate_share_token(self, token):
        """Validate a share token and return the associated share."""
        try:
            # Verify the token signature and age
            share_id = self.signer.unsign(
                token,
                max_age=settings.SHARE_LINK_MAX_AGE
            )
            
            # Get and validate the share
            share = FileShare.objects.get(id=share_id)
            
            if share.is_expired:
                return None
                
            return share
            
        except (BadSignature, FileShare.DoesNotExist):
            return None

    def revoke_share(self, share_id, user):
        """Revoke a file share."""
        try:
            share = FileShare.objects.get(id=share_id)
            
            # Verify the user has permission to revoke
            if share.created_by != user and share.file.owner != user:
                return False
                
            # Remove associated permissions
            if share.shared_with:
                FileUserPermission.objects.filter(
                    file=share.file,
                    user=share.shared_with
                ).delete()
                
            # Delete the share
            share.delete()
            return True
            
        except FileShare.DoesNotExist:
            return False 