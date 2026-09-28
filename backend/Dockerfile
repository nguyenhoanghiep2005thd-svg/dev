# ──────────────────────────────────────────────────────────────
#  PhoneStore Backend — Django + Gunicorn
#  Multi-stage: builder cài deps, runner chạy app
# ──────────────────────────────────────────────────────────────

# ── Stage 1: Builder — cài Python dependencies ──────────────
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Cài build deps cho psycopg2, Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Cài Python packages vào thư mục riêng để copy sang stage sau
COPY requirements.txt .
RUN pip install --prefix=/install --no-cache-dir \
    --trusted-host pypi.org \
    --trusted-host pypi.python.org \
    --trusted-host files.pythonhosted.org \
    -r requirements.txt


# ── Stage 2: Runner — image cuối cùng gọn nhẹ ──────────────
FROM python:3.12-slim AS runner

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.prod

WORKDIR /app

# Chỉ cài runtime deps (không cần gcc)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libjpeg62-turbo \
    && rm -rf /var/lib/apt/lists/*

# Copy packages từ builder
COPY --from=builder /install /usr/local

# Copy source code
COPY . .

# Tạo thư mục static/media, tạo user không phải root
RUN mkdir -p /app/staticfiles /app/media \
    && addgroup --system appgroup \
    && adduser  --system --ingroup appgroup appuser \
    && chown -R appuser:appgroup /app

USER appuser

# Gunicorn thay thế runserver trong production
EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "3", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
