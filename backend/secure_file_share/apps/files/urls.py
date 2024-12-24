from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FileViewSet, SharedFileViewSet

router = DefaultRouter()
router.register(r'files', FileViewSet, basename='file')
router.register(r'shared', SharedFileViewSet, basename='shared-file')

urlpatterns = [
    path('', include(router.urls)),
] 