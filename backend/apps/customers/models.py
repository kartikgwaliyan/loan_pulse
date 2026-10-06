from django.db import models
from django.conf import settings
import uuid

class EmploymentType(models.TextChoices):
    SALARIED = 'SALARIED', 'Salaried Employee'
    SELF_EMPLOYED = 'SELF_EMPLOYED', 'Self-Employed Professional'
    BUSINESS_OWNER = 'BUSINESS_OWNER', 'Business Owner / Entrepreneur'
    OTHER = 'OTHER', 'Other'

class CustomerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='customer_profile'
    )
    customer_id = models.CharField(max_length=30, unique=True, db_index=True)
    
    # Personal Info
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    pan_number = models.CharField(max_length=10, blank=True, null=True, db_index=True)
    aadhaar_number = models.CharField(max_length=12, blank=True, null=True)
    marital_status = models.CharField(max_length=20, blank=True, null=True)
    address_line1 = models.CharField(max_length=255, blank=True, null=True)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)

    # Employment Info
    employment_type = models.CharField(
        max_length=30,
        choices=EmploymentType.choices,
        default=EmploymentType.SALARIED
    )
    employer_name = models.CharField(max_length=150, blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    annual_income = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    work_experience_years = models.IntegerField(default=1)

    # Financial Information
    existing_loans_count = models.IntegerField(default=0)
    monthly_obligations = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    account_number = models.CharField(max_length=30, blank=True, null=True)
    ifsc_code = models.CharField(max_length=20, blank=True, null=True)
    credit_score = models.IntegerField(default=740, help_text="CIBIL / Credit Bureau Score (300 - 900)")

    onboarding_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lp_customers'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.customer_id} - {self.user.get_full_name() or self.user.username}"

    def save(self, *args, **kwargs):
        if not self.customer_id:
            # Generate LP-CUST-XXXXXX
            random_suffix = str(uuid.uuid4().int)[:6]
            self.customer_id = f"LP-CUST-{random_suffix}"
        super().save(*args, **kwargs)
