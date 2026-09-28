-- ============================================================
--  PHONE STORE — Database Schema (PostgreSQL)
--  Phiên bản: 1.0
--  Mô tả: Schema đầy đủ cho website bán điện thoại
--         Khớp với Django models trong backend
-- ============================================================

-- Bật extension để dùng UUID nếu cần sau này
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
--  XÓA BẢNG NẾU ĐÃ TỒN TẠI (thứ tự ngược FK)
-- ============================================================
DROP TABLE IF EXISTS order_items          CASCADE;
DROP TABLE IF EXISTS orders               CASCADE;
DROP TABLE IF EXISTS cart_items           CASCADE;
DROP TABLE IF EXISTS carts                CASCADE;
DROP TABLE IF EXISTS product_images       CASCADE;
DROP TABLE IF EXISTS products             CASCADE;
DROP TABLE IF EXISTS categories           CASCADE;
DROP TABLE IF EXISTS brands               CASCADE;
DROP TABLE IF EXISTS user_roles           CASCADE;
DROP TABLE IF EXISTS users                CASCADE;
DROP TABLE IF EXISTS roles                CASCADE;

-- ============================================================
--  BẢNG 1: roles
--  Lưu các vai trò trong hệ thống
-- ============================================================
CREATE TABLE roles (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(50)     NOT NULL UNIQUE,   -- 'user', 'admin'
    description VARCHAR(255)    NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  roles            IS 'Vai trò hệ thống (user, admin)';
COMMENT ON COLUMN roles.name       IS 'Tên vai trò — duy nhất trong hệ thống';

-- Dữ liệu mặc định
INSERT INTO roles (name, description) VALUES
    ('user',  'Khách hàng thông thường'),
    ('admin', 'Quản trị viên hệ thống');


-- ============================================================
--  BẢNG 2: users
--  Tài khoản người dùng — dùng email thay vì username
-- ============================================================
CREATE TABLE users (
    id            BIGSERIAL       PRIMARY KEY,
    email         VARCHAR(254)    NOT NULL UNIQUE,
    password      VARCHAR(128)    NOT NULL,                    -- Django hashed password
    full_name     VARCHAR(150)    NOT NULL,
    phone         VARCHAR(15)     NOT NULL DEFAULT '',
    address       TEXT            NOT NULL DEFAULT '',
    role          VARCHAR(10)     NOT NULL DEFAULT 'user'
                                  CHECK (role IN ('user', 'admin')),
    is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
    is_staff      BOOLEAN         NOT NULL DEFAULT FALSE,      -- Truy cập Django admin
    is_superuser  BOOLEAN         NOT NULL DEFAULT FALSE,
    last_login    TIMESTAMPTZ     NULL,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users            IS 'Tài khoản người dùng — login bằng email';
COMMENT ON COLUMN users.password   IS 'Mật khẩu đã hash theo chuẩn Django (PBKDF2)';
COMMENT ON COLUMN users.role       IS 'user = khách hàng, admin = quản trị viên';
COMMENT ON COLUMN users.is_staff   IS 'Cho phép truy cập trang /admin của Django';

-- Index tìm kiếm nhanh
CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_role     ON users (role);
CREATE INDEX idx_users_active   ON users (is_active);


-- ============================================================
--  BẢNG 3: user_roles  (bảng trung gian nhiều-nhiều)
--  Cho phép 1 user có nhiều role (mở rộng sau này)
-- ============================================================
CREATE TABLE user_roles (
    id         BIGSERIAL   PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    role_id    INT         NOT NULL REFERENCES roles(id)  ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, role_id)
);

COMMENT ON TABLE user_roles IS 'Quan hệ nhiều-nhiều: user có thể có nhiều role';

CREATE INDEX idx_user_roles_user ON user_roles (user_id);
CREATE INDEX idx_user_roles_role ON user_roles (role_id);


-- ============================================================
--  BẢNG 4: brands
--  Hãng điện thoại: Apple, Samsung, Xiaomi...
-- ============================================================
CREATE TABLE brands (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL UNIQUE,
    slug        VARCHAR(120)    NOT NULL UNIQUE,   -- URL-friendly: 'apple', 'samsung'
    logo        VARCHAR(255)    NULL,              -- Đường dẫn file ảnh logo
    description TEXT            NOT NULL DEFAULT '',
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  brands       IS 'Hãng sản xuất điện thoại';
COMMENT ON COLUMN brands.slug  IS 'Dùng trong URL: /products?brand_slug=apple';
COMMENT ON COLUMN brands.logo  IS 'Relative path trong thư mục media/brands/';

CREATE INDEX idx_brands_slug     ON brands (slug);
CREATE INDEX idx_brands_active   ON brands (is_active);


-- ============================================================
--  BẢNG 5: categories
--  Danh mục: Cao cấp, Tầm trung, Giá rẻ...
-- ============================================================
CREATE TABLE categories (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL UNIQUE,
    slug        VARCHAR(120)    NOT NULL UNIQUE,
    description TEXT            NOT NULL DEFAULT '',
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE categories IS 'Danh mục phân loại sản phẩm';

CREATE INDEX idx_categories_slug   ON categories (slug);
CREATE INDEX idx_categories_active ON categories (is_active);


-- ============================================================
--  BẢNG 6: products
--  Sản phẩm điện thoại
-- ============================================================
CREATE TABLE products (
    id           BIGSERIAL       PRIMARY KEY,
    name         VARCHAR(255)    NOT NULL,
    slug         VARCHAR(300)    NOT NULL UNIQUE,  -- name + uuid ngắn
    brand_id     INT             NULL REFERENCES brands(id)     ON DELETE SET NULL,
    category_id  INT             NULL REFERENCES categories(id) ON DELETE SET NULL,
    description  TEXT            NOT NULL DEFAULT '',
    price        NUMERIC(12, 0)  NOT NULL CHECK (price >= 0),          -- Giá gốc (VNĐ)
    sale_price   NUMERIC(12, 0)  NULL     CHECK (sale_price >= 0),     -- Giá KM, NULL = không KM
    stock        INT             NOT NULL DEFAULT 0 CHECK (stock >= 0),
    specs        JSONB           NOT NULL DEFAULT '{}',  -- {"RAM":"8GB","ROM":"128GB",...}
    is_active    BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Ràng buộc: giá KM phải nhỏ hơn giá gốc
    CONSTRAINT chk_sale_price CHECK (sale_price IS NULL OR sale_price < price)
);

COMMENT ON TABLE  products             IS 'Sản phẩm điện thoại';
COMMENT ON COLUMN products.slug        IS 'URL-friendly, unique — tạo tự động từ name + uuid';
COMMENT ON COLUMN products.price       IS 'Giá gốc tính bằng VNĐ (không có số thập phân)';
COMMENT ON COLUMN products.sale_price  IS 'Giá khuyến mãi, NULL nếu không giảm giá';
COMMENT ON COLUMN products.specs       IS 'Thông số kỹ thuật dạng JSON: RAM, ROM, pin, màn hình...';

-- Index tìm kiếm full-text và lọc
CREATE INDEX idx_products_slug       ON products (slug);
CREATE INDEX idx_products_brand      ON products (brand_id);
CREATE INDEX idx_products_category   ON products (category_id);
CREATE INDEX idx_products_active     ON products (is_active);
CREATE INDEX idx_products_price      ON products (price);
CREATE INDEX idx_products_sale_price ON products (sale_price);
CREATE INDEX idx_products_stock      ON products (stock);
-- Full-text search trên tên sản phẩm
CREATE INDEX idx_products_name_fts   ON products USING GIN (to_tsvector('simple', name));
-- Index trên JSONB specs để query nhanh
CREATE INDEX idx_products_specs      ON products USING GIN (specs);


-- ============================================================
--  BẢNG 7: product_images
--  Ảnh sản phẩm — 1 sản phẩm có nhiều ảnh, 1 ảnh là primary
-- ============================================================
CREATE TABLE product_images (
    id          BIGSERIAL       PRIMARY KEY,
    product_id  BIGINT          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image       VARCHAR(255)    NOT NULL,          -- Relative path: 'products/iphone15.jpg'
    alt_text    VARCHAR(200)    NOT NULL DEFAULT '',
    is_primary  BOOLEAN         NOT NULL DEFAULT FALSE,
    "order"     SMALLINT        NOT NULL DEFAULT 0, -- Thứ tự hiển thị
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  product_images            IS 'Ảnh của sản phẩm';
COMMENT ON COLUMN product_images.image      IS 'Đường dẫn file trong thư mục media/products/';
COMMENT ON COLUMN product_images.is_primary IS 'Mỗi sản phẩm chỉ có 1 ảnh primary (enforce qua app)';
COMMENT ON COLUMN product_images."order"    IS 'Thứ tự hiển thị trong gallery, nhỏ = hiện trước';

CREATE INDEX idx_product_images_product    ON product_images (product_id);
CREATE INDEX idx_product_images_primary    ON product_images (product_id, is_primary);


-- ============================================================
--  BẢNG 8: carts
--  Giỏ hàng — mỗi user có đúng 1 giỏ hàng
-- ============================================================
CREATE TABLE carts (
    id          BIGSERIAL       PRIMARY KEY,
    user_id     BIGINT          NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE carts IS 'Giỏ hàng — 1 user có đúng 1 giỏ (UNIQUE user_id)';

CREATE INDEX idx_carts_user ON carts (user_id);


-- ============================================================
--  BẢNG 9: cart_items
--  Chi tiết sản phẩm trong giỏ hàng
-- ============================================================
CREATE TABLE cart_items (
    id          BIGSERIAL       PRIMARY KEY,
    cart_id     BIGINT          NOT NULL REFERENCES carts(id)    ON DELETE CASCADE,
    -- Giữ thêm user_id để query nhanh không cần JOIN carts
    user_id     BIGINT          NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    product_id  BIGINT          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity    INT             NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Mỗi user chỉ có 1 dòng cho mỗi sản phẩm trong giỏ
    UNIQUE (user_id, product_id)
);

COMMENT ON TABLE  cart_items          IS 'Chi tiết sản phẩm trong giỏ hàng';
COMMENT ON COLUMN cart_items.user_id  IS 'Denormalized: copy từ carts.user_id để tránh JOIN';

CREATE INDEX idx_cart_items_cart    ON cart_items (cart_id);
CREATE INDEX idx_cart_items_user    ON cart_items (user_id);
CREATE INDEX idx_cart_items_product ON cart_items (product_id);


-- ============================================================
--  BẢNG 10: orders
--  Đơn hàng
-- ============================================================
CREATE TABLE orders (
    id                  BIGSERIAL       PRIMARY KEY,
    user_id             BIGINT          NULL REFERENCES users(id) ON DELETE SET NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'pending'
                                        CHECK (status IN ('pending','confirmed','shipping','delivered','cancelled')),
    -- Snapshot thông tin giao hàng tại thời điểm đặt
    -- (không dùng FK đến users để tránh bị ảnh hưởng khi user đổi địa chỉ)
    shipping_full_name  VARCHAR(150)    NOT NULL,
    shipping_phone      VARCHAR(15)     NOT NULL,
    shipping_address    TEXT            NOT NULL,
    payment_method      VARCHAR(10)     NOT NULL DEFAULT 'cod'
                                        CHECK (payment_method IN ('cod','bank')),
    note                TEXT            NOT NULL DEFAULT '',
    total_price         NUMERIC(12, 0)  NOT NULL CHECK (total_price >= 0),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  orders                    IS 'Đơn hàng của khách';
COMMENT ON COLUMN orders.user_id            IS 'NULL nếu user bị xóa, đơn vẫn còn';
COMMENT ON COLUMN orders.status             IS 'pending→confirmed→shipping→delivered | cancelled';
COMMENT ON COLUMN orders.shipping_full_name IS 'Snapshot tên người nhận tại lúc đặt hàng';
COMMENT ON COLUMN orders.total_price        IS 'Tổng tiền tính tại lúc đặt (VNĐ)';

CREATE INDEX idx_orders_user       ON orders (user_id);
CREATE INDEX idx_orders_status     ON orders (status);
CREATE INDEX idx_orders_created    ON orders (created_at DESC);
CREATE INDEX idx_orders_payment    ON orders (payment_method);


-- ============================================================
--  BẢNG 11: order_items
--  Chi tiết sản phẩm trong đơn hàng — snapshot giá tại lúc mua
-- ============================================================
CREATE TABLE order_items (
    id             BIGSERIAL       PRIMARY KEY,
    order_id       BIGINT          NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
    product_id     BIGINT          NULL     REFERENCES products(id) ON DELETE SET NULL,
    -- Snapshot: lưu lại tên & ảnh phòng khi sản phẩm bị xóa/đổi
    product_name   VARCHAR(255)    NOT NULL,
    product_image  VARCHAR(500)    NOT NULL DEFAULT '',
    price          NUMERIC(12, 0)  NOT NULL CHECK (price >= 0),   -- Giá tại lúc mua
    quantity       INT             NOT NULL CHECK (quantity >= 1),
    created_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  order_items              IS 'Chi tiết đơn hàng — snapshot để không bị thay đổi sau';
COMMENT ON COLUMN order_items.product_id   IS 'NULL nếu sản phẩm bị xóa khỏi DB, snapshot vẫn còn';
COMMENT ON COLUMN order_items.price        IS 'Đơn giá tại thời điểm mua, không đổi dù sản phẩm thay giá';

CREATE INDEX idx_order_items_order   ON order_items (order_id);
CREATE INDEX idx_order_items_product ON order_items (product_id);


-- ============================================================
--  TRIGGERS: tự động cập nhật updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Áp dụng trigger cho tất cả bảng có updated_at
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_carts_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
--  DỮ LIỆU MẪU
--  Chạy file riêng: database/seed_data.sql
-- ============================================================
