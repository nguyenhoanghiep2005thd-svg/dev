"""
Lệnh tạo dữ liệu mẫu để test.
Chạy: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.products.models import Brand, Category, Product

User = get_user_model()


class Command(BaseCommand):
    help = 'Tạo dữ liệu mẫu cho development'

    def handle(self, *args, **options):
        self.stdout.write('Đang tạo dữ liệu mẫu...')

        # ── Users ──────────────────────────────────────────────────────────
        if not User.objects.filter(email='admin@phonestore.com').exists():
            User.objects.create_superuser(
                email='admin@phonestore.com',
                password='admin123456',
                full_name='Admin',
            )
            self.stdout.write(self.style.SUCCESS('✓ Tạo admin: admin@phonestore.com / admin123456'))

        if not User.objects.filter(email='user@phonestore.com').exists():
            User.objects.create_user(
                email='user@phonestore.com',
                password='user123456',
                full_name='Nguyễn Văn A',
                phone='0901234567',
            )
            self.stdout.write(self.style.SUCCESS('✓ Tạo user: user@phonestore.com / user123456'))

        # ── Brands ─────────────────────────────────────────────────────────
        brands_data = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Realme']
        brands = {}
        for name in brands_data:
            brand, _ = Brand.objects.get_or_create(name=name)
            brands[name] = brand
        self.stdout.write(self.style.SUCCESS(f'✓ Tạo {len(brands_data)} hãng'))

        # ── Categories ─────────────────────────────────────────────────────
        categories_data = ['Cao cấp', 'Tầm trung', 'Giá rẻ']
        categories = {}
        for name in categories_data:
            cat, _ = Category.objects.get_or_create(name=name)
            categories[name] = cat
        self.stdout.write(self.style.SUCCESS(f'✓ Tạo {len(categories_data)} danh mục'))

        # ── Products ───────────────────────────────────────────────────────
        products_data = [
            {'name': 'iPhone 15 Pro Max', 'brand': 'Apple', 'category': 'Cao cấp', 'price': 34990000, 'sale_price': 32990000, 'stock': 50},
            {'name': 'iPhone 15', 'brand': 'Apple', 'category': 'Cao cấp', 'price': 22990000, 'sale_price': None, 'stock': 80},
            {'name': 'Samsung Galaxy S24 Ultra', 'brand': 'Samsung', 'category': 'Cao cấp', 'price': 31990000, 'sale_price': 28990000, 'stock': 40},
            {'name': 'Samsung Galaxy A55', 'brand': 'Samsung', 'category': 'Tầm trung', 'price': 10990000, 'sale_price': 9990000, 'stock': 120},
            {'name': 'Xiaomi 14', 'brand': 'Xiaomi', 'category': 'Cao cấp', 'price': 19990000, 'sale_price': 17990000, 'stock': 60},
            {'name': 'Xiaomi Redmi Note 13', 'brand': 'Xiaomi', 'category': 'Tầm trung', 'price': 5990000, 'sale_price': None, 'stock': 200},
            {'name': 'OPPO Reno 12', 'brand': 'OPPO', 'category': 'Tầm trung', 'price': 9990000, 'sale_price': 8990000, 'stock': 90},
            {'name': 'Xiaomi Redmi 13C', 'brand': 'Xiaomi', 'category': 'Giá rẻ', 'price': 3490000, 'sale_price': None, 'stock': 300},
        ]

        created = 0
        for p in products_data:
            if not Product.objects.filter(name=p['name']).exists():
                Product.objects.create(
                    name=p['name'],
                    brand=brands[p['brand']],
                    category=categories[p['category']],
                    price=p['price'],
                    sale_price=p['sale_price'],
                    stock=p['stock'],
                    description=f'Mô tả chi tiết cho {p["name"]}',
                    specs={
                        'RAM': '8GB',
                        'Storage': '128GB',
                        'Display': '6.5 inch',
                        'Battery': '4500mAh',
                    },
                )
                created += 1

        self.stdout.write(self.style.SUCCESS(f'✓ Tạo {created} sản phẩm'))
        self.stdout.write(self.style.SUCCESS('\n✅ Seed data hoàn tất!'))
