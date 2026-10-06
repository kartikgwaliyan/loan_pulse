import React, { useState, useEffect } from 'react';
import { sanctionLetterAPI } from '../services/api';
import confetti from 'canvas-confetti';

export default function SanctionLetterModal({ applicationId, isOpen, onClose, onSigned }) {
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && applicationId) {
      loadLetter();
    }
  }, [isOpen, applicationId]);

  const loadLetter = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await sanctionLetterAPI.getLetter(applicationId);
      if (res?.success && res.sanction_letter) {
        setLetter(res.sanction_letter);
      }
    } catch (err) {
      setError(err.message || 'Unable to generate sanction letter');
    } finally {
      setLoading(false);
    }
  };

  const handleESign = async () => {
    try {
      setSigning(true);
      const res = await sanctionLetterAPI.esign(applicationId);
      if (res?.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        await loadLetter();
        if (onSigned) onSigned();
      }
    } catch (err) {
      alert('e-Sign Error: ' + err.message);
    } finally {
      setSigning(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        color: '#111827',
        width: '100%',
        maxWidth: '780px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Controls Bar (Non-printable) */}
        <div className="no-print" style={{
          background: '#0f172a',
          color: '#f8fafc',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
            <span>📜</span>
            <span>Official Loan Sanction Letter</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>🖨️</span> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                color: '#94a3b8',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Formal Sanction Letter Document Body */}
        <div style={{ padding: '36px', fontFamily: 'Inter, sans-serif' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
              <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '12px' }}>Generating formal sanction letter...</p>
            </div>
          ) : error ? (
            <div style={{ color: '#ef4444', textAlign: 'center', padding: '40px' }}>
              <p>{error}</p>
            </div>
          ) : letter ? (
            <div>
              {/* Bank Official Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2563eb', paddingBottom: '16px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.5px' }}>
                    LOANPULSE
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
                    Digital Lending & Credit Sanctioning Core
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                    Registered Office: Fintech Valley, 4th Cross, Outer Ring Road, Bengaluru 560103
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1f2937' }}>
                    CREDIT SANCTION ADVICE
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: '4px' }}>
                    Ref: <strong style={{ fontFamily: 'monospace' }}>{letter.letter_reference}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Date: {letter.sanction_date}
                  </div>
                </div>
              </div>

              {/* Salutation & Subject */}
              <div style={{ marginBottom: '20px', fontSize: '0.88rem', lineHeight: 1.6, color: '#374151' }}>
                <div style={{ fontWeight: 700, color: '#111827' }}>To:</div>
                <div style={{ fontWeight: 600 }}>{letter.applicant.name}</div>
                <div>Customer ID: <span style={{ fontFamily: 'monospace' }}>{letter.applicant.customer_id}</span></div>
                <div>PAN: <span style={{ fontFamily: 'monospace' }}>{letter.applicant.pan_number}</span></div>
                <div>Address: {letter.applicant.address}</div>
                <div style={{ marginTop: '12px', fontWeight: 700, color: '#1e3a8a' }}>
                  Subject: In-Principle Sanction of {letter.loan_terms.facility_name} facility for ₹{letter.loan_terms.sanctioned_amount.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Opening Statement */}
              <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.6, marginBottom: '20px' }}>
                Dear <strong>{letter.applicant.name}</strong>,<br />
                With reference to your loan application, we are pleased to convey the approval and sanction of your credit facility as per the terms and conditions outlined hereunder:
              </p>

              {/* Facility Terms Matrix Table */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
                marginBottom: '24px',
                border: '1px solid #e5e7eb'
              }}>
                <tbody>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563', width: '40%' }}>Credit Facility</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#111827' }}>{letter.loan_terms.facility_name} ({letter.loan_terms.facility_code})</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>Sanctioned Principal Amount</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800, color: '#059669', fontSize: '1.05rem', fontFamily: 'monospace' }}>
                      ₹{letter.loan_terms.sanctioned_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>Annual Interest Rate</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#111827' }}>
                      {letter.loan_terms.interest_rate}% p.a. ({letter.loan_terms.interest_type})
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>Repayment Tenure</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#111827' }}>{letter.loan_terms.tenure_months} Months ({letter.loan_terms.tenure_months / 12} Years)</td>
                  </tr>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>Monthly Equated Installment (EMI)</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800, color: '#2563eb', fontSize: '1.05rem', fontFamily: 'monospace' }}>
                      ₹{letter.loan_terms.monthly_emi.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / month
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>Processing Fee</td>
                    <td style={{ padding: '10px 14px', color: '#111827' }}>
                      ₹{letter.loan_terms.processing_fee.toLocaleString('en-IN')} ({letter.loan_terms.processing_fee_percent}% of sanctioned loan)
                    </td>
                  </tr>
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>Sanction Validity</td>
                    <td style={{ padding: '10px 14px', color: '#b45309', fontWeight: 600 }}>30 Days (Valid until {letter.valid_until})</td>
                  </tr>
                </tbody>
              </table>

              {/* Conditions */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                  Conditions Precedent to Fund Disbursement:
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.8rem', color: '#4b5563', lineHeight: 1.6 }}>
                  {letter.disbursement_conditions.map((cond, idx) => (
                    <li key={idx}>{cond}</li>
                  ))}
                </ul>
              </div>

              {/* Digital Signature & Acceptance Strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                borderTop: '2px dashed #cbd5e1',
                paddingTop: '20px',
                marginTop: '20px'
              }}>
                {/* Bank Digital Stamp */}
                <div style={{
                  border: '1px solid #bfdbfe',
                  background: '#eff6ff',
                  borderRadius: '10px',
                  padding: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8' }}>
                    <span>🛡️</span>
                    <span>DIGITALLY SIGNED BY SANCTIONING AUTHORITY</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
                    {letter.digital_sign_authority.authorized_by}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#4b5563' }}>
                    {letter.digital_sign_authority.authority_title}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: '6px', fontFamily: 'monospace' }}>
                    Verification Hash: {letter.verification_token}
                  </div>
                </div>

                {/* Borrower Digital e-Sign Stamp */}
                <div style={{
                  border: letter.esign.status === 'SIGNED' ? '1px solid #bbf7d0' : '1px solid #fed7aa',
                  background: letter.esign.status === 'SIGNED' ? '#f0fdf4' : '#fffbeb',
                  borderRadius: '10px',
                  padding: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: letter.esign.status === 'SIGNED' ? '#15803d' : '#b45309' }}>
                    <span>{letter.esign.status === 'SIGNED' ? '✅' : '⏳'}</span>
                    <span>BORROWER ACCEPTANCE & E-SIGN</span>
                  </div>
                  {letter.esign.status === 'SIGNED' ? (
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
                        Digitally Signed by {letter.applicant.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#15803d' }}>
                        Legally Bound & Timestamped: {letter.esign.timestamp}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: '6px', fontFamily: 'monospace' }}>
                        IP: {letter.esign.ip_address || '127.0.0.1'} • UID: {letter.applicant.customer_id}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#92400e', marginTop: '4px' }}>
                        Awaiting your digital e-Sign acknowledgment.
                      </div>
                      <button
                        onClick={handleESign}
                        disabled={signing}
                        className="no-print"
                        style={{
                          marginTop: '10px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>✍️</span> {signing ? 'Applying Signature...' : 'e-Sign & Accept Now'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
