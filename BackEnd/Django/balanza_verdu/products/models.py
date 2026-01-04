from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name

class Product(models.Model):
    UNIT_CHOICES = [
        ('KG', 'Kilogramo'),
        ('UN', 'Unidad'),
    ]

    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    discount = models.BooleanField(default=True)
    show_screen = models.BooleanField(default=True)

    start_date = models.DateTimeField(auto_now_add=True)
    upgrade_date = models.DateTimeField(auto_now=True)

    unit = models.CharField(max_length=2, choices=UNIT_CHOICES, default='KG')
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    
    # Bulk information
    bulk_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Precio de compra por bulto cerrado")
    bulk_quantity = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True, help_text="Cantidad de KG/UN que trae el bulto")

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(fields=["name", "category"], name="unique_product_category")
        ]

    @property
    def selling_price(self):
        """
        Calculates the selling price based on cost price (self.price) and profit percentage.
        """
        if self.price and self.percentage:
             # Calculate margin: price + (price * percentage / 100)
             margin = (self.price * self.percentage) / 100
             return self.price + margin
        return self.price

    def __str__(self):
        return f"{self.name} - ${self.price}"
