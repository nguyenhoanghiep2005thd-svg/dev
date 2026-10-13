# ──────────────────────────────────────────────────────────────
#  PhoneStore Frontend — React + Vite → Nginx
#  Multi-stage: node build → nginx serve
# ──────────────────────────────────────────────────────────────

# ── Stage 1: Builder ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# npm install chuẩn — Render có internet tốt
RUN npm install

# Copy source code và build
COPY . .
RUN npm run build


# ── Stage 2: Nginx serve ─────────────────────────────────────
FROM nginx:1.27-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf                /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist  /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
