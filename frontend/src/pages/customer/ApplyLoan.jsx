import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../../components/Badge';
import confetti from 'canvas-confetti';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Calculator,
  ShieldCheck,
  TrendingUp,
  FileText
} from 'lucide-react';

export const ApplyLoan = ({ onNavigate, onNavigateTab, onComplete, initialProduct }) => {
  const navigate = onNavigate || onNavigateTab || onComplete || (() => {});
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [amount, setAmount] = useState(250000);
  const [tenure, setTenure] = useState(24);
  const [purpose, setPurpose] = useState('');
  
  // Realtime automated underwriting evaluation
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get('/loans/products/');
        const list = data?.results || (Array.isArray(data) ? data : []);
        setProducts(list);
        if (initialProduct) {
          setSelectedProduct(initialProduct);
        } else if (list.length > 0) {
          setSelectedProduct(list[0]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProducts();
  }, [initialProduct]);

  // Run automated eligibility engine check whenever amount/tenure/product changes
  const runEligibilityCheck = async () => {
    if (!selectedProduct) return;
    setCheckingEligibility(true);
    setError(null);
    try {
      const res = await api.post('/loans/applications/check-eligibility/', {
        product_id: selectedProduct.id,
        requested_amount: amount,
        tenure_months: tenure,
      });
      if (res.success) {
        setEligibilityResult(res.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingEligibility(false);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      const timer = setTimeout(() => {
        runEligibilityCheck();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedProduct, amount, tenure]);

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/loans/applications/', {
        product: selectedProduct.id,
        requested_amount: amount,
        tenure_months: tenure,
        purpose: purpose || 'General financial requirement',
      });
      setSubmittedApp(res);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setError(err.message || 'Failed to submit loan application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedApp) {
    return (
      <div className="card animate-fade-in" style={{ maxWidth: '640px', margin: '40px auto', padding: '40px', textAlign: 'center' }}>
        <CheckCircle2 size={56} color="var(--success)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Application Submitted Successfully!</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.95rem' }}>
          Your digital loan origination application has been received and registered into the underwriting pipeline.
        </p>

        <div style={{
          background: 'var(--bg-muted)',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          margin: '28px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          fontSize: '0.9rem',
          textAlign: 'left',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Application ID:</span>
            <span className="mono" style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem' }}>
              {submittedApp.application_id}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Product:</span>
            <span style={{ fontWeight: 700 }}>{selectedProduct?.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Requested Amount:</span>
            <span style={{ fontWeight: 700 }}>₹{amount.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Eligibility Status:</span>
            <Badge status={submittedApp.eligibility_status} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => navigate('applications')} className="btn btn-primary btn-lg">
            <span>Track Application Progress</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Apply for a Digital Loan</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Configure your facility and run instant automated credit eligibility checks.
        </p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Step 1: Product Selection Cards */}
      <div>
        <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>
          1. Select Loan Product
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          {products.map((p) => {
            const isSelected = selectedProduct?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProduct(p);
                  setAmount(Math.max(Number(p.min_amount), Math.min(amount, Number(p.max_amount))));
                  setTenure(Math.max(p.min_tenure_months, Math.min(tenure, p.max_tenure_months)));
                }}
                style={{
                  background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '1rem', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {p.interest_rate_min}% – {p.interest_rate_max}% p.a.
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Amount & Tenure Configuration */}
      {selectedProduct && (
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>
            2. Configure Amount & Tenure
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Amount Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Requested Loan Amount
                </span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{amount.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={Number(selectedProduct.min_amount)}
                max={Number(selectedProduct.max_amount)}
                step="10000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>Min: ₹{Number(selectedProduct.min_amount).toLocaleString('en-IN')}</span>
                <span>Max: ₹{Number(selectedProduct.max_amount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Tenure Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Tenure ({Math.floor(tenure / 12)}y {tenure % 12}m)
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {tenure} Months
                </span>
              </div>
              <input
                type="range"
                min={selectedProduct.min_tenure_months}
                max={selectedProduct.max_tenure_months}
                step="6"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>{selectedProduct.min_tenure_months} Months</span>
                <span>{selectedProduct.max_tenure_months} Months</span>
              </div>
            </div>

            {/* Purpose */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Purpose of Loan</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. Home improvements, vehicle purchase, debt consolidation"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Real-Time Underwriting Eligibility Engine Results Card */}
      {eligibilityResult && (
        <div className="card" style={{
          border: eligibilityResult.status === 'ELIGIBLE'
            ? '1px solid rgba(16, 185, 129, 0.4)'
            : '1px solid rgba(245, 158, 11, 0.4)',
          background: eligibilityResult.status === 'ELIGIBLE'
            ? 'var(--success-light)'
            : 'var(--warning-light)',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={22} color={eligibilityResult.status === 'ELIGIBLE' ? 'var(--success)' : '#d97706'} />
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                Automated Underwriting Engine Result
              </span>
            </div>
            <Badge status={eligibilityResult.status} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '16px',
          }}>
            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Underwriting Score</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                {eligibilityResult.score} / 100
              </div>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projected DTI Ratio</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                {eligibilityResult.dti_ratio}%
              </div>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Monthly EMI</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                ₹{Number(eligibilityResult.calculated_emi).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong>Assessment:</strong> {eligibilityResult.reason}
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          onClick={handleSubmitApplication}
          disabled={submitting || checkingEligibility}
          className="btn btn-primary btn-lg"
        >
          <Send size={18} />
          <span>{submitting ? 'Submitting Application...' : 'Submit Loan Application'}</span>
        </button>
      </div>
    </div>
  );
};

export default ApplyLoan;
