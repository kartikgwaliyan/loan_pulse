import React, { useState, useEffect } from 'react';
import { healthAPI } from '../services/api';

export default function DocsPortal({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('src'); // 'src' | 'health' | 'api'
  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'health') {
      fetchHealth();
    }
  }, [activeTab]);

  const fetchHealth = async () => {
    try {
      setHealthLoading(true);
      const data = await healthAPI.getDiagnostics();
      setHealthData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setHealthLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', color: 'var(--text-primary)' }}>
      {/* Top Banner */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>📚</span>
            <span>Knowledge Base & Technical Architecture</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '6px 0 4px 0', color: 'var(--text-primary)' }}>
            LoanPulse Documentation & System Specifications
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Browse formal specifications, source code guides, live server diagnostics, and OpenAPI documentation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href="http://localhost:8000/api/docs/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'var(--primary)',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)'
            }}
          >
            <span>⚡</span> Open Swagger UI
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('src')}
          style={{
            background: activeTab === 'src' ? 'var(--primary-light)' : 'transparent',
            border: activeTab === 'src' ? '1px solid #dbeafe' : '1px solid transparent',
            color: activeTab === 'src' ? 'var(--primary)' : 'var(--text-secondary)',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          💻 Architecture & Technical Guide
        </button>
        <button
          onClick={() => setActiveTab('health')}
          style={{
            background: activeTab === 'health' ? 'var(--primary-light)' : 'transparent',
            border: activeTab === 'health' ? '1px solid #dbeafe' : '1px solid transparent',
            color: activeTab === 'health' ? 'var(--primary)' : 'var(--text-secondary)',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          🩺 Live Health & Diagnostics
        </button>
        <button
          onClick={() => setActiveTab('api')}
          style={{
            background: activeTab === 'api' ? 'var(--primary-light)' : 'transparent',
            border: activeTab === 'api' ? '1px solid #dbeafe' : '1px solid transparent',
            color: activeTab === 'api' ? 'var(--primary)' : 'var(--text-secondary)',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          🔌 API Reference & Endpoints
        </button>
      </div>

      {/* TAB 2: SRC Document & Architecture Guide */}
      {activeTab === 'src' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 0 }}>
              🏗️ Monorepo Component & Application Hierarchy
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: 'var(--primary)' }}>Core Engine</strong>
                <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', paddingLeft: '18px', lineHeight: 1.6 }}>
                  <li>Django 5.1.15 REST Framework</li>
                  <li>SimpleJWT Stateless Token Claims</li>
                  <li>Dual-Engine: Oracle 23ai + SQLite</li>
                  <li>Atomic Financial Transactions</li>
                </ul>
              </div>

              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: 'var(--success)' }}>Underwriting & Risk</strong>
                <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', paddingLeft: '18px', lineHeight: 1.6 }}>
                  <li>XGBoost ML Credit Scoring Engine</li>
                  <li>Account Aggregator 6M MAB Analyzer</li>
                  <li>Automated DTI/FOIR Pre-check</li>
                  <li>DoFP Multi-Tier Approval Matrix</li>
                </ul>
              </div>

              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: 'var(--warning)' }}>Loan Lifecycle</strong>
                <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', paddingLeft: '18px', lineHeight: 1.6 }}>
                  <li>Actuarial Amortization (E = P*r...)</li>
                  <li>Digital Sanction Letter & e-Sign</li>
                  <li>e-NACH Auto-Debit Mandate</li>
                  <li>DPD Aging (SMA-0 to NPA)</li>
                </ul>
              </div>

              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: 'var(--primary)' }}>Frontend & 3D UI</strong>
                <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', paddingLeft: '18px', lineHeight: 1.6 }}>
                  <li>React 18 Single-Page Application</li>
                  <li>Card3D with Gyro Tilt & Flip</li>
                  <li>CreditScoreGauge3D with Clean Scales</li>
                  <li>Same-Origin Vite Reverse Proxy</li>
                </ul>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Full source code guide file: <code style={{ color: 'var(--primary)' }}>docs/SRC_DOCUMENT_LOANPULSE.md</code>
          </div>
        </div>
      )}

      {/* TAB 3: Live Health Check & System Diagnostics */}
      {activeTab === 'health' && (
        <div>
          {healthLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '12px' }}>Polling /api/health/ diagnostics...</p>
            </div>
          ) : healthData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Status Header Strip */}
              <div style={{
                background: healthData.status === 'UP' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: healthData.status === 'UP' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{healthData.status === 'UP' ? '🟢' : '🔴'}</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: healthData.status === 'UP' ? '#34d399' : '#f87171' }}>
                      System Status: {healthData.status}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Timestamp: {healthData.timestamp} • Version: {healthData.version}
                    </span>
                  </div>
                </div>

                <button
                  onClick={fetchHealth}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Refresh Diagnostics
                </button>
              </div>

              {/* Sub-system diagnostics cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Database Metrics */}
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Database Connection
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {healthData.diagnostics.database.status}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Engine: <strong style={{ color: 'var(--text-primary)' }}>{healthData.diagnostics.database.engine}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Query Latency: <strong style={{ color: 'var(--success)' }}>{healthData.diagnostics.database.latency_ms} ms</strong>
                  </div>
                </div>

                {/* Machine Learning Model Engine */}
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    ML Credit Risk Engine
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                    {healthData.diagnostics.ml_engine.status}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Model: <strong style={{ color: 'var(--text-primary)' }}>{healthData.diagnostics.ml_engine.model}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Training Callset: <strong style={{ color: 'var(--warning)' }}>{healthData.diagnostics.ml_engine.dataset_benchmark_records.toLocaleString()} records</strong>
                  </div>
                </div>

                {/* Portfolio Summary */}
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Portfolio Telemetry
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {healthData.diagnostics.portfolio_summary.active_credit_facilities} Active Loans
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Registered Borrowers: <strong style={{ color: 'var(--text-primary)' }}>{healthData.diagnostics.portfolio_summary.total_registered_borrowers}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Settled Transactions: <strong style={{ color: 'var(--text-primary)' }}>{healthData.diagnostics.portfolio_summary.repayment_transactions_settled}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <button onClick={fetchHealth} className="btn btn-primary">Run Diagnostics Now</button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: API Reference */}
      {activeTab === 'api' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
            Production REST API Endpoints
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            All APIs follow the OpenAPI 3.0 specification with standard JWT Bearer authentication.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { m: 'POST', u: '/api/auth/login/', d: 'Multi-credential user authentication (username or email)' },
              { m: 'GET', u: '/api/loans/products/', d: 'Retrieves public catalog of active credit products' },
              { m: 'POST', u: '/api/loans/applications/check-eligibility/', d: 'Automated underwriting pre-check evaluating DTI' },
              { m: 'POST', u: '/api/risk/account-aggregator/connect/', d: 'Digital consent flow for 6-month MAB & statement analysis' },
              { m: 'GET', u: '/api/loans/applications/{id}/sanction-letter/', d: 'Official digital sanction letter with QR verification' },
              { m: 'POST', u: '/api/loans/applications/{id}/esign/', d: 'Borrower electronic e-Sign acceptance' },
              { m: 'POST', u: '/api/payments/mandates/register/', d: 'Registers e-NACH auto-debit mandate with UMRN' },
              { m: 'POST', u: '/api/payments/pay/', d: 'Executes simulated repayment with instant tax receipt' },
              { m: 'GET', u: '/api/health/', d: 'System latency and service health check' }
            ].map((ep, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bg-muted)',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <span style={{
                  background: ep.m === 'POST' ? 'var(--success-light)' : 'var(--primary-light)',
                  color: ep.m === 'POST' ? 'var(--success)' : 'var(--primary)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  border: ep.m === 'POST' ? '1px solid #bbf7d0' : '1px solid #dbeafe'
                }}>
                  {ep.m}
                </span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {ep.u}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {ep.d}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
