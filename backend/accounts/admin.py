from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, LoginIdentity, OTPCode, RefreshToken

# Register your models here.
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model."""
    
    list_display = [
        'id', 'full_name', 'display_name', 'is_verified', 'is_active', 
        'can_self_manage', 'created_at'
    ]
    list_filter = ['is_active', 'can_self_manage', 'is_staff', 'created_at']
    search_fields = ['full_name', 'display_name', 'id']
    ordering = ['-created_at']
    
    def get_queryset(self, request):
        """Optimize queryset with select_related for login identities."""
        qs = super().get_queryset(request)
        return qs.prefetch_related('login_identities')
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('full_name', 'display_name', 'date_of_birth')
        }),
        ('Account Type', {
            'fields': ('can_self_manage', 'created_by_user')
        }),
        ('Status', {
            'fields': ('is_active', 'is_staff', 'is_superuser')
        }),
        ('Login Tracking', {
            'fields': ('first_login_at', 'last_login_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['id', 'created_at', 'updated_at', 'first_login_at', 'last_login_at']
    
    add_fieldsets = (
        (None, {
            'fields': ('full_name', 'is_staff', 'is_superuser')
        }),
    )


@admin.register(LoginIdentity)
class LoginIdentityAdmin(admin.ModelAdmin):
    """Admin interface for LoginIdentity model."""
    
    list_display = [
        'id', 'user', 'type', 'value', 'is_primary', 
        'is_verified', 'created_at'
    ]
    list_filter = ['type', 'is_primary', 'is_verified']
    search_fields = ['value', 'user__full_name']
    ordering = ['-created_at']
    
    readonly_fields = ['id', 'created_at', 'verified_at']


@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    """Admin interface for OTPCode model."""
    
    list_display = [
        'id', 'login_identity', 'purpose', 'attempts', 
        'expires_at', 'consumed_at', 'created_at'
    ]
    list_filter = ['purpose', 'consumed_at']
    search_fields = ['login_identity__value']
    ordering = ['-created_at']
    
    readonly_fields = ['id', 'code_hash', 'created_at']
    
    def has_add_permission(self, request):
        return False


@admin.register(RefreshToken)
class RefreshTokenAdmin(admin.ModelAdmin):
    """Admin interface for RefreshToken model."""
    
    list_display = [
        'id', 'user', 'expires_at', 'revoked_at', 'created_at'
    ]
    list_filter = ['revoked_at', 'created_at']
    search_fields = ['user__full_name', 'token_hash']
    ordering = ['-created_at']
    
    readonly_fields = ['id', 'token_hash', 'created_at']
    
    def has_add_permission(self, request):
        return False