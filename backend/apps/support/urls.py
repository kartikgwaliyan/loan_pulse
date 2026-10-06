from django.urls import path
from .views import SupportTicketListCreateView, SupportTicketDetailView, AddTicketMessageView

urlpatterns = [
    path('tickets/', SupportTicketListCreateView.as_view(), name='support-ticket-list-create'),
    path('tickets/<str:ticket_id>/', SupportTicketDetailView.as_view(), name='support-ticket-detail'),
    path('tickets/<str:ticket_id>/reply/', AddTicketMessageView.as_view(), name='support-ticket-reply'),
]
