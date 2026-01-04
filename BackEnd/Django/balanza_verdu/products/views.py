from rest_framework import viewsets, permissions
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows products to be viewed or edited.
    Only Admins can create/update/destroy. Authenticated users can read.
    """
    queryset = Product.objects.all().order_by('name')
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all().order_by('name')
        
        # Filter by modification date (YYYY-MM-DD)
        date_str = self.request.query_params.get('modified_date')
        if date_str:
            queryset = queryset.filter(upgrade_date__date=date_str)
            
        return queryset
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            # Allow any user (authenticated or not, though usually behind login) to view products
            # This avoids issues if the session is slightly out of sync or if we want public catalog
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]
