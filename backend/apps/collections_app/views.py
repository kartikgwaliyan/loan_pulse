from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import OverdueAccount, CollectionActivity
from .serializers import OverdueAccountSerializer, CollectionActivitySerializer
from apps.authentication.permissions import IsCollectionOfficer, IsEmployeeOrAdmin
from apps.audit.models import AuditLog

class OverdueAccountListView(generics.ListAPIView):
    permission_classes = [IsEmployeeOrAdmin]
    serializer_class = OverdueAccountSerializer
    filterset_fields = ['dpd_bracket', 'status']

    def get_queryset(self):
        user = self.request.user
        queryset = OverdueAccount.objects.all().select_related(
            'loan', 'loan__product', 'loan__customer', 'loan__customer__user', 'assigned_officer'
        ).prefetch_related('activities')
        
        # If collection officer, show assigned or all
        if user.role == 'COLLECTION_OFFICER':
            assigned_only = self.request.query_params.get('assigned_only')
            if assigned_only == 'true':
                queryset = queryset.filter(assigned_officer=user)

        return queryset

class OverdueAccountDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsEmployeeOrAdmin]
    serializer_class = OverdueAccountSerializer
    queryset = OverdueAccount.objects.all()

class RecordCollectionActivityView(APIView):
    permission_classes = [IsEmployeeOrAdmin]

    def post(self, request, pk):
        account = get_object_or_404(OverdueAccount, pk=pk)
        contact_type = request.data.get('contact_type', 'CALL')
        response_text = request.data.get('customer_response', '')
        notes = request.data.get('notes', '')
        followup_date = request.data.get('followup_date')
        new_status = request.data.get('status')

        activity = CollectionActivity.objects.create(
            overdue_account=account,
            officer=request.user,
            contact_type=contact_type,
            customer_response=response_text,
            notes=notes,
            followup_date=followup_date
        )

        account.last_contact_date = timezone.now().date()
        if followup_date:
            account.next_followup_date = followup_date
        if new_status:
            account.status = new_status
        account.save()

        AuditLog.log_action(
            user=request.user,
            action='RECORD_COLLECTION_ACTIVITY',
            target_type='COLLECTIONS',
            target_id=str(account.id),
            details={
                'loan_id': account.loan.loan_id,
                'contact_type': contact_type,
                'status': account.status
            }
        )

        return Response({
            "success": True,
            "message": "Collection activity recorded successfully.",
            "activity": CollectionActivitySerializer(activity).data,
            "updated_account": OverdueAccountSerializer(account).data
        }, status=status.HTTP_201_CREATED)
