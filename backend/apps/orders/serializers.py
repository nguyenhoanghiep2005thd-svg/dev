import re
from rest_framework import serializers
from .models import CartItem, Order, OrderItem
from apps.products.models import Product
from apps.products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source='product',
        write_only=True,
    )
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_id', 'quantity', 'color', 'storage', 'subtotal', 'created_at')
        read_only_fields = ('id', 'created_at')

    def create(self, validated_data):
        user = self.context['request'].user
        product = validated_data['product']
        quantity = validated_data.get('quantity', 1)
        color = validated_data.get('color', '')
        storage = validated_data.get('storage', '')

        cart_item, created = CartItem.objects.get_or_create(
            user=user,
            product=product,
            color=color,
            storage=storage,
            defaults={'quantity': quantity},
        )
        if not created:
            new_qty = cart_item.quantity + quantity
            if new_qty > product.stock:
                raise serializers.ValidationError(
                    {'quantity': f'Chỉ còn {product.stock} sản phẩm. Giỏ đã có {cart_item.quantity}.'}
                )
            cart_item.quantity = new_qty
            cart_item.save()
        return cart_item


class CartItemUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ('quantity',)

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError('Số lượng phải >= 1.')
        product = self.instance.product
        if value > product.stock:
            raise serializers.ValidationError(
                f'Chỉ còn {product.stock} sản phẩm trong kho.'
            )
        return value


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = (
            'id', 'product', 'product_name', 'product_image',
            'price', 'quantity', 'color', 'storage', 'subtotal',
        )


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    shipping_fee = serializers.ReadOnlyField()
    final_total = serializers.ReadOnlyField()

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'status', 'status_display',
            'shipping_full_name', 'shipping_phone', 'shipping_email', 'shipping_address',
            'payment_method', 'payment_method_display', 'note',
            'coupon_code', 'discount_amount',
            'total_price', 'shipping_fee', 'final_total',
            'items', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'user', 'status', 'total_price', 'created_at', 'updated_at')


class CreateOrderSerializer(serializers.Serializer):
    shipping_full_name = serializers.CharField(max_length=150)
    shipping_phone = serializers.CharField(max_length=15)
    shipping_email = serializers.EmailField(required=False, allow_blank=True, default='')
    shipping_address = serializers.CharField()
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices)
    note = serializers.CharField(required=False, allow_blank=True, default='')
    coupon_code = serializers.CharField(required=False, allow_blank=True, default='')
    discount_amount = serializers.DecimalField(max_digits=12, decimal_places=0, required=False, default=0)

    def validate_shipping_phone(self, value):
        cleaned = re.sub(r'\D', '', value)
        if len(cleaned) < 9 or len(cleaned) > 11:
            raise serializers.ValidationError('Số điện thoại không hợp lệ (9–11 chữ số).')
        return value

    def validate(self, attrs):
        user = self.context['request'].user
        cart_items = CartItem.objects.filter(user=user).select_related('product')
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
                stock_errors.append(f'"{p.name}" chỉ còn {p.stock} cái (giỏ có {item.quantity}).')

        if stock_errors:
            raise serializers.ValidationError({'stock': stock_errors})

        attrs['cart_items'] = list(cart_items)
        return attrs

    def create(self, validated_data):
        from django.db import transaction

        cart_items = validated_data.pop('cart_items')
        user = self.context['request'].user
        total_price = sum(item.subtotal for item in cart_items)

        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                total_price=total_price,
                **validated_data,
            )

            order_items = []
            for item in cart_items:
                p = item.product
                primary = p.images.filter(is_primary=True).first()
                image_url = primary.image.url if primary else (p.image_url or '')

                order_items.append(OrderItem(
                    order=order,
                    product=p,
                    product_name=p.name,
                    product_image=image_url,
                    price=p.current_price,
                    quantity=item.quantity,
                    color=item.color,
                    storage=item.storage,
                ))

                Product.objects.filter(pk=p.pk, stock__gte=item.quantity).update(
                    stock=models.F('stock') - item.quantity
                )

            OrderItem.objects.bulk_create(order_items)
            CartItem.objects.filter(user=user).delete()

        return order


class UpdateOrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('status',)
