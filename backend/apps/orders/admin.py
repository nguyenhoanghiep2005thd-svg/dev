from django.contrib import admin
from django.utils.html import format_html
from .models import CartItem, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model          = OrderItem
    extra          = 0
    readonly_fields = ('product', 'product_name', 'product_image_preview',
                       'price', 'quantity', 'subtotal_display')
    fields          = ('product', 'product_name', 'product_image_preview',
                       'price', 'quantity', 'subtotal_display')
    can_delete      = False

    def product_image_preview(self, obj):
        if obj.product_image:
            return format_html(
                '<img src="{}" style="height:40px;border-radius:6px;" />',
                obj.product_image,
            )
        return '—'
    product_image_preview.short_description = 'Ảnh'

    def subtotal_display(self, obj):
        return f'{obj.subtotal:,.0f} ₫'
    subtotal_display.short_description = 'Thành tiền'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display    = (
        'id', 'shipping_full_name', 'shipping_phone',
        'status_badge', 'payment_method', 'total_price_display',
        'item_count', 'created_at',
    )
    list_filter     = ('status', 'payment_method', 'created_at')
    search_fields   = ('shipping_full_name', 'shipping_phone', 'shipping_email', 'user__email')
    readonly_fields = ('total_price', 'created_at', 'updated_at', 'user')
    ordering        = ('-created_at',)
    inlines         = [OrderItemInline]

    fieldsets = (
        ('Thông tin đơn hàng', {
            'fields': ('user', 'status', 'payment_method', 'total_price', 'note'),
        }),
        ('Thông tin giao hàng', {
            'fields': ('shipping_full_name', 'shipping_phone', 'shipping_email', 'shipping_address'),
        }),
        ('Thời gian', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def status_badge(self, obj):
        colors = {
            'pending':   '#f59e0b',
            'confirmed': '#3b82f6',
            'shipping':  '#6366f1',
            'delivered': '#10b981',
            'cancelled': '#ef4444',
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600">{}</span>',
            color,
            obj.get_status_display(),
        )
    status_badge.short_description = 'Trạng thái'

    def total_price_display(self, obj):
        return f'{obj.total_price:,.0f} ₫'
    total_price_display.short_description = 'Tổng tiền'

    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = 'Số SP'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display    = ('user_email', 'product_name', 'quantity', 'subtotal_display', 'updated_at')
    search_fields   = ('user__email', 'product__name')
    list_filter     = ('updated_at',)
    readonly_fields = ('user', 'product', 'subtotal_display')

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'

    def product_name(self, obj):
        return obj.product.name
    product_name.short_description = 'Sản phẩm'

    def subtotal_display(self, obj):
        return f'{obj.subtotal:,.0f} ₫'
    subtotal_display.short_description = 'Thành tiền'
