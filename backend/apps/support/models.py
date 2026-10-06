from django.db import models
from django.conf import settings
from apps.loans.models import Loan
import uuid

class TicketCategory(models.TextChoices):
    EMI = 'EMI', 'EMI & Repayments'
    DISBURSEMENT = 'DISBURSEMENT', 'Disbursement & Bank Transfer'
    KYC = 'KYC', 'KYC & Document Verification'
    ACCOUNT = 'ACCOUNT', 'Account & Profile'
    GENERAL = 'GENERAL', 'General Inquiry'

class TicketPriority(models.TextChoices):
    LOW = 'LOW', 'Low'
    MEDIUM = 'MEDIUM', 'Medium'
    HIGH = 'HIGH', 'High'
    URGENT = 'URGENT', 'Urgent'

class TicketStatus(models.TextChoices):
    OPEN = 'OPEN', 'Open'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    RESOLVED = 'RESOLVED', 'Resolved'
    CLOSED = 'CLOSED', 'Closed'

class SupportTicket(models.Model):
    ticket_id = models.CharField(max_length=30, unique=True, db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='support_tickets')
    loan = models.ForeignKey(Loan, on_delete=models.SET_NULL, null=True, blank=True, related_name='support_tickets')
    subject = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=30, choices=TicketCategory.choices, default=TicketCategory.GENERAL)
    priority = models.CharField(max_length=20, choices=TicketPriority.choices, default=TicketPriority.MEDIUM)
    status = models.CharField(max_length=20, choices=TicketStatus.choices, default=TicketStatus.OPEN, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lp_support_tickets'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.ticket_id} - {self.subject} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.ticket_id:
            rand_suffix = str(uuid.uuid4().int)[:6]
            self.ticket_id = f"TKT-2026-{rand_suffix}"
        super().save(*args, **kwargs)

class TicketMessage(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lp_ticket_messages'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.ticket.ticket_id} msg by {self.sender.username}"
