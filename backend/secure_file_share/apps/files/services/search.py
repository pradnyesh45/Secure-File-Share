from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta

class FileSearchService:
    def search_files(self, queryset, search_params):
        """
        Search and filter files based on various parameters.
        """
        # Text search
        if search_text := search_params.get('search'):
            queryset = queryset.filter(
                Q(name__icontains=search_text) |
                Q(tags__name__icontains=search_text)
            ).distinct()

        # File type filter
        if file_types := search_params.getlist('type'):
            type_query = Q()
            for file_type in file_types:
                if file_type == 'document':
                    type_query |= Q(content_type__in=[
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'text/plain'
                    ])
                elif file_type == 'image':
                    type_query |= Q(content_type__startswith='image/')
                elif file_type == 'video':
                    type_query |= Q(content_type__startswith='video/')
                elif file_type == 'audio':
                    type_query |= Q(content_type__startswith='audio/')
            queryset = queryset.filter(type_query)

        # Date range filter
        if date_range := search_params.get('date_range'):
            today = timezone.now()
            if date_range == 'today':
                queryset = queryset.filter(uploaded_at__date=today.date())
            elif date_range == 'week':
                week_ago = today - timedelta(days=7)
                queryset = queryset.filter(uploaded_at__gte=week_ago)
            elif date_range == 'month':
                month_ago = today - timedelta(days=30)
                queryset = queryset.filter(uploaded_at__gte=month_ago)
            elif date_range == 'custom':
                start_date = search_params.get('start_date')
                end_date = search_params.get('end_date')
                if start_date:
                    queryset = queryset.filter(uploaded_at__gte=start_date)
                if end_date:
                    queryset = queryset.filter(uploaded_at__lte=end_date)

        # Size filter
        if size_range := search_params.get('size'):
            if size_range == 'small':  # < 1MB
                queryset = queryset.filter(size__lt=1024*1024)
            elif size_range == 'medium':  # 1MB - 10MB
                queryset = queryset.filter(size__gte=1024*1024, size__lt=10*1024*1024)
            elif size_range == 'large':  # > 10MB
                queryset = queryset.filter(size__gte=10*1024*1024)

        # Sorting
        sort_by = search_params.get('sort', '-uploaded_at')
        queryset = queryset.order_by(sort_by)

        return queryset 