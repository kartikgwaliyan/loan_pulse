import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import StatCard from '../../components/StatCard';
import { 
  AlertTriangle, Phone, Calendar, Clock, DollarSign, 
  MessageSquare, User, CheckCircle2, ChevronRight, Search, Filter 
} from 'lucide-react';

export default function CollectionDashboard() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bucketFilter, setBucketFilter] = useState('ALL');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activityModal, setActivityModal] = useState(false);
  
  // Action form state
  const [activityType, setActivityType] = useState('PHONE_CALL');
  const [outcome, setOutcome] = useState('PROMISE_TO_PAY');
  const [notes, setNotes] = useState('');
  const [nextFollowup, setNextFollowup] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await api.get('/collections/overdue/');
      setAccounts(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to load overdue accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordActivity = async (e) => {
    e.preventDefault();
    if (!selectedAccount) return;
    setSubmitting(true);
    setActionSuccess('');

    try {
      await api.post(`/collections/overdue/${selectedAccount.id}/record_activity/`, {
        activity_type: activityType,
        outcome: outcome,
        notes: notes,
        next_followup_date: nextFollowup || null
      });
      setActionSuccess('Collection activity logged successfully');
      setTimeout(() => {
        setActivityModal(false);
        setActionSuccess('');
        setNotes('');
        fetchAccounts();
      }, 1200);
    } catch (err) {
      alert('Failed to log activity: ' + (err.message || 'Error occurred'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = 
      acc.loan_account_number?.toLowerCase().includes(search.toLowerCase()) ||
      acc.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      acc.customer_phone?.includes(search);
    const matchesBucket = bucketFilter === 'ALL' || acc.bucket === bucketFilter;
    return matchesSearch && matchesBucket;
  });

  const totalOverdue = accounts.reduce((sum, a) => sum + parseFloat(a.overdue_amount || 0), 0);
  const bucket30 = accounts.filter(a => a.bucket === '30+').length;
  const bucket60 = accounts.filter(a => a.bucket === '60+').length;
  const bucket90 = accounts.filter(a => a.bucket === '90+' || a.bucket === 'NPA').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
          Collection & Delinquency Management
        </h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Monitor delinquent loan portfolios, manage overdue buckets, and record debtor engagement.
        </p>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <StatCard 
          title="Total Overdue Amount" 
          value={`₹${totalOverdue.toLocaleString('en-IN')}`} 
          icon={<DollarSign size={22} />}
          color="error"
        />
        <StatCard 
          title="Bucket 30+ DPD" 
          value={bucket30} 
          icon={<Clock size={22} />}
          color="warning"
        />
        <StatCard 
          title="Bucket 60+ DPD" 
          value={bucket60} 
          icon={<AlertTriangle size={22} />}
          color="error"
        />
        <StatCard 
          title="Critical / 90+ DPD" 
          value={bucket90} 
          icon={<AlertTriangle size={22} />}
          color="error"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by customer name, phone, or loan ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Bucket:</span>
          {['ALL', '30+', '60+', '90+', 'NPA'].map(bucket => (
            <button
              key={bucket}
              onClick={() => setBucketFilter(bucket)}
              className={`btn ${bucketFilter === bucket ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              {bucket}
            </button>
          ))}
        </div>
      </div>

      {/* Delinquent Accounts Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
            Delinquent Accounts Queue ({filteredAccounts.length})
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Sorted by highest Days Past Due (DPD)
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading overdue portfolio...
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No accounts found matching filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Loan Account</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Borrower</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Overdue Amount</th>
                  <th style={{ padding: '0.85rem 1rem' }}>DPD</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Bucket</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map(account => (
                  <tr key={account.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                      {account.loan_account_number}
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{account.customer_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{account.customer_phone}</div>
                    </td>
                    <td style={{ padding: '1rem 1rem', color: 'var(--danger)', fontWeight: 700 }}>
                      ₹{parseFloat(account.overdue_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem 1rem', fontWeight: 700 }}>
                      {account.days_past_due} Days
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <Badge 
                        status={
                          account.bucket === '90+' || account.bucket === 'NPA' ? 'REJECTED' :
                          account.bucket === '60+' ? 'PENDING' : 'INFO'
                        }
                        label={account.bucket}
                      />
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <Badge status={account.status === 'RESOLVED' ? 'APPROVED' : 'PENDING'} label={account.status} />
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => {
                          setSelectedAccount(account);
                          setActivityModal(true);
                        }}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Phone size={14} /> Log Action
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Collection Activity Modal */}
      {activityModal && selectedAccount && (
        <Modal 
          isOpen={activityModal} 
          onClose={() => setActivityModal(false)}
          title={`Collection Engagement: ${selectedAccount.loan_account_number}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Borrower: </span>
                  <strong>{selectedAccount.customer_name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Contact: </span>
                  <strong>{selectedAccount.customer_phone}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Overdue: </span>
                  <strong style={{ color: 'var(--danger)' }}>₹{parseFloat(selectedAccount.overdue_amount || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Days Past Due: </span>
                  <strong>{selectedAccount.days_past_due} Days</strong>
                </div>
              </div>
            </div>

            {actionSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} />
                <span>{actionSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRecordActivity} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Engagement Channel</label>
                <select 
                  className="form-control"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                >
                  <option value="PHONE_CALL">Phone Call</option>
                  <option value="SMS_REMINDER">Automated SMS Reminder</option>
                  <option value="EMAIL_NOTICE">Legal / Demand Notice via Email</option>
                  <option value="FIELD_VISIT">Physical Field Visit</option>
                  <option value="LEGAL_NOTICE">Legal Notice Dispatched</option>
                </select>
              </div>

              <div>
                <label className="form-label">Interaction Outcome</label>
                <select 
                  className="form-control"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                >
                  <option value="PROMISE_TO_PAY">Promise to Pay (PTP)</option>
                  <option value="CALL_BACK_LATER">Requested Callback</option>
                  <option value="DISPUTE_RAISED">Borrower Disputed Amount</option>
                  <option value="UNREACHABLE">Unreachable / Switched Off</option>
                  <option value="REFUSED_TO_PAY">Refused to Pay</option>
                  <option value="FULL_PAYMENT_COLLECTED">Payment Completed</option>
                </select>
              </div>

              <div>
                <label className="form-label">Follow-up Date (Optional)</label>
                <input 
                  type="date"
                  className="form-control"
                  value={nextFollowup}
                  onChange={(e) => setNextFollowup(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Discussion Notes & Remarks</label>
                <textarea 
                  className="form-control"
                  rows={3}
                  placeholder="Record summary of conversation, debtor reasons for delay, and commitments made..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setActivityModal(false)}
                  className="btn btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving Activity...' : 'Submit Collection Log'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
