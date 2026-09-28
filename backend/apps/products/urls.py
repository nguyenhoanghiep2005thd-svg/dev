from django.urls import path
from .views import (
    BrandListCreateView,
    BrandDetailView,
    CategoryListCreateView,
    CategoryDetailView,
    ProductListCreateView,
    ProductDetailView,
    ProductImageUploadView,
    ProductImageDeleteView,
)

urlpatterns = [
    # Brands
    path('brands/', BrandListCreateView.as_view(), name='brand-list-create'),
    path('brands/<int:pk>/', BrandDetailView.as_view(), name='brand-detail'),

    # Categories
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),

    # Products
    path('', ProductListCreateView.as_view(), name='product-list-create'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product-detail'),

    # Product Images
    path('<int:product_id>/images/', ProductImageUploadView.as_view(), name='product-image-upload'),
    path('images/<int:pk>/', ProductImageDeleteView.as_view(), name='product-image-delete'),
]
