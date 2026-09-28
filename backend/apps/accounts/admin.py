from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active')
    search_fields = ('email', 'full_name', 'phone')
    ordering = ('-created_at',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Thông tin cá nhân', {'fields': ('full_name', 'phone', 'address')}),
        ('Phân quyền', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Thời gian', {'fields': ('last_login',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password1', 'password2', 'role'),
        }),
    )
