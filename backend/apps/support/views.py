from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import SupportTicket, TicketMessage
from .serializers import SupportTicketSerializer, TicketMessageSerializer
from apps.audit.models import AuditLog

class SupportTicketListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SupportTicketSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'CUSTOMER':
            return SupportTicket.objects.filter(user=user).prefetch_related('messages')
        return SupportTicket.objects.all().prefetch_related('messages', 'user')

    def perform_create(self, serializer):
        ticket = serializer.save(user=self.request.user)
        AuditLog.log_action(
            user=self.request.user,
            action='CREATE_SUPPORT_TICKET',
            target_type='SUPPORT_TICKET',
            target_id=ticket.ticket_id,
            details={'subject': ticket.subject, 'category': ticket.category}
        )

class SupportTicketDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SupportTicketSerializer
    lookup_field = 'ticket_id'

    def get_queryset(self):
        user = self.request.user
        if user.role == 'CUSTOMER':
            return SupportTicket.objects.filter(user=user)
        return SupportTicket.objects.all()

class AddTicketMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, ticket_id):
        ticket = get_object_or_404(SupportTicket, ticket_id=ticket_id)
        msg_text = request.data.get('message')
        if not msg_text:
            return Response({"success": False, "message": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

        msg = TicketMessage.objects.create(
            ticket=ticket,
            sender=request.user,
            message=msg_text
        )

        # If employee replied, keep in progress; if customer replied and closed, re-open
        if request.user.role != 'CUSTOMER' and ticket.status == 'OPEN':
            ticket.status = 'IN_PROGRESS'
            ticket.save()

        return Response({
            "success": True,
            "message": "Message added.",
            "message_obj": TicketMessageSerializer(msg).data
        }, status=status.HTTP_201_CREATED)
