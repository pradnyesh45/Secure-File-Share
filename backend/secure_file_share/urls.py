from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('secure_file_share.apps.authentication.urls')),
    path('api/files/', include('secure_file_share.apps.files.urls')),
    path('api/sharing/', include('secure_file_share.apps.sharing.urls')),
]
