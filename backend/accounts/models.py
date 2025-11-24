import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.conf import settings

# Create your models here.
class UserManager(BaseUserManager):
    """ Custom user manager for User model. """

    def create_user(self, full_name, **extra_fields):
        """ create and return a regular user """
        if not full_name:
            raise ValueError("Users must have a full name")

        extra_fields.setdefault("can_self_manage", True)
        extra_fields.setdefault("is_active", True)

        user = self.model(full_name=full_name, **extra_fields)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, **extra_fields):
        """ create and return a superuser """
        if not email:
            raise ValueError("Superuser must have an email address")

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("can_self_manage", True)
        extra_fields.setdefault("email", email)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        user = self.create_user(full_name, **extra_fields)

        # create login identity for the superuser
        LoginIdentity.objects.create(
            user=user,
            type='email',
            value=email,
            is_primary=True,
            is_verified=True,
            verified_at=timezone.now()
        )

        return user


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.TextField(unique=True, null=True, blank=True)

    full_name = models.TextField()
    display_name = models.TextField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    # Self-managed vs org-managed
    can_self_manage = models.BooleanField(default=False)
    created_by_user = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_users'
    )

    # Login tracking
    first_login_at = models.DateTimeField(null=True, blank=True)
    last_login_at = models.DateTimeField(null=True, blank=True)

    # Status
    is_active = models.BooleanField(default=True)

    is_staff = models.BooleanField(default=False)

    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    password = models.CharField(max_length=128, null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'users'
        managed = True

    def __str__(self):
        return self.full_name

    def get_primary_identity(self):
        """Get the user's primary login identity."""
        return self.login_identities.filter(is_primary=True).first()

    def get_primary_email(self):
        """Get primary email address if exists."""
        identity = self.login_identities.filter(
            type='email',
            is_primary=True
        ).first()
        return identity.value if identity else None

    def get_primary_phone(self):
        """Get primary phone number if exists."""
        identity = self.login_identities.filter(
            type='phone',
            is_primary=True
        ).first()
        return identity.value if identity else None

    def update_last_login(self):
        """Update last login timestamp."""
        if not self.first_login_at:
            self.first_login_at = timezone.now()
        self.last_login_at = timezone.now()
        self.save(update_fields=['first_login_at', 'last_login_at'])

    def is_verified(self):
        """Check if user's primary identity is verified."""
        primary_identity = self.get_primary_identity()
        return primary_identity.is_verified if primary_identity else False

    is_verified.boolean = True
    is_verified.short_description = 'Verified'


class LoginIdentity(models.Model):
    """Email or phone number used for authentication."""

    TYPE_CHOICES = [
        ('email', 'Email'),
        ('phone', 'Phone'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='login_identities'
    )
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    value = models.TextField()

    is_primary = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'login_identities'
        managed = True
        unique_together = [['type', 'value']]
        indexes = [
            models.Index(fields=['user'], name='idx_login_identities_user_id'),
            models.Index(fields=['value'], name='idx_login_identities_value'),
        ]

    def __str__(self):
        return f"{self.type}: {self.value}"


class OTPCode(models.Model):
    """One-time password codes for authentication and verification."""

    PURPOSE_CHOICES = [
        ('login', 'Login'),
        ('verify_identity', 'Verify Identity'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    login_identity = models.ForeignKey(
        LoginIdentity,
        on_delete=models.CASCADE,
        related_name='otp_codes'
    )
    code_hash = models.TextField()  # Bcrypt hash of the OTP
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)

    attempts = models.IntegerField(default=0)
    max_attempts = models.IntegerField(default=5)

    expires_at = models.DateTimeField()
    consumed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'otp_codes'
        managed = True
        indexes = [
            models.Index(fields=['login_identity'], name='idx_otp_codes_login_identity'),
            models.Index(fields=['expires_at'], name='idx_otp_codes_expires_at'),
        ]

    def is_valid(self):
        """Check if OTP is still valid."""
        return (
                self.consumed_at is None
                and self.expires_at > timezone.now()
                and self.attempts < self.max_attempts
        )

    def increment_attempts(self):
        """Increment attempt counter"""
        self.attempts += 1
        self.save(update_fields=['attempts'])
        return self.attempts < self.max_attempts

    def consume(self):
        """Mark OTP as consumed."""
        self.consumed_at = timezone.now()
        self.save(update_fields=['consumed_at'])

    def __str__(self):
        return f"OTP for {self.login_identity} ({self.purpose})"


class RefreshToken(models.Model):
    """Refresh tokens for JWT authentication."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='refresh_tokens'
    )
    token_hash = models.TextField()

    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)

    device_info = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'refresh_tokens'
        managed = True
        indexes = [
            models.Index(fields=['user'], name='idx_refresh_tokens_user_id'),
            models.Index(fields=['token_hash'], name='idx_refresh_tokens_token_hash'),
            models.Index(fields=['expires_at'], name='idx_refresh_tokens_expires_at'),
        ]

    def is_valid(self):
        """Check if refresh token is still valid."""
        return (
                self.revoked_at is None
                and self.expires_at > timezone.now()
        )

    def revoke(self):
        """Revoke this refresh token."""
        self.revoked_at = timezone.now()
        self.save(update_fields=['revoked_at'])

    def __str__(self):
        return f"RefreshToken for {self.user}"


class UserMFATOTP(models.Model):
    """TOTP-based multi-factor authentication."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='mfa_totp'
    )
    secret_encrypted = models.BinaryField()
    is_enabled = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_mfa_totp'
        managed = True

    def __str__(self):
        return f"TOTP for {self.user}"

class PointTransaction(models.Model):
    """Transactions for points granted to users"""
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="point_transactions",
    )

    source_type = models.CharField(
        max_length=50,
    )

    source_id = models.UUIDField(
        null=True,
        blank=True,
    )

    points = models.IntegerField()

    reason = models.TextField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "point_transactions"
        indexes = [
            models.Index(fields=["source_type", "source_id"]),
            models.Index(fields=["user"]),
        ]

    def __str__(self):
        return f"{self.user} - {self.points} points"

class Donation(models.Model):
    """
    Tracks Paystack donations so we can verify/award points idempotently.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="donations",
        null=True, blank=True,
    )

    phone_number = models.CharField(max_length=32)
    amount = models.IntegerField(help_text="Amount in major currency unit (e.g. KES/NGN).")

    reference = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=32, default="initialized")  # initialized|success|failed
    points_awarded = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "donations"
        indexes = [
            models.Index(fields=["phone_number"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.phone_number} {self.amount} ({self.reference})"
