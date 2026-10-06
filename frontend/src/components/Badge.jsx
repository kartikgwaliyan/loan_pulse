import React from 'react';

const STATUS_MAP = {
  // Application statuses
  SUBMITTED: { label: 'Submitted', type: 'info' },
  DOC_VERIFICATION: { label: 'Doc Verification', type: 'warning' },
  UNDER_REVIEW: { label: 'Under Review', type: 'warning' },
  RISK_ASSESSMENT: { label: 'Risk Review', type: 'warning' },
  MANAGER_APPROVAL: { label: 'Manager Approval', type: 'info' },
  APPROVED: { label: 'Sanctioned', type: 'success' },
  REJECTED: { label: 'Rejected', type: 'danger' },
  DISBURSED: { label: 'Disbursed', type: 'success' },
  CANCELLED: { label: 'Cancelled', type: 'neutral' },

  // KYC statuses
  UPLOADED: { label: 'Uploaded', type: 'info' },
  VERIFIED: { label: 'Verified', type: 'success' },
  EXPIRED: { label: 'Expired', type: 'danger' },

  // Loan statuses
  ACTIVE: { label: 'Active', type: 'success' },
  CLOSED: { label: 'Closed', type: 'neutral' },
  DEFAULTED: { label: 'Defaulted', type: 'danger' },
  SETTLED: { label: 'Settled', type: 'info' },

  // EMI & Payment statuses
  PAID: { label: 'Paid', type: 'success' },
  DUE: { label: 'Due Now', type: 'warning' },
  UPCOMING: { label: 'Upcoming', type: 'neutral' },
  OVERDUE: { label: 'Overdue', type: 'danger' },
  SUCCESS: { label: 'Success', type: 'success' },
  PENDING: { label: 'Pending', type: 'warning' },
  FAILED: { label: 'Failed', type: 'danger' },

  // Risk
  LOW: { label: 'Low Risk', type: 'success' },
  MEDIUM: { label: 'Medium Risk', type: 'warning' },
  HIGH: { label: 'High Risk', type: 'danger' },

  // Eligibility
  ELIGIBLE: { label: 'Eligible', type: 'success' },
  CONDITIONALLY_ELIGIBLE: { label: 'Conditional', type: 'warning' },
  NOT_ELIGIBLE: { label: 'Not Eligible', type: 'danger' },
};

export const Badge = ({ status, text }) => {
  const meta = STATUS_MAP[status] || { label: text || status, type: 'neutral' };
  const label = text || meta.label;

  return (
    <span className={`badge badge-${meta.type}`}>
      {label}
    </span>
  );
};

export default Badge;
