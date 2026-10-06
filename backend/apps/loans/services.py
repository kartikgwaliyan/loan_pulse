from decimal import Decimal, ROUND_HALF_UP
import math

def calculate_emi(principal: Decimal, annual_interest_rate: Decimal, tenure_months: int) -> dict:
    """
    Computes monthly EMI, total interest, and total payable amount
    using standard amortization formula: E = P * r * (1+r)^n / ((1+r)^n - 1)
    """
    P = float(principal)
    annual_rate = float(annual_interest_rate)
    n = int(tenure_months)

    if n <= 0:
        return {"emi": Decimal('0.00'), "total_interest": Decimal('0.00'), "total_payable": Decimal('0.00')}

    if annual_rate <= 0:
        emi_val = P / n
        return {
            "emi": Decimal(str(round(emi_val, 2))),
            "total_interest": Decimal('0.00'),
            "total_payable": Decimal(str(round(P, 2)))
        }

    r = (annual_rate / 12) / 100.0
    factor = math.pow(1 + r, n)
    emi_val = P * r * factor / (factor - 1)
    total_payable_val = emi_val * n
    total_interest_val = total_payable_val - P

    return {
        "emi": Decimal(str(round(emi_val, 2))),
        "total_interest": Decimal(str(round(total_interest_val, 2))),
        "total_payable": Decimal(str(round(total_payable_val, 2)))
    }

def evaluate_eligibility(profile, product, requested_amount: Decimal, tenure_months: int) -> dict:
    """
    Evaluates applicant against credit policy rules, computing DTI, score, and decision.
    """
    amount = float(requested_amount)
    tenure = int(tenure_months)
    monthly_income = float(profile.monthly_income or 0.0)
    existing_obligations = float(profile.monthly_obligations or 0.0)
    credit_score = int(profile.credit_score or 700)

    # Calculate average interest rate for estimation
    avg_interest = (product.interest_rate_min + product.interest_rate_max) / 2
    emi_calc = calculate_emi(Decimal(str(amount)), avg_interest, tenure)
    estimated_emi = float(emi_calc["emi"])

    # DTI Ratio
    total_obligation = existing_obligations + estimated_emi
    dti_ratio = (total_obligation / monthly_income * 100.0) if monthly_income > 0 else 100.0

    score = 100
    reasons = []

    # 1. Income Check
    min_income = float(product.eligibility_min_income)
    if monthly_income < min_income:
        diff = min_income - monthly_income
        score -= 40
        reasons.append(f"Income ₹{monthly_income:,.0f} is below minimum threshold of ₹{min_income:,.0f} (Code: E001)")

    # 2. Credit Score Check
    min_score = product.eligibility_min_credit_score
    if credit_score < min_score:
        score -= 35
        reasons.append(f"Credit score {credit_score} is below product threshold of {min_score} (Code: E002)")
    elif credit_score < 720:
        score -= 10
        reasons.append(f"Fair credit score ({credit_score}); requires stricter underwriting review")

    # 3. DTI Check
    max_dti = float(product.max_dti_ratio)
    if dti_ratio > max_dti:
        score -= 30
        reasons.append(f"Projected Debt-To-Income (DTI) of {dti_ratio:.1f}% exceeds ceiling of {max_dti:.1f}% (Code: E003)")
    elif dti_ratio > 45.0:
        score -= 10
        reasons.append(f"DTI is moderately elevated at {dti_ratio:.1f}%")

    # 4. Amount Range Check
    if amount < float(product.min_amount) or amount > float(product.max_amount):
        score -= 25
        reasons.append(f"Amount ₹{amount:,.0f} outside permissible range [₹{product.min_amount:,.0f} - ₹{product.max_amount:,.0f}] (Code: E004)")

    # 5. Tenure Check
    if tenure < product.min_tenure_months or tenure > product.max_tenure_months:
        score -= 20
        reasons.append(f"Tenure {tenure}m outside permissible limits [{product.min_tenure_months}m - {product.max_tenure_months}m] (Code: E005)")

    # 6. Employment Stability
    if profile.work_experience_years < 1:
        score -= 10
        reasons.append("Work experience is under 1 year; requires employment proof confirmation")

    score = max(0, min(100, score))

    if score >= 75 and dti_ratio <= max_dti and monthly_income >= min_income:
        status_decision = 'ELIGIBLE'
        summary_reason = "Application satisfies all primary credit underwriting criteria."
    elif score >= 50 and dti_ratio <= (max_dti + 10):
        status_decision = 'CONDITIONALLY_ELIGIBLE'
        summary_reason = f"Conditionally eligible subject to co-applicant guarantee or higher down payment. {'; '.join(reasons)}"
    else:
        status_decision = 'NOT_ELIGIBLE'
        summary_reason = f"Application failed automated underwriting checks: {'; '.join(reasons)}"

    return {
        "status": status_decision,
        "score": score,
        "dti_ratio": round(Decimal(str(dti_ratio)), 2),
        "calculated_emi": emi_calc["emi"],
        "reason": summary_reason,
        "details": reasons
    }
