import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import {
  HelpCircle,
  Plus,
  Send,
  MessageSquare,
  Clock,
  User,
  CheckCircle2
} from 'lucide-react';

export const CustomerSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // New ticket state
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('ACCOUNT');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTickets = async () => {
    try {
      const data = await api.get('/support/tickets/');
      const list = data?.results || (Array.isArray(data) ? data : []);
      setTickets(list);
      if (list.length > 0 && !selectedTicket) {
        setSelectedTicket(list[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/support/tickets/', {
        subject: newSubject,
        category: newCategory,
        priority: newPriority,
        description: newDesc,
      });
      setShowCreateModal(false);
      setNewSubject('');
      setNewDesc('');
      fetchTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;
    setSendingReply(true);
    try {
      await api.post(`/support/tickets/${selectedTicket.ticket_id}/reply/`, {
        message: replyMessage,
      });
      setReplyMessage('');
      const updated = await api.get(`/support/tickets/${selectedTicket.ticket_id}/`);
      setSelectedTicket(updated);
      fetchTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading support tickets...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Customer Helpdesk & Support</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Raise operational inquiries regarding KYC, EMI debits, loan statements, or interest certificates.
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>New Support Ticket</span>
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        alignItems: 'start',
      }}>
        {/* Ticket List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tickets.length === 0 ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No support tickets found. Click "New Support Ticket" above if you have an inquiry.
            </div>
          ) : (
            tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className="card"
                  style={{
                    padding: '18px',
                    cursor: 'pointer',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {t.ticket_id}
                    </span>
                    <Badge status={t.status} />
                  </div>
                  <h4 style={{ fontSize: '0.975rem', fontWeight: 700, marginBottom: '6px' }}>{t.subject}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Category: {t.category}</span>
                    <span>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Ticket Conversation */}
        {selectedTicket && (
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="mono" style={{ fontWeight: 800, color: 'var(--primary)' }}>
                  {selectedTicket.ticket_id}
                </span>
                <Badge status={selectedTicket.status} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedTicket.subject}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                {selectedTicket.description}
              </p>
            </div>

            {/* Messages Thread */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
              {selectedTicket.messages && selectedTicket.messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    background: 'var(--bg-muted)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.sender_name}</span>
                    <span>{new Date(m.created_at).toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{m.message}</p>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Type your response to support..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                required
              />
              <button type="submit" disabled={sendingReply} className="btn btn-primary">
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Support Ticket"
      >
        <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-input"
              placeholder="Brief summary of inquiry"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Category</label>
              <select className="form-select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                <option value="ACCOUNT">Account & Profile</option>
                <option value="EMI">EMI & Repayment</option>
                <option value="DISBURSEMENT">Disbursement</option>
                <option value="KYC">KYC Documents</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Priority</label>
              <select className="form-select" value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Detailed Description</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Provide details regarding your issue..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={creating} className="btn btn-primary">
              {creating ? 'Creating...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
