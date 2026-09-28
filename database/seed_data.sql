-- ============================================================
--  PHONE STORE — Seed Data (20 sản phẩm)
--  Chạy file này SAU KHI đã chạy schema.sql
--
--  Cách chạy:
--    Docker:  docker-compose exec -T db psql -U postgres -d phonestore_db < database/seed_data.sql
--    Local:   psql -U postgres -d phonestore_db -f database/seed_data.sql
-- ============================================================

BEGIN;

-- ============================================================
--  XÓA DATA CŨ (giữ nguyên cấu trúc bảng)
-- ============================================================
TRUNCATE TABLE order_items, orders, cart_items, carts,
               product_images, products,
               categories, brands, user_roles, users
    RESTART IDENTITY CASCADE;


-- ============================================================
--  1. BRANDS — 6 hãng
-- ============================================================
INSERT INTO brands (id, name, slug, logo, description, is_active) VALUES
(1, 'Apple',   'apple',   'brands/apple.png',   'Thương hiệu công nghệ Mỹ — nổi tiếng với iPhone, iPad, Mac',        TRUE),
(2, 'Samsung', 'samsung', 'brands/samsung.png', 'Tập đoàn công nghệ Hàn Quốc — dòng Galaxy hàng đầu thế giới',       TRUE),
(3, 'Xiaomi',  'xiaomi',  'brands/xiaomi.png',  'Thương hiệu công nghệ Trung Quốc — chất lượng cao, giá tốt',        TRUE),
(4, 'OPPO',    'oppo',    'brands/oppo.png',    'Thương hiệu Trung Quốc — nổi bật với camera và thiết kế thời trang', TRUE),
(5, 'Vivo',    'vivo',    'brands/vivo.png',    'Thương hiệu Trung Quốc — chuyên về camera selfie và âm thanh',      TRUE),
(6, 'Google',  'google',  'brands/google.png',  'Thương hiệu công nghệ Mỹ — dòng Pixel với Android thuần túy',       TRUE);

-- Reset sequence sau khi insert với id cố định
SELECT setval('brands_id_seq', 6);


-- ============================================================
--  2. CATEGORIES — 3 danh mục
-- ============================================================
INSERT INTO categories (id, name, slug, description, is_active) VALUES
(1, 'Cao cấp',   'cao-cap',   'Điện thoại flagship, hiệu năng đỉnh cao, giá trên 15 triệu VNĐ', TRUE),
(2, 'Tầm trung', 'tam-trung', 'Cân bằng giữa hiệu năng và giá cả, từ 5 đến 15 triệu VNĐ',      TRUE),
(3, 'Giá rẻ',    'gia-re',    'Điện thoại phổ thông, đáp ứng nhu cầu cơ bản, dưới 5 triệu VNĐ', TRUE);

SELECT setval('categories_id_seq', 3);


-- ============================================================
--  3. PRODUCTS — 20 sản phẩm
--
--  Cột specs (JSONB) gồm:
--    ram, storage, colors, display, camera, battery,
--    chip, os, charging, weight
-- ============================================================

INSERT INTO products (
    name, slug,
    brand_id, category_id,
    description,
    price, sale_price,
    stock,
    specs,
    is_active
) VALUES

