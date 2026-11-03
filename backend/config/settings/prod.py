from .base import *  # noqa: F401,F403
from decouple import config, UndefinedValueError

DEBUG = False

# SECRET_KEY — bắt buộc
try:
    SECRET_KEY = config('SECRET_KEY')
except UndefinedValueError:
    import secrets
    SECRET_KEY = secrets.token_urlsafe(50)

ALLOWED_HOSTS = ['*']  # Render dùng proxy, cho phép tất cả host

# ── HTTPS / proxy (Render terminate TLS phía trước) ──────────
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

# CSRF — cần cho Django admin; JWT API (register/login) không dùng session CSRF
# Chỉ chấp nhận origin đầy đủ (không wildcard), ví dụ https://phonestore-frontend.onrender.com
CSRF_TRUSTED_ORIGINS = [
    origin.strip().rstrip('/')
    for origin in config('CSRF_TRUSTED_ORIGINS', default='').split(',')
    if origin.strip()
]
_frontend_url = config('FRONTEND_URL', default='').rstrip('/')
if _frontend_url and _frontend_url not in CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS.append(_frontend_url)

# Cookie secure khi chạy HTTPS (admin/session)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# ── Database ────────────────────────────────────────────────
DATABASE_URL = config('DATABASE_URL', default=None)

if DATABASE_URL:
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=60,
            conn_health_checks=True,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE':   'django.db.backends.postgresql',
            'NAME':     config('DB_NAME',     default='phonestore_db'),
            'USER':     config('DB_USER',     default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default=''),
            'HOST':     config('DB_HOST',     default='db'),
            'PORT':     config('DB_PORT',     default='5432'),
            'CONN_MAX_AGE': 60,
        }
    }

# ── CORS — env CORS_ALLOWED_ORIGINS + FRONTEND_URL + regex *.onrender.com (base)
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

_env_cors = [
    origin.strip().rstrip('/')
    for origin in config('CORS_ALLOWED_ORIGINS', default='').split(',')
    if origin.strip()
]
_origins = list(CORS_ALLOWED_ORIGINS)  # noqa: F405
for _origin in _env_cors + ([_frontend_url] if _frontend_url else []):
    if _origin not in _origins:
        _origins.append(_origin)
CORS_ALLOWED_ORIGINS = _origins

# ── Static / Media
STATIC_ROOT = BASE_DIR / 'staticfiles'  # noqa: F405
MEDIA_ROOT  = BASE_DIR / 'media'        # noqa: F405
# Render free tier không có nginx đứng trước backend → Django tự serve /media/
SERVE_MEDIA = config('SERVE_MEDIA', default=True, cast=bool)

# ── Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',  # INFO để thấy migration output
    },
    'loggers': {
        'django': {
            'handlers':  ['console'],
            'level':     'INFO',
            'propagate': False,
        },
    },
}
