from django.db import models
from django.conf import settings
from apps.customers.models import CustomerProfile

class DocumentType(models.TextChoices):
    PAN = 'PAN', 'PAN Card'
    AADHAAR = 'AADHAAR', 'Aadhaar Card'
    PASSPORT = 'PASSPORT', 'Passport'
    VOTER_ID = 'VOTER_ID', 'Voter ID'
    SALARY_SLIP = 'SALARY_SLIP', 'Salary Slip (Last 3 Months)'
    BANK_STATEMENT = 'BANK_STATEMENT', 'Bank Statement (Last 6 Months)'
    EMPLOYMENT_PROOF = 'EMPLOYMENT_PROOF', 'Employment Offer / ID Card'
    ADDRESS_PROOF = 'ADDRESS_PROOF', 'Utility Bill / Address Proof'
    OTHER = 'OTHER', 'Other Supporting Document'

class DocumentStatus(models.TextChoices):
    UPLOADED = 'UPLOADED', 'Uploaded'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    VERIFIED = 'VERIFIED', 'Verified'
    REJECTED = 'REJECTED', 'Rejected'
    EXPIRED = 'EXPIRED', 'Expired'

class KYCDocument(models.Model):
    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name='kyc_documents'
    )
    document_type = models.CharField(max_length=30, choices=DocumentType.choices)
    document_number = models.CharField(max_length=50, blank=True, null=True)
    file = models.FileField(upload_to='kyc_documents/%Y/%m/')
    file_name = models.CharField(max_length=255, blank=True, null=True)
    file_size = models.IntegerField(default=0)
    mime_type = models.CharField(max_length=100, blank=True, null=True)
    
    status = models.CharField(
        max_length=20,
        choices=DocumentStatus.choices,
        default=DocumentStatus.UPLOADED,
        db_index=True
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_documents'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    remarks = models.TextField(blank=True, null=True)
    expiry_date = models.DateField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lp_kyc_documents'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.customer.customer_id} - {self.get_document_type_display()} ({self.status})"
