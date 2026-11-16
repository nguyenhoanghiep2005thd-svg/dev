from rest_framework import generics, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Brand, Category, Product, ProductImage, Review
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductImageUploadSerializer,
    ReviewSerializer,
)
from .filters import ProductFilter
from apps.accounts.permissions import IsAdminOrReadOnly, IsAdmin


class BrandListCreateView(generics.ListCreateAPIView):
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    permission_classes = (IsAdminOrReadOnly,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    search_fields = ('name',)
    ordering_fields = ('name', 'created_at')


class BrandDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = (IsAdminOrReadOnly,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    lookup_field = 'pk'


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = (IsAdminOrReadOnly,)
    search_fields = ('name',)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (IsAdminOrReadOnly,)


class ProductListCreateView(generics.ListCreateAPIView):
    permission_classes = (IsAdminOrReadOnly,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    filterset_class = ProductFilter
    search_fields = ('name', 'description', 'brand__name')
    ordering_fields = ('price', 'created_at', 'name')
    ordering = ('-created_at',)

    def get_queryset(self):
        queryset = Product.objects.select_related('brand', 'category').prefetch_related('images', 'reviews')
        if not (self.request.user.is_authenticated and self.request.user.is_admin):
            queryset = queryset.filter(is_active=True)
        return queryset

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductDetailSerializer
        return ProductListSerializer


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAdminOrReadOnly,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    lookup_field = 'pk'
    serializer_class = ProductDetailSerializer

    def get_queryset(self):
        queryset = Product.objects.select_related('brand', 'category').prefetch_related('images', 'reviews', 'reviews__user')
        if not (self.request.user.is_authenticated and self.request.user.is_admin):
            queryset = queryset.filter(is_active=True)
        return queryset


class ProductImageUploadView(generics.CreateAPIView):
    serializer_class = ProductImageUploadSerializer
    permission_classes = (IsAdmin,)
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        product = get_object_or_404(Product, pk=self.kwargs['product_id'])
        serializer.save(product=product)


class ProductImageDeleteView(generics.DestroyAPIView):
    queryset = ProductImage.objects.all()
    permission_classes = (IsAdmin,)


class ProductReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        product_id = self.kwargs.get('pk')
        return Review.objects.filter(product_id=product_id).select_related('user').order_by('-created_at')

    def perform_create(self, serializer):
        product = get_object_or_404(Product, pk=self.kwargs.get('pk'))
        serializer.save(user=self.request.user, product=product)
