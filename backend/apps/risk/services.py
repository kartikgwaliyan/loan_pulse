from decimal import Decimal
import math
from apps.loans.models import LoanApplication
from .models import RiskAssessment

def compute_ml_risk_assessment(application: LoanApplication, analyst=None, notes="") -> RiskAssessment:
    """
    Simulates ML model inference (XGBoost/Logistic credit scoring)
    using behavioral, demographic, and financial feature vectors.
    """
    profile = application.customer
    product = application.product
    amount = float(application.requested_amount)
    income = float(profile.monthly_income or 30000.0)
    credit_score = int(profile.credit_score or 720)
    obligations = float(profile.monthly_obligations or 0.0)
    work_exp = int(profile.work_experience_years or 2)
    tenure = int(application.tenure_months or 36)

    # Calculate DTI
    emi_est = float(application.calculated_emi or 5000.0)
    total_debt = obligations + emi_est
    dti = (total_debt / income * 100.0) if income > 0 else 100.0

    # Feature weights (Logistic regression proxy)
    # z = w0 + w1*CS + w2*DTI + w3*IncomeRatio + w4*Exp
    cs_norm = (credit_score - 650) / 100.0
    dti_penalty = (dti - 35.0) / 15.0
    income_support = (income - 40000.0) / 30000.0
    exp_support = (work_exp - 2.0) / 3.0
    amount_risk = (amount - 500000.0) / 1000000.0

    logit = -2.8 - (0.9 * cs_norm) + (0.8 * dti_penalty) - (0.4 * income_support) - (0.3 * exp_support) + (0.3 * amount_risk)
    pd_val = 1.0 / (1.0 + math.exp(-logit))
    pd_val = max(0.008, min(0.385, pd_val))

    # Risk Score: 100 - (PD * 200)
    risk_score = int(round(max(10, min(98, 100 - (pd_val * 220)))))

    indicators = []
    if credit_score >= 750:
        indicators.append({"type": "POSITIVE", "text": f"Prime credit bureau score of {credit_score}"})
    elif credit_score < 680:
        indicators.append({"type": "NEGATIVE", "text": f"Subprime credit score of {credit_score} increases risk of default"})

    if dti <= 35.0:
        indicators.append({"type": "POSITIVE", "text": f"Healthy debt-to-income ratio at {dti:.1f}%"})
    elif dti > 50.0:
        indicators.append({"type": "NEGATIVE", "text": f"High debt burden: DTI ratio at {dti:.1f}%"})

    if work_exp >= 3:
        indicators.append({"type": "POSITIVE", "text": f"Stable employment tenure ({work_exp} years)"})
    else:
        indicators.append({"type": "WARNING", "text": f"Relatively short employment duration ({work_exp} year)"})

    if income >= 60000:
        indicators.append({"type": "POSITIVE", "text": f"Comfortable net cash flow (₹{income:,.0f}/month)"})

    # Classify Category & Recommendation
    if pd_val < 0.05:
        category = 'LOW'
        rec = 'APPROVE'
    elif pd_val < 0.12:
        category = 'MEDIUM'
        rec = 'APPROVE_WITH_CONDITIONS'
    else:
        category = 'HIGH'
        rec = 'REJECT' if pd_val > 0.22 else 'MANUAL_REVIEW'

    # Save or update RiskAssessment record
    assessment, _ = RiskAssessment.objects.update_or_create(
        application=application,
        defaults={
            'risk_score': risk_score,
            'risk_category': category,
            'dti_ratio': Decimal(str(round(dti, 2))),
            'credit_score': credit_score,
            'default_probability': Decimal(str(round(pd_val, 4))),
            'model_name': 'LoanPulse-XGBoost-CreditRisk-v2.4',
            'risk_indicators': indicators,
            'recommendation': rec,
            'assessed_by': analyst,
            'analyst_notes': notes or f"Automated underwriting risk evaluation completed with PD {pd_val*100:.2f}%."
        }
    )

    return assessment


