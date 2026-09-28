from .base import *  # noqa

DEBUG = True

# Cho phép tất cả host trong môi trường dev
ALLOWED_HOSTS = ['*']

# Hiển thị SQL queries trong console (bật khi cần debug)
# LOGGING = {
#     'version': 1,
#     'handlers': {'console': {'class': 'logging.StreamHandler'}},
#     'loggers': {'django.db.backends': {'handlers': ['console'], 'level': 'DEBUG'}},
# }