-- ──────────────────────────────────────────────────────────────
--  APPLE (4 sản phẩm)
-- ──────────────────────────────────────────────────────────────
(
    'iPhone 15 Pro Max',
    'iphone-15-pro-max-001',
    1, 1,
    'iPhone 15 Pro Max là đỉnh cao của dòng iPhone 2023. Được trang bị chip A17 Pro 3nm mạnh mẽ nhất trên thị trường, khung titanium siêu bền nhẹ, hệ thống camera Pro với zoom quang 5x và cổng USB-C 3.0 tốc độ cao. Màn hình ProMotion 120Hz luôn mượt mà. Lý tưởng cho nhiếp ảnh gia và người dùng chuyên nghiệp.',
    34990000, 32990000,
    50,
    '{
        "ram": "8GB",
        "storage": ["256GB", "512GB", "1TB"],
        "colors": ["Titan Đen", "Titan Trắng", "Titan Xanh", "Titan Tự Nhiên"],
        "display": "6.7 inch Super Retina XDR OLED, ProMotion 120Hz, 2796x1290px, 460ppi",
        "camera": {
            "main": "48MP, f/1.78, OIS, 100% Focus Pixels",
            "ultrawide": "12MP, f/2.2, 120° góc rộng",
            "telephoto": "12MP, f/2.8, zoom quang 5x",
            "front": "12MP, f/1.9, autofocus"
        },
        "battery": "4422mAh, sạc nhanh 27W, sạc không dây MagSafe 15W",
        "chip": "Apple A17 Pro, 6 nhân, tiến trình 3nm",
        "os": "iOS 17",
        "charging": "USB-C 3.0, MagSafe, Qi2",
        "weight": "221g",
        "sim": "Nano SIM + eSIM",
        "water_resistance": "IP68"
    }',
    TRUE
),
(
    'iPhone 15 Pro',
    'iphone-15-pro-002',
    1, 1,
    'iPhone 15 Pro với chip A17 Pro, khung titanium, camera 48MP zoom quang 3x. Nhỏ gọn hơn Pro Max nhưng vẫn mang đầy đủ tính năng Pro. Dynamic Island thay thế tai thỏ truyền thống, cung cấp trải nghiệm thông báo thông minh.',
    28990000, 27490000,
    65,
    '{
        "ram": "8GB",
        "storage": ["128GB", "256GB", "512GB", "1TB"],
        "colors": ["Titan Đen", "Titan Trắng", "Titan Xanh", "Titan Tự Nhiên"],
        "display": "6.1 inch Super Retina XDR OLED, ProMotion 120Hz, 2556x1179px, 460ppi",
        "camera": {
            "main": "48MP, f/1.78, OIS",
            "ultrawide": "12MP, f/2.2",
            "telephoto": "12MP, f/2.8, zoom quang 3x",
            "front": "12MP, f/1.9, autofocus"
        },
        "battery": "3274mAh, sạc nhanh 27W",
        "chip": "Apple A17 Pro, 6 nhân, tiến trình 3nm",
        "os": "iOS 17",
        "charging": "USB-C 3.0, MagSafe",
        "weight": "187g",
        "sim": "Nano SIM + eSIM",
        "water_resistance": "IP68"
    }',
    TRUE
),
(
    'iPhone 15',
    'iphone-15-003',
    1, 1,
    'iPhone 15 tiêu chuẩn mang Dynamic Island từ dòng Pro xuống, chip A16 Bionic mạnh mẽ, camera chính 48MP lần đầu xuất hiện trên dòng tiêu chuẩn, chuyển sang cổng USB-C tiện lợi. Lựa chọn hoàn hảo cho người muốn trải nghiệm iPhone hiện đại với mức giá hợp lý hơn.',
    22990000, NULL,
    80,
    '{
        "ram": "6GB",
        "storage": ["128GB", "256GB", "512GB"],
        "colors": ["Đen", "Vàng", "Hồng", "Xanh Dương", "Xanh Lá"],
        "display": "6.1 inch Super Retina XDR OLED, 60Hz, 2556x1179px, 460ppi",
        "camera": {
            "main": "48MP, f/1.6, OIS",
            "ultrawide": "12MP, f/2.4",
            "front": "12MP, f/1.9, autofocus"
        },
        "battery": "3877mAh, sạc nhanh 20W",
        "chip": "Apple A16 Bionic, 6 nhân",
        "os": "iOS 17",
        "charging": "USB-C, MagSafe 15W",
        "weight": "171g",
        "sim": "Nano SIM + eSIM",
        "water_resistance": "IP68"
    }',
    TRUE
),
(
    'iPhone 14',
    'iphone-14-004',
    1, 2,
    'iPhone 14 vẫn là lựa chọn đáng mua với chip A15 Bionic, hệ thống camera kép ổn định, màn hình Super Retina XDR sắc nét. Tính năng Crash Detection và Emergency SOS qua vệ tinh mang đến sự an tâm. Giá đã giảm đáng kể, phù hợp cho người chuyển lên từ iPhone cũ.',
    19990000, 17990000,
    95,
    '{
        "ram": "6GB",
        "storage": ["128GB", "256GB", "512GB"],
        "colors": ["Đen", "Xanh Dương", "Tím", "Vàng", "Đỏ"],
        "display": "6.1 inch Super Retina XDR OLED, 60Hz, 2532x1170px, 460ppi",
        "camera": {
            "main": "12MP, f/1.5, OIS thế hệ mới",
            "ultrawide": "12MP, f/2.4",
            "front": "12MP, f/1.9, autofocus"
        },
        "battery": "3279mAh, sạc nhanh 20W",
        "chip": "Apple A15 Bionic, 6 nhân",
        "os": "iOS 17",
        "charging": "Lightning, MagSafe",
        "weight": "172g",
        "sim": "Nano SIM + eSIM",
        "water_resistance": "IP68"
    }',
    TRUE
),

