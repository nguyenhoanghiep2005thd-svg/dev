from .base import *  # noqa: F401,F403
from decouple import config, UndefinedValueError
import os

DEBUG = False

# SECRET_KEY — bắt buộc
try:
    SECRET_KEY = config('SECRET_KEY')
except UndefinedValueError:
    import secrets
    SECRET_KEY = secrets.token_urlsafe(50)

ALLOWED_HOSTS = ['*']  # Render dùng proxy, cho phép tất cả host

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

# ── CORS — cho phép tất cả *.onrender.com + localhost
CORS_ALLOW_ALL_ORIGINS  = False
CORS_ALLOW_CREDENTIALS  = True

# ── Static
STATIC_ROOT = BASE_DIR / 'staticfiles'  # noqa: F405
MEDIA_ROOT  = BASE_DIR / 'media'        # noqa: F405

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
