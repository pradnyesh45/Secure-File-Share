from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShareViewSet

router = DefaultRouter()
router.register(r'shares', ShareViewSet, basename='share')

urlpatterns = [
    path('', include(router.urls)),
] 