-- ──────────────────────────────────────────────────────────────
--  SAMSUNG (4 sản phẩm)
-- ──────────────────────────────────────────────────────────────
(
    'Samsung Galaxy S24 Ultra',
    'samsung-galaxy-s24-ultra-005',
    2, 1,
    'Galaxy S24 Ultra — đỉnh cao Android 2024. Chip Snapdragon 8 Gen 3 dành riêng cho Galaxy, camera 200MP zoom quang 10x, S Pen tích hợp cho năng suất tối đa. Màn hình Dynamic AMOLED 2X 120Hz siêu sáng 2600 nit. Galaxy AI thông minh với tính năng Circle to Search, Live Translate.',
    33990000, 30990000,
    40,
    '{
        "ram": "12GB",
        "storage": ["256GB", "512GB", "1TB"],
        "colors": ["Titan Đen", "Titan Xám", "Titan Tím", "Titan Vàng"],
        "display": "6.8 inch Dynamic AMOLED 2X, 120Hz, 3088x1440px, 505ppi, 2600 nit",
        "camera": {
            "main": "200MP, f/1.7, OIS, Adaptive Pixel",
            "ultrawide": "12MP, f/2.2, 120°",
            "telephoto1": "10MP, f/2.4, zoom quang 3x",
            "telephoto2": "50MP, f/3.4, zoom quang 5x",
            "front": "12MP, f/2.2"
        },
        "battery": "5000mAh, sạc nhanh 45W, sạc không dây 15W",
        "chip": "Snapdragon 8 Gen 3 for Galaxy",
        "os": "Android 14, One UI 6.1",
        "charging": "USB-C 3.2",
        "weight": "232g",
        "sim": "Nano SIM + eSIM",
        "water_resistance": "IP68",
        "extras": "S Pen tích hợp, Galaxy AI"
    }',
    TRUE
),
(
    'Samsung Galaxy S24+',
    'samsung-galaxy-s24-plus-006',
    2, 1,
    'Galaxy S24+ cân bằng hoàn hảo giữa kích thước lớn và hiệu năng mạnh. Chip Snapdragon 8 Gen 3, pin 4900mAh bền, màn hình 6.7 inch AMOLED sắc nét. Galaxy AI hỗ trợ công việc và sáng tạo nội dung. Sạc nhanh 45W đầy pin trong 65 phút.',
    26990000, 24990000,
    55,
    '{
        "ram": "12GB",
        "storage": ["256GB", "512GB"],
        "colors": ["Cobalt Violet", "Onyx Black", "Marble Gray", "Sandstone Orange"],
        "display": "6.7 inch Dynamic AMOLED 2X, 120Hz, 3088x1440px, 505ppi",
        "camera": {
            "main": "50MP, f/1.8, OIS",
            "ultrawide": "12MP, f/2.2",
            "telephoto": "10MP, f/2.4, zoom quang 3x",
            "front": "12MP, f/2.2"
        },
        "battery": "4900mAh, sạc nhanh 45W",
        "chip": "Snapdragon 8 Gen 3 for Galaxy",
        "os": "Android 14, One UI 6.1",
        "charging": "USB-C 3.2, Wireless 15W",
        "weight": "196g",
        "sim": "Nano SIM + eSIM",
        "water_resistance": "IP68"
    }',
    TRUE
),
(
    'Samsung Galaxy A55 5G',
    'samsung-galaxy-a55-5g-007',
    2, 2,
    'Galaxy A55 5G nâng tầm phân khúc tầm trung với thiết kế kim loại sang trọng, IP67 chống nước, màn hình Super AMOLED 120Hz và camera 50MP OIS. Chip Exynos 1480 hiệu năng mạnh cho tầm giá, pin 5000mAh kèm sạc 25W. Bảo mật vân tay dưới màn hình.',
    11990000, 10490000,
    120,
    '{
        "ram": "8GB",
        "storage": ["128GB", "256GB"],
        "colors": ["Awesome Iceblue", "Awesome Lilac", "Awesome Navy", "Awesome Lemon"],
        "display": "6.6 inch Super AMOLED, 120Hz, 2340x1080px, 390ppi",
        "camera": {
            "main": "50MP, f/1.8, OIS",
            "ultrawide": "12MP, f/2.2",
            "macro": "5MP, f/2.4",
            "front": "32MP, f/2.2"
        },
        "battery": "5000mAh, sạc nhanh 25W",
        "chip": "Exynos 1480, 4nm",
        "os": "Android 14, One UI 6.1",
        "charging": "USB-C 2.0",
        "weight": "213g",
        "sim": "Nano SIM + Nano SIM",
        "water_resistance": "IP67"
    }',
    TRUE
),
(
    'Samsung Galaxy A35 5G',
    'samsung-galaxy-a35-5g-008',
    2, 2,
    'Galaxy A35 5G là lựa chọn thực tế cho phân khúc tầm trung với chip Exynos 1380, màn hình Super AMOLED 120Hz sắc nét, camera 50MP OIS và pin 5000mAh. Hỗ trợ 5G tương lai, bảo mật Knox đáng tin cậy, cập nhật OS 4 năm — đầu tư bền vững.',
    8990000, 7990000,
    150,
    '{
        "ram": "6GB",
        "storage": ["128GB", "256GB"],
        "colors": ["Awesome Iceblue", "Awesome Lilac", "Awesome Navy"],
        "display": "6.6 inch Super AMOLED, 120Hz, 2340x1080px, 390ppi",
        "camera": {
            "main": "50MP, f/1.8, OIS",
            "ultrawide": "8MP, f/2.2",
            "macro": "5MP, f/2.4",
            "front": "13MP, f/2.2"
        },
        "battery": "5000mAh, sạc nhanh 25W",
        "chip": "Exynos 1380, 5nm",
        "os": "Android 14, One UI 6.1",
        "charging": "USB-C 2.0",
        "weight": "210g",
        "sim": "Nano SIM + Nano SIM",
        "water_resistance": "IP67"
    }',
    TRUE
),

