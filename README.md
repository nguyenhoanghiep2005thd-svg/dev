# PhoneStore — Website Bán Điện Thoại

## Cấu trúc project

```
devops/
├── backend/          # Django REST Framework
├── frontend/         # React + Vite + Tailwind CSS
├── database/         # SQL schema & seed data
├── docker-compose.yml
└── README.md
```

---

## Chạy Frontend (Development)

```bash
cd frontend

# Nếu npm install chậm, dùng mirror
npm install --registry https://registry.npmmirror.com

# Hoặc dùng yarn
# yarn install

# Chạy dev server
npm run dev
# → http://localhost:5173
```

---

## Chạy Backend (Development)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

# Tạo file .env (copy từ .env.example)
# Sửa DB_HOST=localhost nếu chạy local

python manage.py migrate
python manage.py seed_data
python manage.py runserver
# → http://localhost:8000
# → http://localhost:8000/api/docs/  (Swagger UI)
```

---

## Chạy toàn bộ bằng Docker

```bash
# Build & start tất cả services
docker-compose up -d --build

# Chạy migrations
docker-compose exec backend python manage.py migrate

# Import seed data
docker-compose exec backend python manage.py seed_data
docker-compose exec -T db psql -U postgres -d phonestore_db < database/seed_data.sql

# Truy cập
# Frontend: http://localhost
# Backend API: http://localhost:8000/api/v1/
# API Docs: http://localhost:8000/api/docs/
```

---

## Tài khoản demo

| Role  | Email                     | Password     |
|-------|---------------------------|--------------|
| Admin | admin@phonestore.vn       | admin123456  |
| User  | nguyenvana@gmail.com      | user123456   |

---

## Các trang Frontend

| URL                        | Trang                     |
|----------------------------|---------------------------|
| /                          | Trang chủ                 |
| /products                  | Danh sách sản phẩm        |
| /products?brand_slug=apple | Lọc theo hãng             |
| /products?search=iphone    | Tìm kiếm                  |
| /products/:id              | Chi tiết sản phẩm         |
| /cart                      | Giỏ hàng                  |
| /checkout                  | Thanh toán                |
| /login                     | Đăng nhập                 |
| /register                  | Đăng ký                   |
| /orders                    | Lịch sử đơn hàng          |
| /profile                   | Trang cá nhân             |

---

## API Endpoints

| Method | URL                              | Mô tả               |
|--------|----------------------------------|---------------------|
| POST   | /api/v1/auth/register/           | Đăng ký             |
| POST   | /api/v1/auth/login/              | Đăng nhập           |
| POST   | /api/v1/auth/logout/             | Đăng xuất           |
| GET    | /api/v1/products/                | Danh sách sản phẩm  |
| GET    | /api/v1/products/?search=iphone  | Tìm kiếm            |
| GET    | /api/v1/products/?brand_slug=apple | Lọc hãng          |
| GET    | /api/v1/products/?price_min=5000000&price_max=15000000 | Lọc giá |
| POST   | /api/v1/products/                | Thêm SP (admin)     |
| GET    | /api/v1/products/brands/         | Danh sách hãng      |
| GET    | /api/v1/orders/cart/             | Xem giỏ hàng        |
| POST   | /api/v1/orders/cart/add/         | Thêm vào giỏ        |
| POST   | /api/v1/orders/create/           | Đặt hàng            |
| GET    | /api/v1/orders/                  | Lịch sử đơn hàng    |
