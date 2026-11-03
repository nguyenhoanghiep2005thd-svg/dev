from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)


def health(request):
    """Health check cho Render — không chạm DB để không bao giờ báo sai khi DB chậm."""
    return JsonResponse({'status': 'ok'}, content_type='application/json')


urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),

    # Health check (Render healthCheckPath)
    path('api/v1/health/', health, name='health'),

    # API v1
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/products/', include('apps.products.urls')),
    path('api/v1/orders/', include('apps.orders.urls')),

    # API Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Root — Render khai báo healthCheckPath là "/" vẫn phải thấy 200,
    # nếu không Django 404 → Render kết luận service chết và restart liên tục
    path('', health, name='root'),
]

# Serve media files trong development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve media khi chạy production (Render free tier không có nginx riêng cho /media)
elif getattr(settings, 'SERVE_MEDIA', False):
    urlpatterns.insert(0, re_path(
        r'^media/(?P<path>.*)$',
        serve,
        {'document_root': settings.MEDIA_ROOT, 'show_indexes': False},
    ))
