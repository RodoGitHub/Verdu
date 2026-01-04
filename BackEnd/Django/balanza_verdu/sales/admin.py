from django.contrib import admin
from .models import Sale, SaleItem

class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price')

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'date', 'total', 'status', 'type', 'payment_method')
    list_filter = ('date', 'status', 'type', 'payment_method')
    search_fields = ('customer__name',)
    inlines = [SaleItemInline]
