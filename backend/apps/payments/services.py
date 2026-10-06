from decimal import Decimal
from datetime import date, timedelta
import calendar
from .models import EMISchedule, PaymentTransaction
from apps.loans.models import Loan
from apps.notifications.models import Notification
from apps.audit.models import AuditLog

def add_months(sourcedate: date, months: int) -> date:
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)

def generate_amortization_schedule(loan: Loan):
    """
    Builds the complete monthly amortization schedule for a disbursed loan.
    """
    EMISchedule.objects.filter(loan=loan).delete()
    
    P = float(loan.sanctioned_amount)
    annual_rate = float(loan.interest_rate)
    r = (annual_rate / 12) / 100.0 if annual_rate > 0 else 0
    emi_val = float(loan.monthly_emi)
    n = loan.tenure_months

    current_balance = P
    start_date = loan.first_emi_date or date.today()
    schedules = []

    for i in range(1, n + 1):
        due_date = add_months(start_date, i - 1)
        interest = current_balance * r
        principal = emi_val - interest

        # Last installment adjustments to ensure exact zero balance
        if i == n or principal > current_balance:
            principal = current_balance
            emi_val = principal + interest
            new_balance = 0.0
        else:
            new_balance = current_balance - principal

        # Determine initial status
        status = 'UPCOMING'
        if i == 1:
            status = 'DUE'

        schedule = EMISchedule(
            loan=loan,
            installment_number=i,
            due_date=due_date,
            principal_amount=Decimal(str(round(principal, 2))),
            interest_amount=Decimal(str(round(interest, 2))),
            emi_amount=Decimal(str(round(emi_val, 2))),
            remaining_balance=Decimal(str(round(max(0.0, new_balance), 2))),
            status=status
        )
        schedules.append(schedule)
        current_balance = new_balance

    EMISchedule.objects.bulk_create(schedules)
    return schedules

def process_emi_payment(loan: Loan, emi: EMISchedule, amount: Decimal, payment_method: str, user=None):
    """
    Processes an EMI payment, records the transaction, updates loan & EMI records.
    """
    txn = PaymentTransaction.objects.create(
        loan=loan,
        emi=emi,
        amount=amount,
        payment_method=payment_method,
        status='SUCCESS',
        gateway_transaction_id=f"MOCK_GW_{date.today().strftime('%Y%m%d')}_{loan.id}"
    )

    # Mark EMI as paid
    emi.status = 'PAID'
    emi.paid_date = date.today()
    emi.payment_reference = txn.transaction_id
    emi.save()

    # Update Loan totals
    loan.outstanding_principal = max(Decimal('0.00'), loan.outstanding_principal - emi.principal_amount)
    loan.total_paid = loan.total_paid + amount
    
    # Check if all EMIs are paid
    unpaid_count = EMISchedule.objects.filter(loan=loan).exclude(status='PAID').count()
    if unpaid_count == 0:
        loan.status = 'CLOSED'
        loan.outstanding_principal = Decimal('0.00')

    loan.save()

    # Notify customer
    Notification.objects.create(
        user=loan.customer.user,
        title="Payment Successful",
        message=f"Received payment of ₹{amount:,.2f} for EMI #{emi.installment_number} on Loan {loan.loan_id}. Transaction ID: {txn.transaction_id}",
        notification_type='PAYMENT'
    )

    # Audit log
    AuditLog.log_action(
        user=user or loan.customer.user,
        action='EMI_PAYMENT_PROCESSED',
        target_type='PAYMENT_TRANSACTION',
        target_id=txn.transaction_id,
        details={
            'loan_id': loan.loan_id,
            'emi_number': emi.installment_number,
            'amount': str(amount),
            'method': payment_method
        }
    )

    return txn
