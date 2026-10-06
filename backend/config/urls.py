"""
URL configuration for LoanPulse platform.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView
)

from config.views import HealthCheckDiagnosticsView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', HealthCheckDiagnosticsView.as_view(), name='health-check'),

    # Core LoanPulse APIs
    path('api/auth/', include('apps.authentication.urls')),
    path('api/customers/', include('apps.customers.urls')),
    path('api/kyc/', include('apps.kyc.urls')),
    path('api/loans/', include('apps.loans.urls')),
    path('api/risk/', include('apps.risk.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/collections/', include('apps.collections_app.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/audit/', include('apps.audit.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/support/', include('apps.support.urls')),

    # OpenAPI 3.0 & Swagger Interactive Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
