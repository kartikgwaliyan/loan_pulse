from django.db import models
from django.conf import settings
from apps.loans.models import Loan
import uuid

class EMIStatus(models.TextChoices):
    UPCOMING = 'UPCOMING', 'Upcoming'
    DUE = 'DUE', 'Due'
    PAID = 'PAID', 'Paid'
    OVERDUE = 'OVERDUE', 'Overdue'

class PaymentStatus(models.TextChoices):
    SUCCESS = 'SUCCESS', 'Success'
    PENDING = 'PENDING', 'Pending'
    FAILED = 'FAILED', 'Failed'
    REFUNDED = 'REFUNDED', 'Refunded'

class PaymentMethod(models.TextChoices):
    UPI = 'UPI', 'UPI / QR'
    NET_BANKING = 'NET_BANKING', 'Net Banking'
    DEBIT_CARD = 'DEBIT_CARD', 'Debit Card'
    NEFT_RTGS = 'NEFT_RTGS', 'NEFT / RTGS Transfer'

class EMISchedule(models.Model):
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='emi_schedules')
    installment_number = models.IntegerField()
    due_date = models.DateField(db_index=True)
    principal_amount = models.DecimalField(max_digits=12, decimal_places=2)
    interest_amount = models.DecimalField(max_digits=12, decimal_places=2)
    emi_amount = models.DecimalField(max_digits=12, decimal_places=2)
    remaining_balance = models.DecimalField(max_digits=12, decimal_places=2)
    late_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    status = models.CharField(
        max_length=20,
        choices=EMIStatus.choices,
        default=EMIStatus.UPCOMING,
        db_index=True
    )
    paid_date = models.DateField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'lp_emi_schedules'
        ordering = ['loan', 'installment_number']
        unique_together = ('loan', 'installment_number')

    def __str__(self):
        return f"{self.loan.loan_id} - EMI #{self.installment_number} due {self.due_date} (₹{self.emi_amount:,.2f}) [{self.status}]"

class PaymentTransaction(models.Model):
    transaction_id = models.CharField(max_length=50, unique=True, db_index=True)
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='payments')
    emi = models.ForeignKey(EMISchedule, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=30, choices=PaymentMethod.choices, default=PaymentMethod.UPI)
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.SUCCESS)
    gateway_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    receipt_number = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'lp_payment_transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_id} - ₹{self.amount:,.2f} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            rand_suffix = str(uuid.uuid4().int)[:8]
            self.transaction_id = f"LP-TXN-{rand_suffix}"
        if not self.receipt_number:
            rand_rcpt = str(uuid.uuid4().int)[:7]
            self.receipt_number = f"RCPT-2026-{rand_rcpt}"
        super().save(*args, **kwargs)


class AutoDebitMandate(models.Model):
    umrn = models.CharField(max_length=60, unique=True, db_index=True, help_text="Unique Mandate Reference Number")
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='mandates')
    customer = models.ForeignKey('customers.CustomerProfile', on_delete=models.CASCADE, related_name='mandates')
    bank_name = models.CharField(max_length=100)
    account_number_masked = models.CharField(max_length=40)
    ifsc_code = models.CharField(max_length=20)
    max_amount = models.DecimalField(max_digits=12, decimal_places=2)
    frequency = models.CharField(max_length=30, default='MONTHLY')
    mandate_type = models.CharField(max_length=30, default='E_NACH') # E_NACH, UPI_AUTOPAY
    status = models.CharField(max_length=30, default='ACTIVE') # ACTIVE, PENDING, REVOKED
    auth_mode = models.CharField(max_length=40, default='NET_BANKING') # NET_BANKING, DEBIT_CARD, AADHAAR
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lp_autodebit_mandates'
        ordering = ['-created_at']

    def __str__(self):
        return f"e-NACH Mandate {self.umrn} - {self.loan.loan_id} ({self.status})"

