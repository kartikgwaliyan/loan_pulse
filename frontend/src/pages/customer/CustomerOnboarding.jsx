import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../../components/Badge';
import confetti from 'canvas-confetti';
import {
  User,
  Briefcase,
  CreditCard,
  FileCheck,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const CustomerOnboarding = ({ onComplete, onNavigateTab }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    date_of_birth: '',
    gender: 'Male',
    pan_number: '',
    aadhaar_number: '',
    marital_status: 'Single',
    address_line1: '',
    city: '',
    state: '',
    pincode: '',
    employment_type: 'SALARIED',
    employer_name: '',
    designation: '',
    monthly_income: '',
    annual_income: '',
    work_experience_years: '2',
    existing_loans_count: '0',
    monthly_obligations: '0',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
  });

  // Doc upload state
  const [docType, setDocType] = useState('PAN');
  const [docNumber, setDocNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const fetchProfileAndDocs = async () => {
    try {
      const pRes = await api.get('/customers/me/');
      if (pRes?.profile) {
        setProfile(pRes.profile);
        setFormData({
          date_of_birth: pRes.profile.date_of_birth || '',
          gender: pRes.profile.gender || 'Male',
          pan_number: pRes.profile.pan_number || '',
          aadhaar_number: pRes.profile.aadhaar_number || '',
          marital_status: pRes.profile.marital_status || 'Single',
          address_line1: pRes.profile.address_line1 || '',
          city: pRes.profile.city || '',
          state: pRes.profile.state || '',
          pincode: pRes.profile.pincode || '',
          employment_type: pRes.profile.employment_type || 'SALARIED',
          employer_name: pRes.profile.employer_name || '',
          designation: pRes.profile.designation || '',
          monthly_income: pRes.profile.monthly_income || '',
          annual_income: pRes.profile.annual_income || '',
          work_experience_years: pRes.profile.work_experience_years || '2',
          existing_loans_count: pRes.profile.existing_loans_count || '0',
          monthly_obligations: pRes.profile.monthly_obligations || '0',
          bank_name: pRes.profile.bank_name || '',
          account_number: pRes.profile.account_number || '',
          ifsc_code: pRes.profile.ifsc_code || '',
        });
      }

      const dRes = await api.get('/kyc/documents/');
      setDocuments(dRes?.results || (Array.isArray(dRes) ? dRes : []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndDocs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveStep = async (nextStep = null) => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload = { ...formData };
      if (nextStep === 5) {
        payload.onboarding_completed = true;
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
      const res = await api.put('/customers/me/', payload);
      if (res.success) {
        setProfile(res.profile);
        setMessage('Profile details updated successfully.');
        if (nextStep) setStep(nextStep);
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    setUploadingDoc(true);
    setError(null);
    setMessage(null);

    const body = new FormData();
    body.append('document_type', docType);
    body.append('document_number', docNumber);
    body.append('file', selectedFile);

    try {
      await api.post('/kyc/documents/', body);
      setMessage('Document uploaded successfully. Sent for officer review.');
      setSelectedFile(null);
      setDocNumber('');
      const dRes = await api.get('/kyc/documents/');
      setDocuments(dRes?.results || (Array.isArray(dRes) ? dRes : []));
    } catch (err) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading onboarding profile...</div>;
  }

  const stepsMeta = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Employment', icon: Briefcase },
    { num: 3, title: 'Financials', icon: CreditCard },
    { num: 4, title: 'KYC Vault', icon: FileCheck },
  ];

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Customer Onboarding & KYC</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Complete your digital verification to unlock higher loan amounts and faster automated sanctions.
        </p>
      </div>

      {/* Stepper Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-card)',
        padding: '16px 24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflowX: 'auto',
      }}>
        {stepsMeta.map((s, idx) => {
          const Icon = s.icon;
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <React.Fragment key={s.num}>
              <div
                onClick={() => setStep(s.num)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  opacity: isCurrent || isDone ? 1 : 0.5,
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: isDone ? 'var(--success)' : (isCurrent ? 'var(--primary)' : 'var(--bg-muted)'),
                  color: isDone || isCurrent ? '#fff' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}>
                  {isDone ? <CheckCircle size={18} /> : <Icon size={18} />}
                </div>
                <div style={{ whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Step 0{s.num}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: isCurrent ? 700 : 600 }}>{s.title}</div>
                </div>
              </div>
              {idx < stepsMeta.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: isDone ? 'var(--success)' : 'var(--border-color)', margin: '0 16px', minWidth: '20px' }}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {message && (
        <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="card" style={{ padding: '32px' }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Step 1: Personal Details</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Date of Birth</label>
                <input type="date" name="date_of_birth" className="form-input" value={formData.date_of_birth} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Gender</label>
                <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">PAN Number</label>
                <input type="text" name="pan_number" className="form-input mono" placeholder="ABCDE1234F" value={formData.pan_number} onChange={handleChange} maxLength={10} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Aadhaar Number (Last 4 visible)</label>
                <input type="text" name="aadhaar_number" className="form-input mono" placeholder="XXXX-XXXX-1234" value={formData.aadhaar_number} onChange={handleChange} maxLength={12} />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Residential Address</label>
              <input type="text" name="address_line1" className="form-input" placeholder="Flat, Building, Street" value={formData.address_line1} onChange={handleChange} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">City</label>
                <input type="text" name="city" className="form-input" value={formData.city} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">State</label>
                <input type="text" name="state" className="form-input" value={formData.state} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">PIN Code</label>
                <input type="text" name="pincode" className="form-input" value={formData.pincode} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => handleSaveStep(2)} disabled={saving} className="btn btn-primary">
                <span>Save & Continue to Employment</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Step 2: Employment & Income Information</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Employment Type</label>
                <select name="employment_type" className="form-select" value={formData.employment_type} onChange={handleChange}>
                  <option value="SALARIED">Salaried Employee</option>
                  <option value="SELF_EMPLOYED">Self-Employed Professional</option>
                  <option value="BUSINESS_OWNER">Business Owner / Partner</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Employer / Business Name</label>
                <input type="text" name="employer_name" className="form-input" placeholder="e.g. Tata Consultancy Services" value={formData.employer_name} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Designation</label>
                <input type="text" name="designation" className="form-input" placeholder="e.g. Lead Consultant" value={formData.designation} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Work Experience (Years)</label>
                <input type="number" name="work_experience_years" className="form-input" value={formData.work_experience_years} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Monthly In-Hand Net Income (₹)</label>
                <input type="number" name="monthly_income" className="form-input" placeholder="e.g. 75000" value={formData.monthly_income} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Gross Annual Income (₹)</label>
                <input type="number" name="annual_income" className="form-input" placeholder="e.g. 900000" value={formData.annual_income} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button onClick={() => handleSaveStep(3)} disabled={saving} className="btn btn-primary">
                <span>Save & Continue to Financials</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Step 3: Financials & Bank Account</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Existing Active Loans Count</label>
                <input type="number" name="existing_loans_count" className="form-input" value={formData.existing_loans_count} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Total Monthly Loan EMIs / Obligations (₹)</label>
                <input type="number" name="monthly_obligations" className="form-input" placeholder="0" value={formData.monthly_obligations} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Disbursement Bank Name</label>
                <input type="text" name="bank_name" className="form-input" placeholder="e.g. HDFC Bank" value={formData.bank_name} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Account Number</label>
                <input type="text" name="account_number" className="form-input mono" placeholder="50100..." value={formData.account_number} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">IFSC Code</label>
                <input type="text" name="ifsc_code" className="form-input mono" placeholder="HDFC0000123" value={formData.ifsc_code} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <button onClick={() => setStep(2)} className="btn btn-secondary">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button onClick={() => handleSaveStep(4)} disabled={saving} className="btn btn-primary">
                <span>Save & Proceed to KYC Documents</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Step 4: KYC Documents Upload & Review</h3>

            {/* Document Upload Form */}
            <form onSubmit={handleUploadDocument} style={{
              background: 'var(--bg-muted)',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Document Category</label>
                  <select value={docType} onChange={(e) => setDocType(e.target.value)} className="form-select">
                    <option value="PAN">PAN Card</option>
                    <option value="AADHAAR">Aadhaar Card</option>
                    <option value="SALARY_SLIP">Salary Slip (Last 3 Months)</option>
                    <option value="BANK_STATEMENT">Bank Statement (Last 6 Months)</option>
                    <option value="EMPLOYMENT_PROOF">Employment Offer / ID</option>
                    <option value="ADDRESS_PROOF">Address Proof / Utility Bill</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Document / Reference Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ABCPS1234F"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Select File (.pdf, .jpg, .png max 5MB)</label>
                  <input
                    type="file"
                    className="form-input"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={uploadingDoc} className="btn btn-primary btn-sm">
                  <Upload size={16} />
                  <span>{uploadingDoc ? 'Uploading...' : 'Upload Document'}</span>
                </button>
              </div>
            </form>

            {/* Uploaded Documents Table */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
                Uploaded Documents ({documents.length})
              </h4>
              {documents.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  No documents uploaded yet. Upload your PAN and Salary Slip above.
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Document</th>
                        <th>Reference Number</th>
                        <th>File Name</th>
                        <th>Uploaded Date</th>
                        <th>Status</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.id}>
                          <td style={{ fontWeight: 600 }}>{doc.document_type.replace('_', ' ')}</td>
                          <td className="mono">{doc.document_number || '—'}</td>
                          <td>{doc.file_name || 'document.pdf'}</td>
                          <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                          <td><Badge status={doc.status} /></td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{doc.remarks || 'Pending verification'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <button onClick={() => setStep(3)} className="btn btn-secondary">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button onClick={() => handleSaveStep(5)} disabled={saving} className="btn btn-success btn-lg">
                <CheckCircle size={18} />
                <span>Complete Onboarding</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS / ONBOARDING COMPLETED */}
        {step === 5 && (
          <div className="card animate-fade-in" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
              animation: 'pulseAura 3s infinite'
            }}>
              <ShieldCheck size={44} color="var(--success)" />
            </div>

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                <Sparkles size={16} />
                <span>VERIFICATION PROFILE SUBMITTED</span>
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px' }}>
                Customer Onboarding Completed!
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Your financial profile and KYC documents are now verified. You have unlocked our premier loan catalogs with automated underwriting sanctions up to <strong>₹25,00,000</strong>.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              width: '100%',
              maxWidth: '600px',
              margin: '12px 0'
            }}>
              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bureau Status</div>
                <div style={{ fontWeight: 700, color: 'var(--success)', marginTop: '2px' }}>Verified & Prime</div>
              </div>
              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Facility Available</div>
                <div style={{ fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>₹ 25,00,000</div>
              </div>
              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>KYC Vault</div>
                <div style={{ fontWeight: 700, color: 'var(--info)', marginTop: '2px' }}>{documents.length} Docs Uploaded</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  if (onNavigateTab) onNavigateTab('apply');
                  else if (onComplete) onComplete();
                }}
                className="btn btn-primary btn-lg"
                style={{ padding: '12px 28px', fontSize: '1rem' }}
              >
                <span>Apply for a Loan Now</span>
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => {
                  if (onNavigateTab) onNavigateTab('dashboard');
                  else if (onComplete) onComplete();
                }}
                className="btn btn-outline btn-lg"
                style={{ padding: '12px 24px' }}
              >
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
