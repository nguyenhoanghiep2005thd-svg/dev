# Database Design — Phone Store

## Cách chạy schema

### Với Docker Compose (khuyến nghị)
```bash
# Từ thư mục gốc d:\devops
docker-compose up -d db

# Chạy schema vào database
docker-compose exec -T db psql -U postgres -d phonestore_db < database/schema.sql
```

### Với psql cài local
```bash
# Tạo database
psql -U postgres -c "CREATE DATABASE phonestore_db;"

# Chạy schema
psql -U postgres -d phonestore_db -f database/schema.sql
```

### Verify sau khi chạy
```sql
-- Kiểm tra các bảng đã tạo
\dt

-- Kiểm tra dữ liệu seed
SELECT name, price, sale_price FROM products;
SELECT name FROM brands;
```

---

## Sơ đồ quan hệ (ERD)

```
roles                    users
─────────────────        ────────────────────────────────────
PK  id SERIAL            PK  id BIGSERIAL
    name VARCHAR(50) UQ      email VARCHAR(254) UQ
    description              password VARCHAR(128)
    created_at               full_name VARCHAR(150)
                             phone VARCHAR(15)
         │                   address TEXT
         │ (M:N)             role VARCHAR(10)  ← 'user'|'admin'
         │                   is_active BOOLEAN
    user_roles               is_staff BOOLEAN
    ───────────              is_superuser BOOLEAN
 PK id BIGSERIAL             last_login TIMESTAMPTZ
 FK user_id ──────────────►  created_at TIMESTAMPTZ
 FK role_id ──────────────►  updated_at TIMESTAMPTZ
    assigned_at                    │               │
                                   │               │
                             (1:1) │         (1:N) │
                                   ▼               ▼
brands                           carts           orders
──────────────────           ─────────────    ─────────────────────────────
PK  id SERIAL             PK  id BIGSERIAL   PK  id BIGSERIAL
    name VARCHAR(100) UQ  FK  user_id UQ ──► FK  user_id (SET NULL)
    slug VARCHAR(120) UQ      created_at          status VARCHAR(20)
    logo VARCHAR(255)          updated_at          shipping_full_name
    description                   │               shipping_phone
    is_active                     │ (1:N)         shipping_address
    created_at                    ▼               payment_method
         │                   cart_items           note TEXT
         │ (1:N)             ──────────────────   total_price NUMERIC
         │               PK  id BIGSERIAL         created_at
categories                FK  cart_id ──────────► updated_at
──────────────────        FK  user_id                   │
PK  id SERIAL             FK  product_id ──────┐        │ (1:N)
    name VARCHAR(100) UQ      quantity INT      │        ▼
    slug VARCHAR(120) UQ      created_at        │   order_items
    description               updated_at        │   ──────────────────────
    is_active                                   │PK id BIGSERIAL
    created_at                                  │FK order_id ──────────────►
         │                                      │FK product_id (SET NULL) ─┐
         │ (1:N)   ┌──────────────────────────┘ │   product_name (snapshot)│
         │         │                              │   product_image          │
         ▼         ▼                              │   price (snapshot)       │
      products ◄───┘                             │   quantity               │
      ─────────────────────                      │   created_at             │
   PK id BIGSERIAL                               │                          │
   FK brand_id ──────────────────────────────────┘                          │
   FK category_id                                                           │
      name VARCHAR(255)                                                     │
      slug VARCHAR(300) UQ                                                  │
      description TEXT                                                      │
      price NUMERIC(12,0)                                                   │
      sale_price NUMERIC(12,0)                                              │
      stock INT                                                             │
      specs JSONB                                                           │
      is_active BOOLEAN                                                     │
      created_at / updated_at                                               │
            │                                                               │
            │ (1:N)                                                         │
            ▼                                                               │
      product_images                                                        │
      ─────────────────                                                     │
   PK id BIGSERIAL                                                          │
   FK product_id ────────────────────────────────────────────────────────►─┘
      image VARCHAR(255)
      alt_text VARCHAR(200)
      is_primary BOOLEAN
      order SMALLINT
      created_at
```

---

## Chi tiết từng bảng

### 1. `roles` — Vai trò hệ thống
| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | SERIAL PK | Auto increment |
| name | VARCHAR(50) UNIQUE | 'user', 'admin' |
| description | VARCHAR(255) | Mô tả vai trò |
| created_at | TIMESTAMPTZ | Ngày tạo |

### 2. `users` — Tài khoản người dùng
| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | BIGSERIAL PK | Auto increment |
| email | VARCHAR(254) UNIQUE | Login bằng email |
| password | VARCHAR(128) | Django hashed (PBKDF2) |
| full_name | VARCHAR(150) | Họ tên đầy đủ |
| phone | VARCHAR(15) | Số điện thoại |
| address | TEXT | Địa chỉ mặc định |
| role | VARCHAR(10) | 'user' hoặc 'admin' |
| is_active | BOOLEAN | Tài khoản còn hoạt động |
| is_staff | BOOLEAN | Truy cập Django admin |
| created_at | TIMESTAMPTZ | Ngày đăng ký |
| updated_at | TIMESTAMPTZ | Lần cập nhật cuối |

