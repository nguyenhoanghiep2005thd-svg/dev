from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction

from .models import CartItem, Order
from .serializers import (
    CartItemSerializer,
    CartItemUpdateSerializer,
    OrderSerializer,
    CreateOrderSerializer,
    UpdateOrderStatusSerializer,
)
from apps.accounts.permissions import IsAdmin, IsOwnerOrAdmin


COUPONS = {
    'PHONESTORE10': {
        'code': 'PHONESTORE10',
        'type': 'percent',
        'value': 10,
        'max_discount': 1000000,
        'min_order': 0,
        'description': 'Giảm 10% tối đa 1.000.000đ',
    },
    'CHAOBANMOI': {
        'code': 'CHAOBANMOI',
        'type': 'fixed',
        'value': 200000,
        'min_order': 2000000,
        'description': 'Giảm 200.000đ cho đơn từ 2.000.000đ',
    },
    'FREESHIP': {
        'code': 'FREESHIP',
        'type': 'shipping',
        'value': 30000,
        'min_order': 0,
        'description': 'Miễn phí vận chuyển toàn quốc',
    },
    'VIP500': {
        'code': 'VIP500',
        'type': 'fixed',
        'value': 500000,
        'min_order': 10000000,
        'description': 'Giảm 500.000đ cho đơn từ 10.000.000đ',
    },
}


class ValidateCouponView(APIView):
    """
    GET  /api/v1/orders/validate-coupon/ - Liệt kê coupon đang có
    POST /api/v1/orders/validate-coupon/ - Kiểm tra coupon
    """
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        return Response([
            {
                'code': k,
                'description': v['description'],
                'min_order': v.get('min_order', 0),
            }
            for k, v in COUPONS.items()
        ])

    def post(self, request):
        code = str(request.data.get('code', '')).strip().upper()
        subtotal = float(request.data.get('subtotal', 0))

        if not code:
            return Response({'error': 'Vui lòng nhập mã giảm giá.'}, status=status.HTTP_400_BAD_REQUEST)

        coupon = COUPONS.get(code)
        if not coupon:
            return Response({'error': 'Mã giảm giá không tồn tại hoặc đã hết hạn.'}, status=status.HTTP_400_BAD_REQUEST)

        if subtotal < coupon['min_order']:
            min_fmt = f"{coupon['min_order']:,}đ"
            return Response({
                'error': f"Mã này chỉ áp dụng cho đơn từ {min_fmt} trở lên."
            }, status=status.HTTP_400_BAD_REQUEST)

        discount = 0
        if coupon['type'] == 'percent':
            discount = min((subtotal * coupon['value']) / 100, coupon.get('max_discount', float('inf')))
        elif coupon['type'] == 'fixed':
            discount = coupon['value']
        elif coupon['type'] == 'shipping':
            discount = coupon['value']

        discount = int(min(discount, subtotal))

        return Response({
            'code': code,
            'discount': discount,
            'description': coupon['description'],
            'message': f"Áp dụng thành công! Giảm {discount:,}đ.",
        })


class CartListView(generics.ListAPIView):
    serializer_class = CartItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return (
            CartItem.objects
            .filter(user=self.request.user)
            .select_related('product', 'product__brand')
            .prefetch_related('product__images')
            .order_by('created_at')
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        total_price = sum(item.subtotal for item in queryset)
        shipping_fee = 0 if total_price >= 1_000_000 else 30_000
        final_total = total_price + shipping_fee

        return Response({
            'items': serializer.data,
            'total_items': queryset.count(),
            'total_price': total_price,
            'shipping_fee': shipping_fee,
            'final_total': final_total,
        })


class CartItemAddView(generics.CreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart_item = serializer.save()
        return Response(
            CartItemSerializer(cart_item, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class CartItemUpdateView(generics.UpdateAPIView):
    serializer_class = CartItemUpdateSerializer
    permission_classes = (permissions.IsAuthenticated,)
    http_method_names = ['patch']

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user).select_related('product')

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        full = CartItemSerializer(instance, context={'request': request})
        return Response(full.data)


class CartItemDeleteView(generics.DestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        super().destroy(request, *args, **kwargs)
        return Response({'message': 'Đã xóa sản phẩm khỏi giỏ hàng.'}, status=status.HTTP_200_OK)


class CartClearView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request):
        deleted_count, _ = CartItem.objects.filter(user=request.user).delete()
        return Response(
            {'message': f'Đã xóa {deleted_count} sản phẩm khỏi giỏ hàng.'},
            status=status.HTTP_200_OK,
        )


class CartSyncView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        items = request.data.get('items', [])
        user = request.user
        synced = 0
        errors = []

        with transaction.atomic():
            for item_data in items:
                product_id = item_data.get('product_id')
                quantity = int(item_data.get('quantity', 1))
                color = item_data.get('color', '')
                storage = item_data.get('storage', '')

                if not product_id or quantity < 1:
                    continue

                from apps.products.models import Product
                try:
                    product = Product.objects.get(pk=product_id, is_active=True)
                except Product.DoesNotExist:
                    errors.append(f'Sản phẩm #{product_id} không tồn tại.')
                    continue

                if product.stock <= 0:
                    errors.append(f'"{product.name}" đã hết hàng.')
                    continue

                cart_item, created = CartItem.objects.get_or_create(
                    user=user,
                    product=product,
                    color=color,
                    storage=storage,
                    defaults={'quantity': min(quantity, product.stock)},
                )
                if not created:
                    cart_item.quantity = min(max(cart_item.quantity, quantity), product.stock)
                    cart_item.save()
                synced += 1

        return Response({
            'synced': synced,
            'errors': errors,
            'message': f'Đồng bộ thành công {synced} sản phẩm.',
        })


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')


class OrderCreateView(generics.CreateAPIView):
    serializer_class = CreateOrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        response_data = OrderSerializer(order, context={'request': request}).data
        response_data['message'] = f'Đặt hàng thành công! Mã đơn hàng #{order.id}.'
        return Response(response_data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrAdmin)
    lookup_field = 'pk'

    def get_queryset(self):
        if self.request.user.is_admin:
            return Order.objects.all().prefetch_related('items')
        return Order.objects.filter(user=self.request.user).prefetch_related('items')


class OrderCancelView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Đơn hàng không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != Order.Status.PENDING:
            return Response(
                {'error': f'Không thể hủy đơn hàng ở trạng thái "{order.get_status_display()}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            order.status = Order.Status.CANCELLED
            order.save()

            from apps.products.models import Product
            for item in order.items.all():
                if item.product:
                    Product.objects.filter(pk=item.product.pk).update(
                        stock=models.F('stock') + item.quantity
                    )

        return Response({'message': 'Hủy đơn hàng thành công.'})


class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = (IsAdmin,)
    search_fields = ('shipping_full_name', 'shipping_phone', 'id')
    ordering_fields = ('created_at', 'total_price', 'status')
    ordering = ('-created_at',)

    def get_queryset(self):
        queryset = Order.objects.prefetch_related('items').all()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAdmin,)
    lookup_field = 'pk'

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UpdateOrderStatusSerializer
        return OrderSerializer

    def get_queryset(self):
        return Order.objects.prefetch_related('items').all()
