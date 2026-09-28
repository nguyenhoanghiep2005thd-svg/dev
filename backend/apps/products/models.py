from django.db import models
from django.utils.text import slugify
import uuid


class Brand(models.Model):
    """Hãng điện thoại: Samsung, Apple, Xiaomi..."""
    name = models.CharField(max_length=100, unique=True, verbose_name='Tên hãng')
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True, verbose_name='Logo')
    description = models.TextField(blank=True, verbose_name='Mô tả')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Hãng'
        verbose_name_plural = 'Hãng'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Category(models.Model):
    """Danh mục: Điện thoại cao cấp, Tầm trung, Giá rẻ..."""
    name = models.CharField(max_length=100, unique=True, verbose_name='Tên danh mục')
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, verbose_name='Mô tả')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Danh mục'
        verbose_name_plural = 'Danh mục'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    """Sản phẩm điện thoại."""
    name = models.CharField(max_length=255, verbose_name='Tên sản phẩm')
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        related_name='products',
        verbose_name='Hãng',
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='products',
        verbose_name='Danh mục',
    )
    description = models.TextField(verbose_name='Mô tả')
    price = models.DecimalField(max_digits=12, decimal_places=0, verbose_name='Giá gốc (VNĐ)')
    sale_price = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        null=True,
        blank=True,
        verbose_name='Giá khuyến mãi (VNĐ)',
    )
    stock = models.PositiveIntegerField(default=0, verbose_name='Tồn kho')
    # Thông số kỹ thuật lưu dạng JSON
    specs = models.JSONField(default=dict, blank=True, verbose_name='Thông số kỹ thuật')
    is_active = models.BooleanField(default=True, verbose_name='Hiển thị')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Sản phẩm'
        verbose_name_plural = 'Sản phẩm'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            # Thêm uuid ngắn để tránh trùng slug
            base_slug = slugify(self.name)
            unique_id = str(uuid.uuid4())[:8]
            self.slug = f'{base_slug}-{unique_id}'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def current_price(self):
        """Trả về giá hiện tại (khuyến mãi nếu có)."""
        return self.sale_price if self.sale_price else self.price

    @property
    def discount_percent(self):
        """Phần trăm giảm giá."""
        if self.sale_price and self.price > 0:
            return int((1 - self.sale_price / self.price) * 100)
        return 0

    @property
    def in_stock(self):
        return self.stock > 0


class ProductImage(models.Model):
    """Ảnh sản phẩm — một sản phẩm có thể có nhiều ảnh."""
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name='Sản phẩm',
    )
    image = models.ImageField(upload_to='products/', verbose_name='Ảnh')
    alt_text = models.CharField(max_length=200, blank=True, verbose_name='Mô tả ảnh')
    is_primary = models.BooleanField(default=False, verbose_name='Ảnh chính')
    order = models.PositiveSmallIntegerField(default=0, verbose_name='Thứ tự')

    class Meta:
        verbose_name = 'Ảnh sản phẩm'
        verbose_name_plural = 'Ảnh sản phẩm'
        ordering = ['order', 'id']

    def __str__(self):
        return f'Ảnh {self.product.name} ({"chính" if self.is_primary else "phụ"})'

    def save(self, *args, **kwargs):
        # Chỉ có một ảnh chính cho mỗi sản phẩm
        if self.is_primary:
            ProductImage.objects.filter(
                product=self.product, is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)
