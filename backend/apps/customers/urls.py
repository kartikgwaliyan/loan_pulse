from django.urls import path
from .views import CustomerMyProfileView, CustomerListView, CustomerDetailView

urlpatterns = [
    path('me/', CustomerMyProfileView.as_view(), name='customer-me'),
    path('', CustomerListView.as_view(), name='customer-list'),
    path('<str:customer_id>/', CustomerDetailView.as_view(), name='customer-detail'),
]
