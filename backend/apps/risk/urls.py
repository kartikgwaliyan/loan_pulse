from django.urls import path
from .views import (
    RiskAssessmentListView,
    RiskAssessmentDetailView,
    TriggerRiskAssessmentView,
    AccountAggregatorConnectView,
    BankStatementAnalysisListView,
    BankStatementAnalysisDetailView,
    UploadBankStatementView
)

urlpatterns = [
    path('', RiskAssessmentListView.as_view(), name='risk-assessment-list'),
    path('<int:pk>/', RiskAssessmentDetailView.as_view(), name='risk-assessment-detail'),
    path('evaluate/<str:application_id>/', TriggerRiskAssessmentView.as_view(), name='trigger-risk-assessment'),
    path('account-aggregator/connect/', AccountAggregatorConnectView.as_view(), name='aa-connect'),
    path('account-aggregator/analyses/', BankStatementAnalysisListView.as_view(), name='bank-statement-analyses'),
    path('account-aggregator/analyses/<int:pk>/', BankStatementAnalysisDetailView.as_view(), name='bank-statement-detail'),
    path('account-aggregator/upload-statement/', UploadBankStatementView.as_view(), name='upload-bank-statement'),
]

