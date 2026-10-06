from rest_framework import serializers
from .models import CustomerProfile
from apps.authentication.serializers import UserSerializer

class CustomerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    email = serializers.CharField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)

    class Meta:
        model = CustomerProfile
        fields = [
            'id', 'customer_id', 'user', 'full_name', 'email', 'phone',
            'date_of_birth', 'gender', 'pan_number', 'aadhaar_number',
            'marital_status', 'address_line1', 'address_line2', 'city', 'state', 'pincode',
            'employment_type', 'employer_name', 'designation', 'monthly_income',
            'annual_income', 'work_experience_years',
            'existing_loans_count', 'monthly_obligations',
            'bank_name', 'account_number', 'ifsc_code', 'credit_score',
            'onboarding_completed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'customer_id', 'created_at', 'updated_at']

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username

class CustomerOnboardingUpdateSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomerProfile
        fields = [
            'phone', 'date_of_birth', 'gender', 'pan_number', 'aadhaar_number',
            'marital_status', 'address_line1', 'address_line2', 'city', 'state', 'pincode',
            'employment_type', 'employer_name', 'designation', 'monthly_income',
            'annual_income', 'work_experience_years',
            'existing_loans_count', 'monthly_obligations',
            'bank_name', 'account_number', 'ifsc_code', 'credit_score',
            'onboarding_completed'
        ]

    def update(self, instance, validated_data):
        phone = validated_data.pop('phone', None)
        if phone:
            instance.user.phone = phone
            instance.user.save()
        return super().update(instance, validated_data)
