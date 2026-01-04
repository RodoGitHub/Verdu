from django.http import JsonResponse
from django.views.decorators.http import require_GET
from .services.scale_service import ScaleService

# Instantiate service once if stateless or low overhead
scale_service = ScaleService()

@require_GET
def get_weight(request):
    """
    View to get the current weight from the scale.
    """
    result = scale_service.get_weight()
    
    # Logic from user's example: return specific format
    # User's example returned: {"peso": peso_prueba if peso_prueba is not None else "En espera..."}
    # We will try to respect that contract but with real data
    
    weight = result.get("weight")
    
    response_data = {
        "peso": weight if weight is not None else "En espera...", # Maintain API compatibility
        "debug_info": result # Include full result for debugging
    }
    
    return JsonResponse(response_data)

from rest_framework import viewsets, permissions
from .models import ScaleTerminal
from .serializers import ScaleTerminalSerializer

class ScaleTerminalViewSet(viewsets.ModelViewSet):
    queryset = ScaleTerminal.objects.all().order_by('name')
    serializer_class = ScaleTerminalSerializer
    permission_classes = [permissions.IsAdminUser] # Solo admins pueden gestionar cajas
