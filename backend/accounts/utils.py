import secrets
import hashlib
import bcrypt
import requests
import phonenumbers
from datetime import timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import OTPCode


def generate_otp(length=6):
    """Generate secure random OTP code."""
    return ''.join([str(secrets.randbelow(10)) for _ in range(length)])


def hash_otp(otp_code):
    """Hash OTP code using bcrypt."""
    return bcrypt.hashpw(otp_code.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_otp_hash(otp_code, hashed):
    """Verify OTP code against bcrypt hash."""
    return bcrypt.checkpw(otp_code.encode('utf-8'), hashed.encode('utf-8'))


def hash_token(token):
    """Hash a token using SHA256."""
    return hashlib.sha256(token.encode()).hexdigest()


def validate_email(email):
    """Validate email format."""
    from django.core.validators import EmailValidator
    validator = EmailValidator()
    try:
        validator(email)
        return email.lower().strip()
    except ValidationError:
        raise ValidationError("Invalid email format")


def validate_phone(phone, country=None):
    """Validate and format phone number using phonenumbers library."""
    if country is None:
        country = settings.DEFAULT_COUNTRY_CODE
    
    try:
        # Parse the phone number
        parsed = phonenumbers.parse(phone, country)
        
        # Validate the number
        if not phonenumbers.is_valid_number(parsed):
            raise ValidationError("Invalid phone number")
        
        # Check if country is allowed
        country_code = phonenumbers.region_code_for_number(parsed)
        if country_code not in settings.ALLOWED_COUNTRY_CODES:
            raise ValidationError(f"Phone numbers from {country_code} are not supported")
        
        return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
    
    except phonenumbers.NumberParseException as e:
        raise ValidationError(f"Invalid phone number format: {str(e)}")


def create_otp_for_identity(login_identity, purpose='login'):
    """
    Create a new OTP code for a login identity.
    """
    OTPCode.objects.filter(
        login_identity=login_identity,
        purpose=purpose,
        consumed_at__isnull=True,
        expires_at__gt=timezone.now()
    ).update(consumed_at=timezone.now())
    
    # Generate new OTP
    otp_code = generate_otp(settings.OTP_LENGTH)
    otp_hash = hash_otp(otp_code)
    
    # Create OTP record
    otp = OTPCode.objects.create(
        login_identity=login_identity,
        code_hash=otp_hash,
        purpose=purpose,
        expires_at=timezone.now() + settings.OTP_EXPIRATION_TIME,
        max_attempts=settings.OTP_MAX_ATTEMPTS
    )
    
    return otp, otp_code


def send_otp_via_email(email, otp_code, purpose='login'):
    """Send OTP code via email."""
    subject = 'Your Hummingbirds Login Code'
    
    if purpose == 'verify_identity':
        subject = 'Verify Your Hummingbirds Account'
    
    message = f"""
    Your verification code is: {otp_code}
    
    This code will expire in {settings.OTP_EXPIRATION_TIME.seconds // 60} minutes.
    
    If you didn't request this code, please ignore this email.
    
    Best regards,
    Hummingbirds Team
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False
        )
        print(f"[EMAIL] OTP sent to {email}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {str(e)}")
        return False


def send_otp_via_sms(phone, otp_code, purpose='login'):
    """
    Send OTP code via SMS using Antugrow SMS API.
    """
    # Check if SMS settings are configured
    if not hasattr(settings, 'ANTUGROW_SMS_API_URL') or not settings.ANTUGROW_SMS_API_URL:
        print(f"[SMS ERROR] SMS not configured. OTP for {phone}: {otp_code}")
        return False
    
    if not hasattr(settings, 'ANTUGROW_SMS_API_KEY') or not settings.ANTUGROW_SMS_API_KEY:
        print(f"[SMS ERROR] SMS API key not configured. OTP for {phone}: {otp_code}")
        return False

    # message
    message = f"Your Hummingbirds verification code is: {otp_code}. Valid for {settings.OTP_EXPIRATION_TIME.seconds // 60} minutes."
    
    # Antugrow API format
    headers = {
        'Content-Type': 'application/json',
        'X-API-KEY': settings.ANTUGROW_SMS_API_KEY
    }
    
    payload = {
        'phone_number': phone,
        'message': message
    }
    
    print(f"[SMS] Sending OTP to: {phone}")
    
    try:
        response = requests.post(
            settings.ANTUGROW_SMS_API_URL,
            json=payload,
            headers=headers,
            timeout=10
        )
        
        # Parse response JSON
        try:
            response_data = response.json()
        except:
            response_data = {}
        
        # Check if successful
        # Antugrow returns statusCode: 100 for success, or status: 'success'/'Success'
        status_code = response_data.get('statusCode', response.status_code)
        status = response_data.get('status', '').lower()
        
        if status_code == 100 or status == 'success':
            print(f"[SMS] OTP sent to {phone}")
            return True
        
        # Handle error responses
        if status == 'userinblacklist':
            print(f"[SMS ERROR] Phone number {phone} is blacklisted. Please contact support or use a different number.")
        elif status_code == 401:
            print(f"[SMS ERROR] Invalid API key. Check ANTUGROW_SMS_API_KEY in settings.")
        elif status_code == 403:
            print(f"[SMS ERROR] API access forbidden. Check API key permissions.")
        else:
            print(f"[SMS ERROR] Failed to send SMS. Status: {response_data.get('status')}, Code: {status_code}, Response: {response_data}")
        
        return False
            
    except requests.RequestException as e:
        print(f"[SMS ERROR] Network error: {str(e)}")
        return False


def send_otp(login_identity, otp_code, purpose='login'):
    """
    Send OTP via appropriate channel (email or SMS).
    """
    if login_identity.type == 'email':
        return send_otp_via_email(login_identity.value, otp_code, purpose)
    elif login_identity.type == 'phone':
        return send_otp_via_sms(login_identity.value, otp_code, purpose)
    else:
        return False


def get_device_info(request):
    return {
        'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        'ip_address': get_client_ip(request),
    }


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

