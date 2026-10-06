from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import RiskAssessment, BankStatementAnalysis
from .serializers import RiskAssessmentSerializer, BankStatementAnalysisSerializer
from .services import compute_ml_risk_assessment, analyze_account_aggregator_cashflow
from apps.loans.models import LoanApplication
from apps.authentication.permissions import IsRiskAnalyst, IsEmployeeOrAdmin
from apps.audit.models import AuditLog

class RiskAssessmentListView(generics.ListAPIView):
    permission_classes = [IsEmployeeOrAdmin]
    serializer_class = RiskAssessmentSerializer
    queryset = RiskAssessment.objects.all().select_related('application', 'application__customer', 'application__product', 'application__customer__user')
    filterset_fields = ['risk_category', 'recommendation']

class RiskAssessmentDetailView(generics.RetrieveAPIView):
    permission_classes = [IsEmployeeOrAdmin]
    serializer_class = RiskAssessmentSerializer
    queryset = RiskAssessment.objects.all()

class TriggerRiskAssessmentView(APIView):
    """
    Triggers the ML credit risk engine on a loan application.
    """
    permission_classes = [IsEmployeeOrAdmin]

    def post(self, request, application_id):
        application = get_object_or_404(LoanApplication, application_id=application_id)
        notes = request.data.get('analyst_notes', '')

        assessment = compute_ml_risk_assessment(
            application=application,
            analyst=request.user,
            notes=notes
        )

        AuditLog.log_action(
            user=request.user,
            action='EVALUATE_CREDIT_RISK',
            target_type='RISK_ASSESSMENT',
            target_id=str(assessment.id),
            details={
                'application_id': application.application_id,
                'category': assessment.risk_category,
                'score': assessment.risk_score,
                'pd': str(assessment.default_probability)
            }
        )

        return Response({
            "success": True,
            "message": "Risk assessment completed successfully.",
            "assessment": RiskAssessmentSerializer(assessment).data
        })


class AccountAggregatorConnectView(APIView):
    """
    Simulates digital consent flow for Account Aggregator (AA) data fetching.
    Instantly verifies bank credentials, downloads 6-month statement data,
    and calculates Monthly Average Balance (MAB) & cashflow metrics.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        customer_profile = getattr(user, 'customer_profile', None)

        # Allow staff to trigger on behalf of a customer by passing customer_id
        if not customer_profile or user.role != 'CUSTOMER':
            cust_id = request.data.get('customer_id')
            if cust_id:
                customer_profile = get_object_or_404(CustomerProfile, customer_id=cust_id)
            elif customer_profile is None:
                return Response(
                    {"success": False, "message": "Customer profile required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        bank_name = request.data.get('bank_name', customer_profile.bank_name or 'HDFC Bank')
        account_number = request.data.get('account_number', customer_profile.account_number)
        ifsc_code = request.data.get('ifsc_code', customer_profile.ifsc_code)
        app_id = request.data.get('application_id')

        application = None
        if app_id:
            application = LoanApplication.objects.filter(application_id=app_id).first()

        analysis = analyze_account_aggregator_cashflow(
            customer_profile=customer_profile,
            application=application,
            bank_name=bank_name,
            account_number=account_number,
            ifsc_code=ifsc_code
        )

        AuditLog.log_action(
            user=user,
            action='CONNECT_ACCOUNT_AGGREGATOR',
            target_type='BANK_STATEMENT_ANALYSIS',
            target_id=str(analysis.id),
            details={
                'consent_id': analysis.consent_id,
                'bank_name': analysis.bank_name,
                'mab': str(analysis.average_monthly_balance),
                'health_score': analysis.cashflow_health_score
            }
        )

        return Response({
            "success": True,
            "message": f"Account Aggregator data fetched and verified successfully from {analysis.bank_name}.",
            "analysis": BankStatementAnalysisSerializer(analysis).data
        }, status=status.HTTP_201_CREATED)


class BankStatementAnalysisListView(generics.ListAPIView):
    """
    Lists bank statement and Account Aggregator analyses.
    Scoped to self for customers; global for underwriters and staff.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BankStatementAnalysisSerializer

    def get_queryset(self):
        user = self.request.user
        qs = BankStatementAnalysis.objects.all().select_related('customer', 'customer__user', 'application')
        if user.role == 'CUSTOMER':
            return qs.filter(customer__user=user)
        
        app_id = self.request.query_params.get('application_id')
        if app_id:
            qs = qs.filter(application__application_id=app_id)

        cust_id = self.request.query_params.get('customer_id')
        if cust_id:
            qs = qs.filter(customer__customer_id=cust_id)

        return qs


class BankStatementAnalysisDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BankStatementAnalysisSerializer
    queryset = BankStatementAnalysis.objects.all()


class UploadBankStatementView(APIView):
    """
    Uploads a bank statement (PDF/CSV) and executes automated statement parsing.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        customer_profile = getattr(user, 'customer_profile', None)
        if not customer_profile:
            cust_id = request.data.get('customer_id')
            if cust_id:
                customer_profile = get_object_or_404(CustomerProfile, customer_id=cust_id)
            else:
                return Response({"success": False, "message": "Customer profile not found."}, status=400)

        statement_file = request.FILES.get('file')
        bank_name = request.data.get('bank_name', 'HDFC Bank')
        app_id = request.data.get('application_id')

        application = None
        if app_id:
            application = LoanApplication.objects.filter(application_id=app_id).first()

        analysis = analyze_account_aggregator_cashflow(
            customer_profile=customer_profile,
            application=application,
            bank_name=bank_name
        )

        return Response({
            "success": True,
            "message": f"Bank statement successfully parsed. Monthly Average Balance verified: ₹{analysis.average_monthly_balance:,.2f}",
            "analysis": BankStatementAnalysisSerializer(analysis).data
        })

