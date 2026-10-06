from django.urls import path
from .views import (
    EMIScheduleListView,
    ProcessPaymentView,
    PaymentTransactionListView,
    RegisterMandateView,
    MandateListView
)

urlpatterns = [
    path('emi-schedules/', EMIScheduleListView.as_view(), name='emi-schedules-list'),
    path('pay/', ProcessPaymentView.as_view(), name='process-payment'),
    path('transactions/', PaymentTransactionListView.as_view(), name='payment-transactions-list'),
    path('mandates/register/', RegisterMandateView.as_view(), name='register-mandate'),
    path('mandates/', MandateListView.as_view(), name='mandates-list'),
]
