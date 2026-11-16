# PhoneStore — Hệ Thống Website Thương Mại Điện Tử Bán Điện Thoại

PhoneStore là nền tảng thương mại điện tử chuyên nghiệp dành cho kinh doanh điện thoại thông minh, được tối ưu hóa toàn diện cho việc chạy local, triển khai Docker và đưa lên các nền tảng đám mây như **Render**, **Railway**, **Fly.io**, **Vercel**...

---

## 📁 Cấu Trúc Dự Án

```
d:/devops/
├── backend/                  # Django REST Framework + Gunicorn + WhiteNoise
│   ├── apps/
│   │   ├── accounts/         # Quản lý người dùng, JWT Authentication, phân quyền Admin
│   │   ├── products/         # Sản phẩm, hãng, danh mục, hình ảnh, đánh giá & nhận xét (Reviews)
│   │   └── orders/           # Giỏ hàng biến thể, đơn hàng, mã giảm giá (Coupons), thống kê doanh thu
│   ├── config/               # Cấu hình Django (base.py, dev.py, prod.py, urls.py)
│   ├── Dockerfile            # Multi-stage Dockerfile chạy production
│   └── requirements.txt      # Thư viện Python (Django, DRF, JWT, WhiteNoise, PostgreSQL...)
│
├── frontend/                 # React 18 + Vite + Tailwind CSS + Zustand
│   ├── src/
│   │   ├── components/       # Header, Footer, ProductCard, AdminLayout, CartDrawer...
│   │   ├── pages/            # Trang chủ, Chi tiết SP, Giỏ hàng, Thanh toán, Yêu thích, Đơn hàng, Profile, Admin Dashboard...
│   │   ├── store/            # Quản lý state toàn cục: authStore, cartStore, wishlistStore
│   │   └── services/         # Tầng gọi API axios, xử lý lỗi và auto-retry
│   ├── Dockerfile            # Multi-stage build Node -> Nginx reverse proxy
│   └── nginx.conf            # Cấu hình Nginx phục vụ SPA & reverse proxy API
│
├── render.yaml               # Render Blueprint (1-Click Deploy cả Backend & Frontend)
├── DEPLOY_RENDER.md          # Hướng dẫn chi tiết từng bước deploy lên Render
├── docker-compose.yml        # Chạy toàn bộ hệ thống bằng Docker
└── README.md
```

---

## 🌟 Các Tính Năng Nổi Bật & Mới Cập Nhật

### 1. Phía Khách Hàng (Customer UI/UX):
- **Trang chủ & Danh sách sản phẩm**: Hero banner, bộ lọc đa năng (hãng, danh mục, tầm giá, RAM, bộ nhớ trong), tìm kiếm theo từ khóa tức thì.
- **Biến thể sản phẩm**: Lựa chọn màu sắc và dung lượng bộ nhớ linh hoạt khi thêm vào giỏ hàng hoặc mua ngay.
- **Danh sách yêu thích (Wishlist)**: Lưu lại sản phẩm yêu thích chỉ với 1 click vào biểu tượng trái tim, hiển thị số lượng trực tiếp trên thanh Header.
- **Đánh giá & Nhận xét (Reviews)**: Chấm điểm 1-5 sao kèm nhận xét chi tiết, tính điểm trung bình (`avg_rating`) và hiển thị số lượt đánh giá.
- **Hệ thống Mã giảm giá (Coupons / Vouchers)**:
  - `PHONESTORE10`: Giảm 10% (tối đa 1.000.000 VNĐ).
  - `FREESHIP`: Miễn phí vận chuyển toàn quốc (30.000 VNĐ).
  - `CHAOBANMOI`: Giảm 200.000 VNĐ cho đơn từ 2 triệu VNĐ.
  - `VIP500`: Giảm 500.000 VNĐ cho đơn từ 10 triệu VNĐ.
- **Thanh toán đa kênh chuyên nghiệp**:
  - **COD**: Thanh toán tiền mặt khi nhận hàng.
  - **Chuyển khoản VietQR**: Sinh mã QR ngân hàng thật 100% tự động điền số tài khoản, số tiền và nội dung chuyển khoản theo mã đơn hàng.
  - **Cổng trực tuyến (Mô phỏng VNPay / MoMo)**: Cho phép quét mã QR và giả lập thanh toán thành công tức thì.
- **Theo dõi đơn hàng (Timeline Stepper)**: Tiến trình 4 bước trực quan: *Chờ xác nhận → Đã xác nhận → Đang giao → Đã giao*.
- **Mua lại (Re-order)**: Nút mua lại đơn hàng cũ nhanh chóng chỉ bằng 1 thao tác.

### 2. Phía Quản Trị Viên (Admin Dashboard):
- **Thống kê doanh thu**: Biểu đồ doanh thu 7 ngày, tổng số đơn, tỷ lệ đơn hàng theo trạng thái, cảnh báo sản phẩm sắp hết hàng.
- **Quản lý sản phẩm**: Thêm mới, chỉnh sửa thông số kỹ thuật JSON, tải lên nhiều ảnh sản phẩm, chuyển đổi trạng thái hiển thị.
- **Quản lý đơn hàng**: Xem chi tiết đơn hàng, cập nhật trạng thái đơn (duyệt đơn, giao hàng, hủy đơn).
- **Quản lý tài khoản**: Danh sách người dùng, kích hoạt / khóa tài khoản.

---

## 🚀 Hướng Dẫn Chạy Dự Án

### Cách 1: Chạy Bằng Docker Compose (Nhanh nhất & Đầy đủ nhất)
Yêu cầu: Đã cài đặt Docker Desktop.
```bash
# Khởi động PostgreSQL, Django Backend và React Nginx Frontend
docker-compose up -d --build

# Chạy migrations & nạp dữ liệu mẫu
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py seed_data

# Truy cập website:
# Frontend: http://localhost:80
# Backend API: http://localhost:8000/api/v1/
# API Swagger Docs: http://localhost:8000/api/docs/
# Django Admin: http://localhost:8000/admin/
```

### Cách 2: Chạy Môi Trường Development (Local)

**Khởi chạy Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Trên Windows
pip install -r requirements.txt

# Chạy migration & nạp dữ liệu mẫu (mặc định hỗ trợ SQLite hoặc PostgreSQL)
python manage.py migrate
python manage.py seed_data
python manage.py runserver
# → http://localhost:8000
```

**Khởi chạy Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## ☁️ Hướng Dẫn Deploy Lên Render (Render.com)

Dự án đã được cấu hình sẵn file `render.yaml` chuẩn Blueprint:

1. Đăng ký tài khoản database PostgreSQL miễn phí tại [Neon.tech](https://neon.tech) và copy chuỗi kết nối (`DATABASE_URL`).
2. Truy cập [Dashboard Render](https://dashboard.render.com) → **New +** → **Blueprint**.
3. Chọn Git repository của bạn, Render sẽ tự động phát hiện cả 2 dịch vụ:
   - `phonestore-backend`: Chạy Docker Gunicorn với WhiteNoise phục vụ static file.
   - `phonestore-frontend`: Chạy Docker Nginx tự động kết nối qua Backend URL.
4. Dán chuỗi `DATABASE_URL` từ Neon vào biến môi trường được yêu cầu và nhấn **Apply**.
5. Xem thêm hướng dẫn chi tiết tại file [DEPLOY_RENDER.md](DEPLOY_RENDER.md).

---

## 🔑 Tài Khoản Demo Hệ Thống

| Vai trò | Email đăng nhập | Mật khẩu |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@phonestore.com` | `admin123456` |
| **Khách hàng (User)** | `user@phonestore.com` | `user123456` |
