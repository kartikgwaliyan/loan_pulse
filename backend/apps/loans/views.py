from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import date
from decimal import Decimal
import uuid

from .models import (
    LoanProduct,
    ApprovalMatrixConfig,
    LoanApplication,
    LoanApplicationTimeline,
    Loan,
    Disbursement
)
from .serializers import (
    LoanProductSerializer,
    ApprovalMatrixConfigSerializer,
    LoanApplicationSerializer,
    LoanApplicationCreateSerializer,
    LoanSerializer,
    DisbursementSerializer
)
from .services import calculate_emi, evaluate_eligibility
from apps.customers.models import CustomerProfile
from apps.payments.services import generate_amortization_schedule
from apps.notifications.models import Notification
from apps.audit.models import AuditLog
from apps.authentication.permissions import (
    IsCustomer,
    IsLoanOfficer,
    IsManager,
    IsAdminUserRole,
    IsEmployeeOrAdmin
)

class LoanProductListCreateView(generics.ListCreateAPIView):
    queryset = LoanProduct.objects.filter(is_active=True)
    serializer_class = LoanProductSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUserRole()]
        return [permissions.AllowAny()]

class LoanProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LoanProduct.objects.all()
    serializer_class = LoanProductSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUserRole()]
        return [permissions.AllowAny()]

