from django.contrib import admin
from .models import Brand, Category, Product, ProductImage


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'category', 'price', 'sale_price', 'stock', 'is_active')
    list_filter = ('brand', 'category', 'is_active')
    search_fields = ('name', 'brand__name')
    inlines = (ProductImageInline,)
    readonly_fields = ('slug', 'created_at', 'updated_at')