-- ──────────────────────────────────────────────────────────────
--  XIAOMI (4 sản phẩm)
-- ──────────────────────────────────────────────────────────────
(
    'Xiaomi 14 Ultra',
    'xiaomi-14-ultra-009',
    3, 1,
    'Xiaomi 14 Ultra là siêu phẩm camera phone hợp tác cùng Leica. Ống kính Summilux 1 inch f/1.63, zoom quang học 5x, quay video 4K Dolby Vision. Chip Snapdragon 8 Gen 3, sạc siêu nhanh 90W đầy pin 5000mAh chỉ trong 37 phút. Thiết kế mặt lưng Nano-tech matte sang trọng.',
    29990000, 27990000,
    35,
    '{
        "ram": "16GB",
        "storage": ["512GB"],
        "colors": ["Đen Titan", "Trắng"],
        "display": "6.73 inch LTPO AMOLED, 1-120Hz, 3200x1440px, 522ppi",
        "camera": {
            "main": "50MP, Leica Summilux, f/1.63, 1 inch sensor",
            "ultrawide": "50MP, Leica Elmarit, f/1.8",
            "telephoto1": "50MP, f/1.8, zoom quang 3.2x",
            "telephoto2": "50MP, f/2.5, zoom quang 5x",
            "front": "32MP, f/2.0"
        },
        "battery": "5000mAh, sạc nhanh 90W, sạc không dây 80W",
        "chip": "Snapdragon 8 Gen 3",
        "os": "Android 14, HyperOS",
        "charging": "USB-C 3.2",
        "weight": "219.8g",
        "sim": "Nano SIM + eSIM",
        "water_resistance": "IP68"
    }',
    TRUE
),
(
    'Xiaomi 14',
    'xiaomi-14-010',
    3, 1,
    'Xiaomi 14 compact nhưng đầy sức mạnh: chip Snapdragon 8 Gen 3, hệ thống camera Leica 3 ống kính 50MP, màn hình AMOLED 120Hz siêu sáng, sạc nhanh 90W. Kích thước nhỏ gọn 152.8mm dễ cầm, thiết kế tinh tế với viền mỏng nhất phân khúc.',
    22990000, 20990000,
    60,
    '{
        "ram": "12GB",
        "storage": ["256GB", "512GB"],
        "colors": ["Đen", "Trắng", "Xanh Dương", "Xanh Lá"],
        "display": "6.36 inch AMOLED LTPO, 1-120Hz, 2670x1200px, 460ppi",
        "camera": {
            "main": "50MP, Leica Summilux, f/1.6",
            "ultrawide": "50MP, Leica Elmarit, f/2.2",
            "telephoto": "50MP, Leica Elmar, f/2.0, zoom quang 3.2x",
            "front": "32MP, f/2.0"
        },
        "battery": "4610mAh, sạc nhanh 90W, sạc không dây 50W",
        "chip": "Snapdragon 8 Gen 3",
        "os": "Android 14, HyperOS",
        "charging": "USB-C 3.2",
        "weight": "193.3g",
        "sim": "Nano SIM + eSIM",
        "water_resistance": "IP68"
    }',
    TRUE
),
(
    'Xiaomi Redmi Note 13 Pro+',
    'xiaomi-redmi-note-13-pro-plus-011',
    3, 2,
    'Redmi Note 13 Pro+ thiết lập chuẩn mới tầm trung với camera 200MP đầu tiên trong phân khúc, màn hình AMOLED 120Hz cong, sạc nhanh 120W đầy pin trong 19 phút. Chip Dimensity 7200 Ultra, IP68 chống nước hoàn toàn — hiếm có ở tầm giá này.',
    9490000, 8490000,
    110,
    '{
        "ram": "12GB",
        "storage": ["256GB", "512GB"],
        "colors": ["Đen", "Trắng Sữa", "Tím Bình Minh", "Xanh Ngọc"],
        "display": "6.67 inch AMOLED, 120Hz, 2712x1220px, cong 1.5mm",
        "camera": {
            "main": "200MP, f/1.69, OIS",
            "ultrawide": "8MP, f/2.2",
            "macro": "2MP, f/2.4",
            "front": "16MP, f/2.4"
        },
        "battery": "5000mAh, sạc nhanh 120W (đầy pin 19 phút)",
        "chip": "MediaTek Dimensity 7200 Ultra, 4nm",
        "os": "Android 13, MIUI 14",
        "charging": "USB-C 2.0",
        "weight": "204.5g",
        "sim": "Nano SIM + Nano SIM",
        "water_resistance": "IP68"
    }',
    TRUE
),
(
    'Xiaomi Redmi 13C',
    'xiaomi-redmi-13c-012',
    3, 3,
    'Redmi 13C là lựa chọn kinh tế nhất cho người dùng phổ thông. Pin 5000mAh dùng cả ngày dài, camera 50MP chụp ảnh rõ nét, màn hình 6.74 inch rộng xem phim thoải mái. Chip Helio G85 đủ mạnh cho tác vụ hàng ngày. Giá dưới 4 triệu, khó tìm đối thủ.',
    3490000, NULL,
    300,
    '{
        "ram": "4GB",
        "storage": ["128GB"],
        "colors": ["Đen Than", "Xanh Băng", "Xanh Lá"],
        "display": "6.74 inch IPS LCD, 90Hz, 1600x720px",
        "camera": {
            "main": "50MP, f/1.8",
            "depth": "2MP, f/2.4",
            "front": "8MP, f/2.0"
        },
        "battery": "5000mAh, sạc 18W",
        "chip": "MediaTek Helio G85",
        "os": "Android 13, MIUI 14",
        "charging": "USB-C",
        "weight": "192g",
        "sim": "Nano SIM + Nano SIM"
    }',
    TRUE
),

