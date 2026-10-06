import React, { useState } from 'react';
import { mandateAPI } from '../services/api';
import confetti from 'canvas-confetti';

export default function AutoDebitMandateModal({ loan, isOpen, onClose, onMandateCreated }) {
  const [bankName, setBankName] = useState(loan?.customer_details?.bank_name || 'HDFC Bank');
  const [accountNumber, setAccountNumber] = useState(loan?.customer_details?.account_number || '');
  const [ifscCode, setIfscCode] = useState(loan?.customer_details?.ifsc_code || 'HDFC0000240');
  const [authMode, setAuthMode] = useState('NET_BANKING');
  const [loading, setLoading] = useState(false);
  const [registeredMandate, setRegisteredMandate] = useState(null);

  if (!isOpen || !loan) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        loan_id: loan.loan_id,
        bank_name: bankName,
        account_number: accountNumber || '50100492817291',
        ifsc_code: ifscCode,
        auth_mode: authMode,
        max_amount: parseFloat(loan.monthly_emi || 15000) * 2
      };
      const res = await mandateAPI.register(payload);
      if (res?.success && res.mandate) {
        setRegisteredMandate(res.mandate);
        confetti({ particleCount: 70, spread: 60 });
        if (onMandateCreated) onMandateCreated(res.mandate);
      }
    } catch (err) {
      alert('Mandate Registration Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px'
    }}>
      <div style={{
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        padding: '28px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        color: '#f9fafb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🔄</span>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
              e-NACH Auto-Debit Mandate
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {registeredMandate ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎉</div>
            <h4 style={{ fontSize: '1.2rem', color: '#10b981', margin: '0 0 8px 0' }}>
              e-NACH Mandate Registered!
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '20px' }}>
              Automatic monthly EMI debits have been authorized for <strong>{registeredMandate.loan_id}</strong>.
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'left',
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>UMRN (Mandate Ref):</span>
                <strong style={{ color: '#f3f4f6', fontFamily: 'monospace' }}>{registeredMandate.umrn}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Authorized Bank:</span>
                <span style={{ color: '#f3f4f6' }}>{registeredMandate.bank_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Max Debit Ceiling:</span>
                <strong style={{ color: '#10b981' }}>₹{parseFloat(registeredMandate.max_amount).toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Authentication Mode:</span>
                <span style={{ color: '#60a5fa' }}>{registeredMandate.auth_mode}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              fontSize: '0.82rem',
              color: '#bfdbfe'
            }}>
              Authorize automated electronic debits for monthly EMI of <strong>₹{parseFloat(loan.monthly_emi || 0).toLocaleString('en-IN')}</strong> on the contractual due date. Never miss an installment!
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#d1d5db', marginBottom: '6px' }}>
                Selected Facility
              </label>
              <input
                type="text"
                disabled
                value={`${loan.loan_id} • ${loan.product_name || 'Credit Facility'}`}
                style={{
                  width: '100%',
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#9ca3af',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#d1d5db', marginBottom: '6px' }}>
                Bank Name
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#f9fafb',
                  fontSize: '0.85rem'
                }}
              >
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="State Bank of India">State Bank of India</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#d1d5db', marginBottom: '6px' }}>
                  Account Number
                </label>
                <input
                  type="text"
                  placeholder="50100492817291"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#f9fafb',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#d1d5db', marginBottom: '6px' }}>
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#f9fafb',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#d1d5db', marginBottom: '6px' }}>
                Authentication Channel
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {['NET_BANKING', 'DEBIT_CARD', 'AADHAAR'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAuthMode(mode)}
                    style={{
                      background: authMode === mode ? 'rgba(59, 130, 246, 0.25)' : '#1f2937',
                      border: authMode === mode ? '1px solid #3b82f6' : '1px solid #374151',
                      color: authMode === mode ? '#93c5fd' : '#9ca3af',
                      padding: '8px 4px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {mode.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'transparent', border: '1px solid #4b5563', color: '#d1d5db', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Authenticating with NPCI...' : 'Register e-NACH Mandate'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
