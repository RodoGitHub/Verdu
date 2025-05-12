from django.db import models

class Unit_measurement(models.Model):
    name = models.CharField(max_length=20)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    discount = models.BooleanField(default=True)
    show_screen = models.BooleanField(default=True)

    start_date = models.DateTimeField(auto_now_add=True)
    upgrade_date = models.DateTimeField(auto_now=True)

    unit_measurement = models.ForeignKey(Unit_measurement, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ["name"] #es un .order_by()
        constraints = [
            models.UniqueConstraint(fields=["name", "category"], name="unique_product_category")#Esto asegura que no tengas dos productos con el mismo nombre en la misma categoría.
        ]


    def __str__(self):
        return f"{self.name} - ${self.price}"
