"""
Lệnh tạo dữ liệu mẫu để test.
Chạy: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.products.models import Brand, Category, Product, Review
from apps.orders.models import Order, OrderItem

User = get_user_model()

PRODUCT_IMAGES = {
    'iPhone 15 Pro Max':          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',
    'iPhone 15':                  'https://images.unsplash.com/photo-1664478546384-d57ffe74a78c?w=600&q=80',
    'Samsung Galaxy S24 Ultra':   'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80',
    'Samsung Galaxy A55':         'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&q=80',
    'Xiaomi 14':                  'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&q=80',
    'Xiaomi Redmi Note 13':       'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80',
    'OPPO Reno 12':               'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
    'Xiaomi Redmi 13C':           'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80',
}
DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=600&q=80'


class Command(BaseCommand):
    help = 'Tạo dữ liệu mẫu cho development và production'

    def handle(self, *args, **options):
        self.stdout.write('Đang tạo dữ liệu mẫu PhoneStore...')

        # ── Users ─────────────────────────────────────────────────────────────
        admin_user, _ = User.objects.get_or_create(
            email='admin@phonestore.com',
            defaults={
                'full_name': 'Quản Trị Viên',
                'is_staff': True,
                'is_superuser': True,
                'role': 'admin',
            }
        )
        if _:
            admin_user.set_password('admin123456')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('✓ Tạo admin: admin@phonestore.com / admin123456'))

        demo_user, _ = User.objects.get_or_create(
            email='user@phonestore.com',
            defaults={
                'full_name': 'Nguyễn Văn A',
                'phone': '0901234567',
                'address': 'Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
            }
        )
        if _:
            demo_user.set_password('user123456')
            demo_user.save()
            self.stdout.write(self.style.SUCCESS('✓ Tạo user: user@phonestore.com / user123456'))

        # ── Brands ────────────────────────────────────────────────────────────
        brands_data = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Realme']
        brands = {}
        for name in brands_data:
            brand, _ = Brand.objects.get_or_create(name=name)
            brands[name] = brand
        self.stdout.write(self.style.SUCCESS(f'✓ Tạo {len(brands_data)} hãng'))

        # ── Categories ────────────────────────────────────────────────────────
        categories_data = ['Cao cấp', 'Tầm trung', 'Giá rẻ']
        categories = {}
        for name in categories_data:
            cat, _ = Category.objects.get_or_create(name=name)
            categories[name] = cat
        self.stdout.write(self.style.SUCCESS(f'✓ Tạo {len(categories_data)} danh mục'))

        # ── Products ──────────────────────────────────────────────────────────
        products_data = [
            {
                'name': 'iPhone 15 Pro Max',
                'brand': 'Apple',
                'category': 'Cao cấp',
                'price': 34990000,
                'sale_price': 31990000,
                'stock': 45,
                'specs': {
                    'ram': '8GB',
                    'storage': ['256GB', '512GB', '1TB'],
                    'colors': ['Titan Tự Nhiên', 'Titan Đen', 'Titan Trắng', 'Titan Xanh'],
                    'chip': 'Apple A17 Pro (3nm)',
                    'display': '6.7 inch Super Retina XDR OLED, 120Hz ProMotion',
                    'camera': 'Chính 48MP + Góc siêu rộng 12MP + Telephoto 5x 12MP',
                    'battery': '4422 mAh, Sạc nhanh 20W, MagSafe 15W',
                    'os': 'iOS 17',
                    'water_resistance': 'IP68 (6m trong 30 phút)',
                },
                'description': 'iPhone 15 Pro Max với thiết kế khung viền Titanium chuẩn hàng không vũ trụ siêu nhẹ và bền bỉ. Trang bị chip Apple A17 Pro mạnh mẽ vượt trội mang lại hiệu năng đỉnh cao cho mọi tác vụ và chơi game đồ họa ray tracing đỉnh cao.',
            },
            {
                'name': 'iPhone 15',
                'brand': 'Apple',
                'category': 'Cao cấp',
                'price': 22990000,
                'sale_price': 19990000,
                'stock': 70,
                'specs': {
                    'ram': '6GB',
                    'storage': ['128GB', '256GB', '512GB'],
                    'colors': ['Đen', 'Xanh Dương', 'Xanh Lá', 'Vàng', 'Hồng'],
                    'chip': 'Apple A16 Bionic (4nm)',
                    'display': '6.1 inch Super Retina XDR OLED',
                    'camera': 'Chính 48MP + Góc rộng 12MP',
                    'battery': '3349 mAh, Sạc Type-C',
                    'os': 'iOS 17',
                },
                'description': 'iPhone 15 sở hữu tính năng Dynamic Island thông minh, camera 48MP nâng cấp chụp ảnh siêu nét và cổng kết nối USB-C tiện lợi.',
            },
            {
                'name': 'Samsung Galaxy S24 Ultra',
                'brand': 'Samsung',
                'category': 'Cao cấp',
                'price': 31990000,
                'sale_price': 27990000,
                'stock': 35,
                'specs': {
                    'ram': '12GB',
                    'storage': ['256GB', '512GB', '1TB'],
                    'colors': ['Titan Đen', 'Titan Xám', 'Titan Tím', 'Titan Vàng'],
                    'chip': 'Snapdragon 8 Gen 3 for Galaxy (4nm)',
                    'display': '6.8 inch Dynamic AMOLED 2X, QHD+, 120Hz',
                    'camera': '200MP + 50MP (5x) + 10MP (3x) + 12MP (Ultrawide)',
                    'battery': '5000 mAh, Sạc nhanh 45W',
                    'os': 'Android 14, One UI 6.1, Galaxy AI',
                },
                'description': 'Samsung Galaxy S24 Ultra định nghĩa lại trải nghiệm di động với quyền năng Galaxy AI vượt trội, camera 200MP zoom đỉnh cao và bút S-Pen tích hợp tiện ích.',
            },
            {
                'name': 'Samsung Galaxy A55',
                'brand': 'Samsung',
                'category': 'Tầm trung',
                'price': 10990000,
                'sale_price': 9490000,
                'stock': 120,
                'specs': {
                    'ram': '8GB',
                    'storage': ['128GB', '256GB'],
                    'colors': ['Xanh Băng', 'Xanh Navy', 'Tím'],
                    'chip': 'Exynos 1480 (4nm)',
                    'display': '6.6 inch Super AMOLED, FHD+, 120Hz',
                    'camera': '50MP + 12MP + 5MP',
                    'battery': '5000 mAh, Sạc 25W',
                },
                'description': 'Galaxy A55 với thiết kế viền kim loại sang trọng, màn hình Super AMOLED 120Hz rực rỡ và pin dung lượng lớn 5000mAh.',
            },
            {
                'name': 'Xiaomi 14',
                'brand': 'Xiaomi',
                'category': 'Cao cấp',
                'price': 19990000,
                'sale_price': 16990000,
                'stock': 50,
                'specs': {
                    'ram': '12GB',
                    'storage': ['256GB', '512GB'],
                    'colors': ['Đen', 'Trắng', 'Xanh Ngọc'],
                    'chip': 'Snapdragon 8 Gen 3 (4nm)',
                    'display': '6.36 inch OLED, 1.5K, 120Hz',
                    'camera': 'Ống kính Leica Summilux 50MP + 50MP + 50MP',
                    'battery': '4610 mAh, Sạc HyperCharge 90W',
                    'os': 'Xiaomi HyperOS (Android 14)',
                },
                'description': 'Xiaomi 14 trang bị hệ thống camera chuyên nghiệp Leica, kích thước nhỏ gọn vừa tay và hiệu năng Snapdragon 8 Gen 3 mạnh mẽ.',
            },
            {
                'name': 'Xiaomi Redmi Note 13',
                'brand': 'Xiaomi',
                'category': 'Tầm trung',
                'price': 5990000,
                'sale_price': 4990000,
                'stock': 150,
                'specs': {
                    'ram': '6GB',
                    'storage': ['128GB'],
                    'colors': ['Đen Than', 'Xanh Băng', 'Vàng Cát'],
                    'chip': 'Snapdragon 685 (6nm)',
                    'display': '6.67 inch AMOLED, FHD+, 120Hz',
                    'camera': '108MP + 8MP + 2MP',
                    'battery': '5000 mAh, Sạc 33W',
                },
                'description': 'Redmi Note 13 nổi bật trong phân khúc tầm trung với camera 108MP siêu nét, màn hình AMOLED 120Hz viền mỏng ấn tượng.',
            },
            {
                'name': 'OPPO Reno 12',
                'brand': 'OPPO',
                'category': 'Tầm trung',
                'price': 9990000,
                'sale_price': 8990000,
                'stock': 80,
                'specs': {
                    'ram': '12GB',
                    'storage': ['256GB', '512GB'],
                    'colors': ['Bạc Titan', 'Nâu', 'Hồng Ngọc'],
                    'chip': 'MediaTek Dimensity 7300-Energy',
                    'display': '6.7 inch AMOLED cong 3D, 120Hz',
                    'camera': '50MP Sony LYT-600 + 8MP + 2MP',
                    'battery': '5000 mAh, Sạc SuperVOOC 80W',
                },
                'description': 'OPPO Reno 12 phong cách thiết kế thời thượng, tính năng AI chụp ảnh chân dung xóa phông tự nhiên và sạc siêu tốc SuperVOOC 80W.',
            },
            {
                'name': 'Xiaomi Redmi 13C',
                'brand': 'Xiaomi',
                'category': 'Giá rẻ',
                'price': 3490000,
                'sale_price': 2990000,
                'stock': 200,
                'specs': {
                    'ram': '4GB',
                    'storage': ['128GB'],
                    'colors': ['Đen', 'Xanh Dương', 'Xanh Lá'],
                    'chip': 'MediaTek Helio G85',
                    'display': '6.74 inch HD+, 90Hz',
                    'camera': '50MP + 2MP',
                    'battery': '5000 mAh, Sạc 18W',
                },
                'description': 'Redmi 13C là sự lựa chọn lý tưởng giá rẻ với màn hình lớn 90Hz mượt mà, camera 50MP và pin bền bỉ cả ngày dài.',
            },
        ]

        created = 0
        for p in products_data:
            prod = Product.objects.filter(name=p['name']).first()
            if not prod:
                prod = Product.objects.create(
                    name=p['name'],
                    brand=brands[p['brand']],
                    category=categories[p['category']],
                    price=p['price'],
                    sale_price=p['sale_price'],
                    stock=p['stock'],
                    image_url=PRODUCT_IMAGES.get(p['name'], DEFAULT_IMAGE),
                    description=p['description'],
                    specs=p['specs'],
                )
                created += 1
            else:
                prod.specs = p['specs']
                prod.description = p['description']
                prod.image_url = PRODUCT_IMAGES.get(p['name'], DEFAULT_IMAGE)
                prod.save(update_fields=['specs', 'description', 'image_url'])

        self.stdout.write(self.style.SUCCESS(f'✓ Cập nhật/Tạo {len(products_data)} sản phẩm'))

        # ── Reviews ───────────────────────────────────────────────────────────
        all_prods = Product.objects.all()
        for prod in all_prods:
            if not prod.reviews.exists():
                Review.objects.create(
                    product=prod,
                    user=demo_user,
                    rating=5,
                    comment=f'Máy {prod.name} dùng rất thích, đóng gói cẩn thận và giao hàng siêu tốc!',
                    color='Titan Đen',
                    storage='256GB',
                    likes=12,
                )
                Review.objects.create(
                    product=prod,
                    user=admin_user,
                    rating=5,
                    comment='Sản phẩm chính hãng chất lượng cao, màn hình đẹp và pin trâu!',
                    color='Titan Tự Nhiên',
                    storage='128GB',
                    likes=8,
                )
        self.stdout.write(self.style.SUCCESS('✓ Tạo đánh giá mẫu cho sản phẩm'))

        # ── Sample Orders ─────────────────────────────────────────────────────
        if not Order.objects.filter(user=demo_user).exists():
            first_prod = all_prods.first()
            if first_prod:
                order = Order.objects.create(
                    user=demo_user,
                    status=Order.Status.CONFIRMED,
                    shipping_full_name=demo_user.full_name,
                    shipping_phone=demo_user.phone,
                    shipping_email=demo_user.email,
                    shipping_address=demo_user.address,
                    payment_method=Order.PaymentMethod.BANK,
                    note='Giao vào giờ hành chính giúp mình',
                    total_price=first_prod.current_price,
                )
                OrderItem.objects.create(
                    order=order,
                    product=first_prod,
                    product_name=first_prod.name,
                    product_image=first_prod.image_url,
                    price=first_prod.current_price,
                    quantity=1,
                    color='Titan Tự Nhiên',
                    storage='256GB',
                )
                self.stdout.write(self.style.SUCCESS('✓ Tạo đơn hàng mẫu cho demo_user'))

        self.stdout.write(self.style.SUCCESS('🎉 Hoàn tất nạp dữ liệu mẫu!'))
