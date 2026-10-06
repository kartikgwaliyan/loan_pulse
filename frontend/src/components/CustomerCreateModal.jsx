import React, { useState } from 'react';
import { api } from '../services/api';
import {
  UserPlus,
  X,
  CheckCircle,
  AlertCircle,
  Briefcase,
  ShieldCheck,
  CreditCard,
  MapPin,
  Lock,
  Mail,
  Phone
} from 'lucide-react';

export const CustomerCreateModal = ({ isOpen, onClose, onCustomerCreated }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: 'Pass@123',
    gender: 'MALE',
    date_of_birth: '1992-05-15',
    marital_status: 'MARRIED',
    pan_number: '',
    aadhaar_number: '',
    address_line1: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    employment_type: 'SALARIED',
    employer_name: '',
    designation: 'Senior Analyst',
    monthly_income: '75000',
    work_experience_years: '4',
    credit_score: '760',
    bank_name: 'HDFC Bank',
    account_number: '50100492817291',
    ifsc_code: 'HDFC0000060'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.first_name || !formData.email || !formData.phone || !formData.pan_number) {
      setError('Please provide at least First Name, Email, Phone, and PAN Number.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        monthly_income: parseFloat(formData.monthly_income) || 50000,
        credit_score: parseInt(formData.credit_score, 10) || 750,
        work_experience_years: parseInt(formData.work_experience_years, 10) || 2
      };

      const res = await api.post('/customers/', payload);
      if (res?.success || res?.customer_id) {
        setSuccessMsg(res?.message || 'New customer successfully created and onboarded!');
        setTimeout(() => {
          if (onCustomerCreated) onCustomerCreated(res?.profile || res);
          onClose();
        }, 1200);
      } else {
        setError(res?.error || 'Failed to create customer.');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err?.message || 'Failed to onboard new customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        maxWidth: '850px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}>
              <UserPlus size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Onboard New Borrower / Customer</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Register walk-in borrower with immediate KYC baseline & financial profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#10b981',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Basic Identity */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> 1. Personal & Identity Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  className="form-input"
                  required
                  placeholder="e.g. Ramesh"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  className="form-input"
                  placeholder="e.g. Verma"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    required
                    placeholder="e.g. ramesh.v@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ paddingLeft: '34px' }}
                  />
                  <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                </div>
              </div>
              <div>
                <label className="form-label">Phone Number (10 digits) *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ paddingLeft: '34px' }}
                  />
                  <Phone size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                </div>
              </div>
              <div>
                <label className="form-label">Permanent PAN *</label>
                <input
                  type="text"
                  name="pan_number"
                  className="form-input mono"
                  required
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  value={formData.pan_number}
                  onChange={e => handleChange({ target: { name: 'pan_number', value: e.target.value.toUpperCase() } })}
                />
              </div>
              <div>
                <label className="form-label">Aadhaar (Last 4 or 12 digits)</label>
                <input
                  type="text"
                  name="aadhaar_number"
                  className="form-input mono"
                  placeholder="XXXX-XXXX-9021"
                  value={formData.aadhaar_number}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Employment & Income */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={16} /> 2. Employment & Income Profile
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label className="form-label">Employment Type</label>
                <select name="employment_type" className="form-select" value={formData.employment_type} onChange={handleChange}>
                  <option value="SALARIED">Salaried (Private / MNC / Govt)</option>
                  <option value="SELF_EMPLOYED">Self Employed Professional</option>
                  <option value="BUSINESS">Business Owner / Enterprise</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">Employer / Enterprise Name</label>
                <input
                  type="text"
                  name="employer_name"
                  className="form-input"
                  placeholder="e.g. Tata Consultancy Services"
                  value={formData.employer_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  name="designation"
                  className="form-input"
                  placeholder="e.g. Project Lead"
                  value={formData.designation}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label">Monthly In-Hand Net Income (₹) *</label>
                <input
                  type="number"
                  name="monthly_income"
                  className="form-input"
                  required
                  placeholder="75000"
                  value={formData.monthly_income}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label">Work Experience (Years)</label>
                <input
                  type="number"
                  name="work_experience_years"
                  className="form-input"
                  value={formData.work_experience_years}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label">Initial Credit Score (300 - 900)</label>
                <input
                  type="number"
                  name="credit_score"
                  className="form-input"
                  min="300"
                  max="900"
                  value={formData.credit_score}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Banking & Address */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard size={16} /> 3. Banking & Disbursement Coordinates
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label className="form-label">Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  className="form-input"
                  placeholder="HDFC Bank"
                  value={formData.bank_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label">Account Number</label>
                <input
                  type="text"
                  name="account_number"
                  className="form-input mono"
                  placeholder="50100492817291"
                  value={formData.account_number}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label">IFSC Code</label>
                <input
                  type="text"
                  name="ifsc_code"
                  className="form-input mono"
                  placeholder="HDFC0000060"
                  value={formData.ifsc_code}
                  onChange={e => handleChange({ target: { name: 'ifsc_code', value: e.target.value.toUpperCase() } })}
                />
              </div>
              <div>
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  className="form-input"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label">Initial Login Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ paddingLeft: '34px' }}
                  />
                  <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '12px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '20px'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                fontWeight: 700
              }}
            >
              <UserPlus size={18} />
              <span>{loading ? 'Onboarding Customer...' : 'Complete & Onboard Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerCreateModal;
