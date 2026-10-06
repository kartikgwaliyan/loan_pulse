import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import {
  Award,
  DollarSign,
  CheckCircle,
  XCircle,
  Send,
  Building,
  CreditCard,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const ManagerDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loans, setLoans] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);

  // Approval action
  const [actionType, setActionType] = useState(null); // 'APPROVE', 'REJECT'
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Disbursement action
  const [disbursementModalApp, setDisbursementModalApp] = useState(null);
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountNumber, setAccountNumber] = useState('5010049281726');
  const [ifscCode, setIfscCode] = useState('HDFC0000123');
  const [disbursing, setDisbursing] = useState(false);
  const [disbursementSuccess, setDisbursementSuccess] = useState(null);

  const fetchData = async () => {
    try {
      const aData = await api.get('/loans/applications/');
      const aList = aData?.results || (Array.isArray(aData) ? aData : []);
      setApplications(aList);

      const lData = await api.get('/loans/');
      const lList = lData?.results || (Array.isArray(lData) ? lData : []);
      setLoans(lList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDecision = async () => {
    if (!selectedApp || !actionType) return;
    setSubmitting(true);
    try {
      await api.post(`/loans/applications/${selectedApp.application_id}/approve/`, {
        decision: actionType,
        remarks: remarks || `Credit authority ${actionType.toLowerCase()} decision recorded.`,
      });
      setSelectedApp(null);
      setActionType(null);
      setRemarks('');
      fetchData();
    } catch (err) {
      alert(err.message || 'Approval matrix authority error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecuteDisbursement = async (e) => {
    e.preventDefault();
    if (!disbursementModalApp) return;
    setDisbursing(true);
    try {
      const res = await api.post(`/loans/applications/${disbursementModalApp.application_id}/disburse/`, {
        bank_name: bankName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        remarks: 'Disbursed via automated bank RTGS gateway',
      });
      setDisbursementSuccess(res);
      fetchData();
    } catch (err) {
      alert(err.message || 'Disbursement failure.');
    } finally {
      setDisbursing(false);
    }
  };

  const pendingApprovals = applications.filter(a => ['MANAGER_APPROVAL', 'DOC_VERIFICATION', 'RISK_ASSESSMENT'].includes(a.status));
  const readyForDisbursement = applications.filter(a => a.status === 'APPROVED');

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading credit manager portal...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Branch & Credit Manager Portal</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          High-value credit sanctions, approval matrix authorization, and automated fund disbursement.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard title="Sanctions Pending" value={pendingApprovals.length} subtitle="Awaiting Approval" icon={Award} color="warning" />
        <StatCard title="Ready for Disbursement" value={readyForDisbursement.length} subtitle="Sanctioned Loans" icon={DollarSign} color="info" />
        <StatCard title="Total Disbursed Facilities" value={loans.length} subtitle="Active Portfolios" icon={CreditCard} color="success" />
        <StatCard title="Approval Delegation Matrix" value="3 Tiers" subtitle="Configured in Admin" icon={ShieldCheck} color="primary" />
      </div>

      {/* Ready for Disbursement Section */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Sanctioned Loans Awaiting Disbursement ({readyForDisbursement.length})
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Loans formally approved by credit authority ready for bank RTGS fund transfer.
            </p>
          </div>
          <span className="badge badge-success">DISBURSEMENT READY</span>
        </div>

        {readyForDisbursement.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            No approved loans currently waiting for disbursement.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Sanctioned Amount</th>
                  <th>Tenure</th>
                  <th>Sanctioned By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {readyForDisbursement.map((app) => (
                  <tr key={app.id}>
                    <td className="mono" style={{ fontWeight: 800 }}>{app.application_id}</td>
                    <td>{app.customer_details?.full_name}</td>
                    <td>{app.product_details?.name}</td>
                    <td style={{ fontWeight: 800, color: 'var(--success)' }}>₹{Number(app.requested_amount).toLocaleString('en-IN')}</td>
                    <td>{app.tenure_months}m</td>
                    <td>{app.approved_by_name || 'Credit Manager'}</td>
                    <td>
                      <button
                        onClick={() => {
                          setDisbursementModalApp(app);
                          setBankName(app.customer_details?.bank_name || 'HDFC Bank');
                          setAccountNumber(app.customer_details?.account_number || '5010049281726');
                          setIfscCode(app.customer_details?.ifsc_code || 'HDFC0000123');
                          setDisbursementSuccess(null);
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        <DollarSign size={14} />
                        <span>Disburse Funds</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Credit Approvals Queue */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
          Credit Approvals Queue ({applications.length})
        </h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Applicant</th>
                <th>Product</th>
                <th>Amount (₹)</th>
                <th>Score</th>
                <th>DTI Ratio</th>
                <th>Stage</th>
                <th>Decision Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td className="mono" style={{ fontWeight: 700 }}>{app.application_id}</td>
                  <td>{app.customer_details?.full_name}</td>
                  <td>{app.product_details?.name}</td>
                  <td style={{ fontWeight: 700 }}>₹{Number(app.requested_amount).toLocaleString('en-IN')}</td>
                  <td>{app.eligibility_score}</td>
                  <td>{app.dti_ratio}%</td>
                  <td><Badge status={app.status} /></td>
                  <td>
                    {app.status !== 'APPROVED' && app.status !== 'DISBURSED' && app.status !== 'REJECTED' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setActionType('APPROVE');
                          }}
                          className="btn btn-success btn-sm"
                        >
                          <CheckCircle size={14} />
                          <span>Sanction</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setActionType('REJECT');
                          }}
                          className="btn btn-danger btn-sm"
                        >
                          <XCircle size={14} />
                          <span>Decline</span>
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Decision Finalized</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sanction Decision Modal */}
      {selectedApp && actionType && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Credit Sanction Authority • ${selectedApp.application_id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <div><strong>Applicant:</strong> {selectedApp.customer_details?.full_name}</div>
              <div><strong>Amount:</strong> ₹{Number(selectedApp.requested_amount).toLocaleString('en-IN')}</div>
              <div><strong>Decision:</strong> <span style={{ fontWeight: 800, color: actionType === 'APPROVE' ? 'var(--success)' : 'var(--danger)' }}>{actionType}</span></div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Manager Sanction Remarks</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Enter credit sanction notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setSelectedApp(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDecision} disabled={submitting} className={`btn btn-${actionType === 'APPROVE' ? 'success' : 'danger'}`}>
                {submitting ? 'Recording Sanction...' : `Confirm ${actionType}`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Disbursement Modal */}
      {disbursementModalApp && (
        <Modal
          isOpen={!!disbursementModalApp}
          onClose={() => setDisbursementModalApp(null)}
          title={`Disbursement Processing Desk • ${disbursementModalApp.application_id}`}
          maxWidth="600px"
        >
          {disbursementSuccess ? (
            <div style={{ textAlign: 'center', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <CheckCircle size={56} color="var(--success)" style={{ margin: '0 auto' }} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Funds Disbursed Successfully!</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Loan record activated. Generated <strong>{disbursementSuccess.emis_generated}</strong> monthly amortization schedule installments.
              </p>
              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '0.85rem' }}>
                <div><strong>Loan ID:</strong> {disbursementSuccess.loan?.loan_id}</div>
                <div><strong>UTR Reference:</strong> {disbursementSuccess.disbursement?.transaction_reference}</div>
                <div><strong>Monthly EMI:</strong> ₹{Number(disbursementSuccess.loan?.monthly_emi).toLocaleString('en-IN')}</div>
              </div>
              <button onClick={() => setDisbursementModalApp(null)} className="btn btn-primary" style={{ alignSelf: 'center' }}>
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleExecuteDisbursement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--bg-muted)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                <div><strong>Applicant:</strong> {disbursementModalApp.customer_details?.full_name}</div>
                <div><strong>Sanctioned Amount:</strong> ₹{Number(disbursementModalApp.requested_amount).toLocaleString('en-IN')}</div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Beneficiary Bank Name</label>
                <input type="text" className="form-input" value={bankName} onChange={(e) => setBankName(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Bank Account Number</label>
                  <input type="text" className="form-input mono" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">IFSC Code</label>
                  <input type="text" className="form-input mono" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setDisbursementModalApp(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={disbursing} className="btn btn-primary btn-lg">
                  {disbursing ? 'Executing RTGS Transfer...' : 'Execute RTGS Disbursement'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default ManagerDashboard;
