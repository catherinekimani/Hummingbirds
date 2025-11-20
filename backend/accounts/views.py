from django.utils import timezone
from django.conf import settings
from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken as JWTRefreshToken
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

from .models import User, LoginIdentity, OTPCode, RefreshToken
from .serializers import (
    RegisterSerializer, LoginSerializer, VerifyOTPSerializer,
    ResendOTPSerializer, RefreshTokenSerializer, LogoutSerializer,
    UserSerializer
)
from .utils import (
    create_otp_for_identity, send_otp, verify_otp_hash,
    hash_token, get_device_info
)

class RegisterView(APIView):
    """Register a new user and send OTP for verification."""
    permission_classes = [AllowAny]
    
    @method_decorator(ratelimit(key='ip', rate='3/h', method='POST'))
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'error': True,
                'message': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        identity_type = data['identity_type']
        identity_value = data['identity_value']
        
        # Check if identity already exists
        existing_identity = LoginIdentity.objects.filter(
            type=identity_type,
            value=identity_value
        ).first()
        
        if existing_identity:
            return Response({
                'error': True,
                'message': f'This {identity_type} is already registered',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    full_name=data['full_name'],
                    display_name=data.get('display_name'),
                    date_of_birth=data.get('date_of_birth'),
                    can_self_manage=True,
                    is_active=True
                )
                
                login_identity = LoginIdentity.objects.create(
                    user=user,
                    type=identity_type,
                    value=identity_value,
                    is_primary=True,
                    is_verified=False
                )
                
                otp, otp_code = create_otp_for_identity(login_identity, purpose='verify_identity')
                sent = send_otp(login_identity, otp_code, purpose='verify_identity')
                
                if not sent:
                    print(f"[DEV] OTP for {identity_value}: {otp_code}")
                
                return Response({
                    'error': False,
                    'message': f'OTP sent to your {identity_type}',
                    'data': {
                        'identity_id': str(login_identity.id),
                        'user_id': str(user.id),
                        'identity_type': identity_type,
                    }
                }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({
                'error': True,
                'message': 'Registration failed',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    """Request OTP for existing user login."""
    permission_classes = [AllowAny]
    
    @method_decorator(ratelimit(key='ip', rate='5/h', method='POST'))
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'error': True,
                'message': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        identity_type = data['identity_type']
        identity_value = data['identity_value']
        
        login_identity = LoginIdentity.objects.filter(
            type=identity_type,
            value=identity_value
        ).select_related('user').first()
        
        if not login_identity:
            return Response({
                'error': True,
                'message': f'No account found with this {identity_type}',
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not login_identity.user.is_active:
            return Response({
                'error': True,
                'message': 'Account is inactive',
            }, status=status.HTTP_403_FORBIDDEN)
        
        otp, otp_code = create_otp_for_identity(login_identity, purpose='login')
        sent = send_otp(login_identity, otp_code, purpose='login')
        
        if not sent:
            print(f"[DEV] OTP for {identity_value}: {otp_code}")
        
        return Response({
            'error': False,
            'message': f'OTP sent to your {identity_type}',
            'data': {
                'identity_id': str(login_identity.id),
                'identity_type': identity_type,
            }
        }, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """Verify OTP and return JWT tokens."""
    permission_classes = [AllowAny]
    
    @method_decorator(ratelimit(key='ip', rate='10/h', method='POST'))
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'error': True,
                'message': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        identity_id = serializer.validated_data['identity_id']
        otp_code = serializer.validated_data['otp']
        
        try:
            login_identity = LoginIdentity.objects.select_related('user').get(id=identity_id)
        except LoginIdentity.DoesNotExist:
            return Response({
                'error': True,
                'message': 'Invalid identity',
            }, status=status.HTTP_404_NOT_FOUND)
        
        otp = OTPCode.objects.filter(
            login_identity=login_identity,
            consumed_at__isnull=True,
            expires_at__gt=timezone.now()
        ).order_by('-created_at').first()
        
        if not otp:
            return Response({
                'error': True,
                'message': 'No valid OTP found. Please request a new one.',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if otp.attempts >= otp.max_attempts:
            return Response({
                'error': True,
                'message': 'Maximum OTP attempts exceeded. Please request a new one.',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not verify_otp_hash(otp_code, otp.code_hash):
            otp.increment_attempts()
            
            remaining = otp.max_attempts - otp.attempts
            return Response({
                'error': True,
                'message': f'Invalid OTP. {remaining} attempts remaining.',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            otp.consume()
            
            if not login_identity.is_verified:
                login_identity.is_verified = True
                login_identity.verified_at = timezone.now()
                login_identity.save(update_fields=['is_verified', 'verified_at'])
            
            user = login_identity.user
            user.update_last_login()
            
            jwt_token = JWTRefreshToken.for_user(user)
            access_token = str(jwt_token.access_token)
            refresh_token = str(jwt_token)
            
            device_info = get_device_info(request)
            RefreshToken.objects.create(
                user=user,
                token_hash=hash_token(refresh_token),
                expires_at=timezone.now() + settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                device_info=device_info
            )
            
            user_data = UserSerializer(user).data
            
            response_data = {
                'error': False,
                'message': 'Login successful',
                'data': {
                    'access': access_token,
                    'refresh': refresh_token,
                    'user': user_data
                }
            }
            
            response = Response(response_data, status=status.HTTP_200_OK)
            
            response.set_cookie(
                key=settings.REFRESH_TOKEN_COOKIE_NAME,
                value=refresh_token,
                httponly=settings.REFRESH_TOKEN_COOKIE_HTTPONLY,
                secure=settings.REFRESH_TOKEN_COOKIE_SECURE,
                samesite=settings.REFRESH_TOKEN_COOKIE_SAMESITE,
                max_age=settings.REFRESH_TOKEN_COOKIE_MAX_AGE
            )
            
            return response


class ResendOTPView(APIView):
    """Resend OTP for a login identity."""
    permission_classes = [AllowAny]
    
    @method_decorator(ratelimit(key='ip', rate='3/h', method='POST'))
    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'error': True,
                'message': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        identity_id = serializer.validated_data['identity_id']
        
        try:
            login_identity = LoginIdentity.objects.select_related('user').get(id=identity_id)
        except LoginIdentity.DoesNotExist:
            return Response({
                'error': True,
                'message': 'Invalid identity',
            }, status=status.HTTP_404_NOT_FOUND)
        
        purpose = 'login' if login_identity.is_verified else 'verify_identity'
        
        otp, otp_code = create_otp_for_identity(login_identity, purpose=purpose)
        sent = send_otp(login_identity, otp_code, purpose=purpose)
        
        if not sent:
            print(f"[DEV] OTP for {login_identity.value}: {otp_code}")
        
        return Response({
            'error': False,
            'message': f'New OTP sent to your {login_identity.type}',
            'data': {
                'identity_id': str(login_identity.id),
            }
        }, status=status.HTTP_200_OK)


class RefreshTokenView(APIView):
    """Refresh access token using refresh token."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'error': True,
                'message': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        refresh_token = serializer.validated_data.get('refresh')
        if not refresh_token:
            refresh_token = request.COOKIES.get(settings.REFRESH_TOKEN_COOKIE_NAME)
        
        if not refresh_token:
            return Response({
                'error': True,
                'message': 'Refresh token required',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            jwt_token = JWTRefreshToken(refresh_token)
            user_id = jwt_token['user_id']
            
            token_hash = hash_token(refresh_token)
            db_token = RefreshToken.objects.filter(
                token_hash=token_hash,
                user_id=user_id,
                revoked_at__isnull=True,
                expires_at__gt=timezone.now()
            ).first()
            
            if not db_token:
                return Response({
                    'error': True,
                    'message': 'Invalid or expired refresh token',
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            new_access_token = str(jwt_token.access_token)
            
            if settings.SIMPLE_JWT.get('ROTATE_REFRESH_TOKENS', False):
                db_token.revoke()
                
                new_jwt_token = JWTRefreshToken.for_user(db_token.user)
                new_refresh_token = str(new_jwt_token)
                new_access_token = str(new_jwt_token.access_token)
                
                device_info = get_device_info(request)
                RefreshToken.objects.create(
                    user=db_token.user,
                    token_hash=hash_token(new_refresh_token),
                    expires_at=timezone.now() + settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                    device_info=device_info
                )
                
                response = Response({
                    'error': False,
                    'message': 'Token refreshed',
                    'data': {
                        'access': new_access_token,
                        'refresh': new_refresh_token
                    }
                }, status=status.HTTP_200_OK)
                
                response.set_cookie(
                    key=settings.REFRESH_TOKEN_COOKIE_NAME,
                    value=new_refresh_token,
                    httponly=settings.REFRESH_TOKEN_COOKIE_HTTPONLY,
                    secure=settings.REFRESH_TOKEN_COOKIE_SECURE,
                    samesite=settings.REFRESH_TOKEN_COOKIE_SAMESITE,
                    max_age=settings.REFRESH_TOKEN_COOKIE_MAX_AGE
                )
                
                return response
            else:
                return Response({
                    'error': False,
                    'message': 'Token refreshed',
                    'data': {
                        'access': new_access_token
                    }
                }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'error': True,
                'message': 'Invalid refresh token',
                'details': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """Logout user and revoke refresh token."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'error': True,
                'message': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        all_devices = serializer.validated_data.get('all_devices', False)
        
        if all_devices:
            RefreshToken.objects.filter(
                user=request.user,
                revoked_at__isnull=True
            ).update(revoked_at=timezone.now())
            
            message = 'Logged out from all devices'
        else:
            refresh_token = serializer.validated_data.get('refresh')
            if not refresh_token:
                refresh_token = request.COOKIES.get(settings.REFRESH_TOKEN_COOKIE_NAME)
            
            if refresh_token:
                token_hash = hash_token(refresh_token)
                RefreshToken.objects.filter(
                    token_hash=token_hash,
                    user=request.user,
                    revoked_at__isnull=True
                ).update(revoked_at=timezone.now())
            
            message = 'Logged out successfully'
        
        response = Response({
            'error': False,
            'message': message
        }, status=status.HTTP_200_OK)
        
        response.delete_cookie(settings.REFRESH_TOKEN_COOKIE_NAME)
        
        return response


class MeView(APIView):
    """Get current user profile."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        
        return Response({
            'error': False,
            'message': 'User profile retrieved',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
