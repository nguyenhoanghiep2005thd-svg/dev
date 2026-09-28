# ──────────────────────────────────────────────────────────────
#  PhoneStore Frontend — React + Vite → Nginx
#  Multi-stage: node build → nginx serve (image ~25MB)
# ──────────────────────────────────────────────────────────────

# ── Stage 1: Builder ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Tắt SSL strict check (cho môi trường corporate/VPN)
RUN npm config set strict-ssl false

# Copy package files
COPY package.json ./

# Dùng npm install (không cần lockfile)
RUN npm install --prefer-offline || \
    npm install --registry https://registry.npmmirror.com --strict-ssl false

# Copy source code
COPY . .

# Build production bundle
RUN npm run build


# ── Stage 2: Nginx serve ─────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Xóa config mặc định
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx config và built files
COPY nginx.conf                    /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist      /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
