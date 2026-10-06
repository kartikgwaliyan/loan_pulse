from rest_framework import serializers
from .models import (
    LoanProduct,
    ApprovalMatrixConfig,
    LoanApplication,
    LoanApplicationTimeline,
    Loan,
    Disbursement
)
from apps.customers.serializers import CustomerProfileSerializer
from .services import calculate_emi, evaluate_eligibility
from decimal import Decimal

class LoanProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanProduct
        fields = '__all__'

class ApprovalMatrixConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalMatrixConfig
        fields = '__all__'

class LoanApplicationTimelineSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = LoanApplicationTimeline
        fields = ['id', 'stage', 'status', 'performed_by', 'performed_by_name', 'remarks', 'timestamp']

    def get_performed_by_name(self, obj):
        if obj.performed_by:
            return obj.performed_by.get_full_name() or obj.performed_by.username
        return 'System Engine'

class LoanApplicationSerializer(serializers.ModelSerializer):
    product_details = LoanProductSerializer(source='product', read_only=True)
    customer_details = CustomerProfileSerializer(source='customer', read_only=True)
    timeline = LoanApplicationTimelineSerializer(many=True, read_only=True)
    assigned_officer_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = LoanApplication
        fields = [
            'id', 'application_id', 'customer', 'customer_details',
            'product', 'product_details', 'requested_amount', 'tenure_months',
            'purpose', 'status', 'eligibility_status', 'eligibility_score',
            'eligibility_reason', 'dti_ratio', 'calculated_emi',
            'assigned_officer', 'assigned_officer_name', 'approved_by', 'approved_by_name',
            'sanction_date', 'rejection_reason', 'timeline', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'application_id', 'status', 'eligibility_status',
            'eligibility_score', 'eligibility_reason', 'dti_ratio',
            'calculated_emi', 'assigned_officer', 'approved_by',
            'sanction_date', 'rejection_reason', 'created_at', 'updated_at'
        ]

    def get_assigned_officer_name(self, obj):
        if obj.assigned_officer:
            return obj.assigned_officer.get_full_name() or obj.assigned_officer.username
        return None

    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return obj.approved_by.get_full_name() or obj.approved_by.username
        return None

class LoanApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanApplication
        fields = ['product', 'requested_amount', 'tenure_months', 'purpose']

    def validate(self, attrs):
        product = attrs['product']
        amount = attrs['requested_amount']
        tenure = attrs['tenure_months']

        if amount < product.min_amount or amount > product.max_amount:
            raise serializers.ValidationError({
                "requested_amount": f"Amount must be between ₹{product.min_amount:,.0f} and ₹{product.max_amount:,.0f}."
            })

        if tenure < product.min_tenure_months or tenure > product.max_tenure_months:
            raise serializers.ValidationError({
                "tenure_months": f"Tenure must be between {product.min_tenure_months} and {product.max_tenure_months} months."
            })

        return attrs

class LoanSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    customer_id = serializers.CharField(source='customer.customer_id', read_only=True)
    customer_name = serializers.SerializerMethodField()
    application_id = serializers.CharField(source='application.application_id', read_only=True)

    class Meta:
        model = Loan
        fields = [
            'id', 'loan_id', 'application', 'application_id', 'customer', 'customer_id', 'customer_name',
            'product', 'product_name', 'sanctioned_amount', 'interest_rate', 'tenure_months',
            'monthly_emi', 'total_interest', 'total_payable', 'outstanding_principal',
            'total_paid', 'disbursement_date', 'first_emi_date', 'maturity_date',
            'status', 'created_at', 'updated_at'
        ]

    def get_customer_name(self, obj):
        return obj.customer.user.get_full_name() or obj.customer.user.username

class DisbursementSerializer(serializers.ModelSerializer):
    loan_id = serializers.CharField(source='loan.loan_id', read_only=True)
    disbursed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Disbursement
        fields = [
            'id', 'disbursement_id', 'loan', 'loan_id', 'amount',
            'bank_name', 'account_number', 'ifsc_code', 'transaction_reference',
            'status', 'disbursed_by', 'disbursed_by_name', 'disbursed_at', 'remarks'
        ]

    def get_disbursed_by_name(self, obj):
        if obj.disbursed_by:
            return obj.disbursed_by.get_full_name() or obj.disbursed_by.username
        return None
