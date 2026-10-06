from django.urls import path
from .views import KYCDocumentListCreateView, KYCDocumentVerifyView

urlpatterns = [
    path('documents/', KYCDocumentListCreateView.as_view(), name='kyc-document-list-create'),
    path('documents/<int:pk>/verify/', KYCDocumentVerifyView.as_view(), name='kyc-document-verify'),
]
