from rest_framework import serializers
from .models import OverdueAccount, CollectionActivity

class CollectionActivitySerializer(serializers.ModelSerializer):
    officer_name = serializers.SerializerMethodField()

    class Meta:
        model = CollectionActivity
        fields = [
            'id', 'overdue_account', 'officer', 'officer_name',
            'contact_type', 'customer_response', 'notes',
            'followup_date', 'created_at'
        ]
        read_only_fields = ['id', 'officer', 'created_at']

    def get_officer_name(self, obj):
        return obj.officer.get_full_name() or obj.officer.username

class OverdueAccountSerializer(serializers.ModelSerializer):
    loan_id = serializers.CharField(source='loan.loan_id', read_only=True)
    product_name = serializers.CharField(source='loan.product.name', read_only=True)
    customer_id = serializers.CharField(source='loan.customer.customer_id', read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.CharField(source='loan.customer.user.phone', read_only=True)
    assigned_officer_name = serializers.SerializerMethodField()
    activities = CollectionActivitySerializer(many=True, read_only=True)

    class Meta:
        model = OverdueAccount
        fields = [
            'id', 'loan', 'loan_id', 'product_name', 'customer_id', 'customer_name',
            'customer_phone', 'overdue_amount', 'overdue_emis_count', 'days_past_due',
            'dpd_bracket', 'assigned_officer', 'assigned_officer_name', 'status',
            'last_contact_date', 'next_followup_date', 'activities',
            'created_at', 'updated_at'
        ]

    def get_customer_name(self, obj):
        return obj.loan.customer.user.get_full_name() or obj.loan.customer.user.username

    def get_assigned_officer_name(self, obj):
        if obj.assigned_officer:
            return obj.assigned_officer.get_full_name() or obj.assigned_officer.username
        return 'Unassigned'
