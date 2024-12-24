from rest_framework import permissions

class FilePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Allow if user is owner
        if obj.owner == request.user:
            return True
            
        # Check if user has shared access
        if hasattr(view, 'action') and view.action == 'download':
            return obj.fileshare_set.filter(
                shared_with=request.user,
                expires_at__gt=timezone.now()
            ).exists()
            
        return False

class IsOwnerOrShared(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Check if user is the owner
        if obj.owner == request.user:
            return True
            
        # Check if file is shared with the user
        if request.method in permissions.SAFE_METHODS:
            return obj.fileshare_set.filter(
                shared_with=request.user,
                expires_at__gt=timezone.now()
            ).exists()
            
        return False 