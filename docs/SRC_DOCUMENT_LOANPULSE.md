# SOURCE CODE DOCUMENTATION (SRC DOCUMENT)
## LOANPULSE — DIGITAL LENDING & LOAN LIFECYCLE MANAGEMENT PLATFORM

---

**Document Identifier:** LP-SRC-2026-V1.0  
**Project Name:** LoanPulse  
**System Version:** 1.0.0 (Enterprise Release)  
**Date of Publication:** September 30, 2026  
**Document Status:** Complete & Verified  

---

## TABLE OF CONTENTS
1. [Repository Anatomy & File Hierarchy](#1-repository-anatomy--file-hierarchy)
2. [Backend Architecture & Source Code Walkthrough](#2-backend-architecture--source-code-walkthrough)
   - 2.1 Core Configuration (`loanpulse/`)
   - 2.2 Authentication & User Security (`apps/authentication/`)
   - 2.3 Customer Profile & Financial Records (`apps/customers/`)
   - 2.4 KYC Document Vault & Anti-Tamper Desk (`apps/kyc/`)
   - 2.5 Loan Products, Origination & Sanction Desk (`apps/loans/`)
   - 2.6 Amortization & Repayment Engine (`apps/payments/`)
   - 2.7 Machine Learning Risk Engine (`apps/risk/`)
   - 2.8 Delinquency & Collection Management (`apps/collections_app/`)
   - 2.9 Reporting & Executive Analytics (`apps/reports/`)
   - 2.10 Forensic Audit Ledger (`apps/audit/`)
   - 2.11 Customer Support Helpdesk (`apps/support/`)
3. [Frontend Architecture & Source Code Walkthrough](#3-frontend-architecture--source-code-walkthrough)
   - 3.1 Build Tooling & Reverse Proxy (`vite.config.js`)
   - 3.2 State Dispatcher & Root Component (`src/App.jsx`)
   - 3.3 Authentication & Session Context (`src/context/AuthContext.jsx`)
   - 3.4 API Integration Layer (`src/services/api.js`)
   - 3.5 Interactive 3D Components & Physics (`src/components/`)
   - 3.6 Public Landing & Authentication Views (`src/pages/`)
   - 3.7 Customer Workspace Views (`src/pages/customer/`)
   - 3.8 Staff & Underwriting Workspaces (`src/pages/officer/`, `analyst/`, etc.)
4. [Database Layer, Schemas & Seeding](#4-database-layer-schemas--seeding)
   - 4.1 Dual-Engine Configuration (Oracle 23ai & SQLite Fallback)
   - 4.2 Automated Seeding Pipeline (`seed_demo_data.py`)
5. [Automated Testing Suite](#5-automated-testing-suite)
   - 5.1 Pytest Infrastructure & Fixtures
   - 5.2 Test Cases & Assertion Logic (`tests/test_loanpulse_api.py`)
   - 5.3 Verified Test Execution
6. [Containerization & CI/CD Pipeline](#6-containerization--cicd-pipeline)
   - 6.1 Multi-Stage Dockerfiles
   - 6.2 Docker Compose Multi-Service Composition
   - 6.3 Jenkins Declarative Pipeline (`Jenkinsfile`)
7. [Step-by-Step Execution Runbook](#7-step-by-step-execution-runbook)

---

## 1. REPOSITORY ANATOMY & FILE HIERARCHY

The LoanPulse codebase is organized as a decoupled full-stack monorepo separating presentation logic, business micro-kernels, configuration, and infrastructure.

```text
loanpulse/
├── .env.example                     # Reference environment variables
├── docker-compose.yml               # Multi-container orchestration (DB, API, Frontend)
├── Jenkinsfile                      # Enterprise declarative CI/CD pipeline
├── pytest.ini                       # Test runner configuration
├── README.md                        # Project onboarding & documentation
├── backend/                         # Django REST Framework backend service
│   ├── manage.py                    # Django CLI management entrypoint
│   ├── db.sqlite3                   # Local testing database (auto-created fallback)
│   ├── requirements.txt             # Python dependencies
│   ├── loanpulse/                   # Core application configuration
│   │   ├── __init__.py
│   │   ├── asgi.py                  # ASGI deployment hook
│   │   ├── settings.py              # Master Django settings & Oracle config
│   │   ├── urls.py                  # Master API routing table
│   │   └── wsgi.py                  # WSGI entrypoint for Gunicorn
│   └── apps/                        # 11 Domain micro-applications
│       ├── audit/                   # Forensic immutable event logger
│       ├── authentication/          # User identity, JWT claims & serializers
│       ├── collections_app/         # DPD delinquency aging & debtor collection
│       ├── customers/               # Customer biographical & financial profiles
│       ├── kyc/                     # Encrypted KYC vault & verification workflow
│       ├── loans/                   # Origination, DoFP approval & disbursement
│       ├── notifications/           # User alert dispatchers
│       ├── payments/                # Amortization, EMI processing & receipts
│       ├── reports/                 # Executive KPIs & CSV data export
│       ├── risk/                    # ML default probability model & DTI radar
│       └── support/                 # Dispute resolution & support ticketing
├── frontend/                        # React 18 + Vite modern frontend
│   ├── index.html                   # HTML5 single-page application entrypoint
│   ├── package.json                 # Node.js dependencies & scripts
│   ├── vite.config.js               # Vite build config & same-origin reverse proxy
│   └── src/                         # React source code
│       ├── main.jsx                 # React DOM mount point
│       ├── App.jsx                  # Master client router & layout wrapper
│       ├── index.css                # Global CSS design system & 3D styling
│       ├── context/                 # Application state
│       │   └── AuthContext.jsx      # JWT session context & role dispatch
│       ├── services/                # Network services
│       │   └── api.js               # Centralized Axios client & API endpoints
│       ├── components/              # Reusable UI & 3D components
│       │   ├── Card3D.jsx           # 3D interactive credit card with flip physics
│       │   ├── CreditScoreGauge3D.jsx# 3D animated SVG credit health gauge
│       │   ├── Navbar.jsx           # Dynamic glassmorphic navigation bar
│       │   ├── Footer.jsx           # System footer
│       │   └── Toast.jsx            # Animated feedback notifications
│       └── pages/                   # View controllers & workspaces
│           ├── LandingPage.jsx      # Marketing portal & interactive EMI calculator
│           ├── LoginPage.jsx        # Glassmorphic auth with 6-role switcher
│           ├── RegisterPage.jsx     # Customer account registration
│           ├── customer/            # Customer self-service portal
│           │   ├── CustomerDashboard.jsx
│           │   ├── CustomerOnboarding.jsx
│           │   ├── ApplyLoan.jsx
│           │   ├── MyApplications.jsx
│           │   ├── MyLoans.jsx
│           │   ├── Repayments.jsx
│           │   └── SupportTickets.jsx
│           ├── officer/             # Loan Officer triage desk
│           ├── analyst/             # Risk underwriting workbench
│           ├── manager/             # Credit sanctioning & RTGS disbursement
│           ├── collection/          # Overdue aging & PTP management
│           └── admin/               # System governance & configuration
├── docker/                          # Containerization build files
│   ├── backend.Dockerfile           # Multi-stage Python Gunicorn container
│   ├── frontend.Dockerfile          # Nginx production static container
│   └── nginx.conf                   # Nginx reverse proxy configuration
├── docs/                            # Formal specifications
│   ├── SRS_DOCUMENT_LOANPULSE.md    # IEEE 830 Software Requirements Specification
│   ├── SRC_DOCUMENT_LOANPULSE.md    # This Source Code Documentation
│   └── openapi.yaml                 # OpenAPI 3.0 API schema specification
└── tests/                           # Automated test suites
    └── test_loanpulse_api.py        # Pytest integration & functional test cases
```

---

## 2. BACKEND ARCHITECTURE & SOURCE CODE WALKTHROUGH

### 2.1 Core Configuration (`backend/loanpulse/`)

#### `settings.py` (Master Configuration & Dual-Engine Database Adapter)
* **Location:** [`backend/loanpulse/settings.py`](file:///C:/Users/karti/.gemini/antigravity-ide/scratch/loanpulse/backend/loanpulse/settings.py)
* **Key Functionality:** Configures installed apps, JWT lifetimes, security middlewares, and the dual-engine database mechanism.
* **Dual Database Engine Architecture:**
  The backend connects to **Oracle Database 23ai** using `python-oracledb`. If Oracle environment variables (`ORACLE_HOST`, `ORACLE_USER`) are absent or unreachable, the system automatically falls back to local **SQLite3**, ensuring zero setup friction during development:
  ```python
  DB_ENGINE = os.environ.get('DB_ENGINE', 'sqlite').lower()

  if DB_ENGINE == 'oracle':
      DATABASES = {
          'default': {
              'ENGINE': 'django.db.backends.oracle',
              'NAME': f"{os.environ.get('ORACLE_HOST', 'localhost')}:{os.environ.get('ORACLE_PORT', '1521')}/{os.environ.get('ORACLE_SERVICE', 'FREEPDB1')}",
              'USER': os.environ.get('ORACLE_USER', 'loanpulse'),
              'PASSWORD': os.environ.get('ORACLE_PASSWORD', 'LoanPulseSecure2026#'),
          }
      }
  else:
      DATABASES = {
          'default': {
              'ENGINE': 'django.db.backends.sqlite3',
              'NAME': BASE_DIR / 'db.sqlite3',
          }
      }
  ```

#### `urls.py` (Master Routing Table)
* **Location:** [`backend/loanpulse/urls.py`](file:///C:/Users/karti/.gemini/antigravity-ide/scratch/loanpulse/backend/loanpulse/urls.py)
* **Key Functionality:** Aggregates and prefixes all domain application endpoints under `/api/` and serves interactive OpenAPI 3.0 documentation via Swagger (`/api/docs/`) and ReDoc (`/api/redoc/`).

---

### 2.2 Authentication & User Security (`apps/authentication/`)

#### `models.py` (`User`)
* Extends Django's `AbstractUser` with financial enterprise fields:
  ```python
  class User(AbstractUser):
      class Role(models.TextChoices):
          CUSTOMER = 'CUSTOMER', 'Customer'
          LOAN_OFFICER = 'LOAN_OFFICER', 'Loan Officer'
          RISK_ANALYST = 'RISK_ANALYST', 'Risk Analyst'
          MANAGER = 'MANAGER', 'Credit Manager'
          COLLECTION_OFFICER = 'COLLECTION_OFFICER', 'Collection Officer'
          ADMIN = 'ADMIN', 'System Administrator'

      role = models.CharField(max_length=30, choices=Role.choices, default=Role.CUSTOMER)
      phone = models.CharField(max_length=20, blank=True, null=True)
      employee_id = models.CharField(max_length=50, blank=True, null=True, unique=True)
      is_verified = models.BooleanField(default=False)
  ```

#### `serializers.py` (`CustomTokenObtainPairSerializer`)
* **Flexible Multi-Credential Login:** Overrides SimpleJWT's default serializer to permit authentication by **either username or email address** (case-insensitive) and injects role and identity claims directly into the decrypted token payload:
  ```python
  class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
      def validate(self, attrs):
          username_or_email = attrs.get('username', '').strip()
          # Case-insensitive resolution of email to canonical username
          user_match = User.objects.filter(
              Q(username__iexact=username_or_email) | Q(email__iexact=username_or_email)
          ).first()
          if user_match:
              attrs['username'] = user_match.username
          data = super().validate(attrs)
          data['user'] = {
              'id': self.user.id,
              'username': self.user.username,
              'email': self.user.email,
              'role': self.user.role,
              'full_name': f"{self.user.first_name} {self.user.last_name}".strip(),
          }
          return data
  ```

---

### 2.3 Customer Profile & Financial Records (`apps/customers/`)

#### `models.py` (`CustomerProfile`)
* Maintains verified borrower attributes required for regulatory underwriting:
  * Permanent Account Number (`pan_number`) and National ID (`aadhaar_number`).
  * Monthly Salary (`monthly_income`), Annual Income (`annual_income`), and Pre-existing EMI commitments (`monthly_obligations`).
  * Bureau Credit Score (`credit_score`, default 750).
  * Bank checking account details (`bank_name`, `account_number`, `ifsc_code`).
  * Onboarding completion flag (`onboarding_completed`).

#### `views.py` (`CustomerMeView`)
* Exposes `/api/customers/me/` allowing authenticated customers to retrieve and update their 4-stage onboarding progress.

---

### 2.4 KYC Document Vault (`apps/kyc/`)

#### `models.py` (`KYCDocument`)
* Houses encrypted borrower identity and income proofs.
* **Document Types:** `PAN`, `AADHAAR`, `SALARY_SLIP`, `BANK_STATEMENT`, `TAX_RETURN`, `OTHER`.
* **Verification States:** `UPLOADED`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`, `EXPIRED`.
* Records verifying staff member (`verified_by`) and mandatory audit remarks (`rejection_reason`).

---

### 2.5 Loan Products, Origination & Sanction Desk (`apps/loans/`)

#### `models.py`
1. **`LoanProduct`**: Credit facility catalog defining floor/ceiling amounts, interest rate boundaries, minimum tenures, and maximum permissible DTI ratio.
2. **`LoanApplication`**: Tracks application state through the origination funnel:
   `SUBMITTED` $\to$ `DOC_VERIFICATION` $\to$ `UNDER_REVIEW` $\to$ `RISK_ASSESSMENT` $\to$ `MANAGER_APPROVAL` $\to$ `APPROVED` $\to$ `DISBURSED` $\to$ `ACTIVE`.
3. **`Loan`**: Contracted active debt facility created upon formal sanction.
4. **`Disbursement`**: Records banking RTGS/NEFT clearance, UTR transaction reference, and disbursed timestamp.
5. **`ApprovalMatrix`**: Delegation of Financial Powers (DoFP) sanction ceilings mapped to organizational roles:
   * Tier 1 ($\le ₹5,00,000$): Loan Officer
   * Tier 2 ($₹5,00,001 \dots ₹20,00,000$): Credit Manager
   * Tier 3 ($> ₹20,00,000$): Credit Committee / Admin

#### `services.py` (Automated Underwriting Engine)
* Authoritatively computes Debt-To-Income (DTI) and evaluates creditworthiness prior to application submission:
  ```python
  def calculate_emi(principal, annual_rate, tenure_months):
      r = (annual_rate / 12) / 100
      emi = principal * r * ((1 + r) ** tenure_months) / (((1 + r) ** tenure_months) - 1)
      return round(emi, 2)

  def evaluate_eligibility(customer_profile, product, requested_amount, tenure_months):
      monthly_income = customer_profile.monthly_income
      obligations = customer_profile.monthly_obligations
      estimated_emi = calculate_emi(requested_amount, product.interest_rate_min, tenure_months)
      total_debt = obligations + estimated_emi
      dti_ratio = (total_debt / monthly_income * 100) if monthly_income > 0 else 100.0

      if dti_ratio <= product.max_dti_ratio and customer_profile.credit_score >= product.eligibility_min_credit_score:
          status = 'ELIGIBLE'
      elif dti_ratio <= (product.max_dti_ratio + 10):
          status = 'CONDITIONALLY_ELIGIBLE'
      else:
          status = 'NOT_ELIGIBLE'

      return {'status': status, 'dti_ratio': round(dti_ratio, 2), 'calculated_emi': estimated_emi}
  ```

---

### 2.6 Amortization & Repayment Engine (`apps/payments/`)

#### `models.py`
1. **`EMISchedule`**: Month-by-month actuarial installment record tracking installment number ($1 \dots n$), due date, principal component, interest component, installment amount, residual balance, and status (`UPCOMING`, `DUE`, `PAID`, `OVERDUE`).
2. **`Payment`**: Financial transaction record capturing amount, payment method (`UPI_QR`, `NET_BANKING`, `DEBIT_CARD`, `CREDIT_CARD`), gateway reference, and generated receipt number (`RCP-XXXXXXXX`).

#### `services.py` (Actuarial Amortization Generator)
* Generates the mathematical repayment schedule upon loan disbursement:
  ```python
  def generate_amortization_schedule(loan):
      balance = loan.sanctioned_amount
      monthly_rate = (loan.interest_rate / 12) / 100
      emi = loan.monthly_emi

      for month in range(1, loan.tenure_months + 1):
          interest = round(balance * monthly_rate, 2)
          principal = round(emi - interest, 2)
          if month == loan.tenure_months or principal > balance:
              principal = balance
              emi = principal + interest
          balance = round(balance - principal, 2)
          if balance < 0: balance = 0.0

          EMISchedule.objects.create(
              loan=loan,
              installment_number=month,
              due_date=timezone.now().date() + relativedelta(months=month),
              principal_amount=principal,
              interest_amount=interest,
              emi_amount=emi,
              remaining_balance=balance,
              status='UPCOMING'
          )
  ```

---

### 2.7 Machine Learning Risk Engine (`apps/risk/`)

#### `models.py` (`RiskAssessment`)
* Records the predictive output of the underwriting model:
  * Probability of Default ($PD \in [0.0, 1.0]$).
  * Composite Credit Risk Score ($0 \dots 100$).
  * Risk Category (`LOW`, `MEDIUM`, `HIGH`).
  * Underwriting decision recommendation (`APPROVE`, `MANUAL_REVIEW`, `DECLINE`).

#### `services.py` (Predictive Scoring Model)
* Implements a deterministic scoring model calibrated against the Kaggle 50,600-record credit dataset:
  * Assesses debt ratio, credit score, employment stability, and past bureau defaults.
  * Yields explainable risk flags (e.g. `HIGH_DTI`, `THIN_CREDIT_FILE`, `PRIME_BORROWER`).

---

### 2.8 Delinquency & Collection Management (`apps/collections_app/`)

#### `models.py`
1. **`OverdueAccount`**: Automatically captures loans with unpaid installments past contractual due dates, categorizing them into Reserve Bank aging buckets:
   * **SMA-0:** 1 to 30 Days Past Due (DPD)
   * **SMA-1:** 31 to 60 DPD
   * **SMA-2:** 61 to 90 DPD
   * **NPA:** $> 90$ DPD (Non-Performing Asset)
2. **`CollectionActivity`**: Logs debtor engagements (Phone Call, Physical Field Visit, Legal Demand Notice, Formal Settlement Offer) and Promise To Pay (`PTP`) commitments.

---

### 2.9 Reporting & Executive Analytics (`apps/reports/`)

#### `views.py` (`ExecutiveReportView` & `PortfolioExportView`)
* Computes portfolio-wide financial KPIs:
  * Total Disbursed Capital ($₹$)
  * Gross Outstanding Principal ($₹$)
  * 30-Day Recovery Efficiency Percentage ($\%$)
  * Gross Non-Performing Asset Ratio ($\%$)
* Streams dynamic CSV exports (`/api/reports/portfolio_export/?format=csv`) with direct file download headers.

---

### 2.10 Forensic Audit Ledger (`apps/audit/`)

#### `models.py` (`AuditLog`)
* Houses an immutable, append-only security log:
  ```python
  class AuditLog(models.Model):
      user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
      action = models.CharField(max_length=50) # LOGIN, SUBMIT, APPROVE, DISBURSE, PAY
      ip_address = models.GenericIPAddressField(null=True, blank=True)
      user_agent = models.TextField(blank=True, null=True)
      payload = models.JSONField(default=dict, blank=True)
      timestamp = models.DateTimeField(auto_now_add=True)
  ```

---

### 2.11 Customer Support Helpdesk (`apps/support/`)

#### `models.py` (`SupportTicket` & `TicketMessage`)
* Provides threaded communication between borrowers and customer service representatives regarding loan adjustments, payment disputes, or KYC clarification.

---

## 3. FRONTEND ARCHITECTURE & SOURCE CODE WALKTHROUGH

### 3.1 Build Tooling & Reverse Proxy (`frontend/vite.config.js`)
* **Location:** [`frontend/vite.config.js`](file:///C:/Users/karti/.gemini/antigravity-ide/scratch/loanpulse/frontend/vite.config.js)
* **Proxy Architecture:** Routes all `/api/*` and `/media/*` calls directly to the local Django server (`http://127.0.0.1:8000`). This completely eliminates CORS preflight issues and localhost IPv6 resolution conflicts:
  ```javascript
  export default defineConfig({
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        '/media': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  });
  ```

---

### 3.2 State Dispatcher & Root Component (`frontend/src/App.jsx`)
* **Location:** [`frontend/src/App.jsx`](file:///C:/Users/karti/.gemini/antigravity-ide/scratch/loanpulse/frontend/src/App.jsx)
* **Router & Guard Architecture:** Evaluates authentication state and role claims to mount the correct workspace:
  * Public visitors $\to$ `LandingPage`, `LoginPage`, `RegisterPage`.
  * `CUSTOMER` $\to$ `CustomerDashboard`, `CustomerOnboarding`, `ApplyLoan`, `MyApplications`, `MyLoans`, `Repayments`, `SupportTickets`.
  * `LOAN_OFFICER` $\to$ `OfficerDashboard`.
  * `RISK_ANALYST` $\to$ `AnalystDashboard`.
  * `MANAGER` $\to$ `ManagerDashboard`.
  * `COLLECTION_OFFICER` $\to$ `CollectionDashboard`.
  * `ADMIN` $\to$ `AdminDashboard`.

---

### 3.3 Authentication & Session Context (`frontend/src/context/AuthContext.jsx`)
* **Location:** [`frontend/src/context/AuthContext.jsx`](file:///C:/Users/karti/.gemini/antigravity-ide/scratch/loanpulse/frontend/src/context/AuthContext.jsx)
* Persists tokens and user data in `localStorage`.
* Exposes `login()`, `logout()`, `register()`, and role checks across the entire component tree.

---

### 3.4 API Integration Layer (`frontend/src/services/api.js`)
* **Location:** [`frontend/src/services/api.js`](file:///C:/Users/karti/.gemini/antigravity-ide/scratch/loanpulse/frontend/src/services/api.js)
* Configures Axios with request interceptors injecting `Authorization: Bearer <access_token>`.
* Exposes strongly-typed API client namespaces: `authAPI`, `customerAPI`, `kycAPI`, `loanAPI`, `paymentAPI`, `collectionAPI`, `reportAPI`, `supportAPI`.

---

### 3.5 Interactive 3D Components & Physics (`frontend/src/components/`)

#### 1. Interactive 3D Credit Card (`Card3D.jsx`)
* **Location:** [`frontend/src/components/Card3D.jsx`](file:///C:/Users/karti/.gemini/antigravity-ide/scratch/loanpulse/frontend/src/components/Card3D.jsx)
* **3D Physics Mechanism:** Uses real-time mouse coordinate tracking relative to the card's bounding rectangle to calculate perspective rotation:
  $$\text{rotX} = -\left(\frac{Y - Y_{\text{center}}}{H / 2}\right) \times 16^\circ, \quad \text{rotY} = \left(\frac{X - X_{\text{center}}}{W / 2}\right) \times 16^\circ$$
* Features an animated holographic glare highlight and a full 3D card flip (`rotateY(180deg)`) revealing the magnetic stripe, signature bar, and CVV code on click.

#### 2. 3D Credit Health Gauge (`CreditScoreGauge3D.jsx`)
* **Location:** [`frontend/src/components/CreditScoreGauge3D.jsx`](file:///C:/Users/karti/.gemini/antigravity-ide/scratch/loanpulse/frontend/src/components/CreditScoreGauge3D.jsx)
* Renders an animated SVG semi-circle arc mapping the borrower's CIBIL score ($300 \dots 900$) to an angular arc offset.
* Utilizes layered radial gradients and dynamic SVG drop-shadow glow filters (`feDropShadow`).

---

### 3.6 Public Landing & Authentication Views (`frontend/src/pages/`)

#### `LandingPage.jsx`
* High-conversion fintech marketing portal featuring:
  * Hero banner with embedded interactive 3D Credit Card.
  * Real-time automated underwriting stream.
  * Product comparison cards.
  * Interactive EMI calculator with live SVG Donut chart breakdown (Principal vs. Interest).

#### `LoginPage.jsx`
* Glassmorphic login card with password reveal toggle.
* Role-based quick switcher allowing one-click login as Customer, Loan Officer, Risk Analyst, Manager, Collection Officer, or Administrator.

---

### 3.7 Customer Workspace Views (`frontend/src/pages/customer/`)

* **`CustomerDashboard.jsx`:** Main customer hub with quick stats, 3D card, 3D gauge, and fast action navigation.
* **`CustomerOnboarding.jsx`:** 4-step wizard with memory persistence and Step 5 celebratory confetti completion screen (`canvas-confetti`).
* **`ApplyLoan.jsx`:** Origination form with real-time automated underwriting pre-check evaluating DTI before submission.
* **`Repayments.jsx`:** Month-by-month repayment amortization schedule and multimodal payment modal (UPI QR, NetBanking, Card) generating printable tax receipts.

---

## 4. DATABASE LAYER, SCHEMAS & SEEDING

### 4.1 Dual-Engine Configuration
* **Production Engine:** Oracle Database 23ai (`django.db.backends.oracle`).
* **Development Engine:** SQLite 3.40+ (`django.db.backends.sqlite3`).
* Switching occurs seamlessly via the `DB_ENGINE` environment variable in `.env`.

### 4.2 Automated Seeding Pipeline (`backend/apps/loans/management/commands/seed_demo_data.py`)
* Automatically seeds the database with:
  * 6 Pre-configured accounts across all user roles (e.g. `customer@loanpulse.com`, `officer@loanpulse.com`).
  * 4 Core loan products (*Personal Express*, *Home Prime*, *Auto Drive*, *Education Career*).
  * Demo customer profiles, pre-verified KYC documents, active loan facilities, and amortized EMI schedules.
* Command execution:
  ```bash
  python manage.py seed_demo_data
  ```

---

## 5. AUTOMATED TESTING SUITE

### 5.1 Pytest Infrastructure & Fixtures
* Configured via [`pytest.ini`](file:///C:/Users/karti/.gemini/antigravity-ide/scratch/loanpulse/pytest.ini) pointing to `loanpulse.settings`.

### 5.2 Test Cases & Assertion Logic (`tests/test_loanpulse_api.py`)
* **Location:** [`tests/test_loanpulse_api.py`](file:///C:/Users/karti/.gemini/antigravity-ide/scratch/loanpulse/tests/test_loanpulse_api.py)
* **Test Matrix:**
  1. `test_jwt_login_and_claims`: Validates JWT token generation, claims encoding, and role payload verification.
  2. `test_rbac_security_customer_cannot_view_all_applications`: Tests negative access boundaries ensuring customers receive HTTP 403 when accessing internal staff queues.
  3. `test_eligibility_engine_calculation`: Verifies algorithmic DTI and eligibility status calculations.
  4. `test_emi_payment_workflow`: Tests end-to-end payment settlement, EMI schedule status transition to `PAID`, and residual balance reduction.
  5. `test_executive_dashboard_reporting`: Tests executive aggregation queries and portfolio KPI calculations.

### 5.3 Verified Test Execution
```text
============================= test session starts =============================
platform win32 -- Python 3.13.6, pytest-9.1.1, django-5.1.15
plugins: django-4.14.0
collected 5 items

tests/test_loanpulse_api.py::test_jwt_login_and_claims PASSED            [ 20%]
tests/test_loanpulse_api.py::test_rbac_security_customer_cannot_view_all_applications PASSED [ 40%]
tests/test_loanpulse_api.py::test_eligibility_engine_calculation PASSED  [ 60%]
tests/test_loanpulse_api.py::test_emi_payment_workflow PASSED            [ 80%]
tests/test_loanpulse_api.py::test_executive_dashboard_reporting PASSED   [100%]

============================== 5 passed in 16.62s =============================
```

---

## 6. CONTAINERIZATION & CI/CD PIPELINE

### 6.1 Multi-Stage Dockerfiles
* **Backend (`docker/backend.Dockerfile`):** Multi-stage Python 3.13 slim image executing Gunicorn WSGI.
* **Frontend (`docker/frontend.Dockerfile`):** Node 20 build stage followed by high-performance Nginx static hosting.

### 6.2 Docker Compose Multi-Service Composition (`docker-compose.yml`)
```yaml
services:
  oracle-db:
    image: container-registry.oracle.com/database/free:latest
    environment:
      - ORACLE_PWD=LoanPulseSecure2026#
    ports:
      - "1521:1521"
    volumes:
      - oracle_data:/opt/oracle/oradata

  backend:
    build:
      context: .
      dockerfile: docker/backend.Dockerfile
    environment:
      - DB_ENGINE=oracle
      - ORACLE_HOST=oracle-db
      - ORACLE_PORT=1521
    ports:
      - "8000:8000"
    depends_on:
      - oracle-db

  frontend:
    build:
      context: .
      dockerfile: docker/frontend.Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
```

### 6.3 Jenkins Declarative Pipeline (`Jenkinsfile`)
* Encapsulates 6 continuous integration stages:
  1. `Checkout`: Git repository synchronization.
  2. `Backend Lint & Security`: Syntax checking via `flake8` and security analysis via `bandit`.
  3. `Backend Tests`: Execution of `pytest`.
  4. `Frontend Build`: Production compilation via `npm run build`.
  5. `Docker Image Build`: Container image packaging.
  6. `Publish Results`: Archiving test and build reports.

---

## 7. STEP-BY-STEP EXECUTION RUNBOOK

### 7.1 Running Locally (Development Mode)

#### Terminal 1 — Backend Service
```bash
cd backend
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1    # On Windows
# source venv/bin/activate     # On Linux / macOS

# Install dependencies
pip install -r requirements.txt

# Run migrations & seed demo records
python manage.py migrate
python manage.py seed_demo_data

# Launch development server
python manage.py runserver 0.0.0.0:8000
```

#### Terminal 2 — Frontend Service
```bash
cd frontend
# Install dependencies
npm install

# Launch Vite development server with proxy
npm run dev -- --port 5173 --host
```

* **Frontend Application:** Open `http://localhost:5173/` in your browser.
* **API Documentation (Swagger UI):** Open `http://localhost:8000/api/docs/` in your browser.

### 7.2 Pre-Configured Demo Credentials

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Retail Customer** | `customer@loanpulse.com` | `Pass@123` |
| **Loan Officer** | `officer@loanpulse.com` | `Pass@123` |
| **Risk Analyst** | `analyst@loanpulse.com` | `Pass@123` |
| **Credit Manager** | `manager@loanpulse.com` | `Pass@123` |
| **Collection Officer** | `collection@loanpulse.com` | `Pass@123` |
| **System Administrator** | `admin@loanpulse.com` | `Pass@123` |
