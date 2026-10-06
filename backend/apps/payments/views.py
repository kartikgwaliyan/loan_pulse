from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import EMISchedule, PaymentTransaction
from .serializers import EMIScheduleSerializer, PaymentTransactionSerializer, MakePaymentSerializer
from .services import process_emi_payment
from apps.loans.models import Loan
from apps.authentication.permissions import IsEmployeeOrAdmin

class EMIScheduleListView(generics.ListAPIView):
    serializer_class = EMIScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        loan_id = self.request.query_params.get('loan_id')
        queryset = EMISchedule.objects.all().select_related('loan', 'loan__product')

        if user.role == 'CUSTOMER':
            profile = getattr(user, 'customer_profile', None)
            if not profile:
                return EMISchedule.objects.none()
            queryset = queryset.filter(loan__customer=profile)

        if loan_id:
            queryset = queryset.filter(loan__loan_id=loan_id)

        return queryset

class ProcessPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = MakePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        emi_id = serializer.validated_data['emi_id']
        amount = serializer.validated_data['amount']
        payment_method = serializer.validated_data['payment_method']

        emi = get_object_or_404(EMISchedule, pk=emi_id)
        loan = emi.loan

        # RBAC Check: Customer can only pay for their own loan
        if request.user.role == 'CUSTOMER' and loan.customer.user != request.user:
            return Response({
                "success": False,
                "error_code": "UNAUTHORIZED_PAYMENT",
                "message": "You are not authorized to make payments on this loan account."
            }, status=status.HTTP_403_FORBIDDEN)

        if emi.status == 'PAID':
            return Response({
                "success": False,
                "error_code": "DUPLICATE_PAYMENT",
                "message": f"EMI #{emi.installment_number} has already been paid on {emi.paid_date}."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Process payment transaction
        txn = process_emi_payment(
            loan=loan,
            emi=emi,
            amount=amount,
            payment_method=payment_method,
            user=request.user
        )

        return Response({
            "success": True,
            "message": f"Payment of ₹{amount:,.2f} processed successfully.",
            "transaction": PaymentTransactionSerializer(txn).data,
            "updated_emi": EMIScheduleSerializer(emi).data
        }, status=status.HTTP_201_CREATED)

class PaymentTransactionListView(generics.ListAPIView):
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        loan_id = self.request.query_params.get('loan_id')
        queryset = PaymentTransaction.objects.all().select_related('loan', 'loan__customer', 'loan__customer__user', 'emi')

        if user.role == 'CUSTOMER':
            profile = getattr(user, 'customer_profile', None)
            if not profile:
                return PaymentTransaction.objects.none()
            queryset = queryset.filter(loan__customer=profile)

        if loan_id:
            queryset = queryset.filter(loan__loan_id=loan_id)

        return queryset


class RegisterMandateView(APIView):
    """
    Registers an electronic NACH / Auto-Debit recurring mandate for automated EMI collection.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from .serializers import RegisterMandateSerializer, AutoDebitMandateSerializer
        from .models import AutoDebitMandate
        from apps.audit.models import AuditLog
        from django.utils import timezone
        from dateutil.relativedelta import relativedelta
        import uuid

        serializer = RegisterMandateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        loan = get_object_or_404(Loan, loan_id=data['loan_id'])

        # RBAC Check
        if request.user.role == 'CUSTOMER' and loan.customer.user != request.user:
            return Response({"success": False, "message": "Unauthorized."}, status=status.HTTP_403_FORBIDDEN)

        acc = data['account_number']
        masked_acc = f"XXXXXXXX{acc[-4:]}" if len(acc) >= 4 else "XXXXXXXX4912"
        max_limit = data.get('max_amount') or (loan.monthly_emi * 2)

        umrn = f"UMRN-NACH-{uuid.uuid4().hex[:12].upper()}"
        start = timezone.now().date()
        end = start + relativedelta(months=loan.tenure_months or 36)

        mandate = AutoDebitMandate.objects.create(
            umrn=umrn,
            loan=loan,
            customer=loan.customer,
            bank_name=data['bank_name'],
            account_number_masked=masked_acc,
            ifsc_code=data['ifsc_code'],
            max_amount=max_limit,
            frequency='MONTHLY',
            mandate_type='E_NACH',
            status='ACTIVE',
            auth_mode=data.get('auth_mode', 'NET_BANKING'),
            start_date=start,
            end_date=end
        )

        AuditLog.log_action(
            user=request.user,
            action='REGISTER_AUTODEBIT_MANDATE',
            target_type='MANDATE',
            target_id=str(mandate.id),
            details={
                'umrn': umrn,
                'loan_id': loan.loan_id,
                'bank_name': data['bank_name'],
                'auth_mode': data.get('auth_mode', 'NET_BANKING')
            }
        )

        return Response({
            "success": True,
            "message": f"e-NACH auto-debit mandate registered successfully with {data['bank_name']}. UMRN: {umrn}",
            "mandate": AutoDebitMandateSerializer(mandate).data
        }, status=status.HTTP_201_CREATED)


class MandateListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        from .serializers import AutoDebitMandateSerializer
        return AutoDebitMandateSerializer

    def get_queryset(self):
        from .models import AutoDebitMandate
        user = self.request.user
        qs = AutoDebitMandate.objects.all().select_related('loan', 'customer', 'customer__user')
        if user.role == 'CUSTOMER':
            profile = getattr(user, 'customer_profile', None)
            if not profile:
                return AutoDebitMandate.objects.none()
            qs = qs.filter(customer=profile)

        loan_id = self.request.query_params.get('loan_id')
        if loan_id:
            qs = qs.filter(loan__loan_id=loan_id)

        return qs

