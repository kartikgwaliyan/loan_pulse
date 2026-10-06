from django.db import models
from django.conf import settings
from apps.loans.models import Loan

class DPDBracket(models.TextChoices):
    THIRTY_PLUS = '30_PLUS', '1 - 30 Days (SMA-0)'
    SIXTY_PLUS = '60_PLUS', '31 - 60 Days (SMA-1)'
    NINETY_PLUS = '90_PLUS', '61 - 90 Days (SMA-2)'
    NPA_CRITICAL = 'NPA_CRITICAL', '90+ Days (Sub-Standard / NPA)'

class OverdueStatus(models.TextChoices):
    NEW = 'NEW', 'New Delinquency'
    CONTACTED = 'CONTACTED', 'Customer Contacted'
    PROMISE_TO_PAY = 'PROMISE_TO_PAY', 'Promise to Pay (PTP)'
    RESTRUCTURED = 'RESTRUCTURED', 'Restructured'
    LEGAL_NOTICE = 'LEGAL_NOTICE', 'Legal Notice Issued'
    RECOVERED = 'RECOVERED', 'Recovered & Current'

class ContactType(models.TextChoices):
    CALL = 'CALL', 'Phone Call'
    SMS = 'SMS', 'SMS Alert'
    EMAIL = 'EMAIL', 'Formal Demand Email'
    FIELD_VISIT = 'FIELD_VISIT', 'Field Investigation / Recovery Visit'
    LEGAL_NOTICE = 'LEGAL_NOTICE', 'Legal Notice'

class OverdueAccount(models.Model):
    loan = models.OneToOneField(Loan, on_delete=models.CASCADE, related_name='overdue_record')
    overdue_amount = models.DecimalField(max_digits=12, decimal_places=2)
    overdue_emis_count = models.IntegerField(default=1)
    days_past_due = models.IntegerField(default=1, db_index=True)
    dpd_bracket = models.CharField(max_length=20, choices=DPDBracket.choices, default=DPDBracket.THIRTY_PLUS, db_index=True)
    assigned_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_collections'
    )
    status = models.CharField(max_length=30, choices=OverdueStatus.choices, default=OverdueStatus.NEW)
    last_contact_date = models.DateField(null=True, blank=True)
    next_followup_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lp_overdue_accounts'
        ordering = ['-days_past_due']

    def __str__(self):
        return f"{self.loan.loan_id} - DPD {self.days_past_due} (₹{self.overdue_amount:,.2f}) [{self.status}]"

class CollectionActivity(models.Model):
    overdue_account = models.ForeignKey(OverdueAccount, on_delete=models.CASCADE, related_name='activities')
    officer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    contact_type = models.CharField(max_length=20, choices=ContactType.choices, default=ContactType.CALL)
    customer_response = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField()
    followup_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lp_collection_activities'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.overdue_account.loan.loan_id} - {self.contact_type} by {self.officer.username}"