### 3. `user_roles` — Bảng trung gian (M:N)
| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | BIGSERIAL PK | |
| user_id | BIGINT FK → users | |
| role_id | INT FK → roles | |
| assigned_at | TIMESTAMPTZ | Thời điểm gán |

### 4. `brands` — Hãng điện thoại
| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | SERIAL PK | |
| name | VARCHAR(100) UNIQUE | Tên hãng |
| slug | VARCHAR(120) UNIQUE | URL-friendly |
| logo | VARCHAR(255) | Path ảnh logo |
| is_active | BOOLEAN | Đang bán |
| created_at | TIMESTAMPTZ | |

### 5. `categories` — Danh mục
| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | SERIAL PK | |
| name | VARCHAR(100) UNIQUE | Tên danh mục |
| slug | VARCHAR(120) UNIQUE | URL-friendly |
| is_active | BOOLEAN | |
| created_at | TIMESTAMPTZ | |

### 6. `products` — Sản phẩm ⭐
| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | BIGSERIAL PK | |
| name | VARCHAR(255) | Tên sản phẩm |
| slug | VARCHAR(300) UNIQUE | URL-friendly + uuid |
| brand_id | INT FK → brands | SET NULL khi xóa brand |
| category_id | INT FK → categories | SET NULL khi xóa category |
| price | NUMERIC(12,0) | Giá gốc VNĐ |
| sale_price | NUMERIC(12,0) NULL | Giá KM, NULL = không KM |
| stock | INT | Số lượng tồn kho |
| specs | JSONB | Thông số kỹ thuật |
| is_active | BOOLEAN | Hiển thị trên web |
| created_at / updated_at | TIMESTAMPTZ | |

### 7. `product_images` — Ảnh sản phẩm
| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | BIGSERIAL PK | |
| product_id | BIGINT FK → products | CASCADE xóa |
| image | VARCHAR(255) | Path file ảnh |
| is_primary | BOOLEAN | Ảnh đại diện |
| order | SMALLINT | Thứ tự gallery |

### 8. `carts` — Giỏ hàng
| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | BIGSERIAL PK | |
| user_id | BIGINT FK UNIQUE → users | 1 user = 1 giỏ |

### 9. `cart_items` — Chi tiết giỏ hàng
| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | BIGSERIAL PK | |
| cart_id | BIGINT FK → carts | |
| user_id | BIGINT FK → users | Denormalized để query nhanh |
| product_id | BIGINT FK → products | |
| quantity | INT ≥ 1 | Số lượng |
| UNIQUE | (user_id, product_id) | Không trùng sản phẩm |

### 10. `orders` — Đơn hàng ⭐
| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | BIGSERIAL PK | |
| user_id | BIGINT FK NULL → users | SET NULL nếu xóa user |
| status | VARCHAR(20) | pending→confirmed→shipping→delivered\|cancelled |
| shipping_full_name | VARCHAR(150) | **Snapshot** — không FK |
| shipping_phone | VARCHAR(15) | **Snapshot** |
| shipping_address | TEXT | **Snapshot** |
| payment_method | VARCHAR(10) | 'cod' hoặc 'bank' |
| total_price | NUMERIC(12,0) | Tổng tiền tại lúc đặt |

### 11. `order_items` — Chi tiết đơn hàng ⭐
| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | BIGSERIAL PK | |
| order_id | BIGINT FK → orders | CASCADE xóa |
| product_id | BIGINT FK NULL → products | SET NULL nếu xóa sản phẩm |
| product_name | VARCHAR(255) | **Snapshot** tên sản phẩm |
| product_image | VARCHAR(500) | **Snapshot** URL ảnh |
| price | NUMERIC(12,0) | **Snapshot** giá tại lúc mua |
| quantity | INT ≥ 1 | Số lượng |

---

## Quan hệ tóm tắt

| Bảng A | Quan hệ | Bảng B | Ghi chú |
|--------|---------|--------|---------|
| users | M:N | roles | Qua bảng user_roles |
| users | 1:1 | carts | 1 user = 1 giỏ hàng |
| users | 1:N | orders | 1 user đặt nhiều đơn |
| carts | 1:N | cart_items | 1 giỏ có nhiều sản phẩm |
| brands | 1:N | products | 1 hãng có nhiều SP |
| categories | 1:N | products | 1 danh mục có nhiều SP |
| products | 1:N | product_images | 1 SP có nhiều ảnh |
| products | 1:N | cart_items | 1 SP ở nhiều giỏ |
| products | 1:N | order_items | 1 SP trong nhiều đơn |
| orders | 1:N | order_items | 1 đơn có nhiều SP |
