from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """Custom manager cho User model."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email là bắt buộc')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser phải có is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser phải có is_superuser=True')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model — dùng email thay vì username."""

    class Role(models.TextChoices):
        USER = 'user', 'User'
        ADMIN = 'admin', 'Admin'

    email = models.EmailField(unique=True, verbose_name='Email')
    full_name = models.CharField(max_length=150, verbose_name='Họ và tên')
    phone = models.CharField(max_length=15, blank=True, verbose_name='Số điện thoại')
    address = models.TextField(blank=True, verbose_name='Địa chỉ')
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.USER,
        verbose_name='Vai trò',
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = 'Người dùng'
        verbose_name_plural = 'Người dùng'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.full_name} <{self.email}>'

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN
