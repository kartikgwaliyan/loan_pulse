from rest_framework import serializers
from .models import RiskAssessment
from apps.loans.serializers import LoanApplicationSerializer

class RiskAssessmentSerializer(serializers.ModelSerializer):
    application_id = serializers.CharField(source='application.application_id', read_only=True)
    customer_name = serializers.SerializerMethodField()
    product_name = serializers.CharField(source='application.product.name', read_only=True)
    requested_amount = serializers.DecimalField(source='application.requested_amount', max_digits=12, decimal_places=2, read_only=True)
    assessed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = RiskAssessment
        fields = [
            'id', 'application', 'application_id', 'customer_name', 'product_name',
            'requested_amount', 'risk_score', 'risk_category', 'dti_ratio',
            'credit_score', 'default_probability', 'model_name', 'risk_indicators',
            'recommendation', 'assessed_by', 'assessed_by_name', 'analyst_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_customer_name(self, obj):
        return obj.application.customer.user.get_full_name() or obj.application.customer.user.username

    def get_assessed_by_name(self, obj):
        if obj.assessed_by:
            return obj.assessed_by.get_full_name() or obj.assessed_by.username
        return 'System ML Pipeline'


class BankStatementAnalysisSerializer(serializers.ModelSerializer):
    customer_id = serializers.CharField(source='customer.customer_id', read_only=True)
    customer_name = serializers.SerializerMethodField()
    application_id = serializers.CharField(source='application.application_id', read_only=True, default=None)

    class Meta:
        from .models import BankStatementAnalysis
        model = BankStatementAnalysis
        fields = [
            'id', 'customer', 'customer_id', 'customer_name', 'application', 'application_id',
            'consent_id', 'consent_status', 'bank_name', 'account_number_masked',
            'account_type', 'ifsc_code', 'statement_period_months',
            'average_monthly_balance', 'lowest_monthly_balance', 'peak_monthly_balance',
            'total_credits', 'total_debits', 'avg_monthly_credits', 'avg_monthly_debits',
            'net_cashflow_margin', 'detected_monthly_salary', 'salary_regularity_score',
            'inward_cheque_bounces', 'ecs_nach_bounces', 'cashflow_health_score',
            'cashflow_grade', 'recommendation', 'monthly_trend', 'expense_categories',
            'salary_credits_detected', 'underwriting_summary', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'consent_id', 'created_at', 'updated_at']

    def get_customer_name(self, obj):
        return obj.customer.user.get_full_name() or obj.customer.user.username