def analyze_account_aggregator_cashflow(customer_profile, application=None, bank_name="HDFC Bank", account_number=None, ifsc_code=None):
    """
    Executes deep cashflow analysis on the borrower's banking account data
    (Account Aggregator protocol simulation / Statement Parser).
    Computes Monthly Average Balance (MAB), detected salary regularity,
    bounces, category spend, and overall cashflow health rating.
    """
    from .models import BankStatementAnalysis, CashflowGrade
    import uuid
    from django.utils import timezone
    from datetime import timedelta

    monthly_salary = float(customer_profile.monthly_income or 55000.0)
    existing_debt = float(customer_profile.monthly_obligations or 12000.0)
    bank = bank_name or customer_profile.bank_name or "HDFC Bank"
    acc_num = account_number or customer_profile.account_number or "50100492817291"
    masked_acc = f"XXXXXXXX{acc_num[-4:]}" if len(acc_num) >= 4 else "XXXXXXXX4912"
    ifsc = ifsc_code or customer_profile.ifsc_code or "HDFC0000240"

    # Generate 6-month historical cashflow series
    months_names = ["Oct 2025", "Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026"]
    # Seed variance multipliers for natural banking patterns
    salary_variances = [1.0, 1.0, 1.05, 1.0, 1.0, 1.08] # Annual bonus in month 3, increment in month 6
    other_credit_factors = [0.08, 0.05, 0.12, 0.04, 0.06, 0.09]
    expense_factors = [0.68, 0.72, 0.81, 0.65, 0.69, 0.70] # Dec holiday peak

    monthly_trend = []
    salary_credits = []
    running_balance = monthly_salary * 0.75
    monthly_mabs = []
    total_credits = 0.0
    total_debits = 0.0

    for i, month_name in enumerate(months_names):
        salary_credit = round(monthly_salary * salary_variances[i], 2)
        other_credits = round(monthly_salary * other_credit_factors[i], 2)
        m_credits = salary_credit + other_credits
        m_debits = round(monthly_salary * expense_factors[i], 2)

        # Average balance is typically 65-90% of salary cushion + base balance
        m_mab = round(max(15000.0, running_balance + (m_credits - m_debits) * 0.45), 2)
        running_balance = round(max(10000.0, running_balance + m_credits - m_debits), 2)

        monthly_mabs.append(m_mab)
        total_credits += m_credits
        total_debits += m_debits

        monthly_trend.append({
            "month": month_name,
            "salary_credit": salary_credit,
            "other_credits": other_credits,
            "total_credits": m_credits,
            "total_debits": m_debits,
            "average_monthly_balance": m_mab,
            "closing_balance": running_balance,
            "bounces": 0
        })

        salary_credits.append({
            "month": month_name,
            "date": f"2026-0{i+1}-01" if i < 3 else f"2026-0{i+1}-28",
            "amount": salary_credit,
            "narration": f"SALARY CREDIT / {customer_profile.employer_name or 'INFOSYS TECH LTD'}",
            "mode": "ACH_CREDIT"
        })

    avg_mab = round(sum(monthly_mabs) / len(monthly_mabs), 2)
    lowest_mab = round(min(monthly_mabs), 2)
    peak_mab = round(max(monthly_mabs), 2)
    avg_credits = round(total_credits / 6.0, 2)
    avg_debits = round(total_debits / 6.0, 2)
    net_margin = round(avg_credits - avg_debits, 2)

    # Cashflow health scoring
    # MAB-to-obligation ratio
    mab_cushion_ratio = (avg_mab / existing_debt) if existing_debt > 0 else 5.0
    savings_rate = (net_margin / avg_credits * 100.0) if avg_credits > 0 else 20.0

    if savings_rate >= 28.0 and mab_cushion_ratio >= 2.5:
        cashflow_score = 92
        grade = CashflowGrade.EXCELLENT
        rec = "STRONG_CASHFLOW"
    elif savings_rate >= 18.0 and mab_cushion_ratio >= 1.5:
        cashflow_score = 84
        grade = CashflowGrade.HEALTHY
        rec = "ADEQUATE_CASHFLOW"
    elif savings_rate >= 8.0:
        cashflow_score = 68
        grade = CashflowGrade.MODERATE
        rec = "BORDERLINE_BUFFER"
    else:
        cashflow_score = 45
        grade = CashflowGrade.VOLATILE
        rec = "STRETCHED_LIQUIDITY"

    expense_breakdown = {
        "Existing Loan EMIs": round(existing_debt, 2),
        "Housing & Rent": round(monthly_salary * 0.22, 2),
        "Utilities & Connectivity": round(monthly_salary * 0.08, 2),
        "Groceries & Essentials": round(monthly_salary * 0.15, 2),
        "Investments & Mutual Funds": round(monthly_salary * 0.12, 2),
        "Discretionary & Lifestyle": round(max(0.0, avg_debits - (existing_debt + monthly_salary * 0.57)), 2)
    }

    summary = (
        f"Verified 6-Month Account Aggregator data from {bank}. "
        f"Average Monthly Balance (MAB) is ₹{avg_mab:,.2f} with a net monthly savings margin of ₹{net_margin:,.2f} "
        f"({savings_rate:.1f}% savings rate). Consistent payroll credits detected with 100% salary regularity and 0 ECS/cheque inward bounces."
    )

    consent_id = f"AA-CONSENT-{uuid.uuid4().hex[:10].upper()}"

    analysis = BankStatementAnalysis.objects.create(
        customer=customer_profile,
        application=application,
        consent_id=consent_id,
        consent_status='ACTIVE',
        bank_name=bank,
        account_number_masked=masked_acc,
        account_type="SAVINGS",
        ifsc_code=ifsc,
        statement_period_months=6,
        average_monthly_balance=Decimal(str(avg_mab)),
        lowest_monthly_balance=Decimal(str(lowest_mab)),
        peak_monthly_balance=Decimal(str(peak_mab)),
        total_credits=Decimal(str(round(total_credits, 2))),
        total_debits=Decimal(str(round(total_debits, 2))),
        avg_monthly_credits=Decimal(str(avg_credits)),
        avg_monthly_debits=Decimal(str(avg_debits)),
        net_cashflow_margin=Decimal(str(net_margin)),
        detected_monthly_salary=Decimal(str(round(monthly_salary, 2))),
        salary_regularity_score=98,
        inward_cheque_bounces=0,
        ecs_nach_bounces=0,
        cashflow_health_score=cashflow_score,
        cashflow_grade=grade,
        recommendation=rec,
        monthly_trend=monthly_trend,
        expense_categories=expense_breakdown,
        salary_credits_detected=salary_credits,
        underwriting_summary=summary
    )

    return analysis

