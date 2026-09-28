from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView,
    LogoutView,
    UserProfileView,
    ChangePasswordView,
    AdminUserListView,
    AdminUserDetailView,
)

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', TokenObtainPairView.as_view(), name='auth-login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),

    # Profile
    path('profile/', UserProfileView.as_view(), name='auth-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='auth-change-password'),

    # Admin — quản lý users
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]
