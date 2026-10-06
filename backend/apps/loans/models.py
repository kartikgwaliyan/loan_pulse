from django.db import models
from django.conf import settings
from apps.customers.models import CustomerProfile
import uuid

class ApplicationStatus(models.TextChoices):
    SUBMITTED = 'SUBMITTED', 'Application Submitted'
    DOC_VERIFICATION = 'DOC_VERIFICATION', 'Document Verification'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    RISK_ASSESSMENT = 'RISK_ASSESSMENT', 'Risk Assessment'
    MANAGER_APPROVAL = 'MANAGER_APPROVAL', 'Manager Approval'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'
    DISBURSED = 'DISBURSED', 'Disbursed'
    CANCELLED = 'CANCELLED', 'Cancelled'

class EligibilityStatus(models.TextChoices):
    ELIGIBLE = 'ELIGIBLE', 'Eligible'
    CONDITIONALLY_ELIGIBLE = 'CONDITIONALLY_ELIGIBLE', 'Conditionally Eligible'
    NOT_ELIGIBLE = 'NOT_ELIGIBLE', 'Not Eligible'

class LoanStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    CLOSED = 'CLOSED', 'Closed'
    DEFAULTED = 'DEFAULTED', 'Defaulted'
    SETTLED = 'SETTLED', 'Settled'

class DisbursementStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    PROCESSING = 'PROCESSING', 'Processing'
    SUCCESS = 'SUCCESS', 'Success'
    FAILED = 'FAILED', 'Failed'
    REVERSED = 'REVERSED', 'Reversed'

class LoanProduct(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    min_amount = models.DecimalField(max_digits=12, decimal_places=2, default=10000.00)
    max_amount = models.DecimalField(max_digits=12, decimal_places=2, default=5000000.00)
    interest_rate_min = models.DecimalField(max_digits=5, decimal_places=2, default=10.50)
    interest_rate_max = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    min_tenure_months = models.IntegerField(default=12)
    max_tenure_months = models.IntegerField(default=60)
    processing_fee_percent = models.DecimalField(max_digits=4, decimal_places=2, default=1.50)
    late_fee_percent = models.DecimalField(max_digits=4, decimal_places=2, default=2.00)
    
    # Eligibility thresholds
    eligibility_min_income = models.DecimalField(max_digits=10, decimal_places=2, default=25000.00)
    eligibility_min_credit_score = models.IntegerField(default=650)
    max_dti_ratio = models.DecimalField(max_digits=5, decimal_places=2, default=50.00)
    required_docs = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lp_loan_products'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"

class ApprovalMatrixConfig(models.Model):
    name = models.CharField(max_length=100)
    min_amount = models.DecimalField(max_digits=12, decimal_places=2)
    max_amount = models.DecimalField(max_digits=12, decimal_places=2)
    required_role = models.CharField(max_length=30, default='LOAN_OFFICER')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'lp_approval_matrix'
        ordering = ['min_amount']

    def __str__(self):
        return f"{self.name}: ₹{self.min_amount:,.0f} - ₹{self.max_amount:,.0f} -> {self.required_role}"

class LoanApplication(models.Model):
    application_id = models.CharField(max_length=30, unique=True, db_index=True)
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='loan_applications')
    product = models.ForeignKey(LoanProduct, on_delete=models.PROTECT, related_name='applications')
    requested_amount = models.DecimalField(max_digits=12, decimal_places=2)
    tenure_months = models.IntegerField()
    purpose = models.TextField(blank=True, null=True)
    
    status = models.CharField(
        max_length=30,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.SUBMITTED,
        db_index=True
    )
    eligibility_status = models.CharField(
        max_length=30,
        choices=EligibilityStatus.choices,
        default=EligibilityStatus.ELIGIBLE
    )
    eligibility_score = models.IntegerField(default=80)
    eligibility_reason = models.TextField(blank=True, null=True)
    dti_ratio = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    calculated_emi = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    assigned_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_applications'
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_applications'
    )
    sanction_date = models.DateField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Digital e-Sign & Sanction Acceptance
    esign_status = models.CharField(max_length=30, default='PENDING')
    esign_timestamp = models.DateTimeField(null=True, blank=True)
    esign_ip = models.GenericIPAddressField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lp_loan_applications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.application_id} - {self.customer.customer_id} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.application_id:
            random_suffix = str(uuid.uuid4().int)[:6]
            self.application_id = f"LP-2026-{random_suffix}"
        super().save(*args, **kwargs)

class LoanApplicationTimeline(models.Model):
    application = models.ForeignKey(LoanApplication, on_delete=models.CASCADE, related_name='timeline')
    stage = models.CharField(max_length=50)
    status = models.CharField(max_length=50)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    remarks = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lp_application_timeline'
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.application.application_id} - {self.stage} ({self.status})"

class Loan(models.Model):
    loan_id = models.CharField(max_length=30, unique=True, db_index=True)
    application = models.OneToOneField(LoanApplication, on_delete=models.PROTECT, related_name='loan')
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='loans')
    product = models.ForeignKey(LoanProduct, on_delete=models.PROTECT, related_name='active_loans')
    
    sanctioned_amount = models.DecimalField(max_digits=12, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    tenure_months = models.IntegerField()
    monthly_emi = models.DecimalField(max_digits=12, decimal_places=2)
    total_interest = models.DecimalField(max_digits=12, decimal_places=2)
    total_payable = models.DecimalField(max_digits=12, decimal_places=2)
    outstanding_principal = models.DecimalField(max_digits=12, decimal_places=2)
    total_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    disbursement_date = models.DateField(null=True, blank=True)
    first_emi_date = models.DateField(null=True, blank=True)
    maturity_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=LoanStatus.choices,
        default=LoanStatus.ACTIVE,
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lp_loans'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.loan_id} - ₹{self.sanctioned_amount:,.0f} ({self.status})"

class Disbursement(models.Model):
    disbursement_id = models.CharField(max_length=30, unique=True, db_index=True)
    loan = models.OneToOneField(Loan, on_delete=models.CASCADE, related_name='disbursement')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=30)
    ifsc_code = models.CharField(max_length=20)
    transaction_reference = models.CharField(max_length=100, unique=True)
    status = models.CharField(
        max_length=20,
        choices=DisbursementStatus.choices,
        default=DisbursementStatus.SUCCESS
    )
    disbursed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    disbursed_at = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'lp_disbursements'
        ordering = ['-disbursed_at']

    def __str__(self):
        return f"{self.disbursement_id} - ₹{self.amount:,.0f} ({self.status})"