-- ──────────────────────────────────────────────────────────────
--  OPPO (3 sản phẩm)
-- ──────────────────────────────────────────────────────────────
(
    'OPPO Find X7 Ultra',
    'oppo-find-x7-ultra-013',
    4, 1,
    'OPPO Find X7 Ultra — đỉnh cao camera Hasselblad. Hệ thống 4 camera Hasselblad, chip Snapdragon 8 Gen 3, sạc nhanh 100W đầy pin 5000mAh trong 30 phút, sạc không dây 50W. Màn hình LTPO AMOLED 120Hz siêu sắc nét. Thiết kế mặt lưng ceramic cao cấp.',
    28990000, 26990000,
    30,
    '{
        "ram": "16GB",
        "storage": ["256GB", "512GB"],
        "colors": ["Đen", "Trắng Ceramic"],
        "display": "6.82 inch LTPO AMOLED, 1-120Hz, 3168x1440px, BOE Q9+",
        "camera": {
            "main": "50MP, Hasselblad, f/1.81, 1 inch Sony LYT-900",
            "ultrawide": "50MP, f/2.0, 110°",
            "telephoto1": "50MP, f/2.6, zoom quang 3x",
            "telephoto2": "50MP, f/4.3, zoom quang 6x",
            "front": "32MP, f/2.4"
        },
        "battery": "5000mAh, sạc nhanh 100W, không dây 50W",
        "chip": "Snapdragon 8 Gen 3",
        "os": "Android 14, ColorOS 14",
        "charging": "USB-C",
        "weight": "221g",
        "sim": "Nano SIM + eSIM",
        "water_resistance": "IP68"
    }',
    TRUE
),
(
    'OPPO Reno 12 Pro',
    'oppo-reno-12-pro-014',
    4, 2,
    'OPPO Reno 12 Pro hướng đến người yêu thích selfie và thời trang. Camera selfie 50MP có AI Face Retouching thông minh, chip Dimensity 7300 Energy tiết kiệm pin, sạc nhanh 80W, màn hình AMOLED 120Hz cong 2.5D. Thiết kế siêu mỏng 7.4mm, trọng lượng nhẹ 180g.',
    12990000, 11490000,
    85,
    '{
        "ram": "12GB",
        "storage": ["256GB"],
        "colors": ["Đen Nebula", "Xanh Tropic", "Hồng Trắng"],
        "display": "6.7 inch AMOLED, 120Hz, 2412x1080px, cong 2.5D",
        "camera": {
            "main": "50MP, f/1.88, OIS",
            "ultrawide": "8MP, f/2.2",
            "macro": "2MP, f/2.4",
            "front": "50MP, f/2.0, AI Face"
        },
        "battery": "5000mAh, sạc nhanh 80W",
        "chip": "MediaTek Dimensity 7300 Energy, 4nm",
        "os": "Android 14, ColorOS 14.1",
        "charging": "USB-C",
        "weight": "180g",
        "sim": "Nano SIM + Nano SIM",
        "water_resistance": "IP65"
    }',
    TRUE
),
(
    'OPPO A98 5G',
    'oppo-a98-5g-015',
    4, 2,
    'OPPO A98 5G là điện thoại 5G với mức giá phải chăng. Màn hình 6.72 inch LCD 120Hz mượt mà, camera 64MP chất lượng tốt, pin 5000mAh và sạc nhanh 67W. Chip Snapdragon 695 5G bảo đảm kết nối 5G nhanh. Loa stereo đôi thích hợp xem phim, nghe nhạc.',
    7990000, 6990000,
    100,
    '{
        "ram": "8GB",
        "storage": ["256GB"],
        "colors": ["Đen Mờ", "Xanh Dương Nhạt"],
        "display": "6.72 inch IPS LCD, 120Hz, 2400x1080px",
        "camera": {
            "main": "64MP, f/1.7",
            "depth": "2MP, f/2.4",
            "front": "32MP, f/2.0"
        },
        "battery": "5000mAh, sạc nhanh 67W",
        "chip": "Snapdragon 695 5G, 6nm",
        "os": "Android 13, ColorOS 13.1",
        "charging": "USB-C",
        "weight": "193g",
        "sim": "Nano SIM + Nano SIM"
    }',
    TRUE
),

-- ──────────────────────────────────────────────────────────────
--  VIVO (3 sản phẩm)
-- ──────────────────────────────────────────────────────────────
(
    'Vivo X100 Pro',
    'vivo-x100-pro-016',
    5, 1,
    'Vivo X100 Pro — siêu phẩm camera Zeiss của Vivo. Ống kính Zeiss Summilux APO, sensor Sony LYT-900 1 inch, chip Dimensity 9300 mạnh nhất 2024 dùng kiến trúc All-Big-Core. Sạc siêu nhanh 120W đầy pin 5400mAh trong 26 phút, hỗ trợ vệ tinh Beidou. Màn hình LTPO 120Hz siêu nét 1080p.',
    27990000, 25990000,
    45,
    '{
        "ram": "16GB",
        "storage": ["256GB", "512GB"],
        "colors": ["Đen Huyền Thoại", "Trắng Ngọc Trai", "Xanh Dương"],
        "display": "6.78 inch LTPO AMOLED, 1-120Hz, 2800x1260px, OLED Q9+",
        "camera": {
            "main": "50MP, Zeiss APO Summilux, f/1.75, 1 inch Sony LYT-900",
            "ultrawide": "50MP, f/2.0, 114°",
            "telephoto": "50MP, f/3.7, zoom quang 4.3x",
            "front": "32MP, f/2.0"
        },
        "battery": "5400mAh, sạc nhanh 120W, không dây 50W",
        "chip": "MediaTek Dimensity 9300, All-Big-Core 4nm",
        "os": "Android 14, Funtouch OS 14 / OriginOS 4",
        "charging": "USB-C",
        "weight": "225g",
        "sim": "Nano SIM + eSIM",
        "water_resistance": "IP68"
    }',
    TRUE
),
(
    'Vivo V30e',
    'vivo-v30e-017',
    5, 2,
    'Vivo V30e hướng đến người dùng coi trọng selfie và thời trang. Camera selfie 50MP có AI Aura Light, đèn flash LED vòng độc đáo cho ảnh selfie đẹp trong điều kiện thiếu sáng. Thiết kế mỏng nhẹ, màn hình AMOLED 120Hz, chip Snapdragon 695, pin 5000mAh sạc nhanh 44W.',
    8490000, 7490000,
    95,
    '{
        "ram": "8GB",
        "storage": ["256GB"],
        "colors": ["Peacock Green", "Noble Black"],
        "display": "6.78 inch AMOLED, 120Hz, 2400x1080px",
        "camera": {
            "main": "64MP, f/1.79",
            "depth": "2MP, f/2.4",
            "front": "50MP, f/2.0, Aura Light LED"
        },
        "battery": "5000mAh, sạc nhanh 44W",
        "chip": "Snapdragon 695 5G, 6nm",
        "os": "Android 14, Funtouch OS 14",
        "charging": "USB-C",
        "weight": "186g",
        "sim": "Nano SIM + Nano SIM"
    }',
    TRUE
),
(
    'Vivo Y36',
    'vivo-y36-018',
    5, 3,
    'Vivo Y36 là điện thoại giá rẻ phù hợp cho học sinh, sinh viên. Pin 5000mAh cực trâu, sạc nhanh 44W, màn hình 6.64 inch IPS LCD 90Hz. Thiết kế trẻ trung với mặt lưng bóng đẹp mắt. Chip Snapdragon 680 đủ dùng cho mạng xã hội, xem phim, game nhẹ.',
    4490000, 3990000,
    200,
    '{
        "ram": "8GB",
        "storage": ["128GB"],
        "colors": ["Đen Đêm", "Xanh Ngọc", "Vàng Ánh Kim"],
        "display": "6.64 inch IPS LCD, 90Hz, 2388x1080px",
        "camera": {
            "main": "50MP, f/1.8",
            "depth": "2MP, f/2.4",
            "front": "8MP, f/2.0"
        },
        "battery": "5000mAh, sạc nhanh 44W",
        "chip": "Snapdragon 680, 6nm",
        "os": "Android 13, Funtouch OS 13",
        "charging": "USB-C",
        "weight": "191g",
        "sim": "Nano SIM + Nano SIM"
    }',
    TRUE
),

