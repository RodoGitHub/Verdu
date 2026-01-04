from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from .models import Sale, SaleItem
from .serializers import SaleSerializer
from products.models import Product
from customers.models import Customer

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all().order_by('-date')
    serializer_class = SaleSerializer

    def get_queryset(self):
        queryset = Sale.objects.all().order_by('-date')
        
        # Date Filter (Required effectively for performance, but we handle it optionally)
        date_str = self.request.query_params.get('date')
        if date_str:
            # Assumes format YYYY-MM-DD
            queryset = queryset.filter(date__date=date_str)
            
        # User Filter
        # "each user can see their own sales but not others"
        # We enforce this for non-staff. Staff can see all (for audit), unless they want to see only theirs?
        # The prompt says "cada usuario podra ver sus propias ventas pero no las ajenas".
        # This usually implies strict separation. However, an Admin "dashboard" usually needs to see everything.
        # Let's interpret: Normal users -> Own sales. Admin -> All sales (but UI might filter by logged user if requested).
        # Actually, if I strictly hide others' sales from admin, the "Dashboard" stats might be wrong compared to total.
        # But for the "Ventas" list specifically, maybe they just want "My Sales".
        # I'll implement: 
        # - Non-staff: Filter by self.request.user
        # - Staff: Return all (so they can audit), but Frontend will show "My Sales" by default or allow filtering?
        # WAIT. The prompt says "cada usuario podra ver sus propias ventas pero no las ajenas" AND "admin tiene acceso full".
        # So Admin sees ALL. Normal user sees OWN.
        
        if not self.request.user.is_staff:
            if self.request.user.is_authenticated:
                queryset = queryset.filter(user=self.request.user)
            else:
                return Sale.objects.none()

        # Customer Name Filter
        customer_name = self.request.query_params.get('customer')
        if customer_name:
            queryset = queryset.filter(customer__name__icontains=customer_name)

        # Status Filter
        status_param = self.request.query_params.get('status')
        if status_param and status_param != 'ALL':
            queryset = queryset.filter(status=status_param)

        return queryset

    def create(self, request, *args, **kwargs):
        data = request.data
        
        # 1. Get or Create Customer
        customer_id = data.get('customer')
        if customer_id:
            try:
                customer = Customer.objects.get(id=customer_id)
            except Customer.DoesNotExist:
                return Response({"error": "Customer not found"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            customer, _ = Customer.objects.get_or_create(name="Consumidor Final")

        # 2. Extract Data
        items_data = data.get('items', [])
        sale_status = data.get('status', 'PENDING') # Default to Pending
        sale_type = data.get('type', 'PRESENTIAL')
        payment_method_id = data.get('payment_method')
        
        # If canceled, total should be 0
        total = data.get('total', 0)
        if sale_status == 'CANCELED':
            total = 0

        # 3. Create Sale
        try:
            with transaction.atomic():
                sale_kwargs = {
                    'customer': customer,
                    'user': request.user if request.user.is_authenticated else None,
                    'total': total,
                    'status': sale_status,
                    'type': sale_type
                }
                
                if payment_method_id:
                     sale_kwargs['payment_method_id'] = payment_method_id

                sale = Sale.objects.create(**sale_kwargs)

                for item in items_data:
                    # item structure from frontend
                    product_id = item.get('id')
                    if not product_id: continue
                    
                    try:
                        product = Product.objects.get(id=product_id)
                        SaleItem.objects.create(
                            sale=sale,
                            product=product,
                            quantity=item.get('qty', 1),
                            price=item.get('finalPrice', 0)
                        )
                    except Product.DoesNotExist:
                        continue
                
                serializer = self.get_serializer(sale)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
