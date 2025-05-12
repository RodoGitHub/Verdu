from products.models import Product, Unit_measurement, Category

class ProductRepository:
    @staticmethod
    def create(
        name: str,
        price: float,
        percentage: float,
        discount: bool,
        show_screen: bool,
        unit_measurement_name: str,
        category_name: str,
    ) -> Product:
        # Buscar las instancias de las relaciones
        unit_measurement = Unit_measurement.objects.get(name=unit_measurement_name)
        category = Category.objects.get(name=category_name)

        return Product.objects.create(
            name=name,
            price=price,
            percentage=percentage,
            discount=discount,
            show_screen=show_screen,
            unit_measurement=unit_measurement,
            category=category,
        )
