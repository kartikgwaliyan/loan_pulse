from rest_framework import serializers
from .models import EMISchedule, PaymentTransaction

class EMIScheduleSerializer(serializers.ModelSerializer):
    loan_id = serializers.CharField(source='loan.loan_id', read_only=True)
    product_name = serializers.CharField(source='loan.product.name', read_only=True)

    class Meta:
        model = EMISchedule
        fields = [
            'id', 'loan', 'loan_id', 'product_name', 'installment_number',
            'due_date', 'principal_amount', 'interest_amount', 'emi_amount',
            'remaining_balance', 'late_fee', 'status', 'paid_date', 'payment_reference'
        ]

class PaymentTransactionSerializer(serializers.ModelSerializer):
    loan_id = serializers.CharField(source='loan.loan_id', read_only=True)
    customer_name = serializers.SerializerMethodField()
    installment_number = serializers.IntegerField(source='emi.installment_number', read_only=True, allow_null=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'transaction_id', 'loan', 'loan_id', 'emi', 'installment_number',
            'customer_name', 'amount', 'payment_method', 'status',
            'gateway_transaction_id', 'receipt_number', 'created_at'
        ]

    def get_customer_name(self, obj):
        return obj.loan.customer.user.get_full_name() or obj.loan.customer.user.username

class MakePaymentSerializer(serializers.Serializer):
    emi_id = serializers.IntegerField(required=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)
    payment_method = serializers.ChoiceField(
        choices=['UPI', 'NET_BANKING', 'DEBIT_CARD', 'NEFT_RTGS'],
        default='UPI'
    )


class AutoDebitMandateSerializer(serializers.ModelSerializer):
    loan_id = serializers.CharField(source='loan.loan_id', read_only=True)
    customer_name = serializers.SerializerMethodField()

    class Meta:
        from .models import AutoDebitMandate
        model = AutoDebitMandate
        fields = [
            'id', 'umrn', 'loan', 'loan_id', 'customer', 'customer_name',
            'bank_name', 'account_number_masked', 'ifsc_code', 'max_amount',
            'frequency', 'mandate_type', 'status', 'auth_mode', 'start_date',
            'end_date', 'created_at'
        ]
        read_only_fields = ['id', 'umrn', 'created_at']

    def get_customer_name(self, obj):
        return obj.customer.user.get_full_name() or obj.customer.user.username


class RegisterMandateSerializer(serializers.Serializer):
    loan_id = serializers.CharField(required=True)
    bank_name = serializers.CharField(required=True)
    account_number = serializers.CharField(required=True)
    ifsc_code = serializers.CharField(required=True)
    auth_mode = serializers.ChoiceField(choices=['NET_BANKING', 'DEBIT_CARD', 'AADHAAR'], default='NET_BANKING')
    max_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)

