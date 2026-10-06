from django.urls import path
from .views import ExecutiveDashboardStatsView, CustomerDashboardStatsView, ExportPortfolioReportView

urlpatterns = [
    path('dashboard/executive/', ExecutiveDashboardStatsView.as_view(), name='executive-dashboard-stats'),
    path('dashboard/customer/', CustomerDashboardStatsView.as_view(), name='customer-dashboard-stats'),
    path('export/portfolio/', ExportPortfolioReportView.as_view(), name='export-portfolio-report'),
]
