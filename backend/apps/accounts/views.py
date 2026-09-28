from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    AdminUserSerializer,
)
from .permissions import IsAdmin

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    POST /api/v1/auth/register/
    Đăng ký tài khoản mới.
    """
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Tự động cấp token sau khi đăng ký
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'message': 'Đăng ký thành công.',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/
    Đăng xuất — blacklist refresh token.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Đăng xuất thành công.'}, status=status.HTTP_200_OK)
        except KeyError:
            return Response({'error': 'Thiếu refresh token.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'error': 'Token không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/v1/auth/profile/  — Xem thông tin cá nhân
    PUT  /api/v1/auth/profile/  — Cập nhật thông tin cá nhân
    """
    serializer_class = UserProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """
    POST /api/v1/auth/change-password/
    Đổi mật khẩu.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Đổi mật khẩu thành công.'})


# ─── Admin Views ─────────────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    """
    GET /api/v1/auth/admin/users/
    Admin xem danh sách tất cả user.
    """
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = (IsAdmin,)
    search_fields = ('email', 'full_name', 'phone')
    ordering_fields = ('created_at', 'full_name')


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/auth/admin/users/<id>/  — Xem chi tiết user
    PUT    /api/v1/auth/admin/users/<id>/  — Cập nhật (role, is_active)
    DELETE /api/v1/auth/admin/users/<id>/  — Xóa user
    """
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = (IsAdmin,)
