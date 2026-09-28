from rest_framework import serializers
from .models import Brand, Category, Product, ProductImage


class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Brand
        fields = ('id', 'name', 'slug', 'logo', 'description', 'is_active', 'product_count')
        read_only_fields = ('slug',)

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'is_active', 'product_count')
        read_only_fields = ('slug',)

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'alt_text', 'is_primary', 'order')


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer gọn cho danh sách sản phẩm."""
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    primary_image = serializers.SerializerMethodField()
    current_price = serializers.ReadOnlyField()
    discount_percent = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'brand_name', 'category_name',
            'price', 'sale_price', 'current_price', 'discount_percent',
            'in_stock', 'primary_image',
        )

    def get_primary_image(self, obj):
        image = obj.images.filter(is_primary=True).first()
        if not image:
            image = obj.images.first()
        if image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image.image.url)
            return image.image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer đầy đủ cho trang chi tiết sản phẩm."""
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), source='brand', write_only=True, required=False
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False
    )
    images = ProductImageSerializer(many=True, read_only=True)
    current_price = serializers.ReadOnlyField()
    discount_percent = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'brand', 'brand_id', 'category', 'category_id',
            'description', 'price', 'sale_price', 'current_price', 'discount_percent',
            'stock', 'in_stock', 'specs', 'is_active', 'images', 'created_at', 'updated_at',
        )
        read_only_fields = ('slug', 'created_at', 'updated_at')


class ProductImageUploadSerializer(serializers.ModelSerializer):
    """Upload ảnh cho sản phẩm."""
    class Meta:
        model = ProductImage
        fields = ('id', 'product', 'image', 'alt_text', 'is_primary', 'order')
