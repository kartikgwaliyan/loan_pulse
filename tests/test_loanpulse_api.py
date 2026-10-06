import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.core.management import call_command
from decimal import Decimal
from apps.loans.models import LoanProduct, LoanApplication, Loan
from apps.payments.models import EMISchedule
from apps.customers.models import CustomerProfile

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def setup_seed_data(db):
    """Runs seed_data in the pytest test database"""
    call_command('seed_data')

@pytest.fixture
def auth_tokens(setup_seed_data):
    """Returns JWT access tokens for different roles"""
    client = APIClient()
    
    # Login as admin
    resp_admin = client.post('/api/auth/login/', {'username': 'admin', 'password': 'Password@123'}, format='json')
    admin_token = resp_admin.data.get('access')

    # Login as loan officer
    resp_officer = client.post('/api/auth/login/', {'username': 'officer', 'password': 'Password@123'}, format='json')
    officer_token = resp_officer.data.get('access')

    # Login as manager
    resp_manager = client.post('/api/auth/login/', {'username': 'manager', 'password': 'Password@123'}, format='json')
    manager_token = resp_manager.data.get('access')

    # Login as customer
    resp_cust = client.post('/api/auth/login/', {'username': 'customer', 'password': 'Password@123'}, format='json')
    cust_token = resp_cust.data.get('access')

    return {
        'admin': admin_token,
        'officer': officer_token,
        'manager': manager_token,
        'customer': cust_token,
    }

@pytest.mark.django_db
def test_jwt_login_and_claims(auth_tokens):
    assert auth_tokens['admin'] is not None
    assert auth_tokens['customer'] is not None

@pytest.mark.django_db
def test_rbac_security_customer_cannot_view_all_applications(auth_tokens, api_client):
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {auth_tokens['customer']}")
    resp = api_client.get('/api/loans/applications/')
    assert resp.status_code == 200
    # Customer only sees applications belonging to their profile
    results = resp.data.get('results', resp.data) if isinstance(resp.data, dict) else resp.data
    for app in results:
        assert app['customer_details']['email'] == 'customer@loanpulse.com'

@pytest.mark.django_db
def test_eligibility_engine_calculation(auth_tokens, api_client):
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {auth_tokens['customer']}")
    prod = LoanProduct.objects.get(code='PERS')
    
    payload = {
        'product_id': prod.id,
        'requested_amount': 200000,
        'tenure_months': 24
    }
    resp = api_client.post('/api/loans/applications/check-eligibility/', payload, format='json')
    assert resp.status_code == 200
    assert resp.data['success'] is True
    assert 'status' in resp.data['result']
    assert resp.data['result']['status'] in ['ELIGIBLE', 'CONDITIONALLY_ELIGIBLE']
    assert float(resp.data['result']['calculated_emi']) > 0

@pytest.mark.django_db
def test_emi_payment_workflow(auth_tokens, api_client):
    # Fetch an unpaid EMI for customer's loan
    loan = Loan.objects.filter(customer__user__username='customer', status='ACTIVE').first()
    assert loan is not None
    
    unpaid_emi = EMISchedule.objects.filter(loan=loan, status__in=['DUE', 'UPCOMING']).first()
    assert unpaid_emi is not None

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {auth_tokens['customer']}")
    pay_payload = {
        'emi_id': unpaid_emi.id,
        'amount': float(unpaid_emi.emi_amount),
        'payment_method': 'UPI'
    }
    resp = api_client.post('/api/payments/pay/', pay_payload, format='json')
    assert resp.status_code == 201
    assert resp.data['success'] is True
    assert resp.data['transaction']['status'] == 'SUCCESS'

    # Verify EMI record updated
    unpaid_emi.refresh_from_db()
    assert unpaid_emi.status == 'PAID'
    assert unpaid_emi.payment_reference is not None

@pytest.mark.django_db
def test_executive_dashboard_reporting(auth_tokens, api_client):
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {auth_tokens['manager']}")
    resp = api_client.get('/api/reports/dashboard/executive/')
    assert resp.status_code == 200
    assert resp.data['success'] is True
    assert 'metrics' in resp.data
    assert resp.data['metrics']['total_customers'] >= 3
    assert resp.data['metrics']['total_disbursed'] > 0

@pytest.mark.django_db
def test_account_aggregator_cashflow_analysis(auth_tokens, api_client):
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {auth_tokens['customer']}")
    payload = {
        'bank_name': 'HDFC Bank',
        'account_number': '50100492817291'
    }
    resp = api_client.post('/api/risk/account-aggregator/connect/', payload, format='json')
    assert resp.status_code == 201
    assert resp.data['success'] is True
    analysis = resp.data['analysis']
    assert analysis['bank_name'] == 'HDFC Bank'
    assert float(analysis['average_monthly_balance']) > 0
    assert 0 <= analysis['cashflow_health_score'] <= 100
    assert len(analysis['monthly_trend']) == 6
    assert len(analysis['salary_credits_detected']) >= 1
    assert analysis['inward_cheque_bounces'] == 0

@pytest.mark.django_db
def test_create_customer_by_staff(auth_tokens, api_client):
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {auth_tokens['officer']}")
    payload = {
        'first_name': 'Aarav',
        'last_name': 'Mehta',
        'email': 'aarav.mehta.walkin@test.com',
        'phone': '9812345678',
        'pan_number': 'ABCDE9999F',
        'monthly_income': 85000,
        'employment_type': 'SALARIED',
        'credit_score': 770,
        'city': 'Bengaluru',
        'state': 'Karnataka'
    }
    resp = api_client.post('/api/customers/', payload, format='json')
    assert resp.status_code == 201
    assert resp.data['success'] is True
    assert 'LP-CUST-' in resp.data['profile']['customer_id']
    assert resp.data['profile']['email'] == 'aarav.mehta.walkin@test.com'
    assert resp.data['profile']['credit_score'] == 770


