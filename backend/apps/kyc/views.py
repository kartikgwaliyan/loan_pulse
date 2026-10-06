from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import KYCDocument
from .serializers import KYCDocumentSerializer, KYCVerifySerializer
from apps.customers.models import CustomerProfile
from apps.authentication.permissions import IsLoanOfficer, IsEmployeeOrAdmin
from apps.audit.models import AuditLog

class KYCDocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = KYCDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'CUSTOMER':
            profile = getattr(user, 'customer_profile', None)
            if not profile:
                return KYCDocument.objects.none()
            return KYCDocument.objects.filter(customer=profile)
        # Employees/Admins can filter by customer or see all
        customer_id = self.request.query_params.get('customer_id')
        status_param = self.request.query_params.get('status')
        queryset = KYCDocument.objects.all().select_related('customer', 'customer__user', 'verified_by')
        if customer_id:
            queryset = queryset.filter(customer__customer_id=customer_id)
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'CUSTOMER':
            profile, _ = CustomerProfile.objects.get_or_create(user=user)
            doc = serializer.save(customer=profile, status='UNDER_REVIEW')
        else:
            doc = serializer.save(status='UNDER_REVIEW')

        AuditLog.log_action(
            user=user,
            action='UPLOAD_KYC_DOCUMENT',
            target_type='KYC_DOCUMENT',
            target_id=str(doc.id),
            ip_address=self.request.META.get('REMOTE_ADDR', '127.0.0.1'),
            details={'document_type': doc.document_type, 'file_name': doc.file_name}
        )

class KYCDocumentVerifyView(APIView):
    permission_classes = [IsLoanOfficer]

    def post(self, request, pk):
        doc = get_object_or_404(KYCDocument, pk=pk)
        serializer = KYCVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        remarks = serializer.validated_data.get('remarks', '')

        doc.status = new_status
        doc.remarks = remarks
        doc.verified_by = request.user
        doc.verified_at = timezone.now()
        doc.save()

        # Check if all KYC docs for this customer are verified
        customer_docs = KYCDocument.objects.filter(customer=doc.customer)
        if customer_docs.exists() and not customer_docs.exclude(status='VERIFIED').exists():
            doc.customer.user.is_verified = True
            doc.customer.user.save()

        AuditLog.log_action(
            user=request.user,
            action=f"KYC_DOCUMENT_{new_status}",
            target_type='KYC_DOCUMENT',
            target_id=str(doc.id),
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
            details={'customer_id': doc.customer.customer_id, 'remarks': remarks}
        )

        return Response({
            "success": True,
            "message": f"Document {doc.get_document_type_display()} marked as {new_status}.",
            "document": KYCDocumentSerializer(doc).data
        })
