from django.urls import path
from .views import (
    CartListView, CartItemAddView, CartItemUpdateView,
    CartItemDeleteView, CartClearView, CartSyncView,
    OrderListView, OrderCreateView, OrderDetailView,
    OrderCancelView, AdminOrderListView, AdminOrderDetailView,
    ValidateCouponView,
)
from .views_admin import AdminDashboardStatsView

urlpatterns = [
    # Cart
    path('cart/', CartListView.as_view(), name='cart-list'),
    path('cart/add/', CartItemAddView.as_view(), name='cart-add'),
    path('cart/<int:pk>/update/', CartItemUpdateView.as_view(), name='cart-update'),
    path('cart/<int:pk>/delete/', CartItemDeleteView.as_view(), name='cart-delete'),
    path('cart/clear/', CartClearView.as_view(), name='cart-clear'),
    path('cart/sync/', CartSyncView.as_view(), name='cart-sync'),

    # Orders & Coupons
    path('', OrderListView.as_view(), name='order-list'),
    path('create/', OrderCreateView.as_view(), name='order-create'),
    path('validate-coupon/', ValidateCouponView.as_view(), name='validate-coupon'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/cancel/', OrderCancelView.as_view(), name='order-cancel'),

    # Admin orders & stats
    path('admin/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),
]
