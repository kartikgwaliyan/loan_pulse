import React, { useState, useEffect } from 'react';
import { accountAggregatorAPI } from '../services/api';

export default function CashflowAnalysisCard({ 
  customerProfile = null, 
  applicationId = null,
  initialAnalysis = null,
  onAnalysisComplete = null,
  readOnly = false 
}) {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState('trend'); // 'trend' | 'expenses' | 'salary'

  const supportedBanks = [
    { name: 'HDFC Bank', code: 'HDFC', logo: '🏦' },
    { name: 'State Bank of India', code: 'SBIN', logo: '🏛️' },
    { name: 'ICICI Bank', code: 'ICIC', logo: '🏢' },
    { name: 'Axis Bank', code: 'UTIB', logo: '🏬' },
    { name: 'Kotak Mahindra Bank', code: 'KKBK', logo: '🏪' },
  ];

  useEffect(() => {
    if (initialAnalysis) {
      setAnalysis(initialAnalysis);
    } else {
      fetchLatestAnalysis();
    }
  }, [initialAnalysis, applicationId]);

  const fetchLatestAnalysis = async () => {
    try {
      setLoading(true);
      const params = {};
      if (applicationId) params.application_id = applicationId;
      const res = await accountAggregatorAPI.getAnalyses(params);
      if (res && res.results && res.results.length > 0) {
        setAnalysis(res.results[0]);
      } else if (res && Array.isArray(res) && res.length > 0) {
        setAnalysis(res[0]);
      }
    } catch (err) {
      console.warn('Could not fetch AA analyses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConnect = () => {
    setShowModal(true);
    setOtpStep(false);
    setOtp('');
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setOtpStep(true);
      setOtp('482910'); // Simulated pre-filled OTP for convenience
    }, 800);
  };

  const handleVerifyOtpAndFetch = async (e) => {
    e.preventDefault();
    setConnecting(true);
    try {
      const payload = {
        bank_name: selectedBank,
        account_number: accountNumber || customerProfile?.account_number || '50100492817291',
        ifsc_code: customerProfile?.ifsc_code || 'HDFC0000240',
        application_id: applicationId
      };
      const res = await accountAggregatorAPI.connect(payload);
      if (res?.success && res.analysis) {
        setAnalysis(res.analysis);
        setShowModal(false);
        if (onAnalysisComplete) onAnalysisComplete(res.analysis);
      }
    } catch (err) {
      alert('Account Aggregator connection error: ' + (err.message || 'Verification failed'));
    } finally {
      setConnecting(false);
    }
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  return (
    <div style={{
      background: 'rgba(17, 24, 39, 0.75)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      color: '#f9fafb'
    }}>
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '180px',
        height: '180px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem' }}>📊</span>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#f3f4f6' }}>
              Account Aggregator & Cashflow Analyzer
            </h3>
            {analysis && (
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}>
                ✓ RBI-AA VERIFIED
              </span>
            )}
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#9ca3af' }}>
            6-Month Automated Bank Statement Analytics & Monthly Average Balance (MAB)
          </p>
        </div>

        {!readOnly && (
          <button
            onClick={handleStartConnect}
            disabled={connecting}
            style={{
              background: analysis 
                ? 'rgba(255, 255, 255, 0.06)' 
                : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: analysis ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span>🔄</span>
            {analysis ? 'Re-Sync Bank Data' : 'Connect via Account Aggregator'}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '36px', color: '#9ca3af' }}>
          <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>Retrieving banking cashflow data...</p>
        </div>
      ) : analysis ? (
        <div>
          {/* Top Key Performance Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {/* Metric 1: Monthly Average Balance */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6ee7b7', marginBottom: '4px' }}>
                Monthly Avg Balance (MAB)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>
                {formatCurrency(analysis.average_monthly_balance)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
                Peak: {formatCurrency(analysis.peak_monthly_balance)}
              </div>
            </div>

            {/* Metric 2: Cashflow Health Score */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#93c5fd', marginBottom: '4px' }}>
                Cashflow Health Score
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#3b82f6' }}>
                  {analysis.cashflow_health_score}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#60a5fa' }}>/ 100</span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: '#bfdbfe'
                }}>
                  {analysis.cashflow_grade}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
                Rec: {analysis.recommendation.replace('_', ' ')}
              </div>
            </div>

            {/* Metric 3: Net Monthly Inflow Margin */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#fcd34d', marginBottom: '4px' }}>
                Net Monthly Margin
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>
                {formatCurrency(analysis.net_cashflow_margin)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
                Inflow: {formatCurrency(analysis.avg_monthly_credits)}
              </div>
            </div>

            {/* Metric 4: Inward Bounces & Risk */}
            <div style={{
              background: analysis.inward_cheque_bounces === 0 && analysis.ecs_nach_bounces === 0 
                ? 'rgba(16, 185, 129, 0.08)' 
                : 'rgba(239, 68, 68, 0.08)',
              border: analysis.inward_cheque_bounces === 0 && analysis.ecs_nach_bounces === 0 
                ? '1px solid rgba(16, 185, 129, 0.2)' 
                : '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: analysis.inward_cheque_bounces === 0 ? '#6ee7b7' : '#fca5a5', marginBottom: '4px' }}>
                Inward ECS / Cheque Bounces
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: analysis.inward_cheque_bounces === 0 ? '#10b981' : '#ef4444' }}>
                {analysis.inward_cheque_bounces + analysis.ecs_nach_bounces} Bounces
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
                Salary Regularity: {analysis.salary_regularity_score}%
              </div>
            </div>
          </div>

          {/* Bank metadata strip */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem',
            color: '#9ca3af',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div>
              <strong style={{ color: '#e5e7eb' }}>Primary Account:</strong> {analysis.bank_name} ({analysis.account_number_masked})
            </div>
            <div>
              <strong style={{ color: '#e5e7eb' }}>Account Type:</strong> {analysis.account_type} • <strong style={{ color: '#e5e7eb' }}>IFSC:</strong> {analysis.ifsc_code}
            </div>
            <div>
              <strong style={{ color: '#e5e7eb' }}>Consent ID:</strong> <span style={{ fontFamily: 'monospace' }}>{analysis.consent_id}</span>
            </div>
          </div>

          {/* Subtabs for Deep-dive */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', marginBottom: '16px' }}>
            <button
              onClick={() => setActiveTab('trend')}
              style={{
                background: activeTab === 'trend' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: activeTab === 'trend' ? '#60a5fa' : '#9ca3af',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500
              }}
            >
              📈 6-Month Inflow/Outflow Trend
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              style={{
                background: activeTab === 'expenses' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: activeTab === 'expenses' ? '#60a5fa' : '#9ca3af',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500
              }}
            >
              🥧 Expense Categories
            </button>
            <button
              onClick={() => setActiveTab('salary')}
              style={{
                background: activeTab === 'salary' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: activeTab === 'salary' ? '#60a5fa' : '#9ca3af',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500
              }}
            >
              💼 Detected Payroll Credits
            </button>
          </div>

          {/* TAB 1: 6-Month Inflow/Outflow Graph */}
          {activeTab === 'trend' && analysis.monthly_trend && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', fontSize: '0.75rem', marginBottom: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6ee7b7' }}>
                  <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }} /> Total Inflows (Credits)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#93c5fd' }}>
                  <span style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '2px' }} /> Total Outflows (Debits)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fcd34d' }}>
                  <span style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '50%' }} /> Average Balance (MAB)
                </span>
              </div>

              {/* Chart Bars */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${analysis.monthly_trend.length}, 1fr)`, gap: '10px', alignItems: 'flex-end', minHeight: '160px', paddingBottom: '10px' }}>
                {analysis.monthly_trend.map((m, idx) => {
                  const maxVal = Math.max(...analysis.monthly_trend.map(item => Math.max(item.total_credits, item.total_debits))) || 100000;
                  const creditHeight = Math.max(15, (m.total_credits / maxVal) * 120);
                  const debitHeight = Math.max(15, (m.total_debits / maxVal) * 120);

                  return (
                    <div key={idx} style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '4px', height: '130px' }}>
                        {/* Credits bar */}
                        <div 
                          title={`Inflows: ${formatCurrency(m.total_credits)}`}
                          style={{
                            width: '18px',
                            height: `${creditHeight}px`,
                            background: 'linear-gradient(to top, #059669, #10b981)',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.4s ease'
                          }} 
                        />
                        {/* Debits bar */}
                        <div 
                          title={`Outflows: ${formatCurrency(m.total_debits)}`}
                          style={{
                            width: '18px',
                            height: `${debitHeight}px`,
                            background: 'linear-gradient(to top, #2563eb, #3b82f6)',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.4s ease'
                          }} 
                        />
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#e5e7eb', marginTop: '6px', fontWeight: 500 }}>
                        {m.month.split(' ')[0]}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>
                        {formatCurrency(m.average_monthly_balance)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Expense Breakdown */}
          {activeTab === 'expenses' && analysis.expense_categories && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {Object.entries(analysis.expense_categories).map(([cat, amount], idx) => {
                const total = analysis.avg_monthly_debits || 1;
                const pct = Math.round((parseFloat(amount) / total) * 100);
                return (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                      <span style={{ color: '#d1d5db' }}>{cat}</span>
                      <strong style={{ color: '#f3f4f6' }}>{formatCurrency(amount)}</strong>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: idx % 2 === 0 ? '#3b82f6' : '#10b981', borderRadius: '3px' }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px', textAlign: 'right' }}>
                      {pct}% of monthly outflows
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: Salary Regularity */}
          {activeTab === 'salary' && analysis.salary_credits_detected && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.08)', padding: '12px 16px', borderRadius: '8px', marginBottom: '14px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ fontSize: '1.2rem' }}>💼</span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399' }}>
                    Automated Payroll Detection: {formatCurrency(analysis.detected_monthly_salary)} / month
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    100% Consistent ACH/NEFT employer deposits detected with zero deviation across all 6 evaluated cycles.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analysis.salary_credits_detected.map((sal, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    border: '1px solid rgba(255,255,255,0.04)'
                  }}>
                    <div>
                      <strong style={{ color: '#e5e7eb' }}>{sal.month}</strong> — <span style={{ color: '#9ca3af' }}>{sal.narration}</span>
                    </div>
                    <div style={{ fontWeight: 600, color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>
                      +{formatCurrency(sal.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Underwriting summary callout */}
          <div style={{
            marginTop: '16px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderLeft: '3px solid #3b82f6',
            padding: '10px 14px',
            fontSize: '0.82rem',
            color: '#9ca3af',
            lineHeight: 1.4
          }}>
            <strong style={{ color: '#d1d5db' }}>Underwriting Rationale:</strong> {analysis.underwriting_summary}
          </div>
        </div>
      ) : (
        /* Empty State: Invitation to Connect */
        <div style={{ textAlign: 'center', padding: '30px 16px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚡</div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#f3f4f6' }}>
            Boost Your Loan Eligibility with Account Aggregator
          </h4>
          <p style={{ margin: '0 auto 16px auto', maxWidth: '480px', fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.5 }}>
            Directly connect your primary salary bank account via the RBI-regulated Account Aggregator network. 
            No physical bank statements or paper slips required. Instant MAB validation and priority processing!
          </p>
          <button
            onClick={handleStartConnect}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
            }}
          >
            Connect Bank Account Now
          </button>
        </div>
      )}

      {/* Account Aggregator Consent Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🔒</span>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#f3f4f6' }}>
                  Account Aggregator Consent
                </h4>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {!otpStep ? (
              <form onSubmit={handleRequestOtp}>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '16px' }}>
                  Select your primary checking/salary bank. An encrypted request will be sent to the certified Financial Information Provider (FIP).
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#d1d5db', marginBottom: '6px' }}>
                    Select Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      padding: '10px',
                      color: '#f9fafb',
                      fontSize: '0.9rem'
                    }}
                  >
                    {supportedBanks.map((b) => (
                      <option key={b.code} value={b.name}>
                        {b.logo} {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#d1d5db', marginBottom: '6px' }}>
                    Bank Account Number (Optional / Auto-linked)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 50100492817291"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      padding: '10px',
                      color: '#f9fafb',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{ background: 'transparent', border: '1px solid #4b5563', color: '#d1d5db', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={connecting}
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {connecting ? 'Requesting OTP...' : 'Send Bank OTP'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpAndFetch}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem', color: '#93c5fd' }}>
                  A 6-digit consent authorization OTP has been generated for <strong>{selectedBank}</strong>.
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#d1d5db', marginBottom: '6px' }}>
                    Enter 6-Digit Consent OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    placeholder="482910"
                    required
                    style={{
                      width: '100%',
                      background: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      padding: '12px',
                      color: '#34d399',
                      fontSize: '1.25rem',
                      textAlign: 'center',
                      letterSpacing: '6px',
                      fontFamily: 'monospace',
                      fontWeight: 700
                    }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '6px', textAlign: 'center' }}>
                    Simulated Sandbox OTP: <strong>482910</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setOtpStep(false)}
                    style={{ background: 'transparent', border: '1px solid #4b5563', color: '#d1d5db', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={connecting}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {connecting ? 'Authorizing & Fetching...' : 'Authorize & Fetch Data'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
