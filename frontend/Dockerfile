# ──────────────────────────────────────────────────────────────
#  PhoneStore Frontend — React + Vite → Nginx
#  Multi-stage: node build → nginx serve
# ──────────────────────────────────────────────────────────────

# ── Stage 1: Builder ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# VITE_* phải có lúc build — Vite nhúng vào bundle
# Render/Docker Compose truyền qua build-arg / env
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build


# ── Stage 2: Nginx serve ─────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# envsubst (gettext) để inject PORT + BACKEND_URL lúc runtime
RUN apk add --no-cache gettext \
    && rm -f /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

# Mặc định: docker-compose (backend service trong cùng network)
# Render override bằng envVars BACKEND_URL
ENV PORT=80 \
    BACKEND_URL=http://backend:8000

EXPOSE 80

# Render inject PORT (thường 10000); docker-compose dùng 80
# BACKEND_URL bắt buộc đúng trên Render — nếu trỏ "http://backend:8000" (default
# của docker-compose) thì nginx không resolve được và container chết ngay.
CMD ["sh", "-c", "if echo \"$BACKEND_URL\" | grep -q '://backend:'; then echo \"[ERROR] BACKEND_URL=$BACKEND_URL — trên Render phải là URL thật của service backend (https://<tên-backend>.onrender.com)\"; fi; envsubst '${PORT} ${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
