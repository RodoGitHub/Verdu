from rest_framework import serializers
from .models import ScaleTerminal

class ScaleTerminalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScaleTerminal
        fields = ['id', 'name', 'device_id', 'is_active', 'created_at']
        read_only_fields = ['created_at']
