from django.db import models

class ScaleTerminal(models.Model):
    name = models.CharField(max_length=100, help_text="Nombre descriptivo (ej: Caja 1 - Carnicería)")
    device_id = models.CharField(max_length=50, unique=True, help_text="ID único que usará la URL (ej: caja_1)")
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.device_id})"
