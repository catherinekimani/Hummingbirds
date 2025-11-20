from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User, LoginIdentity, OTPCode, RefreshToken
from .utils import validate_email, validate_phone


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    primary_email = serializers.SerializerMethodField()
    primary_phone = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'display_name', 'date_of_birth',
            'can_self_manage', 'is_active', 'first_login_at',
            'last_login_at', 'created_at', 'primary_email', 'primary_phone'
        ]
        read_only_fields = [
            'id', 'can_self_manage', 'first_login_at',
            'last_login_at', 'created_at'
        ]
    
    def get_primary_email(self, obj):
        return obj.get_primary_email()
    
    def get_primary_phone(self, obj):
        return obj.get_primary_phone()


class LoginIdentitySerializer(serializers.ModelSerializer):
    """Serializer for LoginIdentity model."""
    
    class Meta:
        model = LoginIdentity
        fields = [
            'id', 'type', 'value', 'is_primary',
            'is_verified', 'verified_at', 'created_at'
        ]
        read_only_fields = ['id', 'is_verified', 'verified_at', 'created_at']


class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration."""
    full_name = serializers.CharField(max_length=255, required=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    display_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    
    def validate(self, data):
        """Validate that email or phone is provided"""
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        
        if not email and not phone:
            raise serializers.ValidationError(
                "email or phone number is required"
            )
        
        if email and phone:
            raise serializers.ValidationError(
                "Provide email or phone, not both"
            )
        
        # Validate and format email
        if email:
            try:
                data['email'] = validate_email(email)
                data['identity_type'] = 'email'
                data['identity_value'] = data['email']
            except DjangoValidationError as e:
                raise serializers.ValidationError({'email': str(e)})
        
        # Validate and format phone
        if phone:
            try:
                data['phone'] = validate_phone(phone)
                data['identity_type'] = 'phone'
                data['identity_value'] = data['phone']
            except DjangoValidationError as e:
                raise serializers.ValidationError({'phone': str(e)})
        
        return data
    
    def validate_full_name(self, value):
        """Validate full name."""
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Full name must be at least 2 characters")
        return value


class LoginSerializer(serializers.Serializer):
    """Serializer for login (request OTP)."""
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    def validate(self, data):
        """Validate that email or phone is provided, not both."""
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        
        if not email and not phone:
            raise serializers.ValidationError(
                "email or phone number is required"
            )
        
        if email and phone:
            raise serializers.ValidationError(
                "Provide either email or phone, not both"
            )
        
        # Validate and format email
        if email:
            try:
                data['email'] = validate_email(email)
                data['identity_type'] = 'email'
                data['identity_value'] = data['email']
            except DjangoValidationError as e:
                raise serializers.ValidationError({'email': str(e)})
        
        # Validate and format phone
        if phone:
            try:
                data['phone'] = validate_phone(phone)
                data['identity_type'] = 'phone'
                data['identity_value'] = data['phone']
            except DjangoValidationError as e:
                raise serializers.ValidationError({'phone': str(e)})
        
        return data


class VerifyOTPSerializer(serializers.Serializer):
    """Serializer for OTP verification."""
    identity_id = serializers.UUIDField(required=True)
    otp = serializers.CharField(min_length=6, max_length=6, required=True)
    
    def validate_otp(self, value):
        """Validate OTP format (6 digits)."""
        if not value.isdigit():
            raise serializers.ValidationError("OTP must be 6 digits")
        return value


class ResendOTPSerializer(serializers.Serializer):
    """Serializer for resending OTP."""
    identity_id = serializers.UUIDField(required=True)


class RefreshTokenSerializer(serializers.Serializer):
    """Serializer for token refresh."""
    refresh = serializers.CharField(required=False)
    
    def validate(self, data):
        """Validate that refresh token is provided"""
        return data


class LogoutSerializer(serializers.Serializer):
    """Serializer for logout."""
    refresh = serializers.CharField(required=False)
    all_devices = serializers.BooleanField(default=False, required=False)

# not functional yet
class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    
    def validate_new_password(self, value):
        """Validate new password strength."""
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters"
            )
        return value