-- ──────────────────────────────────────────────────────────────
--  GOOGLE (2 sản phẩm)
-- ──────────────────────────────────────────────────────────────
(
    'Google Pixel 8 Pro',
    'google-pixel-8-pro-019',
    6, 1,
    'Google Pixel 8 Pro — trải nghiệm Android thuần túy và AI tiên tiến nhất. Chip Google Tensor G3 tối ưu cho AI, camera 50MP với Magic Eraser, Best Take, Photo Unblur. Cập nhật Android 7 năm, bảo mật cấp doanh nghiệp. Màn hình LTPO OLED 120Hz siêu sáng 2400 nit. Nhiệt độ màn hình thực tế.',
    27990000, 25490000,
    55,
    '{
        "ram": "12GB",
        "storage": ["128GB", "256GB", "1TB"],
        "colors": ["Obsidian", "Porcelain", "Bay"],
        "display": "6.7 inch LTPO OLED, 1-120Hz, 2992x1344px, 489ppi, 2400 nit",
        "camera": {
            "main": "50MP, f/1.68, OIS, Octa PD",
            "ultrawide": "48MP, f/1.95, autofocus",
            "telephoto": "48MP, f/2.8, zoom quang 5x",
            "front": "10.5MP, f/2.2"
        },
        "battery": "5050mAh, sạc nhanh 30W, không dây 23W",
        "chip": "Google Tensor G3",
        "os": "Android 14 (cập nhật 7 năm)",
        "charging": "USB-C 3.2",
        "weight": "213g",
        "sim": "Nano SIM + eSIM",
        "water_resistance": "IP68",
        "extras": "Google AI, Magic Eraser, Best Take, Call Screen"
    }',
    TRUE
),
(
    'Google Pixel 8a',
    'google-pixel-8a-020',
    6, 2,
    'Google Pixel 8a mang trải nghiệm Pixel cao cấp xuống phân khúc tầm trung. Chip Tensor G3 mạnh tương đương Pixel 8 Pro, camera 64MP với tất cả tính năng AI của Google, màn hình OLED 120Hz lần đầu trên dòng "a". Cập nhật Android 7 năm, giá tốt nhất để vào hệ sinh thái Pixel.',
    14990000, 13490000,
    70,
    '{
        "ram": "8GB",
        "storage": ["128GB", "256GB"],
        "colors": ["Obsidian", "Porcelain", "Bay", "Aloe"],
        "display": "6.1 inch OLED, 120Hz (lần đầu trên dòng a), 2400x1080px, 429ppi",
        "camera": {
            "main": "64MP, f/1.89, OIS",
            "ultrawide": "13MP, f/2.2",
            "front": "13MP, f/2.2"
        },
        "battery": "4492mAh, sạc nhanh 18W",
        "chip": "Google Tensor G3",
        "os": "Android 14 (cập nhật 7 năm)",
        "charging": "USB-C, Wireless 18W",
        "weight": "188g",
        "sim": "Nano SIM + eSIM",
        "water_resistance": "IP67",
        "extras": "Google AI, Magic Eraser, Best Take"
    }',
    TRUE
);


-- ============================================================
--  4. PRODUCT IMAGES — 2 ảnh / sản phẩm (1 ảnh chính + 1 phụ)
--     Dùng placeholder URL từ placehold.co (thay bằng ảnh thật)
-- ============================================================

INSERT INTO product_images (product_id, image, alt_text, is_primary, "order") VALUES
-- iPhone 15 Pro Max (id=1)
(1, 'products/iphone-15-pro-max-main.jpg',  'iPhone 15 Pro Max - Mặt trước',  TRUE,  0),
(1, 'products/iphone-15-pro-max-back.jpg',  'iPhone 15 Pro Max - Mặt sau',    FALSE, 1),

-- iPhone 15 Pro (id=2)
(2, 'products/iphone-15-pro-main.jpg',      'iPhone 15 Pro - Mặt trước',      TRUE,  0),
(2, 'products/iphone-15-pro-back.jpg',      'iPhone 15 Pro - Mặt sau',        FALSE, 1),

-- iPhone 15 (id=3)
(3, 'products/iphone-15-main.jpg',          'iPhone 15 - Mặt trước',          TRUE,  0),
(3, 'products/iphone-15-back.jpg',          'iPhone 15 - Mặt sau',            FALSE, 1),

