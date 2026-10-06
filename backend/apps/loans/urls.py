from django.urls import path
from .views import (
    LoanProductListCreateView,
    LoanProductDetailView,
    LoanApplicationEligibilityCheckView,
    LoanApplicationListCreateView,
    LoanApplicationDetailView,
    LoanApplicationReviewActionView,
    LoanApplicationApprovalActionView,
    LoanDisbursementActionView,
    LoanListView,
    LoanDetailView,
    ApprovalMatrixConfigListView,
    SanctionLetterView,
    ESignSanctionLetterView
)

urlpatterns = [
    # Products
    path('products/', LoanProductListCreateView.as_view(), name='loan-product-list-create'),
    path('products/<int:pk>/', LoanProductDetailView.as_view(), name='loan-product-detail'),
    
    # Eligibility Engine
    path('applications/check-eligibility/', LoanApplicationEligibilityCheckView.as_view(), name='check-eligibility'),

    # Applications
    path('applications/', LoanApplicationListCreateView.as_view(), name='loan-application-list-create'),
    path('applications/<str:application_id>/', LoanApplicationDetailView.as_view(), name='loan-application-detail'),
    path('applications/<str:application_id>/review/', LoanApplicationReviewActionView.as_view(), name='loan-application-review'),
    path('applications/<str:application_id>/approve/', LoanApplicationApprovalActionView.as_view(), name='loan-application-approve'),
    path('applications/<str:application_id>/disburse/', LoanDisbursementActionView.as_view(), name='loan-application-disburse'),
    path('applications/<str:application_id>/sanction-letter/', SanctionLetterView.as_view(), name='loan-application-sanction-letter'),
    path('applications/<str:application_id>/esign/', ESignSanctionLetterView.as_view(), name='loan-application-esign'),

    # Active Loans
    path('', LoanListView.as_view(), name='loan-list'),
    path('<str:loan_id>/', LoanDetailView.as_view(), name='loan-detail'),

    # Admin Approval Matrix Config
    path('config/approval-matrix/', ApprovalMatrixConfigListView.as_view(), name='approval-matrix-list'),
    path('approval-matrix/', ApprovalMatrixConfigListView.as_view(), name='approval-matrix-list-alias'),
]
