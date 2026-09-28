from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Đăng ký tài khoản mới."""
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True, label='Xác nhận mật khẩu')

    class Meta:
        model = User
        fields = ('email', 'full_name', 'phone', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Mật khẩu không khớp.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(**validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    """Xem và cập nhật thông tin cá nhân."""

    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'phone', 'address', 'role', 'created_at')
        read_only_fields = ('id', 'email', 'role', 'created_at')


class ChangePasswordSerializer(serializers.Serializer):
    """Đổi mật khẩu."""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Mật khẩu cũ không đúng.')
        return value


class AdminUserSerializer(serializers.ModelSerializer):
    """Dành cho admin xem/quản lý danh sách users."""

    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'phone', 'address', 'role', 'is_active', 'created_at')
        read_only_fields = ('id', 'email', 'created_at')
