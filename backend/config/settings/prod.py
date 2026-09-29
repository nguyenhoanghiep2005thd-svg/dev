from .base import *  # noqa: F401,F403
from decouple import config, Csv
import os

DEBUG = False

SECRET_KEY    = config('SECRET_KEY')
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='.onrender.com').split(',')

# ── Database — hỗ trợ cả DATABASE_URL (Render) và DB_* riêng ─
DATABASE_URL = config('DATABASE_URL', default=None)

if DATABASE_URL:
    # Render cung cấp DATABASE_URL dạng postgres://user:pass@host:port/db
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=60,
            conn_health_checks=True,
        )
    }
else:
    # Fallback: dùng DB_* riêng (Docker Compose local)
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

# ── CORS ─────────────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS   = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost',
    cast=Csv(),
)

# ── Static & Media ─────────────────────────────────────────────
STATIC_ROOT = BASE_DIR / 'staticfiles'   # noqa: F405
MEDIA_ROOT  = BASE_DIR / 'media'         # noqa: F405

# ── Security ──────────────────────────────────────────────────
SECURE_BROWSER_XSS_FILTER    = True
SECURE_CONTENT_TYPE_NOSNIFF  = True
X_FRAME_OPTIONS               = 'DENY'

# ── Logging ───────────────────────────────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style':  '{',
        },
    },
    'handlers': {
        'console': {
            'class':     'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level':    'WARNING',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level':    config('DJANGO_LOG_LEVEL', default='WARNING'),
            'propagate': False,
        },
    },
}
