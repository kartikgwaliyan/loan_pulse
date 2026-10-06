from django.db import models
from django.conf import settings

class NotificationType(models.TextChoices):
    LOAN_UPDATE = 'LOAN_UPDATE', 'Loan Status Update'
    KYC = 'KYC', 'KYC & Verification'
    EMI_REMINDER = 'EMI_REMINDER', 'EMI Payment Reminder'
    PAYMENT = 'PAYMENT', 'Payment Confirmation'
    SECURITY = 'SECURITY', 'Security Alert'
    SYSTEM = 'SYSTEM', 'System Announcement'

class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM
    )
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'lp_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title} ({'Read' if self.is_read else 'Unread'})"
