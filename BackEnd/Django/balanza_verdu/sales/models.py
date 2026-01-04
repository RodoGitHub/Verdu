from django.db import models
from django.contrib.auth.models import User
from products.models import Product
from customers.models import Customer
from payments.models import PaymentMethod

class Sale(models.Model):
    STATUS_CHOICES = [
        ('COMPLETED', 'Finalizado'),
        ('CANCELED', 'Cancelado'),
        ('PENDING', 'Pendiente de Pago'),
    ]
    
    TYPE_CHOICES = [
        ('PRESENTIAL', 'Presencial'),
        ('DELIVERY', 'Delivery'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # New Fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='PRESENTIAL')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Sale {self.id} - {self.customer.name} ({self.status})"

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=3, default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"