-- iPhone 14 (id=4)
(4, 'products/iphone-14-main.jpg',          'iPhone 14 - Mặt trước',          TRUE,  0),
(4, 'products/iphone-14-back.jpg',          'iPhone 14 - Mặt sau',            FALSE, 1),

-- Samsung S24 Ultra (id=5)
(5, 'products/s24-ultra-main.jpg',          'Samsung Galaxy S24 Ultra',        TRUE,  0),
(5, 'products/s24-ultra-spen.jpg',          'Samsung Galaxy S24 Ultra - S Pen',FALSE, 1),

-- Samsung S24+ (id=6)
(6, 'products/s24-plus-main.jpg',           'Samsung Galaxy S24+',             TRUE,  0),
(6, 'products/s24-plus-back.jpg',           'Samsung Galaxy S24+ - Mặt sau',   FALSE, 1),

-- Samsung A55 (id=7)
(7, 'products/a55-main.jpg',                'Samsung Galaxy A55 5G',           TRUE,  0),
(7, 'products/a55-colors.jpg',              'Samsung Galaxy A55 5G - Màu sắc', FALSE, 1),

-- Samsung A35 (id=8)
(8, 'products/a35-main.jpg',                'Samsung Galaxy A35 5G',           TRUE,  0),
(8, 'products/a35-back.jpg',                'Samsung Galaxy A35 5G - Mặt sau', FALSE, 1),

-- Xiaomi 14 Ultra (id=9)
(9, 'products/xiaomi-14-ultra-main.jpg',    'Xiaomi 14 Ultra - Camera Leica',  TRUE,  0),
(9, 'products/xiaomi-14-ultra-back.jpg',    'Xiaomi 14 Ultra - Mặt sau',       FALSE, 1),

-- Xiaomi 14 (id=10)
(10, 'products/xiaomi-14-main.jpg',         'Xiaomi 14',                       TRUE,  0),
(10, 'products/xiaomi-14-colors.jpg',       'Xiaomi 14 - Các màu',             FALSE, 1),

-- Redmi Note 13 Pro+ (id=11)
(11, 'products/redmi-note13-pro-main.jpg',  'Redmi Note 13 Pro+',              TRUE,  0),
(11, 'products/redmi-note13-pro-back.jpg',  'Redmi Note 13 Pro+ - Mặt sau',   FALSE, 1),

-- Redmi 13C (id=12)
(12, 'products/redmi-13c-main.jpg',         'Xiaomi Redmi 13C',                TRUE,  0),
(12, 'products/redmi-13c-back.jpg',         'Xiaomi Redmi 13C - Mặt sau',      FALSE, 1),

-- OPPO Find X7 Ultra (id=13)
(13, 'products/find-x7-ultra-main.jpg',     'OPPO Find X7 Ultra',              TRUE,  0),
(13, 'products/find-x7-ultra-camera.jpg',   'OPPO Find X7 Ultra - Camera',     FALSE, 1),

-- OPPO Reno 12 Pro (id=14)
(14, 'products/reno12-pro-main.jpg',        'OPPO Reno 12 Pro',                TRUE,  0),
(14, 'products/reno12-pro-colors.jpg',      'OPPO Reno 12 Pro - Màu sắc',      FALSE, 1),

-- OPPO A98 (id=15)
(15, 'products/oppo-a98-main.jpg',          'OPPO A98 5G',                     TRUE,  0),
(15, 'products/oppo-a98-back.jpg',          'OPPO A98 5G - Mặt sau',           FALSE, 1),

-- Vivo X100 Pro (id=16)
(16, 'products/vivo-x100-pro-main.jpg',     'Vivo X100 Pro',                   TRUE,  0),
(16, 'products/vivo-x100-pro-camera.jpg',   'Vivo X100 Pro - Camera Zeiss',    FALSE, 1),

-- Vivo V30e (id=17)
(17, 'products/vivo-v30e-main.jpg',         'Vivo V30e',                       TRUE,  0),
(17, 'products/vivo-v30e-colors.jpg',       'Vivo V30e - Màu sắc',             FALSE, 1),

-- Vivo Y36 (id=18)
(18, 'products/vivo-y36-main.jpg',          'Vivo Y36',                        TRUE,  0),
(18, 'products/vivo-y36-back.jpg',          'Vivo Y36 - Mặt sau',              FALSE, 1),

-- Google Pixel 8 Pro (id=19)
(19, 'products/pixel-8-pro-main.jpg',       'Google Pixel 8 Pro',              TRUE,  0),
(19, 'products/pixel-8-pro-back.jpg',       'Google Pixel 8 Pro - Mặt sau',    FALSE, 1),

-- Google Pixel 8a (id=20)
(20, 'products/pixel-8a-main.jpg',          'Google Pixel 8a',                 TRUE,  0),
(20, 'products/pixel-8a-colors.jpg',        'Google Pixel 8a - Màu sắc',       FALSE, 1);


-- ============================================================
--  5. USERS MẪU
--  Mật khẩu đã hash bằng Django PBKDF2:
--    admin123456  →  pbkdf2_sha256$...$admin
--    user123456   →  pbkdf2_sha256$...$user
--  (Thay bằng hash thật khi dùng với Django)
-- ============================================================

