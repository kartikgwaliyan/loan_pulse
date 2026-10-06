import React, { useState, useEffect } from 'react';
import { EmiCalculatorWidget } from '../components/EmiCalculatorWidget';
import { Card3D } from '../components/Card3D';
import FintechHero3D from '../components/FintechHero3D';
import { api } from '../services/api';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle,
  FileCheck,
  TrendingUp,
  CreditCard,
  Lock,
  Layers,
  Award,
  Users,
  Building,
  HelpCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const LandingPage = ({ onNavigate, onSelectProductForApply }) => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get('/loans/products/');
        const list = data?.results || (Array.isArray(data) ? data : []);
        setProducts(list);
      } catch (e) {
        console.error('Failed to load products:', e);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const stats = [
    { value: '12K+', label: 'Registered Customers' },
    { value: '8K+', label: 'Active Loan Accounts' },
    { value: '₹82Cr+', label: 'Disbursed to Date' },
    { value: '98%', label: 'Digital STP Processing' },
  ];

  const features = [
    { title: 'Customer Onboarding', desc: 'Frictionless digital self-registration with PAN & bureau validation in seconds.', icon: Users },
    { title: 'KYC Document Vault', desc: 'Secure document verification pipeline with automated OCR & officer review.', icon: FileCheck },
    { title: 'Credit & ML Risk Engine', desc: 'XGBoost predictive scoring assessing DTI, cash flow, and default probability.', icon: TrendingUp },
    { title: 'Multi-Tier Approval Matrix', desc: 'Configurable delegation of financial authority across Officers, Managers, and Admins.', icon: Award },
    { title: 'Instant RTGS Disbursement', desc: 'Automated bank account validation and instant fund release with UTR tracking.', icon: Zap },
    { title: 'Automated EMI Engine', desc: 'Full monthly amortization schedule generation with principal-interest breakdown.', icon: CreditCard },
    { title: 'Omnichannel Repayments', desc: 'Instant UPI QR code, Net Banking, and card gateway integration with receipts.', icon: Layers },
    { title: 'Delinquency & Collections', desc: 'Automated DPD (30+/60+/90+) classification with follow-up task manager.', icon: Building },
    { title: 'Enterprise Audit Trail', desc: 'Immutable security log tracking every administrative decision, approval, and payment.', icon: Lock },
  ];

  const faqs = [
    {
      q: 'How fast can a loan application be sanctioned?',
      a: 'Through LoanPulse digital underwriting, standard personal and vehicle loan applications complete preliminary KYC and automated risk evaluation within minutes.'
    },
    {
      q: 'What is the Approval Matrix and how does it safeguard decisions?',
      a: 'LoanPulse enforces a multi-tier financial delegation matrix: Tier 1 (up to ₹5L) can be approved by Loan Officers, Tier 2 (₹5L - ₹20L) requires Credit Manager signoff, and Tier 3 (> ₹20L) requires Senior Authority.'
    },
    {
      q: 'Can I repay my monthly EMI via UPI or Net Banking?',
      a: 'Yes! The customer portal has an integrated payment gateway supporting real-time UPI QR scans, Net Banking across major banks, and Debit cards with immediate receipt generation.'
    },
    {
      q: 'Which database powers the LoanPulse backend?',
      a: 'LoanPulse is architected for Enterprise Oracle Database (with support for Oracle 19c/21c/23ai Free via python-oracledb) as well as seamless local development adapters.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '40px' }}>
      {/* Hero Section */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '40px 24px 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '48px',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.825rem',
            fontWeight: 700,
            width: 'fit-content',
            border: '1px solid #dbeafe',
          }}>
            <Sparkles size={16} />
            <span>Powering Smarter Lending & Loan Lifecycle</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 4vw, 3.6rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
          }}>
            Smarter Lending. <br />
            <span style={{ color: 'var(--primary)' }}>Faster Decisions.</span> <br />
            Better Finance.
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '540px' }}>
            LoanPulse simplifies the complete lending journey — from digital KYC and AI underwriting to multi-tier approval, RTGS disbursement, and automated EMI collection.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', paddingTop: '8px' }}>
            <button
              onClick={() => onNavigate('register')}
              className="btn btn-primary btn-lg"
            >
              <span>Apply for a Loan</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn btn-secondary btn-lg"
            >
              <span>Explore Products</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={18} color="var(--success)" />
              <span>RBI / Digital Lending Compliant</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <Lock size={18} color="var(--primary)" />
              <span>Oracle Relational Core</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive 3D Showcase */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%' }}>
          {/* Genuine 3D Three.js WebGL Core */}
          <div style={{
            width: '100%',
            maxWidth: '440px',
            height: '380px',
            position: 'relative',
            zIndex: 2,
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <FintechHero3D />
          </div>

          {/* Live Underwriting Pulse Console */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 22px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: '380px',
            zIndex: 2,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Real-Time Underwriting Stream</span>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>STP ENGINE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={14} color="var(--success)" />
                <span>Bureau Check: <strong>785 (Excellent)</strong></span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Live</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={14} color="var(--success)" />
                <span>Default Prob (PD): <strong>1.4% (Tier 1)</strong></span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.7rem' }}>AI Model</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={14} color="var(--success)" />
                <span>Instant Sanction: <strong>₹5,00,000</strong></span>
                <span style={{ marginLeft: 'auto', color: 'var(--success)', fontWeight: 700, fontSize: '0.7rem' }}>APPROVED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Statistics */}
      <section style={{
        background: 'var(--bg-muted)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        padding: '40px 24px',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          textAlign: 'center',
        }}>
          {stats.map((s, idx) => (
            <div key={idx}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: 'var(--primary)',
                letterSpacing: '-0.02em',
                marginBottom: '4px',
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          * Platform benchmark metrics and live demo portfolio figures
        </div>
      </section>

      {/* Loan Products Section */}
      <section id="products-section" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
            Tailored Lending Products
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Competitive interest rates, transparent fee structures, and customized tenures engineered for every financial milestone.
          </p>
        </div>

        {loadingProducts ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            Loading available products...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {products.map((prod) => (
              <div key={prod.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span className="badge badge-info">{prod.code}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)' }}>
                      Fee: {prod.processing_fee_percent}%
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '8px' }}>
                    {prod.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px', minHeight: '50px' }}>
                    {prod.description}
                  </p>

                  <div style={{
                    background: 'var(--bg-muted)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '0.85rem',
                    marginBottom: '20px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Interest Rate:</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {prod.interest_rate_min}% – {prod.interest_rate_max}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Tenure Range:</span>
                      <span style={{ fontWeight: 700 }}>
                        {prod.min_tenure_months} – {prod.max_tenure_months} months
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Permissible Limits:</span>
                      <span style={{ fontWeight: 700 }}>
                        ₹{Number(prod.min_amount).toLocaleString('en-IN')} – ₹{Number(prod.max_amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Min Credit Score:</span>
                      <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                        {prod.eligibility_min_credit_score}+
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onSelectProductForApply) onSelectProductForApply(prod);
                    onNavigate('portal');
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <span>Apply Now</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Interactive EMI Calculator Section */}
      <section id="calculator-section" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', width: '100%' }}>
        <EmiCalculatorWidget
          onApplyNow={(prefill) => {
            onNavigate('register');
          }}
        />
      </section>

      {/* Features Grid Section */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
            Comprehensive Lifecycle Architecture
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Every touchpoint engineered for regulatory compliance, sub-second decisioning, and seamless user experience.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="card" style={{ display: 'flex', gap: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                    {feat.title}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Everything you need to know about digital borrowing with LoanPulse.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {faqs.map((faq, i) => (
            <div key={i} className="card" style={{ padding: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {faq.q}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', width: '100%' }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '48px 32px',
          border: '1px solid var(--border-color)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Experience the Future of Digital Lending
          </h2>
          <p style={{ maxWidth: '600px', color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Join over 12,000 satisfied borrowers. Sign up today or use our interactive multi-role switcher to inspect the platform from any perspective.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => onNavigate('register')}
              className="btn btn-primary btn-lg"
            >
              <span>Create Free Account</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="btn btn-secondary btn-lg"
            >
              <span>Employee & Customer Login</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
