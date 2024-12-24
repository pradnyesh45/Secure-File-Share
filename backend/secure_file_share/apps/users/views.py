from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import qrcode
import io
import base64

from .serializers import UserRegistrationSerializer, MFASetupSerializer, TOTPVerificationSerializer

User = get_user_model()

class AuthViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            response_data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            if user.mfa_method == 'TOTP':
                response_data['mfa_required'] = True
                response_data['mfa_setup_required'] = True
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def setup_mfa(self, request):
        serializer = MFASetupSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            user.mfa_method = serializer.validated_data['mfa_method']
            
            if user.mfa_method == 'TOTP':
                secret = user.generate_mfa_secret()
                totp = pyotp.TOTP(secret)
                provisioning_uri = totp.provisioning_uri(
                    user.email, 
                    issuer_name="SecureFileShare"
                )
                
                # Generate QR code
                qr = qrcode.QRCode(version=1, box_size=10, border=5)
                qr.add_data(provisioning_uri)
                qr.make(fit=True)
                img = qr.make_image(fill_color="black", back_color="white")
                
                # Convert QR code to base64
                buffer = io.BytesIO()
                img.save(buffer, format='PNG')
                qr_code = base64.b64encode(buffer.getvalue()).decode()
                
                return Response({
                    'secret': secret,
                    'qr_code': qr_code
                })
            
            user.save()
            return Response({'status': 'MFA setup successful'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def verify_totp(self, request):
        serializer = TOTPVerificationSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if user.verify_totp(serializer.validated_data['token']):
                user.is_mfa_verified = True
                user.save()
                return Response({'status': 'MFA verification successful'})
            return Response(
                {'error': 'Invalid token'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
