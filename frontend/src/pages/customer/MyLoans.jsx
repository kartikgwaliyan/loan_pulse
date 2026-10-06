import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../../components/Badge';
import { PaymentGatewayModal } from '../../components/PaymentGatewayModal';
import AutoDebitMandateModal from '../../components/AutoDebitMandateModal';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Printer,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export const MyLoans = ({ onNavigate, onNavigateTab }) => {
  const navigate = onNavigate || onNavigateTab || (() => {});
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmiForPay, setSelectedEmiForPay] = useState(null);
  const [mandateModalLoan, setMandateModalLoan] = useState(null);

  const fetchLoans = async () => {
    try {
      const data = await api.get('/loans/');
      const list = data?.results || (Array.isArray(data) ? data : []);
      setLoans(list);
      if (list.length > 0) {
        setSelectedLoan(list[0]);
        fetchSchedule(list[0].loan_id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async (loanId) => {
    try {
      const data = await api.get('/payments/emi-schedules/', { loan_id: loanId });
      const items = data?.results || (Array.isArray(data) ? data : []);
      setSchedules(items);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleSelectLoan = (loan) => {
    setSelectedLoan(loan);
    fetchSchedule(loan.loan_id);
  };

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading loan accounts & amortization schedules...</div>;
  }

  if (loans.length === 0) {
    return (
      <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
        <CreditCard size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>No Active Loans Found</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px', marginBottom: '20px' }}>
          Once your loan application is sanctioned and disbursed, its full repayment schedule will appear here.
        </p>
        <button onClick={() => navigate('apply')} className="btn btn-primary">
          Explore Products & Apply
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Loan Accounts & EMI Schedule</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Detailed month-by-month financial amortization, principal-interest splits, and instant payment actions.
        </p>
      </div>

      {/* Loan Switcher Tabs */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
        {loans.map((l) => (
          <button
            key={l.id}
            onClick={() => handleSelectLoan(l)}
            style={{
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              border: selectedLoan?.id === l.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              background: selectedLoan?.id === l.id ? 'var(--primary-light)' : 'var(--bg-card)',
              color: selectedLoan?.id === l.id ? 'var(--primary)' : 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 700,
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
            }}
          >
            <CreditCard size={18} />
            <span>{l.loan_id} ({l.product_name})</span>
            <Badge status={l.status} />
          </button>
        ))}
      </div>

      {/* Selected Loan Overview Card */}
      {selectedLoan && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
            marginBottom: '28px',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sanctioned Facility</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{Number(selectedLoan.sanctioned_amount).toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Interest Rate</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                {selectedLoan.interest_rate}% p.a.
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Monthly EMI</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
                ₹{Number(selectedLoan.monthly_emi).toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Remaining Principal</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                ₹{Number(selectedLoan.outstanding_principal).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Auto-Debit Mandate Status & Action */}
          <div style={{
            background: 'var(--bg-muted)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <RefreshCw size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>NPCI e-NACH Auto-Debit Mandate</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}>
                    Active Protection
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Set up automated bank deduction for monthly ₹{Number(selectedLoan.monthly_emi).toLocaleString('en-IN')} to prevent late penalties.
                </div>
              </div>
            </div>
            <button
              onClick={() => setMandateModalLoan(selectedLoan)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <ShieldCheck size={16} color="var(--primary)" />
              Setup / Manage e-NACH
            </button>
          </div>

          {/* EMI Amortization Table */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Repayment Schedule ({schedules.length} Installments)
            </h3>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
            >
              <Printer size={14} />
              <span>Print Schedule</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Due Date</th>
                  <th>Principal (₹)</th>
                  <th>Interest (₹)</th>
                  <th>EMI Amount (₹)</th>
                  <th>Balance (₹)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((row) => (
                  <tr key={row.id}>
                    <td className="mono" style={{ fontWeight: 700 }}>{row.installment_number}</td>
                    <td>{row.due_date}</td>
                    <td>{Number(row.principal_amount).toLocaleString('en-IN')}</td>
                    <td>{Number(row.interest_amount).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700 }}>{Number(row.emi_amount).toLocaleString('en-IN')}</td>
                    <td className="mono">{Number(row.remaining_balance).toLocaleString('en-IN')}</td>
                    <td><Badge status={row.status} /></td>
                    <td>
                      {row.status === 'PAID' ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} /> Paid {row.paid_date}
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedEmiForPay(row)}
                          className="btn btn-primary btn-sm"
                        >
                          Pay EMI
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {selectedEmiForPay && (
        <PaymentGatewayModal
          isOpen={!!selectedEmiForPay}
          onClose={() => setSelectedEmiForPay(null)}
          emi={selectedEmiForPay}
          onPaymentSuccess={() => {
            if (selectedLoan) fetchSchedule(selectedLoan.loan_id);
            fetchLoans();
          }}
        />
      )}

      {/* Auto-Debit Mandate Registration Modal */}
      {mandateModalLoan && (
        <AutoDebitMandateModal
          loanId={mandateModalLoan.id}
          loanAccountNumber={mandateModalLoan.loan_id}
          emiAmount={mandateModalLoan.monthly_emi}
          isOpen={!!mandateModalLoan}
          onClose={() => setMandateModalLoan(null)}
          onRegistered={() => {
            fetchLoans();
          }}
        />
      )}
    </div>
  );
};

export default MyLoans;
