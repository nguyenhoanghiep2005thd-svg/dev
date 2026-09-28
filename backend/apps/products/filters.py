import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    """
    Hỗ trợ các query params:
      ?brand=1           — lọc theo brand id
      ?brand_slug=apple  — lọc theo brand slug
      ?category=2        — lọc theo category id
      ?price_min=5000000 — giá từ
      ?price_max=20000000— giá đến
      ?in_stock=true     — còn hàng
    """
    brand = django_filters.NumberFilter(field_name='brand__id')
    brand_slug = django_filters.CharFilter(field_name='brand__slug', lookup_expr='iexact')
    category = django_filters.NumberFilter(field_name='category__id')
    category_slug = django_filters.CharFilter(field_name='category__slug', lookup_expr='iexact')

    # Lọc theo khoảng giá — dùng current_price logic qua annotate hoặc lọc trên price/sale_price
    price_min = django_filters.NumberFilter(method='filter_price_min')
    price_max = django_filters.NumberFilter(method='filter_price_max')

    in_stock = django_filters.BooleanFilter(method='filter_in_stock')

    class Meta:
        model = Product
        fields = ['brand', 'brand_slug', 'category', 'category_slug']

    def filter_price_min(self, queryset, name, value):
        """Lọc: current_price >= value (ưu tiên sale_price nếu có)."""
        from django.db.models import Q, Case, When, F
        return queryset.annotate(
            effective_price=Case(
                When(sale_price__isnull=False, then=F('sale_price')),
                default=F('price'),
            )
        ).filter(effective_price__gte=value)

    def filter_price_max(self, queryset, name, value):
        """Lọc: current_price <= value."""
        from django.db.models import Case, When, F
        return queryset.annotate(
            effective_price=Case(
                When(sale_price__isnull=False, then=F('sale_price')),
                default=F('price'),
            )
        ).filter(effective_price__lte=value)

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset.filter(stock=0)
