-- ============================================================
--  QUERIES MẪU — Phone Store
--  Dùng để test sau khi chạy schema.sql
-- ============================================================


-- ─── 1. SẢN PHẨM ────────────────────────────────────────────

-- Danh sách sản phẩm (active) kèm tên hãng, danh mục, ảnh chính
SELECT
    p.id,
    p.name,
    p.slug,
    b.name          AS brand_name,
    c.name          AS category_name,
    p.price,
    p.sale_price,
    COALESCE(p.sale_price, p.price) AS current_price,
    CASE
        WHEN p.sale_price IS NOT NULL
        THEN ROUND((1 - p.sale_price::NUMERIC / p.price) * 100)
        ELSE 0
    END             AS discount_percent,
    p.stock,
    pi.image        AS primary_image
FROM products p
LEFT JOIN brands      b  ON b.id = p.brand_id
LEFT JOIN categories  c  ON c.id = p.category_id
LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
WHERE p.is_active = TRUE
ORDER BY p.created_at DESC;


-- Tìm kiếm sản phẩm theo tên (full-text search)
SELECT id, name, price
FROM products
WHERE to_tsvector('simple', name) @@ to_tsquery('simple', 'iphone')
  AND is_active = TRUE;

-- Tìm kiếm đơn giản dùng ILIKE (dễ dùng hơn với REST API)
SELECT id, name, price
FROM products
WHERE name ILIKE '%iphone%'
  AND is_active = TRUE;


-- Lọc theo hãng
SELECT p.id, p.name, p.price
FROM products p
JOIN brands b ON b.id = p.brand_id
WHERE b.slug = 'apple'
  AND p.is_active = TRUE;


-- Lọc theo khoảng giá (dùng current_price = sale_price nếu có, ngược lại dùng price)
SELECT id, name, price, sale_price,
       COALESCE(sale_price, price) AS current_price
FROM products
WHERE COALESCE(sale_price, price) BETWEEN 5000000 AND 15000000
  AND is_active = TRUE
ORDER BY COALESCE(sale_price, price) ASC;


-- Phân trang sản phẩm (page 1, 12 sản phẩm/trang)
SELECT p.id, p.name, p.price, p.sale_price
FROM products p
WHERE p.is_active = TRUE
ORDER BY p.created_at DESC
LIMIT 12 OFFSET 0;   -- page 2: OFFSET 12, page 3: OFFSET 24


-- Chi tiết 1 sản phẩm + tất cả ảnh
SELECT
    p.*,
    b.name AS brand_name,
    c.name AS category_name,
    json_agg(
        json_build_object(
            'id',         pi.id,
            'image',      pi.image,
            'alt_text',   pi.alt_text,
            'is_primary', pi.is_primary,
            'order',      pi."order"
        ) ORDER BY pi."order"
    ) AS images
FROM products p
LEFT JOIN brands          b  ON b.id = p.brand_id
LEFT JOIN categories      c  ON c.id = p.category_id
LEFT JOIN product_images  pi ON pi.product_id = p.id
WHERE p.id = 1
GROUP BY p.id, b.name, c.name;


-- ─── 2. THỐNG KÊ ADMIN ──────────────────────────────────────

-- Số sản phẩm theo hãng
SELECT b.name, COUNT(p.id) AS total_products
FROM brands b
LEFT JOIN products p ON p.brand_id = b.id AND p.is_active = TRUE
GROUP BY b.id, b.name
ORDER BY total_products DESC;


-- Doanh thu theo tháng
SELECT
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*)                        AS total_orders,
    SUM(total_price)                AS revenue
FROM orders
WHERE status = 'delivered'
GROUP BY month
ORDER BY month DESC;


-- Đơn hàng theo trạng thái
SELECT status, COUNT(*) AS count
FROM orders
GROUP BY status
ORDER BY count DESC;


-- ─── 3. GIỎ HÀNG ────────────────────────────────────────────

-- Xem giỏ hàng của user (id = 1) kèm thông tin sản phẩm
SELECT
    ci.id,
    p.id            AS product_id,
    p.name          AS product_name,
    COALESCE(p.sale_price, p.price) AS unit_price,
    ci.quantity,
    COALESCE(p.sale_price, p.price) * ci.quantity AS subtotal,
    p.stock         AS available_stock
FROM cart_items ci
JOIN products p ON p.id = ci.product_id
WHERE ci.user_id = 1
ORDER BY ci.created_at;


-- Tổng giỏ hàng của user (id = 1)
SELECT
    COUNT(ci.id)    AS total_items,
    SUM(COALESCE(p.sale_price, p.price) * ci.quantity) AS total_price
FROM cart_items ci
JOIN products p ON p.id = ci.product_id
WHERE ci.user_id = 1;


-- ─── 4. ĐƠN HÀNG ────────────────────────────────────────────

-- Lịch sử đơn hàng của user (id = 1)
SELECT
    o.id,
    o.status,
    o.shipping_full_name,
    o.total_price,
    o.payment_method,
    o.created_at,
    COUNT(oi.id) AS total_items
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.user_id = 1
GROUP BY o.id
ORDER BY o.created_at DESC;


-- Chi tiết 1 đơn hàng (id = 1)
SELECT
    o.id            AS order_id,
    o.status,
    o.shipping_full_name,
    o.shipping_phone,
    o.shipping_address,
    o.payment_method,
    o.total_price,
    o.note,
    o.created_at,
    oi.id           AS item_id,
    oi.product_name,
    oi.product_image,
    oi.price        AS unit_price,
    oi.quantity,
    oi.price * oi.quantity AS subtotal
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.id = 1;


-- Admin: tìm đơn hàng theo SĐT
SELECT o.*, u.email AS user_email
FROM orders o
LEFT JOIN users u ON u.id = o.user_id
WHERE o.shipping_phone LIKE '090%'
ORDER BY o.created_at DESC;


-- ─── 5. USERS ────────────────────────────────────────────────

-- Danh sách users kèm số đơn hàng
SELECT
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.is_active,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total_price), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'delivered'
GROUP BY u.id
ORDER BY total_spent DESC;
