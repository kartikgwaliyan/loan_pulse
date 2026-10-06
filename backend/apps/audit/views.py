from rest_framework import serializers, generics
from .models import AuditLog
from apps.authentication.permissions import IsAdminUserRole

class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'username', 'user_role', 'action', 'target_type', 'target_id', 'ip_address', 'details', 'timestamp']

class AuditLogListView(generics.ListAPIView):
    permission_classes = [IsAdminUserRole]
    serializer_class = AuditLogSerializer
    queryset = AuditLog.objects.all().select_related('user')
