from rest_framework import serializers
from .models import Brand, Category, Product, ProductImage, Review


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
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'alt_text', 'is_primary', 'order')

    def get_image(self, obj):
        request = self.context.get('request')
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            'id', 'product', 'user', 'user_name', 'user_avatar',
            'rating', 'comment', 'color', 'storage', 'likes', 'created_at',
        )
        read_only_fields = ('id', 'product', 'user', 'user_name', 'user_avatar', 'likes', 'created_at')

    def get_user_name(self, obj):
        return getattr(obj.user, 'full_name', '') or obj.user.email.split('@')[0]

    def get_user_avatar(self, obj):
        name = getattr(obj.user, 'full_name', '') or obj.user.email
        return name[0].upper() if name else 'U'


class ProductListSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    primary_image = serializers.SerializerMethodField()
    current_price = serializers.ReadOnlyField()
    discount_percent = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()
    avg_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'brand_name', 'category_name',
            'price', 'sale_price', 'current_price', 'discount_percent',
            'in_stock', 'primary_image', 'avg_rating', 'review_count', 'specs',
        )

    def get_primary_image(self, obj):
        image = obj.images.filter(is_primary=True).first() or obj.images.first()
        if image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image.image.url)
            return image.image.url
        return obj.image_url or None


class ProductDetailSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), source='brand', write_only=True, required=False
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False
    )
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    current_price = serializers.ReadOnlyField()
    discount_percent = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()
    avg_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'brand', 'brand_id', 'category', 'category_id',
            'description', 'price', 'sale_price', 'current_price', 'discount_percent',
            'stock', 'in_stock', 'specs', 'is_active', 'image_url', 'primary_image',
            'images', 'reviews', 'avg_rating', 'review_count', 'created_at', 'updated_at',
        )
        read_only_fields = ('slug', 'created_at', 'updated_at')

    def get_primary_image(self, obj):
        image = obj.images.filter(is_primary=True).first() or obj.images.first()
        if image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image.image.url)
            return image.image.url
        return obj.image_url or None


class ProductImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'product', 'image', 'alt_text', 'is_primary', 'order')
        read_only_fields = ('id', 'product')
