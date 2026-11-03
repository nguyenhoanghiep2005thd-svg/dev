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
# BACKEND_URL được normalize (bỏ dấu / cuối — để lại sẽ thành //api/v1 → 404 mọi request)
# và cảnh báo nếu vẫn là default docker-compose: trên Render tên "backend" không resolve
# được → nginx [emerg] host not found in upstream → container crash-loop.
CMD ["sh", "-c", "BACKEND_URL=$(printf '%s' \"$BACKEND_URL\" | sed 's:/*$::'); export BACKEND_URL; case \"$BACKEND_URL\" in http://*|https://*) ;; *) echo \"[ERROR] BACKEND_URL khong hop le hoac rong: '$BACKEND_URL'\"; exit 1;; esac; if echo \"$BACKEND_URL\" | grep -q '://backend:'; then echo \"[ERROR] BACKEND_URL=$BACKEND_URL la default cua docker-compose. Tren Render: Environment -> them BACKEND_URL = URL that cua service backend (vidu https://ten-backend.onrender.com), roi redeploy.\"; fi; envsubst '${PORT} ${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