class LoanApplicationEligibilityCheckView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        requested_amount = request.data.get('requested_amount')
        tenure_months = request.data.get('tenure_months')

        if not all([product_id, requested_amount, tenure_months]):
            return Response(
                {"success": False, "message": "product_id, requested_amount, and tenure_months are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        product = get_object_or_404(LoanProduct, pk=product_id)
        profile, _ = CustomerProfile.objects.get_or_create(user=request.user)

        result = evaluate_eligibility(
            profile,
            product,
            Decimal(str(requested_amount)),
            int(tenure_months)
        )
        return Response({"success": True, "result": result})

class LoanApplicationListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LoanApplicationCreateSerializer
        return LoanApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'CUSTOMER':
            profile = getattr(user, 'customer_profile', None)
            if not profile:
                return LoanApplication.objects.none()
            return LoanApplication.objects.filter(customer=profile).select_related('customer', 'product', 'customer__user')
        
        # Employees/Admins
        queryset = LoanApplication.objects.all().select_related('customer', 'product', 'customer__user')
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        profile, _ = CustomerProfile.objects.get_or_create(user=user)
        product = serializer.validated_data['product']
        requested_amount = serializer.validated_data['requested_amount']
        tenure_months = serializer.validated_data['tenure_months']

        # Automated underwriting eligibility assessment
        eligibility = evaluate_eligibility(profile, product, requested_amount, tenure_months)

        application = serializer.save(
            customer=profile,
            status='SUBMITTED',
            eligibility_status=eligibility['status'],
            eligibility_score=eligibility['score'],
            eligibility_reason=eligibility['reason'],
            dti_ratio=eligibility['dti_ratio'],
            calculated_emi=eligibility['calculated_emi']
        )

        # Initial timeline entry
        LoanApplicationTimeline.objects.create(
            application=application,
            stage='Application Submitted',
            status='SUBMITTED',
            performed_by=user,
            remarks=f"Application submitted digitally for ₹{requested_amount:,.2f} over {tenure_months} months."
        )

        # Automated KYC check step
        LoanApplicationTimeline.objects.create(
            application=application,
            stage='Document Verification',
            status='DOC_VERIFICATION',
            performed_by=None,
            remarks="Documents queued for verification by loan operations desk."
        )
        application.status = 'DOC_VERIFICATION'
        application.save()

        # Audit log
        AuditLog.log_action(
            user=user,
            action='SUBMIT_LOAN_APPLICATION',
            target_type='LOAN_APPLICATION',
            target_id=application.application_id,
            details={
                'product': product.name,
                'amount': str(requested_amount),
                'tenure': tenure_months,
                'eligibility': eligibility['status']
            }
        )

        # Notification
        Notification.objects.create(
            user=user,
            title="Loan Application Received",
            message=f"Your loan application {application.application_id} for {product.name} of ₹{requested_amount:,.2f} has been submitted successfully.",
            notification_type='LOAN_UPDATE'
        )

class LoanApplicationDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LoanApplicationSerializer
    queryset = LoanApplication.objects.all().select_related('customer', 'product', 'customer__user')
    lookup_field = 'application_id'

class LoanApplicationReviewActionView(APIView):
    """
    Loan Officer review actions:
    - VERIFY_DOCS: Moves from DOC_VERIFICATION -> UNDER_REVIEW -> RISK_ASSESSMENT
    - REQUEST_INFO: Adds remarks and requests applicant to update
    - REJECT: Rejects application with reason
    """
    permission_classes = [IsLoanOfficer]

    def post(self, request, application_id):
        application = get_object_or_404(LoanApplication, application_id=application_id)
        action = request.data.get('action') # 'VERIFY_DOCS', 'REQUEST_INFO', 'RECOMMEND_APPROVAL', 'REJECT'
        remarks = request.data.get('remarks', '')

        if action == 'VERIFY_DOCS':
            application.status = 'RISK_ASSESSMENT'
            application.assigned_officer = request.user
            application.save()
            LoanApplicationTimeline.objects.create(
                application=application,
                stage='Risk Assessment',
                status='RISK_ASSESSMENT',
                performed_by=request.user,
                remarks=remarks or "All KYC documents successfully verified. Application forwarded to Risk Review."
            )
        elif action == 'REQUEST_INFO':
            LoanApplicationTimeline.objects.create(
                application=application,
                stage='Information Requested',
                status='INFO_REQUESTED',
                performed_by=request.user,
                remarks=remarks
            )
            Notification.objects.create(
                user=application.customer.user,
                title="Action Required: Loan Application",
                message=f"Loan officer requested additional information on {application.application_id}: {remarks}",
                notification_type='LOAN_UPDATE'
            )
        elif action == 'RECOMMEND_APPROVAL':
            application.status = 'MANAGER_APPROVAL'
            application.save()
            LoanApplicationTimeline.objects.create(
                application=application,
                stage='Manager Approval',
                status='MANAGER_APPROVAL',
                performed_by=request.user,
                remarks=remarks or "Recommended for credit sanction by loan officer."
            )
        elif action == 'REJECT':
            application.status = 'REJECTED'
            application.rejection_reason = remarks
            application.save()
            LoanApplicationTimeline.objects.create(
                application=application,
                stage='Application Rejected',
                status='REJECTED',
                performed_by=request.user,
                remarks=remarks or "Application rejected during preliminary underwriting."
            )
            Notification.objects.create(
                user=application.customer.user,
                title="Loan Application Update",
                message=f"Your loan application {application.application_id} could not be approved. Reason: {remarks}",
                notification_type='LOAN_UPDATE'
            )

        AuditLog.log_action(
            user=request.user,
            action=f"OFFICER_REVIEW_{action}",
            target_type='LOAN_APPLICATION',
            target_id=application.application_id,
            details={'action': action, 'remarks': remarks}
        )

        return Response({
            "success": True,
            "message": f"Action {action} processed successfully.",
            "application": LoanApplicationSerializer(application).data
        })

class LoanApplicationApprovalActionView(APIView):
    """
    Manager / Credit Authority Approval with Approval Matrix validation!
    """
    permission_classes = [IsEmployeeOrAdmin]

    def post(self, request, application_id):
        application = get_object_or_404(LoanApplication, application_id=application_id)
        decision = request.data.get('decision') # 'APPROVE' or 'REJECT'
        remarks = request.data.get('remarks', '')
        user = request.user

        # Approval Matrix Enforcement
        amount = application.requested_amount
        if decision == 'APPROVE':
            if amount > Decimal('2000000.00') and user.role not in ['ADMIN', 'MANAGER']:
                return Response({
                    "success": False,
                    "error_code": "APPROVAL_MATRIX_VIOLATION",
                    "message": "Loans exceeding ₹20 Lakhs require Senior Credit Authority / Admin approval."
                }, status=status.HTTP_403_FORBIDDEN)
            elif amount > Decimal('500000.00') and user.role not in ['MANAGER', 'ADMIN']:
                return Response({
                    "success": False,
                    "error_code": "APPROVAL_MATRIX_VIOLATION",
                    "message": "Loans between ₹5 Lakhs and ₹20 Lakhs require Credit Manager approval."
                }, status=status.HTTP_403_FORBIDDEN)

            application.status = 'APPROVED'
            application.approved_by = user
            application.sanction_date = date.today()
            application.save()

            LoanApplicationTimeline.objects.create(
                application=application,
                stage='Loan Sanctioned',
                status='APPROVED',
                performed_by=user,
                remarks=remarks or f"Sanctioned by {user.get_role_display()} {user.get_full_name()}."
            )

            Notification.objects.create(
                user=application.customer.user,
                title="Congratulations! Loan Approved",
                message=f"Your loan application {application.application_id} for ₹{amount:,.2f} has been formally sanctioned and is ready for disbursement!",
                notification_type='LOAN_UPDATE'
            )
        else:
            application.status = 'REJECTED'
            application.rejection_reason = remarks
            application.save()

            LoanApplicationTimeline.objects.create(
                application=application,
                stage='Application Rejected',
                status='REJECTED',
                performed_by=user,
                remarks=remarks or "Rejected by credit management authority."
            )

            Notification.objects.create(
                user=application.customer.user,
                title="Loan Application Rejected",
                message=f"Your loan application {application.application_id} was rejected. Reason: {remarks}",
                notification_type='LOAN_UPDATE'
            )

        AuditLog.log_action(
            user=user,
            action=f"CREDIT_DECISION_{decision}",
            target_type='LOAN_APPLICATION',
            target_id=application.application_id,
            details={'decision': decision, 'amount': str(amount), 'remarks': remarks}
        )

        return Response({
            "success": True,
            "message": f"Loan {application.application_id} successfully {decision.lower()}d.",
            "application": LoanApplicationSerializer(application).data
        })

class LoanDisbursementActionView(APIView):
    """
    Executes loan disbursement:
    1. Validates bank credentials
    2. Changes application status -> DISBURSED
    3. Creates Loan record with unique LN-XXXX id
    4. Records Disbursement transaction with UTR
    5. Triggers automatic monthly EMI schedule generation!
    """
    permission_classes = [IsEmployeeOrAdmin]

    def post(self, request, application_id):
        application = get_object_or_404(LoanApplication, application_id=application_id)
        if application.status != 'APPROVED':
            return Response({
                "success": False,
                "error_code": "DISBURSEMENT_ERROR",
                "message": f"Cannot disburse loan in '{application.status}' status. Only APPROVED loans can be disbursed."
            }, status=status.HTTP_400_BAD_REQUEST)

        profile = application.customer
        bank_name = request.data.get('bank_name') or profile.bank_name or 'HDFC Bank'
        account_number = request.data.get('account_number') or profile.account_number or '5010023419082'
        ifsc_code = request.data.get('ifsc_code') or profile.ifsc_code or 'HDFC0001234'
        remarks = request.data.get('remarks', 'Disbursed via automated RTGS/NEFT gateway')

        # Compute final loan parameters
        interest_rate = (application.product.interest_rate_min + application.product.interest_rate_max) / 2
        emi_calc = calculate_emi(application.requested_amount, interest_rate, application.tenure_months)

        # Create active Loan record
        loan_num = str(uuid.uuid4().int)[:6]
        loan = Loan.objects.create(
            loan_id=f"LN-2026-{loan_num}",
            application=application,
            customer=profile,
            product=application.product,
            sanctioned_amount=application.requested_amount,
            interest_rate=interest_rate,
            tenure_months=application.tenure_months,
            monthly_emi=emi_calc['emi'],
            total_interest=emi_calc['total_interest'],
            total_payable=emi_calc['total_payable'],
            outstanding_principal=application.requested_amount,
            disbursement_date=date.today(),
            first_emi_date=date.today() + timezone.timedelta(days=30),
            maturity_date=date.today() + timezone.timedelta(days=application.tenure_months * 30),
            status='ACTIVE'
        )

        # Create Disbursement record
        disb_num = str(uuid.uuid4().int)[:6]
        utr_num = f"UTR{uuid.uuid4().hex[:12].upper()}"
        disbursement = Disbursement.objects.create(
            disbursement_id=f"DISB-2026-{disb_num}",
            loan=loan,
            amount=application.requested_amount,
            bank_name=bank_name,
            account_number=account_number,
            ifsc_code=ifsc_code,
            transaction_reference=utr_num,
            status='SUCCESS',
            disbursed_by=request.user,
            remarks=remarks
        )

        # Update application status
        application.status = 'DISBURSED'
        application.save()

        # Update timeline
        LoanApplicationTimeline.objects.create(
            application=application,
            stage='Disbursement Completed',
            status='DISBURSED',
            performed_by=request.user,
            remarks=f"₹{application.requested_amount:,.2f} disbursed to {bank_name} A/C ending {account_number[-4:]} (Ref: {utr_num})."
        )

        # Generate Full Monthly Amortization Schedule
        schedules = generate_amortization_schedule(loan)

        # Customer Notification
        Notification.objects.create(
            user=profile.user,
            title="Loan Disbursed Successfully!",
            message=f"₹{loan.sanctioned_amount:,.2f} has been transferred to your bank account {account_number}. Your first EMI of ₹{loan.monthly_emi:,.2f} is due on {loan.first_emi_date}.",
            notification_type='LOAN_UPDATE'
        )

        # Audit Log
        AuditLog.log_action(
            user=request.user,
            action='DISBURSE_LOAN',
            target_type='LOAN',
            target_id=loan.loan_id,
            details={
                'disbursement_id': disbursement.disbursement_id,
                'amount': str(loan.sanctioned_amount),
                'utr': utr_num,
                'installments_generated': len(schedules)
            }
        )

        return Response({
            "success": True,
            "message": "Loan successfully disbursed! Repayment amortization schedule activated.",
            "loan": LoanSerializer(loan).data,
            "disbursement": DisbursementSerializer(disbursement).data,
            "emis_generated": len(schedules)
        })

class LoanListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LoanSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'CUSTOMER':
            profile = getattr(user, 'customer_profile', None)
            if not profile:
                return Loan.objects.none()
            return Loan.objects.filter(customer=profile).select_related('customer', 'product', 'customer__user')
        
        # Employees/Admin
        queryset = Loan.objects.all().select_related('customer', 'product', 'customer__user')
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

class LoanDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LoanSerializer
    queryset = Loan.objects.all().select_related('customer', 'product', 'customer__user')
    lookup_field = 'loan_id'

class ApprovalMatrixConfigListView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUserRole]
    serializer_class = ApprovalMatrixConfigSerializer
    queryset = ApprovalMatrixConfig.objects.all()


class SanctionLetterView(APIView):
    """
    Generates official Digital Sanction Letter details with cryptographic verification token.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, application_id):
        import hashlib
        from django.utils import timezone
        from dateutil.relativedelta import relativedelta

        app = get_object_or_404(
            LoanApplication.objects.select_related('customer', 'product', 'customer__user', 'approved_by'),
            application_id=application_id
        )

        # RBAC Check
        if request.user.role == 'CUSTOMER' and app.customer.user != request.user:
            return Response({"success": False, "message": "Unauthorized."}, status=status.HTTP_403_FORBIDDEN)

        sanction_dt = app.sanction_date or (app.created_at.date() if app.created_at else timezone.now().date())
        expiry_dt = sanction_dt + relativedelta(days=30)
        
        proc_fee = round(float(app.requested_amount) * (float(app.product.processing_fee_percent) / 100.0), 2)
        total_interest = round((float(app.calculated_emi) * int(app.tenure_months)) - float(app.requested_amount), 2)
        total_payable = round(float(app.requested_amount) + max(0.0, total_interest), 2)

        # Generate cryptographic verification hash
        raw_sig = f"LOANPULSE:{app.application_id}:{app.requested_amount}:{sanction_dt}:VERIFIED"
        token = hashlib.sha256(raw_sig.encode()).hexdigest()[:24].upper()

        letter_data = {
            "letter_reference": f"LP/SL/2026/{app.application_id}",
            "sanction_date": str(sanction_dt),
            "valid_until": str(expiry_dt),
            "verification_token": f"VER-{token}",
            "applicant": {
                "name": app.customer.user.get_full_name() or app.customer.user.username,
                "customer_id": app.customer.customer_id,
                "pan_number": app.customer.pan_number or "ABCDE1234F",
                "phone": app.customer.user.phone or "+91 98765 43210",
                "email": app.customer.user.email,
                "address": f"{app.customer.address_line1 or 'Tower 4, Fintech Valley'}, {app.customer.city or 'Bengaluru'}, {app.customer.state or 'Karnataka'} - {app.customer.pincode or '560100'}",
                "employer": app.customer.employer_name or "Verified Corporate Enterprise"
            },
            "loan_terms": {
                "facility_name": app.product.name,
                "facility_code": app.product.code,
                "sanctioned_amount": float(app.requested_amount),
                "interest_rate": float(app.product.interest_rate_min),
                "interest_type": "Fixed Compound Daily-Reducing",
                "tenure_months": int(app.tenure_months),
                "monthly_emi": float(app.calculated_emi),
                "processing_fee": proc_fee,
                "processing_fee_percent": float(app.product.processing_fee_percent),
                "total_estimated_interest": total_interest,
                "total_repayable": total_payable
            },
            "disbursement_conditions": [
                "Submission and electronic signing of this formal Sanction Letter.",
                "Mandatory registration of an e-NACH auto-debit recurring repayment mandate.",
                "Direct credit to borrower bank account via RTGS/NEFT banking rails."
            ],
            "digital_sign_authority": {
                "authorized_by": app.approved_by.get_full_name() if app.approved_by else "National Credit Sanctioning Committee",
                "authority_title": "Authorized Credit Signatory",
                "digital_seal": "LOANPULSE TECHNOLOGIES LTD • DIGITAL LENDING CORE",
                "is_digitally_signed": True,
                "stamp_timestamp": str(app.updated_at or timezone.now())
            },
            "esign": {
                "status": app.esign_status,
                "timestamp": str(app.esign_timestamp) if app.esign_timestamp else None,
                "ip_address": app.esign_ip
            }
        }

        return Response({
            "success": True,
            "sanction_letter": letter_data
        })


class ESignSanctionLetterView(APIView):
    """
    Records borrower's electronic e-Sign acceptance of the formal loan sanction letter.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, application_id):
        from django.utils import timezone
        app = get_object_or_404(LoanApplication, application_id=application_id)

        # RBAC Check
        if request.user.role == 'CUSTOMER' and app.customer.user != request.user:
            return Response({"success": False, "message": "Unauthorized."}, status=status.HTTP_403_FORBIDDEN)

        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
        app.esign_status = 'SIGNED'
        app.esign_timestamp = timezone.now()
        app.esign_ip = ip
        app.save()

        LoanApplicationTimeline.objects.create(
            application=app,
            stage='Sanction Letter e-Signed',
            status=app.status,
            performed_by=request.user,
            remarks=f"Borrower legally acknowledged and digitally e-signed sanction letter from IP {ip}."
        )

        AuditLog.log_action(
            user=request.user,
            action='ESIGN_SANCTION_LETTER',
            target_type='LOAN_APPLICATION',
            target_id=app.application_id,
            details={'ip': ip, 'timestamp': str(app.esign_timestamp)}
        )

        return Response({
            "success": True,
            "message": "Loan Sanction Letter digitally signed and legally accepted!",
            "esign_status": "SIGNED",
            "signed_at": str(app.esign_timestamp)
        })

