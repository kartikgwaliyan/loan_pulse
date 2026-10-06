from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import CustomerProfile
from .serializers import CustomerProfileSerializer, CustomerOnboardingUpdateSerializer
from apps.authentication.permissions import IsCustomer, IsEmployeeOrAdmin
from apps.audit.models import AuditLog

class CustomerMyProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = CustomerProfile.objects.get_or_create(user=request.user)
        serializer = CustomerProfileSerializer(profile)
        return Response({"success": True, "profile": serializer.data})

    def put(self, request):
        profile, _ = CustomerProfile.objects.get_or_create(user=request.user)
        serializer = CustomerOnboardingUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        AuditLog.log_action(
            user=request.user,
            action='UPDATE_CUSTOMER_PROFILE',
            target_type='CUSTOMER',
            target_id=profile.customer_id,
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
            details={'onboarding_completed': profile.onboarding_completed}
        )

        return Response({
            "success": True,
            "message": "Customer profile updated successfully.",
            "profile": CustomerProfileSerializer(profile).data
        })

import uuid
from apps.authentication.models import User

class CustomerListView(generics.ListCreateAPIView):
    permission_classes = [IsEmployeeOrAdmin]
    serializer_class = CustomerProfileSerializer
    queryset = CustomerProfile.objects.all().select_related('user')
    search_fields = ['customer_id', 'user__first_name', 'user__last_name', 'user__email', 'pan_number']
    filterset_fields = ['employment_type', 'onboarding_completed', 'city', 'state']

    def create(self, request, *args, **kwargs):
        data = request.data
        email = data.get('email', '').strip()
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        phone = data.get('phone', '').strip()
        password = data.get('password', 'Pass@123')

        if not email or not first_name:
            return Response({"success": False, "error": "Email and First Name are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"success": False, "error": f"A user with email '{email}' already exists."}, status=status.HTTP_400_BAD_REQUEST)

        # Create user account
        username = email.split('@')[0] + "_" + str(uuid.uuid4())[:4]
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role='CUSTOMER'
        )

        # Create customer financial profile
        profile, _ = CustomerProfile.objects.get_or_create(user=user)
        profile.pan_number = data.get('pan_number', '').upper()
        profile.aadhaar_number = data.get('aadhaar_number', '')
        profile.gender = data.get('gender', 'MALE')
        if data.get('date_of_birth'):
            profile.date_of_birth = data.get('date_of_birth')
        profile.marital_status = data.get('marital_status', 'SINGLE')
        profile.address_line1 = data.get('address_line1', '')
        profile.city = data.get('city', '')
        profile.state = data.get('state', '')
        profile.pincode = data.get('pincode', '')
        profile.employment_type = data.get('employment_type', 'SALARIED')
        profile.employer_name = data.get('employer_name', '')
        profile.designation = data.get('designation', '')
        
        monthly_inc = data.get('monthly_income', 50000)
        profile.monthly_income = monthly_inc
        profile.annual_income = data.get('annual_income', float(monthly_inc) * 12)
        profile.work_experience_years = data.get('work_experience_years', 2)
        profile.credit_score = data.get('credit_score', 750)
        profile.bank_name = data.get('bank_name', '')
        profile.account_number = data.get('account_number', '')
        profile.ifsc_code = data.get('ifsc_code', '')
        profile.onboarding_completed = True
        profile.save()

        AuditLog.log_action(
            user=request.user,
            action='CREATE_CUSTOMER_BY_STAFF',
            target_type='CUSTOMER',
            target_id=profile.customer_id,
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
            details={
                'staff_officer': request.user.username,
                'customer_email': email,
                'customer_id': profile.customer_id
            }
        )

        return Response({
            "success": True,
            "message": f"Customer '{first_name} {last_name}' registered successfully with ID {profile.customer_id}.",
            "profile": CustomerProfileSerializer(profile).data
        }, status=status.HTTP_201_CREATED)

class CustomerDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsEmployeeOrAdmin]
    serializer_class = CustomerProfileSerializer
    queryset = CustomerProfile.objects.all().select_related('user')
    lookup_field = 'customer_id'
