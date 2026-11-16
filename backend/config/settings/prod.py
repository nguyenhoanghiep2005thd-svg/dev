from .base import *  # noqa: F401,F403
from decouple import config, UndefinedValueError

DEBUG = False

try:
    SECRET_KEY = config('SECRET_KEY')
except UndefinedValueError:
    import secrets
    SECRET_KEY = secrets.token_urlsafe(50)

ALLOWED_HOSTS = ['*']

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

CSRF_TRUSTED_ORIGINS = [
    'https://*.onrender.com',
    'https://*.vercel.app',
]
_env_csrf = [
    origin.strip().rstrip('/')
    for origin in config('CSRF_TRUSTED_ORIGINS', default='').split(',')
    if origin.strip()
]
for o in _env_csrf:
    if o not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(o)

_frontend_url = config('FRONTEND_URL', default='').rstrip('/')
if _frontend_url and _frontend_url not in CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS.append(_frontend_url)

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

DATABASE_URL = config('DATABASE_URL', default=None)
USE_SQLITE = config('USE_SQLITE', default=False, cast=bool)

if DATABASE_URL:
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=60,
            conn_health_checks=True,
        )
    }
elif USE_SQLITE:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
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

STATIC_ROOT = BASE_DIR / 'staticfiles'  # noqa: F405
MEDIA_ROOT  = BASE_DIR / 'media'        # noqa: F405
SERVE_MEDIA = config('SERVE_MEDIA', default=True, cast=bool)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers':  ['console'],
            'level':     'INFO',
            'propagate': False,
        },
    },
}
