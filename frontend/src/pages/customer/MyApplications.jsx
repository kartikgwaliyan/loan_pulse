import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../../components/Badge';
import {
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  User,
  ArrowRight
} from 'lucide-react';
import SanctionLetterModal from '../../components/SanctionLetterModal';

export const MyApplications = ({ onNavigate, onNavigateTab }) => {
  const navigate = onNavigate || onNavigateTab || (() => {});
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [sanctionModalApp, setSanctionModalApp] = useState(null);

  const fetchApplications = async () => {
    try {
      const data = await api.get('/loans/applications/');
      const list = data?.results || (Array.isArray(data) ? data : []);
      setApplications(list);
      if (list.length > 0 && !selectedApp) {
        setSelectedApp(list[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading applications...</div>;
  }

  const pipelineStages = [
    { key: 'SUBMITTED', label: 'Application Submitted' },
    { key: 'DOC_VERIFICATION', label: 'Document Verification' },
    { key: 'RISK_ASSESSMENT', label: 'Risk Assessment' },
    { key: 'MANAGER_APPROVAL', label: 'Manager Approval' },
    { key: 'APPROVED', label: 'Sanctioned' },
    { key: 'DISBURSED', label: 'Disbursement Active' },
  ];

  const getStageIndex = (status) => {
    switch (status) {
      case 'SUBMITTED': return 0;
      case 'DOC_VERIFICATION': return 1;
      case 'UNDER_REVIEW': return 1;
      case 'RISK_ASSESSMENT': return 2;
      case 'MANAGER_APPROVAL': return 3;
      case 'APPROVED': return 4;
      case 'DISBURSED': return 5;
      case 'REJECTED': return -1;
      default: return 0;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>My Loan Applications</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Real-time status tracking across each underwriting, approval, and disbursement milestone.
          </p>
        </div>
        <button onClick={() => onNavigateTab('apply')} className="btn btn-primary">
          <span>New Application</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <FolderOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Applications Found</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            You haven't submitted any loan applications yet.
          </p>
          <button onClick={() => navigate('apply')} className="btn btn-primary">
            Apply Now
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}>
          {/* Applications List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {applications.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="card"
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className="mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {app.application_id}
                    </span>
                    <Badge status={app.status} />
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>
                    {app.product_details?.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    ₹{Number(app.requested_amount).toLocaleString('en-IN')} • {app.tenure_months} Months
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Submitted: {new Date(app.created_at).toLocaleDateString()}</span>
                    <span>Eligibility: <strong>{app.eligibility_status}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Visual Tracker for Selected Application */}
          {selectedApp && (
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Application Tracking Dossier
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }} className="mono">
                    {selectedApp.application_id}
                  </h3>
                </div>
                <Badge status={selectedApp.status} />
              </div>

              {/* Stepper Progress Bar */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {pipelineStages.map((stage, idx) => {
                    const currentIdx = getStageIndex(selectedApp.status);
                    const isPassed = currentIdx >= idx && currentIdx !== -1;
                    const isCurrent = currentIdx === idx;
                    const isRejected = selectedApp.status === 'REJECTED' && idx === 0;

                    return (
                      <div key={stage.key} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: isPassed ? 'var(--success)' : (isCurrent ? 'var(--primary)' : 'var(--bg-muted)'),
                            color: isPassed || isCurrent ? '#fff' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}>
                            {isPassed ? <CheckCircle2 size={16} /> : idx + 1}
                          </div>
                          {idx < pipelineStages.length - 1 && (
                            <div style={{ width: '2px', height: '24px', background: isPassed ? 'var(--success)' : 'var(--border-color)', margin: '4px 0' }}></div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: isCurrent ? 800 : (isPassed ? 700 : 500), fontSize: '0.9rem', color: isPassed || isCurrent ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {stage.label}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {isPassed ? 'Completed' : (isCurrent ? 'Current Processing Stage' : 'Pending')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sanction Letter & e-Sign Callout */}
              {['APPROVED', 'DISBURSED'].includes(selectedApp.status) && (
                <div style={{
                  background: 'var(--success-light)',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  marginBottom: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 800, fontSize: '0.95rem' }}>
                      <ShieldCheck size={20} /> Official Digital Sanction Letter Issued
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '520px' }}>
                      {selectedApp.esign_status === 'COMPLETED'
                        ? '✓ Legally binding digital e-Sign completed. View, download, or verify your official sanction dossier anytime.'
                        : 'Your loan has been sanctioned by the Credit Committee. Review sanctioned terms and complete 1-click legal e-Sign to initiate instant disbursement.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSanctionModalApp(selectedApp.id)}
                    className="btn btn-primary"
                    style={{
                      padding: '10px 18px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FolderOpen size={16} />
                    {selectedApp.esign_status === 'COMPLETED' ? 'View Sanction Letter' : 'Review & e-Sign Letter'}
                  </button>
                </div>
              )}

              {/* Remarks / Timeline Log */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>
                  Activity & Underwriting Notes
                </h4>
                <div style={{
                  background: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  fontSize: '0.85rem',
                }}>
                  {selectedApp.timeline && selectedApp.timeline.length > 0 ? (
                    selectedApp.timeline.map((item, tIdx) => (
                      <div key={tIdx} style={{ borderBottom: tIdx < selectedApp.timeline.length - 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span>{item.stage}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{item.remarks}</p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Officer: {item.performed_by_name || 'Automated Engine'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: 'var(--text-muted)' }}>No timeline entries yet recorded.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sanction Letter e-Sign Modal */}
      {sanctionModalApp && (
        <SanctionLetterModal
          applicationId={sanctionModalApp}
          isOpen={!!sanctionModalApp}
          onClose={() => setSanctionModalApp(null)}
          onSigned={() => {
            fetchApplications();
          }}
        />
      )}
    </div>
  );
};

export default MyApplications;
