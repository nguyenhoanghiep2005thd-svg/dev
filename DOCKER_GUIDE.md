# PhoneStore — Hướng dẫn Docker

## Cấu trúc services

```
┌─────────────────────────────────────────────────────────────┐
│  Browser  →  :80  →  Nginx (frontend)                       │
│                         ↓ /api/*                            │
│                    Django (backend) :8000                   │
│                         ↓                                   │
│                    PostgreSQL (db) :5432                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Bước 1 — Chuẩn bị

```powershell
# Kiểm tra Docker đã cài chưa
docker --version
docker compose version

# Đứng tại thư mục gốc project
cd d:\devops
```

---

## Bước 2 — docker build

### Build tất cả services cùng lúc

```powershell
docker compose build
```

### Build từng service riêng

```powershell
# Build backend
docker compose build backend

# Build frontend
docker compose build frontend

# Build với --no-cache (khi cần rebuild sạch)
docker compose build --no-cache

# Build và hiện progress chi tiết
docker compose build --progress=plain backend
```

---

## Bước 3 — docker images

```powershell
# Xem tất cả images đã build
docker images

# Lọc chỉ images của project này
docker images | findstr phonestore

# Xem chi tiết size từng layer
docker image inspect phonestore-backend
docker image inspect phonestore-frontend
```

**Output mẫu:**
```
REPOSITORY             TAG       IMAGE ID       SIZE
devops-backend         latest    abc123def456   280MB
devops-frontend        latest    789xyz012345   45MB
postgres               16-alpine 111aaa222bbb   87MB
```

---

## Bước 4 — docker run (khởi động project)

### Cách 1 — Chạy toàn bộ stack (khuyến nghị)

```powershell
# Khởi động tất cả services (detached mode)
docker compose up -d

# Xem log trong khi khởi động
docker compose up

# Khởi động và build lại nếu code thay đổi
docker compose up -d --build
```

### Cách 2 — Chạy từng bước (lần đầu setup)

```powershell
# Bước 1: Khởi động database trước
docker compose up -d db

# Chờ DB sẵn sàng (khoảng 10 giây)
Start-Sleep -Seconds 10

# Bước 2: Chạy migrate
docker compose run --rm backend python manage.py migrate

# Bước 3: Tạo dữ liệu mẫu
docker compose run --rm backend python manage.py seed_data

# Bước 4: Khởi động tất cả
docker compose up -d
```

### Cách 3 — Chạy container riêng lẻ (không dùng compose)

```powershell
# Run database
docker run -d \
  --name phonestore_db \
  -e POSTGRES_DB=phonestore_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=PhoneStore@2024 \
  -p 5432:5432 \
  postgres:16-alpine

# Run backend (sau khi db đang chạy)
docker run -d \
  --name phonestore_backend \
  --link phonestore_db:db \
  -p 8000:8000 \
  --env-file backend/.env \
  devops-backend

# Run frontend
docker run -d \
  --name phonestore_frontend \
  -p 80:80 \
  devops-frontend
```

---

## Bước 5 — docker ps (kiểm tra containers)

```powershell
# Xem containers đang chạy
docker ps

# Xem tất cả containers (kể cả đã dừng)
docker ps -a

# Xem chỉ containers của project này
docker compose ps

# Xem status chi tiết
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

**Output mẫu khi chạy thành công:**
```
NAME                    STATUS          PORTS
phonestore_frontend     Up 2 minutes    0.0.0.0:80->80/tcp
phonestore_backend      Up 2 minutes    8000/tcp
phonestore_db           Up 2 minutes    5432/tcp
```

---

## Bước 6 — docker logs

```powershell
# Xem log tất cả services
docker compose logs

# Xem log real-time (follow)
docker compose logs -f

# Xem log từng service
docker compose logs backend
docker compose logs frontend
docker compose logs db

# Xem log real-time của backend
docker compose logs -f backend

# Xem 50 dòng log cuối
docker compose logs --tail=50 backend

# Xem log từ container trực tiếp
docker logs phonestore_backend
docker logs phonestore_backend -f --tail=100
```

---

## Bước 7 — Kiểm tra website chạy thành công

### 7.1 Kiểm tra containers healthy

```powershell
docker compose ps
# Tất cả STATUS phải là "Up" hoặc "healthy"
```

### 7.2 Kiểm tra từng endpoint

```powershell
# Website frontend
curl http://localhost
# Hoặc mở browser: http://localhost

# Backend API health check
curl http://localhost/api/v1/products/
# Phải trả về JSON danh sách sản phẩm

# API docs (Swagger)
# Mở browser: http://localhost/api/docs/

# Django admin
# Mở browser: http://localhost/admin/
```

### 7.3 Kiểm tra database

```powershell
# Kết nối vào postgres container
docker compose exec db psql -U postgres -d phonestore_db

# Trong psql:
\dt                          -- xem danh sách bảng
SELECT COUNT(*) FROM products_product;  -- đếm sản phẩm
\q                           -- thoát
```

### 7.4 Kiểm tra backend logs không có lỗi

```powershell
docker compose logs backend | findstr -v "GET\|POST"
# Không được có: ERROR, CRITICAL, Exception
```

### 7.5 Test đăng nhập admin

```
URL:      http://localhost/admin
Email:    admin@phonestore.vn  (sau khi chạy seed_data)
Password: admin123456
```

---

## Lệnh quản lý hằng ngày

```powershell
# Dừng tất cả (giữ data)
docker compose stop

# Khởi động lại
docker compose start

# Restart 1 service
docker compose restart backend

# Dừng và xóa containers (giữ volumes/data)
docker compose down

# Dừng và XÓA LUÔN volumes (mất data!)
docker compose down -v

# Rebuild và restart 1 service
docker compose up -d --build backend

# Exec vào container backend
docker compose exec backend sh

# Chạy lệnh Django management
docker compose exec backend python manage.py shell
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_data
```

---

## Xử lý lỗi thường gặp

### Lỗi: Port 80 đã bị dùng

```powershell
# Tìm process đang dùng port 80
netstat -ano | findstr :80

# Đổi port trong docker-compose.yml
# ports: - "8080:80"   # đổi 80 thành 8080
```

### Lỗi: Backend không kết nối được database

```powershell
# Kiểm tra db container healthy chưa
docker compose ps db

# Xem log db
docker compose logs db

# Thử kết nối thủ công
docker compose exec backend python manage.py dbshell
```

### Lỗi: npm install thất bại (SSL)

```powershell
# Build với SSL disabled
docker compose build --build-arg NPM_ARGS="--strict-ssl false" frontend
```

### Reset hoàn toàn (xóa hết data)

```powershell
docker compose down -v --remove-orphans
docker system prune -f
docker compose up -d --build
```

---

## Tóm tắt nhanh — Chạy lần đầu

```powershell
cd d:\devops

# 1. Build
docker compose build

# 2. Start
docker compose up -d

# 3. Migrate + seed (lần đầu)
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_data

# 4. Kiểm tra
docker compose ps
curl http://localhost

# 5. Mở browser
start http://localhost
```
