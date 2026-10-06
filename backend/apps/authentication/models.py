from django.db import models
from django.contrib.auth.models import AbstractUser

class UserRole(models.TextChoices):
    CUSTOMER = 'CUSTOMER', 'Customer'
    LOAN_OFFICER = 'LOAN_OFFICER', 'Loan Officer'
    RISK_ANALYST = 'RISK_ANALYST', 'Risk Analyst'
    MANAGER = 'MANAGER', 'Credit Manager'
    COLLECTION_OFFICER = 'COLLECTION_OFFICER', 'Collection Officer'
    ADMIN = 'ADMIN', 'System Administrator'

class User(AbstractUser):
    role = models.CharField(
        max_length=30,
        choices=UserRole.choices,
        default=UserRole.CUSTOMER,
        db_index=True
    )
    phone = models.CharField(max_length=20, blank=True, null=True)
    branch = models.CharField(max_length=100, default='Main Branch')
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lp_users'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
