from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'mfa_method')
        extra_kwargs = {
            'email': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            mfa_method=validated_data.get('mfa_method', 'NONE')
        )
        if user.mfa_method == 'TOTP':
            user.generate_mfa_secret()
        return user

class MFASetupSerializer(serializers.Serializer):
    mfa_method = serializers.ChoiceField(choices=User.MFA_METHODS)

class TOTPVerificationSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=6, min_length=6)
