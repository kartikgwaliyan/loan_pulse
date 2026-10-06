from django.urls import path
from .views import OverdueAccountListView, OverdueAccountDetailView, RecordCollectionActivityView

urlpatterns = [
    path('overdue-accounts/', OverdueAccountListView.as_view(), name='overdue-accounts-list'),
    path('overdue-accounts/<int:pk>/', OverdueAccountDetailView.as_view(), name='overdue-account-detail'),
    path('overdue-accounts/<int:pk>/activity/', RecordCollectionActivityView.as_view(), name='record-collection-activity'),
]
