from django.db import models
from django.conf import settings
from apps.products.models import Product


class CartItem(models.Model):
    """Item trong giỏ hàng — mỗi user có nhiều cart items với các biến thể (màu sắc, dung lượng)."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart_items',
        verbose_name='Người dùng',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='cart_items',
        verbose_name='Sản phẩm',
    )
    quantity = models.PositiveIntegerField(default=1, verbose_name='Số lượng')
    color = models.CharField(max_length=50, blank=True, verbose_name='Màu sắc')
    storage = models.CharField(max_length=50, blank=True, verbose_name='Dung lượng')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Giỏ hàng'
        verbose_name_plural = 'Giỏ hàng'
        unique_together = ('user', 'product', 'color', 'storage')

    def __str__(self):
        variant = f" ({self.color} - {self.storage})" if (self.color or self.storage) else ""
        return f'{self.user.email} — {self.product.name}{variant} x{self.quantity}'

    @property
    def subtotal(self):
        return self.product.current_price * self.quantity


class Order(models.Model):
    """Đơn hàng."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Chờ xác nhận'
        CONFIRMED = 'confirmed', 'Đã xác nhận'
        SHIPPING = 'shipping', 'Đang giao'
        DELIVERED = 'delivered', 'Đã giao'
        CANCELLED = 'cancelled', 'Đã hủy'

    class PaymentMethod(models.TextChoices):
        COD    = 'cod',    'Thanh toán khi nhận hàng (COD)'
        BANK   = 'bank',   'Chuyển khoản ngân hàng'
        ONLINE = 'online', 'Thanh toán online (VNPay/MoMo/ZaloPay)'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='orders',
        verbose_name='Người đặt',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name='Trạng thái',
    )
    shipping_full_name = models.CharField(max_length=150, verbose_name='Tên người nhận')
    shipping_phone = models.CharField(max_length=15, verbose_name='SĐT người nhận')
    shipping_email = models.EmailField(blank=True, verbose_name='Email người nhận')
    shipping_address = models.TextField(verbose_name='Địa chỉ giao hàng')
    payment_method = models.CharField(
        max_length=10,
        choices=PaymentMethod.choices,
        default=PaymentMethod.COD,
        verbose_name='Phương thức thanh toán',
    )
    note = models.TextField(blank=True, verbose_name='Ghi chú')
    coupon_code = models.CharField(max_length=50, blank=True, verbose_name='Mã giảm giá')
    discount_amount = models.DecimalField(
        max_digits=12, decimal_places=0, default=0, verbose_name='Số tiền giảm'
    )
    total_price = models.DecimalField(
        max_digits=12, decimal_places=0, verbose_name='Tổng tiền hàng'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Đơn hàng'
        verbose_name_plural = 'Đơn hàng'
        ordering = ['-created_at']

    def __str__(self):
        return f'Đơn #{self.id} — {self.shipping_full_name} ({self.get_status_display()})'

    @property
    def shipping_fee(self):
        return 0 if self.total_price >= 1_000_000 else 30_000

    @property
    def final_total(self):
        base = max(0, self.total_price - self.discount_amount)
        return base + self.shipping_fee


class OrderItem(models.Model):
    """Chi tiết từng sản phẩm trong đơn hàng — snapshot giá tại thời điểm mua."""
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Đơn hàng',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        related_name='order_items',
        verbose_name='Sản phẩm',
    )
    product_name = models.CharField(max_length=255, verbose_name='Tên sản phẩm')
    product_image = models.CharField(max_length=500, blank=True, verbose_name='Ảnh sản phẩm')
    price = models.DecimalField(max_digits=12, decimal_places=0, verbose_name='Đơn giá')
    quantity = models.PositiveIntegerField(verbose_name='Số lượng')
    color = models.CharField(max_length=50, blank=True, verbose_name='Màu sắc')
    storage = models.CharField(max_length=50, blank=True, verbose_name='Dung lượng')

    class Meta:
        verbose_name = 'Chi tiết đơn hàng'
        verbose_name_plural = 'Chi tiết đơn hàng'

    def __str__(self):
        return f'{self.product_name} x{self.quantity}'

    @property
    def subtotal(self):
        return self.price * self.quantity
