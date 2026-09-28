from rest_framework import serializers
from django.db import models
from .models import CartItem, Order, OrderItem
from apps.products.models import Product
from apps.products.serializers import ProductListSerializer


# ─── Cart ────────────────────────────────────────────────────────────────────

class CartItemSerializer(serializers.ModelSerializer):
    product     = ProductListSerializer(read_only=True)
    product_id  = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source='product',
        write_only=True,
    )
    subtotal    = serializers.ReadOnlyField()

    class Meta:
        model  = CartItem
        fields = ('id', 'product', 'product_id', 'quantity', 'subtotal', 'updated_at')

    def validate(self, attrs):
        product  = attrs.get('product')
        quantity = attrs.get('quantity', 1)

        if not product:
            return attrs

        # Kiểm tra sản phẩm còn hoạt động
        if not product.is_active:
            raise serializers.ValidationError(
                {'product_id': f'Sản phẩm "{product.name}" hiện không còn bán.'}
            )

        # Kiểm tra tồn kho
        if product.stock <= 0:
            raise serializers.ValidationError(
                {'product_id': f'Sản phẩm "{product.name}" đã hết hàng.'}
            )

        if quantity > product.stock:
            raise serializers.ValidationError(
                {'quantity': f'Chỉ còn {product.stock} sản phẩm trong kho.'}
            )
        return attrs

    def create(self, validated_data):
        user     = self.context['request'].user
        product  = validated_data['product']
        quantity = validated_data.get('quantity', 1)

        # Nếu đã có trong giỏ thì cộng thêm số lượng
        cart_item, created = CartItem.objects.get_or_create(
            user=user,
            product=product,
            defaults={'quantity': quantity},
        )
        if not created:
            new_qty = cart_item.quantity + quantity
            if new_qty > product.stock:
                raise serializers.ValidationError(
                    {'quantity': f'Chỉ còn {product.stock} sản phẩm. '
                                 f'Giỏ hàng đã có {cart_item.quantity}, '
                                 f'không thể thêm {quantity} nữa.'}
                )
            cart_item.quantity = new_qty
            cart_item.save()
        return cart_item


class CartItemUpdateSerializer(serializers.ModelSerializer):
    """Cập nhật số lượng — kiểm tra tồn kho."""
    class Meta:
        model  = CartItem
        fields = ('quantity',)

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError('Số lượng phải >= 1.')
        # Kiểm tra với tồn kho hiện tại
        product = self.instance.product
        if value > product.stock:
            raise serializers.ValidationError(
                f'Chỉ còn {product.stock} sản phẩm trong kho.'
            )
        return value


# ─── Order ───────────────────────────────────────────────────────────────────

class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'product_image', 'price', 'quantity', 'subtotal')


class OrderSerializer(serializers.ModelSerializer):
    """Xem chi tiết đơn hàng."""
    items                  = OrderItemSerializer(many=True, read_only=True)
    status_display         = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    total_items            = serializers.SerializerMethodField()
    shipping_fee           = serializers.SerializerMethodField()
    final_total            = serializers.SerializerMethodField()

    class Meta:
        model  = Order
        fields = (
            'id', 'status', 'status_display',
            'shipping_full_name', 'shipping_phone', 'shipping_email', 'shipping_address',
            'payment_method', 'payment_method_display',
            'note', 'total_price', 'total_items', 'shipping_fee', 'final_total',
            'items', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'total_price', 'status', 'created_at', 'updated_at')

    def get_total_items(self, obj):
        return sum(i.quantity for i in obj.items.all())

    def get_shipping_fee(self, obj):
        return 0 if obj.total_price >= 1_000_000 else 30_000

    def get_final_total(self, obj):
        fee = self.get_shipping_fee(obj)
        return int(obj.total_price) + fee


class CreateOrderSerializer(serializers.Serializer):
    """Tạo đơn hàng từ giỏ hàng — validate stock, tạo order + items, trừ tồn kho, xóa cart."""
    shipping_full_name = serializers.CharField(max_length=150)
    shipping_phone     = serializers.CharField(max_length=15)
    shipping_email     = serializers.EmailField(required=False, allow_blank=True, default='')
    shipping_address   = serializers.CharField()
    payment_method     = serializers.ChoiceField(choices=Order.PaymentMethod.choices)
    note               = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_shipping_phone(self, value):
        import re
        cleaned = re.sub(r'\D', '', value)
        if len(cleaned) < 9 or len(cleaned) > 11:
            raise serializers.ValidationError('Số điện thoại không hợp lệ (9–11 chữ số).')
        return value

    def validate(self, attrs):
        user       = self.context['request'].user
        cart_items = (
            CartItem.objects
            .filter(user=user)
            .select_related('product')
        )

        if not cart_items.exists():
            raise serializers.ValidationError({'non_field_errors': ['Giỏ hàng đang trống.']})

        stock_errors = []
        for item in cart_items:
            p = item.product
            if not p.is_active:
                stock_errors.append(f'"{p.name}" hiện không còn bán.')
            elif p.stock <= 0:
                stock_errors.append(f'"{p.name}" đã hết hàng.')
            elif item.quantity > p.stock:
                stock_errors.append(
                    f'"{p.name}" chỉ còn {p.stock} sản phẩm, '
                    f'giỏ hàng yêu cầu {item.quantity}.'
                )

        if stock_errors:
            raise serializers.ValidationError({'stock': stock_errors})

        attrs['cart_items'] = cart_items
        return attrs

    def create(self, validated_data):
        from django.db import transaction

        cart_items = validated_data.pop('cart_items')
        user       = self.context['request'].user

        # Tính tổng (không bao gồm ship — ship tính ở frontend và lưu vào note nếu cần)
        total_price = sum(item.subtotal for item in cart_items)

        with transaction.atomic():
            # 1. Tạo order
            order = Order.objects.create(
                user=user,
                total_price=total_price,
                **validated_data,
            )

            # 2. Tạo order items (snapshot giá + ảnh)
            order_items = []
            for item in cart_items:
                p = item.product
                primary = p.images.filter(is_primary=True).first()
                image_url = primary.image.url if primary else ''

                order_items.append(OrderItem(
                    order=order,
                    product=p,
                    product_name=p.name,
                    product_image=image_url,
                    price=p.current_price,
                    quantity=item.quantity,
                ))

                # 3. Trừ tồn kho (dùng select_for_update để tránh race condition)
                from apps.products.models import Product as P
                P.objects.filter(pk=p.pk, stock__gte=item.quantity).update(
                    stock=models.F('stock') - item.quantity
                )

            OrderItem.objects.bulk_create(order_items)

            # 4. Xóa giỏ hàng
            cart_items.delete()

        return order


class UpdateOrderStatusSerializer(serializers.ModelSerializer):
    """Admin cập nhật trạng thái đơn hàng."""
    class Meta:
        model = Order
        fields = ('status',)

    def validate_status(self, value):
        current = self.instance.status
        # Đơn đã hủy hoặc đã giao không thể đổi trạng thái
        if current in (Order.Status.CANCELLED, Order.Status.DELIVERED):
            raise serializers.ValidationError(
                f'Không thể thay đổi trạng thái đơn hàng đã "{self.instance.get_status_display()}".'
            )
        return value
