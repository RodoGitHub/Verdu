from django.contrib import admin
from .models import ScaleTerminal

@admin.register(ScaleTerminal)
class ScaleTerminalAdmin(admin.ModelAdmin):
    list_display = ('name', 'device_id', 'is_active', 'created_at')
    search_fields = ('name', 'device_id')
