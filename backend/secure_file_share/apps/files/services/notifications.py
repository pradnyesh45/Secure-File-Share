from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

class ShareNotificationService:
    def send_share_notification(self, share, base_url):
        """Send notification email for file sharing."""
        if share.share_type == 'USER':
            self._send_user_share_notification(share)
        else:
            self._send_link_share_notification(share, base_url)

    def _send_user_share_notification(self, share):
        """Send notification for direct user share."""
        context = {
            'recipient_name': share.shared_with.username,
            'sender_name': share.created_by.username,
            'file_name': share.file.name,
        }
        
        html_content = render_to_string(
            'emails/file_shared_notification.html',
            context
        )
        
        send_mail(
            subject=f'{share.created_by.username} shared a file with you',
            message=strip_tags(html_content),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[share.shared_with.email],
            html_message=html_content
        )

    def _send_link_share_notification(self, share, base_url):
        """Send notification for link share."""
        share_url = f"{base_url}/share/{share.access_token}"
        
        context = {
            'sender_name': share.created_by.username,
            'file_name': share.file.name,
            'share_url': share_url,
            'expires_at': share.expires_at,
        }
        
        html_content = render_to_string(
            'emails/share_link_notification.html',
            context
        )
        
        send_mail(
            subject='Your file share link is ready',
            message=strip_tags(html_content),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[share.created_by.email],
            html_message=html_content
        ) 