import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { PaymentGatewayModal } from '../../components/PaymentGatewayModal';
import { Card3D } from '../../components/Card3D';
import { CreditScoreGauge3D } from '../../components/CreditScoreGauge3D';
import CashflowAnalysisCard from '../../components/CashflowAnalysisCard';
import {
  CreditCard,
  AlertTriangle,
  Award,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Send,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const CustomerDashboard = ({ onNavigate, onNavigateTab }) => {
  const navigate = onNavigate || onNavigateTab || (() => {});
  const [data, setData] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmiForPay, setSelectedEmiForPay] = useState(null);

  const fetchDashboard = async () => {
    try {
      const stats = await api.get('/reports/dashboard/customer/');
      setData(stats);
      const loansData = await api.get('/loans/');
      setLoans(loansData?.results || (Array.isArray(loansData) ? loansData : []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading your customer portfolio...
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const nextEmi = data?.next_emi;
  const primaryLoan = loans[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner / Welcome */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
            <Sparkles size={16} />
            <span>Customer Account • {metrics.customer_id || 'LP-CUST-ACTIVE'}</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            Financial Overview & Repayments
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px', maxWidth: '600px' }}>
            Track active facilities, upcoming EMI debits, live bureau health, and instant repayments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('apply')}
            className="btn btn-primary"
            style={{ padding: '10px 20px' }}
          >
            <Send size={16} />
            <span>Apply for New Loan</span>
          </button>
          {!metrics.onboarding_completed && (
            <button
              onClick={() => navigate('kyc')}
              className="btn btn-secondary"
            >
              <FileCheck size={16} />
              <span>Complete KYC</span>
            </button>
          )}
        </div>
      </div>

      {/* 3D Financial Interactive Showcase: 3D Credit Card + 3D Credit Score Gauge */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
        alignItems: 'center',
      }}>
        {/* Interactive 3D Perspective Card */}
        <div className="card" style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Virtual Lending Facility</span>
            <span className="badge badge-info">3D Interactive</span>
          </div>
          <Card3D 
            customerName={metrics.customer_name || "VALUED BORROWER"} 
            balance={primaryLoan ? `₹ ${Number(primaryLoan.outstanding_amount || primaryLoan.sanctioned_amount).toLocaleString('en-IN')}` : "₹ 25,00,000 Limit"}
            accountNumber={primaryLoan?.loan_id || "LP-2026-9901"}
          />
        </div>

        {/* 3D Credit Health Gauge */}
        <CreditScoreGauge3D score={metrics.credit_score || 785} />
      </div>

      {/* KPI Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '20px',
      }}>
        <StatCard
          title="Active Loans"
          value={metrics.active_loans || 0}
          subtitle="Sanctioned Facilities"
          icon={CreditCard}
          color="primary"
        />
        <StatCard
          title="Total Outstanding"
          value={`₹${(metrics.total_outstanding || 0).toLocaleString('en-IN')}`}
          subtitle="Principal Remaining"
          icon={TrendingUp}
          color="info"
        />
        <StatCard
          title="Next EMI Due"
          value={nextEmi ? `₹${Number(nextEmi.amount).toLocaleString('en-IN')}` : '₹0.00'}
          subtitle={nextEmi ? `Due ${nextEmi.due_date}` : 'No upcoming dues'}
          icon={Calendar}
          color="warning"
        />
        <StatCard
          title="Overdue Amount"
          value={`₹${(metrics.total_overdue || 0).toLocaleString('en-IN')}`}
          subtitle={metrics.total_overdue > 0 ? 'Urgent attention required' : 'Current & Healthy'}
          icon={AlertTriangle}
          color={metrics.total_overdue > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Main Grid: Active Facility Progress + Upcoming EMI Widget */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
      }}>
        {/* Next EMI Action Card */}
        {nextEmi ? (
          <div className="card glow-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="badge badge-warning">NEXT UPCOMING REPAYMENT</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{nextEmi.loan_id}</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
                {nextEmi.product_name} • EMI #{nextEmi.installment_number}
              </h3>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', margin: '12px 0' }}>
                ₹{Number(nextEmi.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <Clock size={16} color="#f59e0b" />
                <span>Due Date: <strong>{nextEmi.due_date}</strong> (Auto-debit fallback)</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setSelectedEmiForPay({
                  id: nextEmi.id,
                  installment_number: nextEmi.installment_number,
                  emi_amount: nextEmi.amount,
                  due_date: nextEmi.due_date,
                })}
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
              >
                <span>Pay EMI Now</span>
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('loans')}
                className="btn btn-secondary"
              >
                Full Schedule
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '32px' }}>
            <CheckCircle size={44} color="var(--success)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px' }}>No Pending EMIs</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              All your scheduled loan repayments are completely up-to-date!
            </p>
          </div>
        )}

        {/* Active Loan Account Status */}
        {primaryLoan ? (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="badge badge-success">FACILITY: {primaryLoan.loan_id}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                {primaryLoan.interest_rate}% p.a.
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {primaryLoan.product_name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Tenure: {primaryLoan.tenure_months} Months • Sanctioned ₹{Number(primaryLoan.sanctioned_amount).toLocaleString('en-IN')}
            </p>

            {/* Repayment Progress Bar */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Principal Repaid</span>
                <span style={{ fontWeight: 700 }}>
                  ₹{Number(primaryLoan.total_paid).toLocaleString('en-IN')} / ₹{Number(primaryLoan.total_payable).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (Number(primaryLoan.total_paid) / Number(primaryLoan.total_payable || 1)) * 100)}%`,
                  background: 'var(--success)',
                  borderRadius: '4px',
                  transition: 'width 0.8s ease'
                }}></div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              background: 'var(--bg-muted)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.825rem',
            }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Monthly EMI:</div>
                <div style={{ fontWeight: 700 }}>₹{Number(primaryLoan.monthly_emi).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Maturity Date:</div>
                <div style={{ fontWeight: 700 }}>{primaryLoan.maturity_date || 'N/A'}</div>
              </div>
            </div>

            <button
              onClick={() => navigate('loans')}
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '16px', fontSize: '0.85rem' }}
            >
              View Loan Statement & EMI Amortization
            </button>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
            <CreditCard size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Active Loans Yet</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', maxWidth: '280px' }}>
              Explore loan products and submit your digital application in just 3 minutes.
            </p>
            <button onClick={() => navigate('apply')} className="btn btn-primary">
              Apply Now
            </button>
          </div>
        )}
      </div>

      {/* Account Aggregator & Bank Statement Cashflow Analyzer */}
      <CashflowAnalysisCard 
        customerProfile={metrics} 
        onAnalysisComplete={fetchDashboard} 
      />

      {/* Payment Gateway Modal */}
      {selectedEmiForPay && (
        <PaymentGatewayModal
          isOpen={!!selectedEmiForPay}
          onClose={() => setSelectedEmiForPay(null)}
          emi={selectedEmiForPay}
          onPaymentSuccess={() => {
            fetchDashboard();
          }}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
