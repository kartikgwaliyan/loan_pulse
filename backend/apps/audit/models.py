from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=100, db_index=True)
    target_type = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    target_id = models.CharField(max_length=100, blank=True, null=True)
    ip_address = models.CharField(max_length=50, blank=True, null=True)
    details = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'lp_audit_logs'
        ordering = ['-timestamp']

    def __str__(self):
        user_str = self.user.username if self.user else "SYSTEM"
        return f"[{self.timestamp:%Y-%m-%d %H:%M}] {user_str} - {self.action} ({self.target_type}:{self.target_id})"

    @classmethod
    def log_action(cls, user=None, action="", target_type="", target_id="", ip_address="127.0.0.1", details=None):
        try:
            return cls.objects.create(
                user=user if user and user.is_authenticated else None,
                action=action,
                target_type=target_type,
                target_id=str(target_id) if target_id else "",
                ip_address=ip_address,
                details=details or {}
            )
        except Exception as e:
            # Audit log failure should never crash the main transaction
            print(f"Failed to record audit log: {e}")
            return None
