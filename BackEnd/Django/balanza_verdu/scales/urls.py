from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'terminals', views.ScaleTerminalViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('peso/', views.get_weight, name='get_weight'),
]
