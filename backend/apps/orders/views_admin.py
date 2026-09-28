"""
Admin-only views: Dashboard stats, Revenue charts.
"""
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth, TruncDate
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.accounts.permissions import IsAdmin


class AdminDashboardStatsView(APIView):
    """
    GET /api/v1/admin/stats/
    Dashboard summary: products, users, orders, revenue.
    """
    permission_classes = (IsAdmin,)

    def get(self, request):
        from apps.products.models import Product
        from apps.accounts.models import User
        from .models import Order

        now        = timezone.now()
        this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month = (this_month - timedelta(days=1)).replace(day=1)

        # ── Sản phẩm ──
        total_products   = Product.objects.count()
        active_products  = Product.objects.filter(is_active=True).count()
        low_stock        = Product.objects.filter(stock__gt=0, stock__lte=5).count()
        out_of_stock     = Product.objects.filter(stock=0).count()

        # ── Người dùng ──
        total_users      = User.objects.count()
        new_users_month  = User.objects.filter(created_at__gte=this_month).count()
        active_users     = User.objects.filter(is_active=True).count()

        # ── Đơn hàng ──
        total_orders     = Order.objects.count()
        pending_orders   = Order.objects.filter(status='pending').count()
        orders_month     = Order.objects.filter(created_at__gte=this_month).count()
        orders_prev      = Order.objects.filter(
            created_at__gte=last_month, created_at__lt=this_month
        ).count()

        # ── Doanh thu ──
        revenue_total    = Order.objects.filter(status='delivered').aggregate(
            total=Sum('total_price')
        )['total'] or 0

        revenue_month    = Order.objects.filter(
            status='delivered', created_at__gte=this_month
        ).aggregate(total=Sum('total_price'))['total'] or 0

        revenue_prev     = Order.objects.filter(
            status='delivered',
            created_at__gte=last_month, created_at__lt=this_month,
        ).aggregate(total=Sum('total_price'))['total'] or 0

        # ── Status breakdown ──
        order_status = list(
            Order.objects.values('status')
            .annotate(count=Count('id'))
            .order_by('status')
        )

        # ── Revenue last 7 days ──
        seven_days_ago = now - timedelta(days=6)
        daily_revenue  = list(
            Order.objects
            .filter(status='delivered', created_at__gte=seven_days_ago)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(revenue=Sum('total_price'), orders=Count('id'))
            .order_by('date')
        )

        return Response({
            'products': {
                'total':       total_products,
                'active':      active_products,
                'low_stock':   low_stock,
                'out_of_stock': out_of_stock,
            },
            'users': {
                'total':       total_users,
                'active':      active_users,
                'new_month':   new_users_month,
            },
            'orders': {
                'total':       total_orders,
                'pending':     pending_orders,
                'this_month':  orders_month,
                'prev_month':  orders_prev,
                'by_status':   order_status,
            },
            'revenue': {
                'total':       float(revenue_total),
                'this_month':  float(revenue_month),
                'prev_month':  float(revenue_prev),
                'daily':       [
                    {
                        'date':    str(r['date']),
                        'revenue': float(r['revenue'] or 0),
                        'orders':  r['orders'],
                    }
                    for r in daily_revenue
                ],
            },
        })
