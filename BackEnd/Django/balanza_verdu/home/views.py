from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint to manage employees/users.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'public_sellers':
            return [permissions.AllowAny()]
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def public_sellers(self, request):
        """
        Public endpoint to list active sellers (non-staff users) for the login page.
        """
        # Filter: isActive=True and isStaff=False (Vendedores)
        sellers = User.objects.filter(is_active=True, is_staff=False).order_by('username')
        
        # Return minimal data
        data = []
        for user in sellers:
            display_name = f"{user.first_name} {user.last_name}".strip()
            if not display_name:
                display_name = user.username
            
            data.append({
                'id': user.id,
                'username': user.username,
                'name': display_name
            })
        
        return Response(data)

class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)
