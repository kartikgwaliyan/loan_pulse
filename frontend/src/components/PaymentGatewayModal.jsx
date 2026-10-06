import React, { useState } from 'react';
import { Modal } from './Modal';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  QrCode,
  Building2,
  CheckCircle,
  AlertCircle,
  Printer,
  ShieldCheck,
  Lock,
  ArrowRight
} from 'lucide-react';

export const PaymentGatewayModal = ({ isOpen, onClose, emi, onPaymentSuccess }) => {
  const [method, setMethod] = useState('UPI');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  if (!emi) return null;

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/payments/pay/', {
        emi_id: emi.id,
        amount: Number(emi.emi_amount),
        payment_method: method,
      });

      if (response.success) {
        setReceipt(response.transaction);
        // Confetti burst for successful repayment celebration!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (onPaymentSuccess) {
          onPaymentSuccess(response.transaction);
        }
      }
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setReceipt(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={receipt ? 'Payment Confirmation Receipt' : `Pay EMI #${emi.installment_number}`}
      maxWidth={receipt ? '650px' : '520px'}
    >
      {receipt ? (
        /* Printable Receipt View */
        <div className="printable-receipt" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'var(--success-light)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            textAlign: 'center',
          }}>
            <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Repayment Processed Successfully!
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Transaction ID: <span className="mono" style={{ fontWeight: 700 }}>{receipt.transaction_id}</span>
            </p>
          </div>

          {/* Receipt Detailed Table */}
          <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            fontSize: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Receipt Number:</span>
              <span className="mono" style={{ fontWeight: 700 }}>{receipt.receipt_number}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Loan ID:</span>
              <span style={{ fontWeight: 600 }}>{receipt.loan_id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Installment:</span>
              <span style={{ fontWeight: 600 }}>EMI #{receipt.installment_number || emi.installment_number}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Customer Name:</span>
              <span style={{ fontWeight: 600 }}>{receipt.customer_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Payment Mode:</span>
              <span style={{ fontWeight: 600 }}>{receipt.payment_method}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed var(--border-color)', paddingTop: '10px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>Amount Paid:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>
                ₹{Number(receipt.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button onClick={handlePrint} className="btn btn-secondary">
              <Printer size={16} />
              <span>Print Receipt</span>
            </button>
            <button onClick={handleClose} className="btn btn-primary">
              Done
            </button>
          </div>
        </div>
      ) : (
        /* Payment Checkout Flow */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* EMI Summary Card */}
          <div style={{
            background: 'var(--bg-muted)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Total Due
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                ₹{Number(emi.emi_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
              <div style={{ color: 'var(--text-muted)' }}>Due Date</div>
              <div style={{ fontWeight: 700 }}>{emi.due_date}</div>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              Select Payment Method
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setMethod('UPI')}
                style={{
                  padding: '12px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: method === 'UPI' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: method === 'UPI' ? 'var(--primary-light)' : 'var(--bg-card)',
                  color: method === 'UPI' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.825rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <QrCode size={20} />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('NET_BANKING')}
                style={{
                  padding: '12px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: method === 'NET_BANKING' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: method === 'NET_BANKING' ? 'var(--primary-light)' : 'var(--bg-card)',
                  color: method === 'NET_BANKING' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.825rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Building2 size={20} />
                <span>Net Banking</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('DEBIT_CARD')}
                style={{
                  padding: '12px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: method === 'DEBIT_CARD' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: method === 'DEBIT_CARD' ? 'var(--primary-light)' : 'var(--bg-card)',
                  color: method === 'DEBIT_CARD' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.825rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <CreditCard size={20} />
                <span>Debit Card</span>
              </button>
            </div>
          </div>

          {/* Method Specific Inputs */}
          {method === 'UPI' && (
            <div style={{
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 12px',
                background: '#ffffff',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e2e8f0',
              }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=upi://pay?pa=loanpulse@hdfcbank&pn=LoanPulse&am=${emi.emi_amount}&cu=INR`}
                  alt="UPI QR Code"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Scan QR using GPay, PhonePe, or Paytm</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UPI ID: loanpulse@hdfcbank</div>
            </div>
          )}

          {method === 'NET_BANKING' && (
            <div className="form-group">
              <label className="form-label">Select Your Bank</label>
              <select
                className="form-select"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
              >
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="State Bank of India">State Bank of India (SBI)</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
              </select>
            </div>
          )}

          {method === 'DEBIT_CARD' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  className="form-input mono"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Expiry</label>
                  <input type="text" className="form-input" defaultValue="10/29" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">CVV</label>
                  <input type="password" className="form-input mono" defaultValue="•••" maxLength={3} />
                </div>
              </div>
            </div>
          )}

          {/* Security Guarantee */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}>
            <Lock size={14} color="#10b981" />
            <span>256-Bit SSL Encrypted Sandbox Payment Gateway</span>
          </div>

          {/* Action Button */}
          <button
            onClick={handlePay}
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
          >
            {loading ? (
              <span>Processing Transaction...</span>
            ) : (
              <>
                <span>Pay ₹{Number(emi.emi_amount).toLocaleString('en-IN')}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      )}
    </Modal>
  );
};
