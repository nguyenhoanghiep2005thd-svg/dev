# Hướng Dẫn Deploy PhoneStore Lên Render & Các Nền Tảng Cloud

Website **PhoneStore** được thiết kế và tối ưu hoàn chỉnh để chạy mượt mà trên **Render.com**, **Railway**, **Fly.io**, hoặc bất kỳ nền tảng Docker Container nào.

---

## 🚀 Cách 1: Deploy Bằng Render Blueprint (Khuyên Dùng — 1 Click)

Render hỗ trợ file `render.yaml` để tự động tạo và liên kết cả 2 service: **Backend (Django)** và **Frontend (React)**.

### Bước 1: Tạo Database PostgreSQL Miễn Phí (Neon hoặc Supabase)
1. Truy cập [Neon.tech](https://neon.tech) hoặc [Supabase.com](https://supabase.com) tạo database PostgreSQL miễn phí (hoặc tạo PostgreSQL trên Render).
2. Copy chuỗi kết nối (`Connection String` hoặc `DATABASE_URL`), dạng:
   ```
   postgresql://username:password@ep-sample-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### Bước 2: Deploy Blueprint trên Render
1. Đăng nhập vào [Dashboard Render](https://dashboard.render.com).
2. Nhấn **New +** → Chọn **Blueprint**.
3. Kết nối với Git repository của bạn chứa source code dự án này.
4. Render sẽ tự động đọc file `render.yaml` và nhận diện:
   - `phonestore-backend`: Django + Gunicorn (Docker)
   - `phonestore-frontend`: React + Nginx (Docker)
5. Tại ô cấu hình biến môi trường `DATABASE_URL`, dán chuỗi kết nối PostgreSQL bạn vừa copy ở Bước 1.
6. Nhấn **Apply**. Render sẽ tự động:
   - Build Docker image cho backend.
   - Chạy lệnh `migrate`, `collectstatic`, và nạp dữ liệu mẫu `seed_data`.
   - Build Docker image cho frontend và cấu hình Nginx reverse proxy trỏ sang backend.
7. Khi cả 2 service chuyển sang trạng thái **Live**, mở URL của `phonestore-frontend` để trải nghiệm website!

---

## 🛠️ Cách 2: Deploy Từng Web Service Thủ Công trên Render

Nếu không dùng Blueprint, bạn có thể tạo 2 Web Service riêng biệt:

### 1. Tạo Backend Service:
- Nhấn **New +** → **Web Service** → Chọn repository.
- **Name**: `phonestore-backend`
- **Region**: Singapore
- **Language / Runtime**: `Docker`
- **Docker Command / Context**: `backend`
- **Dockerfile Path**: `backend/Dockerfile`
- **Instance Type**: `Free`
- **Health Check Path**: `/api/v1/health/`
- **Environment Variables**:
  - `DJANGO_SETTINGS_MODULE`: `config.settings.prod`
  - `SECRET_KEY`: (nhấn Generate)
  - `DEBUG`: `False`
  - `DATABASE_URL`: (chuỗi kết nối Neon PostgreSQL)
  - `FRONTEND_URL`: (URL của frontend service trên Render)
  - `CSRF_TRUSTED_ORIGINS`: `https://*.onrender.com`
  - `CORS_ALLOWED_ORIGINS`: `https://*.onrender.com`

### 2. Tạo Frontend Service:
- Nhấn **New +** → **Web Service** → Chọn repository.
- **Name**: `phonestore-frontend`
- **Region**: Singapore
- **Language / Runtime**: `Docker`
- **Docker Command / Context**: `frontend`
- **Dockerfile Path**: `frontend/Dockerfile`
- **Instance Type**: `Free`
- **Health Check Path**: `/`
- **Environment Variables**:
  - `BACKEND_URL`: `https://<ten-backend-service>.onrender.com` (URL của backend service)

---

## 💻 Cách 3: Chạy Toàn Bộ Bằng Docker Compose (Local / VPS)

```bash
# 1. Khởi động PostgreSQL, Backend Django và Frontend Nginx
docker-compose up -d --build

# 2. Truy cập
# - Frontend: http://localhost:80
# - Backend API: http://localhost:8000/api/v1/
# - API Swagger Docs: http://localhost:8000/api/docs/
# - Django Admin: http://localhost:8000/admin/
```

---

## 🔑 Tài Khoản Demo

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@phonestore.com` | `admin123456` |
| **Khách hàng (User)** | `user@phonestore.com` | `user123456` |

---

## 🎁 Mã Giảm Giá Khuyến Mãi Có Thể Test

- `PHONESTORE10`: Giảm 10% tối đa 1.000.000 VNĐ.
- `FREESHIP`: Miễn phí vận chuyển toàn quốc (30.000 VNĐ).
- `CHAOBANMOI`: Giảm 200.000 VNĐ cho đơn hàng từ 2 triệu VNĐ.
- `VIP500`: Giảm 500.000 VNĐ cho đơn hàng từ 10 triệu VNĐ.

---

## ✨ Tính Năng Nổi Bật Đã Cập Nhật

1. **Đầy đủ tính năng E-Commerce**:
   - Duyệt sản phẩm, lọc theo hãng, mức giá, RAM, dung lượng bộ nhớ.
   - Tìm kiếm nhanh sản phẩm theo từ khóa.
   - Danh sách yêu thích (Wishlist) lưu trữ tức thì và đồng bộ trên Header.
   - Đánh giá & nhận xét sản phẩm (1-5 sao, nhận xét thực tế từ khách hàng).
   - Chọn biến thể Màu sắc & Dung lượng bộ nhớ khi mua hàng.
   - Áp dụng mã giảm giá / Voucher ngay trong Giỏ hàng và Thanh toán.
   - Thanh toán đa kênh:
     - COD (Thanh toán khi nhận hàng).
     - Chuyển khoản VietQR: sinh mã QR ngân hàng thật 100% tự động điền số tài khoản, số tiền và mã đơn hàng.
     - Ví điện tử online (Mô phỏng VNPay / MoMo).
   - Theo dõi tiến trình đơn hàng (Timeline Stepper): Chờ xác nhận → Đã xác nhận → Đang giao → Đã giao.
   - Nút "Mua lại" đơn hàng nhanh chóng chỉ với 1 click.
2. **Trang Quản trị Admin Dashboard**:
   - Thống kê doanh thu 7 ngày, tổng số đơn hàng, tỷ lệ trạng thái đơn, tồn kho sản phẩm.
   - Quản lý sản phẩm, thêm/sửa/xóa, upload nhiều ảnh sản phẩm.
   - Quản lý trạng thái đơn hàng (duyệt đơn, chuyển giao hàng, hoàn thành).
   - Quản lý danh sách người dùng.
3. **Sẵn sàng triển khai Cloud**:
   - WhiteNoise phục vụ static files nén và cache tối ưu.
   - Chế độ tự phục hồi nếu server Render ngủ (auto wakeup & retry).
   - Healthcheck tách biệt tránh vòng lặp kiểm tra dịch vụ.
