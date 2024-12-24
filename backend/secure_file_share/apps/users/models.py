from django.contrib.auth.models import AbstractUser
from django.db import models
import pyotp

class User(AbstractUser):
    MFA_METHODS = (
        ('TOTP', 'Time-based OTP'),
        ('EMAIL', 'Email OTP'),
        ('NONE', 'No MFA'),
    )
    
    mfa_method = models.CharField(max_length=10, choices=MFA_METHODS, default='NONE')
    mfa_secret = models.CharField(max_length=32, blank=True, null=True)
    is_mfa_verified = models.BooleanField(default=False)
    
    def generate_mfa_secret(self):
        self.mfa_secret = pyotp.random_base32()
        self.save()
        return self.mfa_secret
    
    def verify_totp(self, token):
        if not self.mfa_secret:
            return False
        totp = pyotp.TOTP(self.mfa_secret)
        return totp.verify(token)