INSERT INTO users (email, password, full_name, phone, address, role, is_active, is_staff, is_superuser) VALUES
(
    'admin@phonestore.vn',
    'pbkdf2_sha256$720000$placeholder$AdminHashedPasswordHere=',
    'Quản trị viên',
    '0901234567',
    '123 Nguyễn Huệ, Quận 1, TP.HCM',
    'admin',
    TRUE, TRUE, TRUE
),
(
    'nguyenvana@gmail.com',
    'pbkdf2_sha256$720000$placeholder$UserHashedPasswordHere=',
    'Nguyễn Văn A',
    '0912345678',
    '456 Lê Lợi, Quận 1, TP.HCM',
    'user',
    TRUE, FALSE, FALSE
),
(
    'tranthib@gmail.com',
    'pbkdf2_sha256$720000$placeholder$UserHashedPasswordHere=',
    'Trần Thị B',
    '0923456789',
    '789 Trần Hưng Đạo, Quận 5, TP.HCM',
    'user',
    TRUE, FALSE, FALSE
),
(
    'levanc@gmail.com',
    'pbkdf2_sha256$720000$placeholder$UserHashedPasswordHere=',
    'Lê Văn C',
    '0934567890',
    '12 Đinh Tiên Hoàng, Quận Bình Thạnh, TP.HCM',
    'user',
    TRUE, FALSE, FALSE
),
(
    'phamthid@gmail.com',
    'pbkdf2_sha256$720000$placeholder$UserHashedPasswordHere=',
    'Phạm Thị D',
    '0945678901',
    '34 Cách Mạng Tháng 8, Quận 3, TP.HCM',
    'user',
    TRUE, FALSE, FALSE
);

-- Gán role cho admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@phonestore.vn' AND r.name = 'admin';

-- Gán role user cho tất cả user thường
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.role = 'user' AND r.name = 'user';


-- ============================================================
--  6. ĐƠN HÀNG MẪU
-- ============================================================

-- Đơn hàng 1: đã giao
INSERT INTO orders (
    user_id, status,
    shipping_full_name, shipping_phone, shipping_address,
    payment_method, note, total_price
)
SELECT
    u.id,
    'delivered',
    'Nguyễn Văn A', '0912345678', '456 Lê Lợi, Quận 1, TP.HCM',
    'cod', 'Giao giờ hành chính',
    22990000
FROM users u WHERE u.email = 'nguyenvana@gmail.com';

-- Chi tiết đơn hàng 1
INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity)
SELECT
    o.id,
    p.id,
    p.name,
    'products/iphone-15-main.jpg',
    p.price,
    1
FROM orders o, products p
WHERE o.shipping_full_name = 'Nguyễn Văn A'
  AND p.slug = 'iphone-15-003'
LIMIT 1;

-- Đơn hàng 2: đang giao
INSERT INTO orders (
    user_id, status,
    shipping_full_name, shipping_phone, shipping_address,
    payment_method, note, total_price
)
SELECT
    u.id,
    'shipping',
    'Trần Thị B', '0923456789', '789 Trần Hưng Đạo, Quận 5, TP.HCM',
    'bank', '',
    10490000
FROM users u WHERE u.email = 'tranthib@gmail.com';

INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity)
SELECT
    o.id,
    p.id,
    p.name,
    'products/a55-main.jpg',
    p.sale_price,
    1
FROM orders o, products p
WHERE o.shipping_full_name = 'Trần Thị B'
  AND p.slug = 'samsung-galaxy-a55-5g-007'
LIMIT 1;

-- Đơn hàng 3: chờ xác nhận
INSERT INTO orders (
    user_id, status,
    shipping_full_name, shipping_phone, shipping_address,
    payment_method, note, total_price
)
SELECT
    u.id,
    'pending',
    'Lê Văn C', '0934567890', '12 Đinh Tiên Hoàng, Quận Bình Thạnh, TP.HCM',
    'cod', 'Gọi trước khi giao',
    41980000
FROM users u WHERE u.email = 'levanc@gmail.com';

INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity)
SELECT
    o.id,
    p.id,
    p.name,
    'products/s24-ultra-main.jpg',
    p.sale_price,
    1
FROM orders o, products p
WHERE o.shipping_full_name = 'Lê Văn C'
  AND p.slug = 'samsung-galaxy-s24-ultra-005'
LIMIT 1;

-- Thêm sản phẩm thứ 2 vào đơn hàng 3
INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity)
SELECT
    o.id,
    p.id,
    p.name,
    'products/redmi-13c-main.jpg',
    p.price,
    1
FROM orders o, products p
WHERE o.shipping_full_name = 'Lê Văn C'
  AND p.slug = 'xiaomi-redmi-13c-012'
LIMIT 1;


COMMIT;

-- ============================================================
--  KIỂM TRA SAU KHI IMPORT
-- ============================================================
SELECT '=== TỔNG KẾT ===' AS info;
SELECT 'Brands:     ' || COUNT(*) FROM brands;
SELECT 'Categories: ' || COUNT(*) FROM categories;
SELECT 'Products:   ' || COUNT(*) FROM products;
SELECT 'Images:     ' || COUNT(*) FROM product_images;
SELECT 'Users:      ' || COUNT(*) FROM users;
SELECT 'Orders:     ' || COUNT(*) FROM orders;
SELECT 'OrderItems: ' || COUNT(*) FROM order_items;

SELECT '=== SẢN PHẨM THEO HÃNG ===' AS info;
SELECT b.name AS hang, COUNT(p.id) AS so_san_pham
FROM brands b
LEFT JOIN products p ON p.brand_id = b.id
GROUP BY b.name ORDER BY b.name;

SELECT '=== SẢN PHẨM THEO DANH MỤC ===' AS info;
SELECT c.name AS danh_muc, COUNT(p.id) AS so_san_pham
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.name ORDER BY c.name;
