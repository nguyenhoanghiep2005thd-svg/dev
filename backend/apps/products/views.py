from rest_framework import generics, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Brand, Category, Product, ProductImage
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductImageUploadSerializer,
)
from .filters import ProductFilter
from apps.accounts.permissions import IsAdminOrReadOnly, IsAdmin


# ─── Brand ───────────────────────────────────────────────────────────────────

class BrandListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/products/brands/  — Danh sách hãng (public)
    POST /api/v1/products/brands/  — Tạo hãng mới (admin)
    """
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    permission_classes = (IsAdminOrReadOnly,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    search_fields = ('name',)
    ordering_fields = ('name', 'created_at')


class BrandDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/products/brands/<id>/  — Chi tiết hãng
    PUT    /api/v1/products/brands/<id>/  — Cập nhật (admin)
    DELETE /api/v1/products/brands/<id>/  — Xóa (admin)
    """
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = (IsAdminOrReadOnly,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    lookup_field = 'pk'


# ─── Category ────────────────────────────────────────────────────────────────

class CategoryListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/products/categories/  — Danh sách danh mục (public)
    POST /api/v1/products/categories/  — Tạo danh mục (admin)
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = (IsAdminOrReadOnly,)
    search_fields = ('name',)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/products/categories/<id>/
    PUT    /api/v1/products/categories/<id>/
    DELETE /api/v1/products/categories/<id>/
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (IsAdminOrReadOnly,)


# ─── Product ─────────────────────────────────────────────────────────────────

class ProductListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/products/          — Danh sách + tìm kiếm + lọc + phân trang (public)
    POST /api/v1/products/          — Tạo sản phẩm mới (admin)

    Query params:
      ?search=iphone        — tìm kiếm theo tên
      ?brand=1              — lọc theo brand id
      ?brand_slug=apple     — lọc theo brand slug
      ?category=2           — lọc theo category id
      ?price_min=5000000    — giá từ
      ?price_max=20000000   — giá đến
      ?in_stock=true        — còn hàng
      ?ordering=price       — sắp xếp (price, -price, -created_at)
      ?page=1&page_size=12  — phân trang
    """
    permission_classes = (IsAdminOrReadOnly,)
    filterset_class = ProductFilter
    search_fields = ('name', 'brand__name', 'description')
    ordering_fields = ('price', 'created_at', 'name')
    ordering = ('-created_at',)

    def get_queryset(self):
        queryset = Product.objects.select_related('brand', 'category').prefetch_related('images')
        # User thường chỉ thấy sản phẩm active
        if not (self.request.user.is_authenticated and self.request.user.is_admin):
            queryset = queryset.filter(is_active=True)
        return queryset

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductDetailSerializer
        return ProductListSerializer


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/products/<id>/   — Chi tiết sản phẩm (public)
    PUT    /api/v1/products/<id>/   — Cập nhật (admin)
    DELETE /api/v1/products/<id>/   — Xóa (admin)
    """
    queryset = Product.objects.select_related('brand', 'category').prefetch_related('images')
    serializer_class = ProductDetailSerializer
    permission_classes = (IsAdminOrReadOnly,)


# ─── Product Image ────────────────────────────────────────────────────────────

class ProductImageUploadView(generics.CreateAPIView):
    """
    POST /api/v1/products/<product_id>/images/
    Upload ảnh cho sản phẩm (admin).
    """
    serializer_class = ProductImageUploadSerializer
    permission_classes = (IsAdmin,)
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        product_id = self.kwargs['product_id']
        product = generics.get_object_or_404(Product, pk=product_id)
        serializer.save(product=product)


class ProductImageDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/v1/products/images/<id>/
    Xóa ảnh sản phẩm (admin).
    """
    queryset = ProductImage.objects.all()
    permission_classes = (IsAdmin,)
