import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import CashflowAnalysisCard from '../../components/CashflowAnalysisCard';
import {
  ShieldAlert,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  Brain,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const RiskAnalystDashboard = () => {
  const [assessments, setAssessments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [analystNotes, setAnalystNotes] = useState('');

  const fetchRiskData = async () => {
    try {
      const aData = await api.get('/risk/');
      const aList = aData?.results || (Array.isArray(aData) ? aData : []);
      setAssessments(aList);

      const appData = await api.get('/loans/applications/', { status: 'RISK_ASSESSMENT' });
      const appList = appData?.results || (Array.isArray(appData) ? appData : []);
      setApplications(appList);
      if (appList.length > 0 && !selectedApp) {
        setSelectedApp(appList[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  const handleTriggerMlEvaluation = async (appId) => {
    setEvaluating(true);
    try {
      await api.post(`/risk/evaluate/${appId}/`, {
        analyst_notes: analystNotes || 'Risk Analyst ML credit scoring completed.',
      });
      fetchRiskData();
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const lowRiskCount = assessments.filter(a => a.risk_category === 'LOW').length;
  const medRiskCount = assessments.filter(a => a.risk_category === 'MEDIUM').length;
  const highRiskCount = assessments.filter(a => a.risk_category === 'HIGH').length;

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading risk workbench...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Credit Risk & Underwriting Workbench</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          ML-driven default probability estimation, DTI obligation analysis, and credit bureau risk grading.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard title="Awaiting Risk Review" value={applications.length} subtitle="Applications in Pipeline" icon={Activity} color="primary" />
        <StatCard title="Low Risk Cohort" value={lowRiskCount} subtitle="Prime Grade (PD < 5%)" icon={CheckCircle} color="success" />
        <StatCard title="Moderate Risk Cohort" value={medRiskCount} subtitle="Near-Prime (PD 5-12%)" icon={AlertTriangle} color="warning" />
        <StatCard title="High Risk / Elevated" value={highRiskCount} subtitle="Subprime (PD > 12%)" icon={ShieldAlert} color="danger" />
      </div>

      {/* Main Review Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        alignItems: 'start',
      }}>
        {/* Applications Awaiting Assessment */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
            Risk Review Queue ({applications.length})
          </h3>

          {applications.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No applications pending risk review at this time.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {applications.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="mono" style={{ fontWeight: 800 }}>{app.application_id}</span>
                      <Badge status={app.eligibility_status} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{app.customer_details?.full_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      ₹{Number(app.requested_amount).toLocaleString('en-IN')} • DTI: {app.dti_ratio}% • CIBIL: {app.customer_details?.credit_score}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Deep Dive ML Model Assessment Card */}
        {selectedApp && (
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ML Risk Evaluation</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }} className="mono">
                  {selectedApp.application_id}
                </h3>
              </div>
              <button
                onClick={() => handleTriggerMlEvaluation(selectedApp.application_id)}
                disabled={evaluating}
                className="btn btn-primary btn-sm"
              >
                <Brain size={16} />
                <span>{evaluating ? 'Running Model...' : 'Trigger ML Risk Scoring'}</span>
              </button>
            </div>

            {/* Applicant Financial Indicators */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              background: 'var(--bg-muted)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CIBIL Bureau</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--success)' }}>
                  {selectedApp.customer_details?.credit_score || 750}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DTI Obligation</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  {selectedApp.dti_ratio}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly Income</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{Number(selectedApp.customer_details?.monthly_income || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Decision Support Banner */}
            <div style={{
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}>
              <strong>Regulatory Advisory:</strong> ML predictive output is provided as <em>decision support</em> for credit underwriting teams and does not constitute an unconditional automated approval or rejection.
            </div>

            <div className="form-group">
              <label className="form-label">Analyst Credit Notes</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Enter underwriting observations..."
                value={analystNotes}
                onChange={(e) => setAnalystNotes(e.target.value)}
              />
            </div>

            {/* Account Aggregator & Bank Statement Cashflow Analytics */}
            <div style={{ marginTop: '24px' }}>
              <CashflowAnalysisCard 
                applicationId={selectedApp.application_id}
                customerProfile={selectedApp.customer_details}
                onAnalysisComplete={fetchRiskData}
              />
            </div>
          </div>
        )}
      </div>

      {/* Historical Risk Assessments Table */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
          Historical Underwriting Assessments ({assessments.length})
        </h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Applicant</th>
                <th>Model Name</th>
                <th>Risk Score</th>
                <th>Default Prob (PD)</th>
                <th>Risk Category</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => (
                <tr key={a.id}>
                  <td className="mono" style={{ fontWeight: 700 }}>{a.application_id}</td>
                  <td>{a.customer_name}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.model_name}</td>
                  <td style={{ fontWeight: 800 }}>{a.risk_score} / 100</td>
                  <td className="mono" style={{ fontWeight: 700 }}>{(Number(a.default_probability) * 100).toFixed(2)}%</td>
                  <td><Badge status={a.risk_category} /></td>
                  <td>
                    <span className="badge badge-info">{a.recommendation}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalystDashboard;
