from django.db import models
from django.conf import settings
from apps.products.models import Product


class CartItem(models.Model):
    """Item trong giỏ hàng — mỗi user có nhiều cart items."""
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Giỏ hàng'
        verbose_name_plural = 'Giỏ hàng'
        # Mỗi user chỉ có 1 dòng cho mỗi sản phẩm trong giỏ
        unique_together = ('user', 'product')

    def __str__(self):
        return f'{self.user.email} — {self.product.name} x{self.quantity}'

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
    # Snapshot thông tin giao hàng tại thời điểm đặt
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
    total_price = models.DecimalField(
        max_digits=12, decimal_places=0, verbose_name='Tổng tiền'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Đơn hàng'
        verbose_name_plural = 'Đơn hàng'
        ordering = ['-created_at']

    def __str__(self):
        return f'Đơn #{self.id} — {self.shipping_full_name} ({self.get_status_display()})'


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
    # Snapshot để không bị ảnh hưởng khi sản phẩm thay đổi giá
    product_name = models.CharField(max_length=255, verbose_name='Tên sản phẩm')
    product_image = models.CharField(max_length=500, blank=True, verbose_name='Ảnh sản phẩm')
    price = models.DecimalField(max_digits=12, decimal_places=0, verbose_name='Đơn giá')
    quantity = models.PositiveIntegerField(verbose_name='Số lượng')

    class Meta:
        verbose_name = 'Chi tiết đơn hàng'
        verbose_name_plural = 'Chi tiết đơn hàng'

    def __str__(self):
        return f'{self.product_name} x{self.quantity}'

    @property
    def subtotal(self):
        return self.price * self.quantity
