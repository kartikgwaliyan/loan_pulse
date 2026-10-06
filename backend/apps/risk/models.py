from django.db import models
from django.conf import settings
from apps.loans.models import LoanApplication

class RiskCategory(models.TextChoices):
    LOW = 'LOW', 'Low Risk'
    MEDIUM = 'MEDIUM', 'Medium Risk'
    HIGH = 'HIGH', 'High Risk'

class RiskRecommendation(models.TextChoices):
    APPROVE = 'APPROVE', 'Approve'
    APPROVE_WITH_CONDITIONS = 'APPROVE_WITH_CONDITIONS', 'Approve with Conditions'
    REJECT = 'REJECT', 'Reject'
    MANUAL_REVIEW = 'MANUAL_REVIEW', 'Manual Review Required'

class RiskAssessment(models.Model):
    application = models.OneToOneField(
        LoanApplication,
        on_delete=models.CASCADE,
        related_name='risk_assessment'
    )
    risk_score = models.IntegerField(help_text="Underwriting score (0 - 100)")
    risk_category = models.CharField(max_length=20, choices=RiskCategory.choices, db_index=True)
    dti_ratio = models.DecimalField(max_digits=5, decimal_places=2)
    credit_score = models.IntegerField()
    default_probability = models.DecimalField(max_digits=5, decimal_places=4, help_text="ML predicted PD (e.g., 0.0320 = 3.2%)")
    model_name = models.CharField(max_length=100, default='LoanPulse-XGBoost-CreditRisk-v2.4')
    risk_indicators = models.JSONField(default=list)
    recommendation = models.CharField(max_length=30, choices=RiskRecommendation.choices)
    assessed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    analyst_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lp_risk_assessments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.application.application_id} - {self.risk_category} (Score: {self.risk_score})"


class CashflowGrade(models.TextChoices):
    EXCELLENT = 'EXCELLENT', 'Excellent Cashflow Stability'
    HEALTHY = 'HEALTHY', 'Healthy Positive Cashflow'
    MODERATE = 'MODERATE', 'Moderate Cashflow Buffer'
    VOLATILE = 'VOLATILE', 'Volatile Cashflow Inflow'
    HIGH_RISK = 'HIGH_RISK', 'High Inward Bounce / Negative Buffer'


class BankStatementAnalysis(models.Model):
    customer = models.ForeignKey(
        'customers.CustomerProfile',
        on_delete=models.CASCADE,
        related_name='bank_analyses'
    )
    application = models.ForeignKey(
        LoanApplication,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bank_analyses'
    )
    consent_id = models.CharField(max_length=60, unique=True, db_index=True)
    consent_status = models.CharField(max_length=20, default='ACTIVE')
    bank_name = models.CharField(max_length=100, default='HDFC Bank')
    account_number_masked = models.CharField(max_length=40, default='XXXXXXXX4912')
    account_type = models.CharField(max_length=30, default='SAVINGS')
    ifsc_code = models.CharField(max_length=20, default='HDFC0000240')
    statement_period_months = models.IntegerField(default=6)

    # Balance & Cashflow Metrics
    average_monthly_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    lowest_monthly_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    peak_monthly_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_credits = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    total_debits = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    avg_monthly_credits = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    avg_monthly_debits = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    net_cashflow_margin = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    # Salary & Behavioral Underwriting
    detected_monthly_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    salary_regularity_score = models.IntegerField(default=95, help_text="0-100 score")
    inward_cheque_bounces = models.IntegerField(default=0)
    ecs_nach_bounces = models.IntegerField(default=0)
    cashflow_health_score = models.IntegerField(default=85, help_text="0-100 score")
    cashflow_grade = models.CharField(max_length=30, choices=CashflowGrade.choices, default=CashflowGrade.HEALTHY)
    recommendation = models.CharField(max_length=50, default='STRONG_CASHFLOW')

    # Detailed Time-Series & Breakdown
    monthly_trend = models.JSONField(default=list)
    expense_categories = models.JSONField(default=dict)
    salary_credits_detected = models.JSONField(default=list)
    underwriting_summary = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lp_bank_statement_analyses'
        ordering = ['-created_at']

    def __str__(self):
        return f"AA Analysis: {self.customer.customer_id} - {self.bank_name} (MAB: ₹{self.average_monthly_balance})"

