from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Chỉ admin mới có quyền."""
    message = 'Bạn không có quyền thực hiện hành động này.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_admin
        )


class IsAdminOrReadOnly(BasePermission):
    """Admin có full quyền, user thường chỉ đọc (GET, HEAD, OPTIONS)."""
    message = 'Bạn không có quyền thực hiện hành động này.'

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_admin
        )


class IsOwnerOrAdmin(BasePermission):
    """Chủ sở hữu hoặc admin mới có quyền truy cập object."""
    message = 'Bạn không có quyền truy cập tài nguyên này.'

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        # obj có thể là Order, CartItem — đều có field 'user'
        return obj.user == request.user
