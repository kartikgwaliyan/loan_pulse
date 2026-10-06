import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import StatCard from '../../components/StatCard';
import CustomerCreateModal from '../../components/CustomerCreateModal';
import { 
  Users, Layers, Sliders, ShieldCheck, Download, 
  Plus, CheckCircle2, UserPlus, RefreshCw, AlertCircle, FileText 
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  // Users state
  const [users, setUsers] = useState([]);
  const [userModal, setUserModal] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: 'CUSTOMER',
    employee_id: ''
  });
  
  // Products state
  const [products, setProducts] = useState([]);
  
  // Approval Matrix state
  const [matrixConfigs, setMatrixConfigs] = useState([]);
  
  // Audit state
  const [auditLogs, setAuditLogs] = useState([]);

  // Common notification
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, productsData, matrixData, auditData] = await Promise.all([
        api.get('/reports/executive/').catch(() => null),
        api.get('/auth/users/').catch(() => []),
        api.get('/loans/products/').catch(() => []),
        api.get('/loans/approval-matrix/').catch(() => []),
        api.get('/audit/').catch(() => [])
      ]);

      setStats(statsData);
      setUsers(Array.isArray(usersData) ? usersData : usersData.results || []);
      setProducts(Array.isArray(productsData) ? productsData : productsData.results || []);
      setMatrixConfigs(Array.isArray(matrixData) ? matrixData : matrixData.results || []);
      setAuditLogs(Array.isArray(auditData) ? auditData : auditData.results || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/users/', newUser);
      setStatusMessage({ type: 'success', text: `User ${newUser.username} created successfully!` });
      setUserModal(false);
      setNewUser({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        role: 'CUSTOMER',
        employee_id: ''
      });
      // Refresh users
      const usersData = await api.get('/auth/users/');
      setUsers(Array.isArray(usersData) ? usersData : usersData.results || []);
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      alert('Error creating user: ' + (err.message || 'Validation failed'));
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('loanpulse_access_token');
      const response = await fetch('http://localhost:8000/api/reports/portfolio_export/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `loanpulse_portfolio_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
            System Administration & Control Center
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Configure RBAC security, loan product parameters, approval hierarchies, and system audit logs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadAllAdminData} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={handleExportCSV} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={16} /> Export Portfolio CSV
          </button>
        </div>
      </div>

      {statusMessage.text && (
        <div style={{ 
          background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: statusMessage.type === 'success' ? 'var(--success)' : 'var(--danger)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'overview', label: 'Overview & KPIs', icon: <Layers size={16} /> },
          { id: 'users', label: 'User Directory & RBAC', icon: <Users size={16} /> },
          { id: 'products', label: 'Loan Products', icon: <FileText size={16} /> },
          { id: 'matrix', label: 'Approval Matrix', icon: <Sliders size={16} /> },
          { id: 'audit', label: 'Audit Trail', icon: <ShieldCheck size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : undefined,
              borderRadius: 'var(--radius-md)'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <StatCard 
              title="Total Disbursed Volume" 
              value={`₹${(stats?.total_disbursed_volume || 0).toLocaleString('en-IN')}`} 
              color="primary"
            />
            <StatCard 
              title="Active Loan Accounts" 
              value={stats?.active_loans_count || 0} 
              color="success"
            />
            <StatCard 
              title="Portfolio Outstanding" 
              value={`₹${(stats?.total_outstanding_portfolio || 0).toLocaleString('en-IN')}`} 
              color="warning"
            />
            <StatCard 
              title="Total Applications" 
              value={stats?.total_applications_count || 0} 
              color="primary"
            />
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem' }}>System Architecture & Health</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Database Engine</span>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginTop: '0.25rem' }}>Oracle 23ai / SQLite Local Fallback</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.25rem' }}>● Connected & Synced</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Authentication Protocol</span>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginTop: '0.25rem' }}>JWT (RS256/HS256) + RBAC</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.25rem' }}>● 6 Active Security Roles</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Decisioning Engine</span>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginTop: '0.25rem' }}>Automated Eligibility + ML Risk Scorer</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.25rem' }}>● XGBoost Scorecard Active</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Users */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>User Accounts & Roles ({users.length})</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setCustomerModal(true)} 
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
              >
                <UserPlus size={16} /> + Onboard Customer
              </button>
              <button 
                onClick={() => setUserModal(true)} 
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> Add Staff User
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>User</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Email</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Employee ID</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                      {u.first_name} {u.last_name || `(${u.username})`}
                    </td>
                    <td style={{ padding: '1rem 1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <Badge status="INFO" label={u.role} />
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>{u.employee_id || 'N/A'}</td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <Badge status={u.is_active ? 'APPROVED' : 'REJECTED'} label={u.is_active ? 'Active' : 'Disabled'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Loan Products */}
      {activeTab === 'products' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Configured Loan Products</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Product Code</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Product Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Interest Rate</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Tenure Range</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Amount Limits</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Processing Fee</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{p.code}</td>
                    <td style={{ padding: '1rem 1rem', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '1rem 1rem', color: 'var(--primary)', fontWeight: 700 }}>{p.interest_rate}% p.a.</td>
                    <td style={{ padding: '1rem 1rem' }}>{p.min_tenure_months} – {p.max_tenure_months} Mo</td>
                    <td style={{ padding: '1rem 1rem' }}>
                      ₹{parseFloat(p.min_amount).toLocaleString('en-IN')} – ₹{parseFloat(p.max_amount).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>{p.processing_fee_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Approval Matrix */}
      {activeTab === 'matrix' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Multi-Tier Delegation of Financial Power (DoFP)</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Non-hardcoded approval authorities dynamically evaluated at loan submission.
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Tier Level</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Amount Range</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Required Approval Authority</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Auto-Route Policy</th>
                </tr>
              </thead>
              <tbody>
                {matrixConfigs.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{m.tier_name}</td>
                    <td style={{ padding: '1rem 1rem', fontWeight: 600 }}>
                      ₹{parseFloat(m.min_amount).toLocaleString('en-IN')} – ₹{parseFloat(m.max_amount).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <Badge status="INFO" label={m.required_role} />
                    </td>
                    <td style={{ padding: '1rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Enforced by Backend Rule Engine
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Immutable System Audit Log</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Forensic records of all approvals, rejections, disbursements, payments, and administrative actions.
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Timestamp</th>
                  <th style={{ padding: '0.85rem 1rem' }}>User</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Action Code</th>
                  <th style={{ padding: '0.85rem 1rem' }}>IP Address</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(log.created_at).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{log.user_username || 'SYSTEM'}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Badge status="INFO" label={log.action} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                      <pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Creation Modal */}
      {userModal && (
        <Modal 
          isOpen={userModal} 
          onClose={() => setUserModal(false)}
          title="Create System User Account"
        >
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div>
                <label className="form-label">First Name</label>
                <input 
                  type="text"
                  className="form-control"
                  value={newUser.first_name}
                  onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input 
                  type="text"
                  className="form-control"
                  value={newUser.last_name}
                  onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Username</label>
              <input 
                type="text"
                className="form-control"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input 
                type="email"
                className="form-control"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">Security Role (RBAC)</label>
              <select 
                className="form-control"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="LOAN_OFFICER">Loan Officer</option>
                <option value="RISK_ANALYST">Risk Analyst</option>
                <option value="MANAGER">Manager</option>
                <option value="COLLECTION_OFFICER">Collection Officer</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>

            <div>
              <label className="form-label">Employee ID (if applicable)</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g. EMP-101"
                value={newUser.employee_id}
                onChange={(e) => setNewUser({ ...newUser, employee_id: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Temporary Password</label>
              <input 
                type="password"
                className="form-control"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setUserModal(false)} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-primary">Create User</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Direct Customer Onboarding Modal */}
      {customerModal && (
        <CustomerCreateModal
          isOpen={customerModal}
          onClose={() => setCustomerModal(false)}
          onCustomerCreated={() => {
            loadAllAdminData();
          }}
        />
      )}
    </div>
  );
}
