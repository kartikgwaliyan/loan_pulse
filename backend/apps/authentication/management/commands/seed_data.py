from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal
import uuid

from apps.customers.models import CustomerProfile
from apps.kyc.models import KYCDocument
from apps.loans.models import (
    LoanProduct,
    ApprovalMatrixConfig,
    LoanApplication,
    LoanApplicationTimeline,
    Loan,
    Disbursement
)
from apps.loans.services import calculate_emi, evaluate_eligibility
from apps.payments.models import EMISchedule, PaymentTransaction
from apps.payments.services import generate_amortization_schedule, process_emi_payment
from apps.collections_app.models import OverdueAccount, CollectionActivity
from apps.risk.models import RiskAssessment
from apps.risk.services import compute_ml_risk_assessment
from apps.notifications.models import Notification
from apps.audit.models import AuditLog
from apps.support.models import SupportTicket, TicketMessage

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with realistic LoanPulse demo users, products, applications, loans, and audit trails'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Initializing LoanPulse Seed Script..."))

        # 1. Create Core Users
        users_data = [
            {'username': 'admin', 'email': 'admin@loanpulse.com', 'password': 'Password@123', 'role': 'ADMIN', 'first_name': 'Vikram', 'last_name': 'Mehta', 'phone': '+91 98765 00001'},
            {'username': 'officer', 'email': 'officer@loanpulse.com', 'password': 'Password@123', 'role': 'LOAN_OFFICER', 'first_name': 'Ananya', 'last_name': 'Iyer', 'phone': '+91 98765 00002'},
            {'username': 'analyst', 'email': 'analyst@loanpulse.com', 'password': 'Password@123', 'role': 'RISK_ANALYST', 'first_name': 'Rohan', 'last_name': 'Deshmukh', 'phone': '+91 98765 00003'},
            {'username': 'manager', 'email': 'manager@loanpulse.com', 'password': 'Password@123', 'role': 'MANAGER', 'first_name': 'Sanjay', 'last_name': 'Singhania', 'phone': '+91 98765 00004'},
            {'username': 'collection', 'email': 'collection@loanpulse.com', 'password': 'Password@123', 'role': 'COLLECTION_OFFICER', 'first_name': 'Kavita', 'last_name': 'Rao', 'phone': '+91 98765 00005'},
            {'username': 'customer', 'email': 'customer@loanpulse.com', 'password': 'Password@123', 'role': 'CUSTOMER', 'first_name': 'Rahul', 'last_name': 'Sharma', 'phone': '+91 98765 43210'},
            {'username': 'customer2', 'email': 'customer2@loanpulse.com', 'password': 'Password@123', 'role': 'CUSTOMER', 'first_name': 'Priya', 'last_name': 'Patel', 'phone': '+91 98765 43211'},
            {'username': 'customer3', 'email': 'customer3@loanpulse.com', 'password': 'Password@123', 'role': 'CUSTOMER', 'first_name': 'Amit', 'last_name': 'Verma', 'phone': '+91 98765 43212'},
        ]

        users_dict = {}
        for u in users_data:
            user = User.objects.filter(username=u['username']).first()
            if not user:
                user = User.objects.create_user(
                    username=u['username'],
                    email=u['email'],
                    password=u['password'],
                    first_name=u['first_name'],
                    last_name=u['last_name'],
                    phone=u['phone'],
                    role=u['role'],
                    is_verified=True
                )
                self.stdout.write(self.style.SUCCESS(f"Created user: {u['username']} ({u['role']})"))
            else:
                user.role = u['role']
                user.set_password(u['password'])
                user.save()
            users_dict[u['username']] = user

        # 2. Setup Customer Profiles
        cust1_profile, _ = CustomerProfile.objects.get_or_create(user=users_dict['customer'])
        cust1_profile.date_of_birth = date(1992, 5, 14)
        cust1_profile.gender = 'Male'
        cust1_profile.pan_number = 'ABCPS1234F'
        cust1_profile.aadhaar_number = '987654321098'
        cust1_profile.marital_status = 'Married'
        cust1_profile.address_line1 = 'Flat 402, Skyline Residency, Bandra West'
        cust1_profile.city = 'Mumbai'
        cust1_profile.state = 'Maharashtra'
        cust1_profile.pincode = '400050'
        cust1_profile.employment_type = 'SALARIED'
        cust1_profile.employer_name = 'Infosys Technologies Ltd'
        cust1_profile.designation = 'Senior Software Architect'
        cust1_profile.monthly_income = Decimal('125000.00')
        cust1_profile.annual_income = Decimal('1500000.00')
        cust1_profile.work_experience_years = 6
        cust1_profile.existing_loans_count = 1
        cust1_profile.monthly_obligations = Decimal('18000.00')
        cust1_profile.bank_name = 'HDFC Bank'
        cust1_profile.account_number = '5010049281726'
        cust1_profile.ifsc_code = 'HDFC0000123'
        cust1_profile.credit_score = 785
        cust1_profile.onboarding_completed = True
        cust1_profile.save()

        cust2_profile, _ = CustomerProfile.objects.get_or_create(user=users_dict['customer2'])
        cust2_profile.date_of_birth = date(1989, 8, 22)
        cust2_profile.gender = 'Female'
        cust2_profile.pan_number = 'BKRPP4567M'
        cust2_profile.aadhaar_number = '876543210987'
        cust2_profile.marital_status = 'Single'
        cust2_profile.address_line1 = 'B-12, Indiranagar 100ft Road'
        cust2_profile.city = 'Bengaluru'
        cust2_profile.state = 'Karnataka'
        cust2_profile.pincode = '560038'
        cust2_profile.employment_type = 'SELF_EMPLOYED'
        cust2_profile.employer_name = 'Patel Legal & Advisory'
        cust2_profile.designation = 'Managing Partner'
        cust2_profile.monthly_income = Decimal('210000.00')
        cust2_profile.annual_income = Decimal('2520000.00')
        cust2_profile.work_experience_years = 9
        cust2_profile.existing_loans_count = 0
        cust2_profile.monthly_obligations = Decimal('0.00')
        cust2_profile.bank_name = 'ICICI Bank'
        cust2_profile.account_number = '001205009871'
        cust2_profile.ifsc_code = 'ICIC0000012'
        cust2_profile.credit_score = 815
        cust2_profile.onboarding_completed = True
        cust2_profile.save()

        cust3_profile, _ = CustomerProfile.objects.get_or_create(user=users_dict['customer3'])
        cust3_profile.date_of_birth = date(1995, 11, 3)
        cust3_profile.gender = 'Male'
        cust3_profile.pan_number = 'XYZPV8901K'
        cust3_profile.aadhaar_number = '765432109876'
        cust3_profile.marital_status = 'Single'
        cust3_profile.address_line1 = '15/2, Salt Lake Sector V'
        cust3_profile.city = 'Kolkata'
        cust3_profile.state = 'West Bengal'
        cust3_profile.pincode = '700091'
        cust3_profile.employment_type = 'SALARIED'
        cust3_profile.employer_name = 'Wipro Digital'
        cust3_profile.designation = 'QA Lead'
        cust3_profile.monthly_income = Decimal('48000.00')
        cust3_profile.annual_income = Decimal('576000.00')
        cust3_profile.work_experience_years = 3
        cust3_profile.existing_loans_count = 2
        cust3_profile.monthly_obligations = Decimal('24000.00')
        cust3_profile.bank_name = 'State Bank of India'
        cust3_profile.account_number = '30981273645'
        cust3_profile.ifsc_code = 'SBIN0001823'
        cust3_profile.credit_score = 635
        cust3_profile.onboarding_completed = True
        cust3_profile.save()

        # 3. Create Loan Products
        products_data = [
            {
                'code': 'PERS',
                'name': 'Personal Loan',
                'description': 'Instant, collateral-free credit for emergency, travel, medical or wedding expenses.',
                'min_amount': Decimal('50000.00'),
                'max_amount': Decimal('2500000.00'),
                'interest_rate_min': Decimal('10.50'),
                'interest_rate_max': Decimal('16.50'),
                'min_tenure_months': 12,
                'max_tenure_months': 60,
                'processing_fee_percent': Decimal('1.50'),
                'late_fee_percent': Decimal('2.00'),
                'eligibility_min_income': Decimal('25000.00'),
                'eligibility_min_credit_score': 650,
                'max_dti_ratio': Decimal('50.00'),
                'required_docs': ['PAN', 'AADHAAR', 'SALARY_SLIP', 'BANK_STATEMENT']
            },
            {
                'code': 'HOME',
                'name': 'Home Loan',
                'description': 'Attractive rates and flexible long-term tenure for purchasing or constructing your dream home.',
                'min_amount': Decimal('500000.00'),
                'max_amount': Decimal('50000000.00'),
                'interest_rate_min': Decimal('8.25'),
                'interest_rate_max': Decimal('10.50'),
                'min_tenure_months': 60,
                'max_tenure_months': 360,
                'processing_fee_percent': Decimal('0.50'),
                'late_fee_percent': Decimal('1.50'),
                'eligibility_min_income': Decimal('50000.00'),
                'eligibility_min_credit_score': 700,
                'max_dti_ratio': Decimal('55.00'),
                'required_docs': ['PAN', 'AADHAAR', 'SALARY_SLIP', 'BANK_STATEMENT', 'ADDRESS_PROOF']
            },
            {
                'code': 'AUTO',
                'name': 'Vehicle Loan',
                'description': 'Fast-track financing for brand new 4-wheelers, electric vehicles, and commercial fleets.',
                'min_amount': Decimal('100000.00'),
                'max_amount': Decimal('5000000.00'),
                'interest_rate_min': Decimal('8.75'),
                'interest_rate_max': Decimal('13.00'),
                'min_tenure_months': 12,
                'max_tenure_months': 84,
                'processing_fee_percent': Decimal('1.00'),
                'late_fee_percent': Decimal('2.00'),
                'eligibility_min_income': Decimal('30000.00'),
                'eligibility_min_credit_score': 675,
                'max_dti_ratio': Decimal('50.00'),
                'required_docs': ['PAN', 'AADHAAR', 'SALARY_SLIP', 'BANK_STATEMENT']
            },
            {
                'code': 'EDUC',
                'name': 'Education Loan',
                'description': 'Comprehensive student financing for premier domestic and international higher education.',
                'min_amount': Decimal('100000.00'),
                'max_amount': Decimal('7500000.00'),
                'interest_rate_min': Decimal('9.00'),
                'interest_rate_max': Decimal('12.50'),
                'min_tenure_months': 24,
                'max_tenure_months': 120,
                'processing_fee_percent': Decimal('1.00'),
                'late_fee_percent': Decimal('1.50'),
                'eligibility_min_income': Decimal('35000.00'),
                'eligibility_min_credit_score': 650,
                'max_dti_ratio': Decimal('50.00'),
                'required_docs': ['PAN', 'AADHAAR', 'EMPLOYMENT_PROOF', 'BANK_STATEMENT']
            }
        ]

        products_dict = {}
        for p in products_data:
            prod, _ = LoanProduct.objects.update_or_create(code=p['code'], defaults=p)
            products_dict[p['code']] = prod
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(products_dict)} loan products."))

        # 4. Create Approval Matrix
        ApprovalMatrixConfig.objects.get_or_create(
            name='Tier 1 - Loan Officer Authority',
            defaults={'min_amount': Decimal('0.00'), 'max_amount': Decimal('500000.00'), 'required_role': 'LOAN_OFFICER'}
        )
        ApprovalMatrixConfig.objects.get_or_create(
            name='Tier 2 - Credit Manager Authority',
            defaults={'min_amount': Decimal('500000.01'), 'max_amount': Decimal('2000000.00'), 'required_role': 'MANAGER'}
        )
        ApprovalMatrixConfig.objects.get_or_create(
            name='Tier 3 - Senior Credit Authority / Admin',
            defaults={'min_amount': Decimal('2000000.01'), 'max_amount': Decimal('100000000.00'), 'required_role': 'ADMIN'}
        )

        # 5. Seed KYC Documents for Rahul Sharma
        kyc_docs_meta = [
            ('PAN', 'PAN Card', 'ABCPS1234F'),
            ('AADHAAR', 'Aadhaar Card', '9876-5432-1098'),
            ('SALARY_SLIP', 'Salary Slip - Aug 2026', 'SLIP-AUG-26'),
            ('BANK_STATEMENT', 'HDFC Bank 6M Statement', 'STMT-HDFC-982')
        ]
        for dtype, name, dnum in kyc_docs_meta:
            KYCDocument.objects.get_or_create(
                customer=cust1_profile,
                document_type=dtype,
                defaults={
                    'document_number': dnum,
                    'file_name': f"{dtype.lower()}_verified.pdf",
                    'file_size': 245000,
                    'mime_type': 'application/pdf',
                    'status': 'VERIFIED',
                    'verified_by': users_dict['officer'],
                    'verified_at': timezone.now() - timedelta(days=5),
                    'remarks': 'Document inspected and verified against bureau registry.'
                }
            )

        # 6. Seed Loan Application 1: Rahul Sharma -> Active & Disbursed
        app1, _ = LoanApplication.objects.get_or_create(
            application_id='LP-2026-000101',
            defaults={
                'customer': cust1_profile,
                'product': products_dict['PERS'],
                'requested_amount': Decimal('500000.00'),
                'tenure_months': 36,
                'purpose': 'Home renovation and modular kitchen interior works',
                'status': 'DISBURSED',
                'eligibility_status': 'ELIGIBLE',
                'eligibility_score': 88,
                'eligibility_reason': 'Superb credit score (785) with healthy DTI ratio.',
                'dti_ratio': Decimal('32.40'),
                'calculated_emi': Decimal('16607.00'),
                'assigned_officer': users_dict['officer'],
                'approved_by': users_dict['manager'],
                'sanction_date': date.today() - timedelta(days=90)
            }
        )

        LoanApplicationTimeline.objects.get_or_create(
            application=app1,
            stage='Application Submitted',
            defaults={'status': 'SUBMITTED', 'performed_by': users_dict['customer'], 'remarks': 'Digital application initiated.'}
        )
        LoanApplicationTimeline.objects.get_or_create(
            application=app1,
            stage='Risk Assessment',
            defaults={'status': 'RISK_ASSESSMENT', 'performed_by': users_dict['analyst'], 'remarks': 'Underwriting model evaluated: Low risk category.'}
        )
        LoanApplicationTimeline.objects.get_or_create(
            application=app1,
            stage='Manager Sanction',
            defaults={'status': 'APPROVED', 'performed_by': users_dict['manager'], 'remarks': 'Sanctioned under Credit Manager Tier 2 authority.'}
        )

        # Active Loan for App 1
        loan1, _ = Loan.objects.get_or_create(
            loan_id='LN-2026-00042',
            defaults={
                'application': app1,
                'customer': cust1_profile,
                'product': products_dict['PERS'],
                'sanctioned_amount': Decimal('500000.00'),
                'interest_rate': Decimal('12.00'),
                'tenure_months': 36,
                'monthly_emi': Decimal('16607.15'),
                'total_interest': Decimal('97857.40'),
                'total_payable': Decimal('597857.40'),
                'outstanding_principal': Decimal('470200.00'),
                'total_paid': Decimal('33214.30'),
                'disbursement_date': date.today() - timedelta(days=60),
                'first_emi_date': date.today() - timedelta(days=30),
                'maturity_date': date.today() + timedelta(days=34 * 30),
                'status': 'ACTIVE'
            }
        )

        # Disbursement record for Loan 1
        Disbursement.objects.get_or_create(
            disbursement_id='DISB-2026-00010',
            defaults={
                'loan': loan1,
                'amount': Decimal('500000.00'),
                'bank_name': cust1_profile.bank_name,
                'account_number': cust1_profile.account_number,
                'ifsc_code': cust1_profile.ifsc_code,
                'transaction_reference': 'UTR20260715HDFC99812',
                'status': 'SUCCESS',
                'disbursed_by': users_dict['manager'],
                'remarks': 'Fund disbursement executed successfully via RTGS gateway.'
            }
        )

        # Generate Amortization & mark 2 EMIs as Paid
        generate_amortization_schedule(loan1)
        emis = EMISchedule.objects.filter(loan=loan1).order_by('installment_number')
        if emis.count() >= 2:
            process_emi_payment(loan1, emis[0], emis[0].emi_amount, 'UPI', users_dict['customer'])
            process_emi_payment(loan1, emis[1], emis[1].emi_amount, 'NET_BANKING', users_dict['customer'])

        # Compute ML Risk for App 1
        compute_ml_risk_assessment(app1, users_dict['analyst'], "Applicant exhibits prime repayment history and strong cash flow.")

        # 7. Seed Loan Application 2: Priya Patel -> Approved (Pending Disbursement)
        app2, _ = LoanApplication.objects.get_or_create(
            application_id='LP-2026-000102',
            defaults={
                'customer': cust2_profile,
                'product': products_dict['HOME'],
                'requested_amount': Decimal('3500000.00'),
                'tenure_months': 180,
                'purpose': 'Acquisition of residential apartment in Whitefield',
                'status': 'APPROVED',
                'eligibility_status': 'ELIGIBLE',
                'eligibility_score': 94,
                'eligibility_reason': 'Excellent credit score (815), zero existing obligations, strong partner income.',
                'dti_ratio': Decimal('22.10'),
                'calculated_emi': Decimal('34210.00'),
                'assigned_officer': users_dict['officer'],
                'approved_by': users_dict['admin'],
                'sanction_date': date.today() - timedelta(days=2)
            }
        )
        compute_ml_risk_assessment(app2, users_dict['analyst'], "Prime quality home loan applicant with significant asset backing.")

        # 8. Seed Loan Application 3: Amit Verma -> Under Risk Assessment / High Risk
        app3, _ = LoanApplication.objects.get_or_create(
            application_id='LP-2026-000103',
            defaults={
                'customer': cust3_profile,
                'product': products_dict['PERS'],
                'requested_amount': Decimal('400000.00'),
                'tenure_months': 24,
                'purpose': 'Debt consolidation',
                'status': 'RISK_ASSESSMENT',
                'eligibility_status': 'CONDITIONALLY_ELIGIBLE',
                'eligibility_score': 54,
                'eligibility_reason': 'CIBIL score is 635 (subprime) and DTI is elevated at 58%.',
                'dti_ratio': Decimal('58.20'),
                'calculated_emi': Decimal('18840.00'),
                'assigned_officer': users_dict['officer']
            }
        )
        compute_ml_risk_assessment(app3, users_dict['analyst'], "DTI exceeds policy ceiling. Requires co-signer or reduced principal.")

        # 9. Seed Delinquency / Overdue Account for testing Collections Module
        # Create an active loan that is past due
        app_overdue, _ = LoanApplication.objects.get_or_create(
            application_id='LP-2026-000099',
            defaults={
                'customer': cust3_profile,
                'product': products_dict['AUTO'],
                'requested_amount': Decimal('300000.00'),
                'tenure_months': 24,
                'purpose': 'Used commercial van',
                'status': 'DISBURSED',
                'eligibility_status': 'ELIGIBLE',
                'eligibility_score': 65,
                'eligibility_reason': 'Approved under legacy credit policy.',
                'dti_ratio': Decimal('42.00'),
                'calculated_emi': Decimal('14120.00'),
                'sanction_date': date.today() - timedelta(days=120)
            }
        )

        loan_overdue, _ = Loan.objects.get_or_create(
            loan_id='LN-2026-00019',
            defaults={
                'application': app_overdue,
                'customer': cust3_profile,
                'product': products_dict['AUTO'],
                'sanctioned_amount': Decimal('300000.00'),
                'interest_rate': Decimal('11.50'),
                'tenure_months': 24,
                'monthly_emi': Decimal('14120.00'),
                'total_interest': Decimal('38880.00'),
                'total_payable': Decimal('338880.00'),
                'outstanding_principal': Decimal('285000.00'),
                'total_paid': Decimal('14120.00'),
                'disbursement_date': date.today() - timedelta(days=120),
                'first_emi_date': date.today() - timedelta(days=90),
                'maturity_date': date.today() + timedelta(days=20 * 30),
                'status': 'ACTIVE'
            }
        )

        generate_amortization_schedule(loan_overdue)
        # Mark EMI 1 as paid, EMI 2 as overdue
        overdue_emis = EMISchedule.objects.filter(loan=loan_overdue).order_by('installment_number')
        if overdue_emis.count() >= 2:
            overdue_emis[0].status = 'PAID'
            overdue_emis[0].save()

            overdue_emis[1].status = 'OVERDUE'
            overdue_emis[1].late_fee = Decimal('500.00')
            overdue_emis[1].save()

        od_account, _ = OverdueAccount.objects.get_or_create(
            loan=loan_overdue,
            defaults={
                'overdue_amount': Decimal('14620.00'),
                'overdue_emis_count': 1,
                'days_past_due': 42,
                'dpd_bracket': '60_PLUS',
                'assigned_officer': users_dict['collection'],
                'status': 'CONTACTED',
                'last_contact_date': date.today() - timedelta(days=3),
                'next_followup_date': date.today() + timedelta(days=4)
            }
        )

        CollectionActivity.objects.get_or_create(
            overdue_account=od_account,
            officer=users_dict['collection'],
            contact_type='CALL',
            defaults={
                'customer_response': 'Promised payment by next Friday after salary credit',
                'notes': 'Spoke with Amit Verma. Acknowledged 42 DPD overdue status. Promised to clear installment #2 by 10th.',
                'followup_date': date.today() + timedelta(days=4)
            }
        )

        # 10. Seed Notifications
        Notification.objects.get_or_create(
            user=users_dict['customer'],
            title="Loan Pulse Active Sanction",
            defaults={
                'message': "Welcome to LoanPulse. Your personal loan account LN-2026-00042 is active and healthy.",
                'notification_type': 'LOAN_UPDATE',
                'is_read': False
            }
        )
        Notification.objects.get_or_create(
            user=users_dict['customer'],
            title="Upcoming EMI Due Alert",
            defaults={
                'message': "Your next monthly installment of ₹16,607.15 is due in 10 days.",
                'notification_type': 'EMI_REMINDER',
                'is_read': False
            }
        )

        # 11. Seed Support Ticket
        tkt, _ = SupportTicket.objects.get_or_create(
            ticket_id='TKT-2026-00012',
            defaults={
                'user': users_dict['customer'],
                'loan': loan1,
                'subject': 'Request for Interest Certificate & Amortization Statement',
                'description': 'Kindly provide the IT interest certificate for financial year tax filing purposes.',
                'category': 'ACCOUNT',
                'priority': 'MEDIUM',
                'status': 'OPEN'
            }
        )
        TicketMessage.objects.get_or_create(
            ticket=tkt,
            sender=users_dict['customer'],
            defaults={'message': 'Hello team, please share the FY 2025-26 interest certificate for tax deduction.'}
        )

        # 12. Seed System Audit Logs
        AuditLog.log_action(
            user=users_dict['admin'],
            action='SYSTEM_BOOTSTRAP',
            target_type='SYSTEM',
            target_id='INIT_2026',
            details={'status': 'All loan products, rules, and seed pipelines configured successfully.'}
        )

        self.stdout.write(self.style.SUCCESS("All LoanPulse seed data created successfully! Ready for live demonstration."))
