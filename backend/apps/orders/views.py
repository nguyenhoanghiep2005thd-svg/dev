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


# ─── Cart ─────────────────────────────────────────────────────────────────────

class CartListView(generics.ListAPIView):
    """
    GET /api/v1/orders/cart/
    Xem giỏ hàng. Trả về items + total_items + total_price + shipping_fee + final_total.
    """
    serializer_class    = CartItemSerializer
    permission_classes  = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return (
            CartItem.objects
            .filter(user=self.request.user)
            .select_related('product', 'product__brand')
            .prefetch_related('product__images')
            .order_by('created_at')
        )

    def list(self, request, *args, **kwargs):
        queryset      = self.get_queryset()
        serializer    = self.get_serializer(queryset, many=True)
        total_price   = sum(item.subtotal for item in queryset)

        # Phí ship: miễn phí nếu >= 1.000.000đ
        shipping_fee  = 0 if total_price >= 1_000_000 else 30_000
        final_total   = total_price + shipping_fee

        return Response({
            'items':        serializer.data,
            'total_items':  queryset.count(),
            'total_price':  total_price,
            'shipping_fee': shipping_fee,
            'final_total':  final_total,
        })


class CartItemAddView(generics.CreateAPIView):
    """
    POST /api/v1/orders/cart/add/
    Thêm sản phẩm vào giỏ. Kiểm tra hết hàng + stock.
    Body: { "product_id": 1, "quantity": 2 }
    """
    serializer_class   = CartItemSerializer
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
    """
    PATCH /api/v1/orders/cart/<id>/update/
    Cập nhật số lượng. Kiểm tra stock.
    Body: { "quantity": 3 }
    """
    serializer_class   = CartItemUpdateSerializer
    permission_classes = (permissions.IsAuthenticated,)
    http_method_names  = ['patch']

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user).select_related('product')

    def update(self, request, *args, **kwargs):
        instance   = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Trả về cart item đầy đủ thông tin
        full = CartItemSerializer(instance, context={'request': request})
        return Response(full.data)


class CartItemDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/v1/orders/cart/<id>/delete/
    Xóa 1 sản phẩm khỏi giỏ.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        super().destroy(request, *args, **kwargs)
        return Response({'message': 'Đã xóa sản phẩm khỏi giỏ hàng.'}, status=status.HTTP_200_OK)


class CartClearView(APIView):
    """
    DELETE /api/v1/orders/cart/clear/
    Xóa toàn bộ giỏ hàng.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request):
        deleted_count, _ = CartItem.objects.filter(user=request.user).delete()
        return Response(
            {'message': f'Đã xóa {deleted_count} sản phẩm khỏi giỏ hàng.'},
            status=status.HTTP_200_OK,
        )


class CartSyncView(APIView):
    """
    POST /api/v1/orders/cart/sync/
    Đồng bộ giỏ hàng local (guest) lên server sau khi đăng nhập.
    Body: { "items": [{ "product_id": 1, "quantity": 2 }, ...] }
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        items   = request.data.get('items', [])
        user    = request.user
        errors  = []
        synced  = 0

        with transaction.atomic():
            for item_data in items:
                product_id = item_data.get('product_id')
                quantity   = int(item_data.get('quantity', 1))

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
                    defaults={'quantity': min(quantity, product.stock)},
                )
                if not created:
                    # Lấy max giữa local và server, không vượt stock
                    cart_item.quantity = min(
                        max(cart_item.quantity, quantity),
                        product.stock,
                    )
                    cart_item.save()
                synced += 1

        return Response({
            'synced': synced,
            'errors': errors,
            'message': f'Đồng bộ thành công {synced} sản phẩm.',
        })


# ─── Order ────────────────────────────────────────────────────────────────────

class OrderListView(generics.ListAPIView):
    """
    GET /api/v1/orders/
    User xem lịch sử đơn hàng của mình.
    """
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')


class OrderCreateView(generics.CreateAPIView):
    """
    POST /api/v1/orders/create/
    Tạo đơn hàng từ giỏ hàng.
    Body: { shipping_full_name, shipping_phone, shipping_email,
            shipping_address, payment_method, note }
    Trả về: order đầy đủ kèm mã đơn hàng.
    """
    serializer_class   = CreateOrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        # Trả về order đầy đủ + message
        response_data = OrderSerializer(order, context={'request': request}).data
        response_data['message'] = f'Đặt hàng thành công! Mã đơn hàng #{order.id}.'

        return Response(response_data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/orders/<id>/
    Xem chi tiết đơn hàng (chủ đơn hoặc admin).
    """
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrAdmin)
    queryset = Order.objects.prefetch_related('items')


class OrderCancelView(APIView):
    """
    POST /api/v1/orders/<id>/cancel/
    User tự hủy đơn hàng (chỉ được hủy khi đang ở trạng thái 'pending').
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Không tìm thấy đơn hàng.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != Order.Status.PENDING:
            return Response(
                {'error': 'Chỉ có thể hủy đơn hàng đang chờ xác nhận.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Hoàn lại tồn kho
        for item in order.items.select_related('product'):
            if item.product:
                item.product.stock += item.quantity
                item.product.save(update_fields=['stock'])

        order.status = Order.Status.CANCELLED
        order.save(update_fields=['status'])
        return Response({'message': 'Đơn hàng đã được hủy.'})


# ─── Admin Order Views ────────────────────────────────────────────────────────

class AdminOrderListView(generics.ListAPIView):
    """
    GET /api/v1/orders/admin/
    Admin xem tất cả đơn hàng.
    Query: ?status=pending|confirmed|shipping|delivered|cancelled
    """
    serializer_class = OrderSerializer
    permission_classes = (IsAdmin,)
    queryset = Order.objects.prefetch_related('items').select_related('user')
    filterset_fields = ('status',)
    search_fields = ('shipping_full_name', 'shipping_phone', 'user__email')
    ordering_fields = ('created_at', 'total_price')
    ordering = ('-created_at',)


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/v1/orders/admin/<id>/  — Xem chi tiết
    PATCH /api/v1/orders/admin/<id>/  — Cập nhật trạng thái
    Body: { "status": "confirmed" }
    """
    queryset = Order.objects.prefetch_related('items').select_related('user')
    permission_classes = (IsAdmin,)

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return UpdateOrderStatusSerializer
        return OrderSerializer
