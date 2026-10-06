import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import CustomerCreateModal from '../../components/CustomerCreateModal';
import {
  FolderOpen,
  FileCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  User,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export const LoanOfficerDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [kycDocs, setKycDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null); // 'VERIFY_DOCS', 'REQUEST_INFO', 'REJECT'
  const [remarks, setRemarks] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);

  const fetchApplications = async () => {
    try {
      const data = await api.get('/loans/applications/');
      const list = data?.results || (Array.isArray(data) ? data : []);
      setApplications(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchKycDocsForCustomer = async (customerId) => {
    try {
      const data = await api.get('/kyc/documents/', { customer_id: customerId });
      const list = data?.results || (Array.isArray(data) ? data : []);
      setKycDocs(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleOpenAppDossier = (app) => {
    setSelectedApp(app);
    if (app.customer_details?.customer_id) {
      fetchKycDocsForCustomer(app.customer_details.customer_id);
    }
  };

  const handleProcessAction = async () => {
    if (!selectedApp || !actionModal) return;
    setSubmittingAction(true);
    try {
      await api.post(`/loans/applications/${selectedApp.application_id}/review/`, {
        action: actionModal,
        remarks: remarks,
      });
      setActionModal(null);
      setRemarks('');
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleVerifyKycDoc = async (docId, statusDecision) => {
    try {
      await api.post(`/kyc/documents/${docId}/verify/`, {
        status: statusDecision,
        remarks: `Document marked ${statusDecision} by Loan Officer`,
      });
      if (selectedApp?.customer_details?.customer_id) {
        fetchKycDocsForCustomer(selectedApp.customer_details.customer_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchSearch = (
      app.application_id.toLowerCase().includes(search.toLowerCase()) ||
      app.customer_details?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      app.product_details?.name?.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = applications.filter(a => ['SUBMITTED', 'DOC_VERIFICATION', 'UNDER_REVIEW'].includes(a.status)).length;
  const approvedCount = applications.filter(a => ['APPROVED', 'DISBURSED'].includes(a.status)).length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Loan Officer Application Desk</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Review submitted loan applications, inspect KYC credentials, and recommend credit sanctions.
          </p>
        </div>
        <button
          onClick={() => setShowCreateCustomer(true)}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 700 }}
        >
          <UserPlus size={18} />
          <span>+ Onboard Walk-In Customer</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard title="Applications in Queue" value={applications.length} subtitle="Total Applications" icon={FolderOpen} color="primary" />
        <StatCard title="Pending Review" value={pendingCount} subtitle="Requires Officer Action" icon={AlertCircle} color="warning" />
        <StatCard title="Sanctioned / Active" value={approvedCount} subtitle="Approved Facilities" icon={CheckCircle} color="success" />
        <StatCard title="Declined Applications" value={rejectedCount} subtitle="Failed Underwriting" icon={XCircle} color="danger" />
      </div>

      {/* Queue Filters & Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by ID, Customer, or Product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter:</span>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="DOC_VERIFICATION">Doc Verification</option>
              <option value="RISK_ASSESSMENT">Risk Review</option>
              <option value="MANAGER_APPROVAL">Manager Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="DISBURSED">Disbursed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Applicant</th>
                <th>Product</th>
                <th>Requested (₹)</th>
                <th>Tenure</th>
                <th>Underwriting Status</th>
                <th>Pipeline Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id}>
                  <td className="mono" style={{ fontWeight: 800, color: 'var(--primary)' }}>
                    {app.application_id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{app.customer_details?.full_name || 'Customer'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.customer_details?.customer_id}</div>
                  </td>
                  <td>{app.product_details?.name}</td>
                  <td style={{ fontWeight: 700 }}>₹{Number(app.requested_amount).toLocaleString('en-IN')}</td>
                  <td>{app.tenure_months}m</td>
                  <td><Badge status={app.eligibility_status} /></td>
                  <td><Badge status={app.status} /></td>
                  <td>
                    <button
                      onClick={() => handleOpenAppDossier(app)}
                      className="btn btn-primary btn-sm"
                    >
                      <span>Review Dossier</span>
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Review Dossier Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Application Dossier • ${selectedApp.application_id}`}
          maxWidth="720px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Applicant Summary */}
            <div style={{
              background: 'var(--bg-muted)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              fontSize: '0.85rem',
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Customer Name:</span>
                <div style={{ fontWeight: 700 }}>{selectedApp.customer_details?.full_name}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Monthly Income:</span>
                <div style={{ fontWeight: 700 }}>₹{Number(selectedApp.customer_details?.monthly_income || 0).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Credit Bureau Score:</span>
                <div style={{ fontWeight: 700, color: 'var(--success)' }}>{selectedApp.customer_details?.credit_score || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>DTI Obligation Ratio:</span>
                <div style={{ fontWeight: 700 }}>{selectedApp.dti_ratio}%</div>
              </div>
            </div>

            {/* KYC Documents Section */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>
                KYC Verification Credentials
              </h4>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Ref Number</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kycDocs.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.document_type.replace('_', ' ')}</td>
                        <td className="mono">{doc.document_number || '—'}</td>
                        <td><Badge status={doc.status} /></td>
                        <td style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleVerifyKycDoc(doc.id, 'VERIFIED')}
                            className="btn btn-success btn-sm"
                            title="Verify document"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => handleVerifyKycDoc(doc.id, 'REJECTED')}
                            className="btn btn-danger btn-sm"
                            title="Reject document"
                          >
                            <XCircle size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Decision Controls */}
            <div style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setActionModal('REQUEST_INFO')}
                className="btn btn-secondary"
              >
                Request More Info
              </button>
              <button
                onClick={() => setActionModal('REJECT')}
                className="btn btn-danger"
              >
                Reject Application
              </button>
              <button
                onClick={() => setActionModal('VERIFY_DOCS')}
                className="btn btn-primary"
              >
                <CheckCircle size={16} />
                <span>Verify & Advance to Risk Review</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Remarks Modal */}
      {actionModal && (
        <Modal
          isOpen={!!actionModal}
          onClose={() => setActionModal(null)}
          title={`Confirm Action: ${actionModal.replace('_', ' ')}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Add underwriting remarks to be recorded into the official audit timeline.
            </p>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Officer Remarks / Notes</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Enter remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setActionModal(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleProcessAction} disabled={submittingAction} className="btn btn-primary">
                {submittingAction ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Customer Creation Modal */}
      {showCreateCustomer && (
        <CustomerCreateModal
          isOpen={showCreateCustomer}
          onClose={() => setShowCreateCustomer(false)}
          onCustomerCreated={() => {
            fetchApplications();
          }}
        />
      )}
    </div>
  );
};

export default LoanOfficerDashboard;
