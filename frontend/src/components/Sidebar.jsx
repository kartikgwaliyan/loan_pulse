import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  FileCheck,
  Send,
  FolderOpen,
  CreditCard,
  AlertTriangle,
  Users,
  Settings,
  ShieldAlert,
  Sliders,
  DollarSign,
  HelpCircle,
  LogOut,
  FileText,
  Activity,
  Award
} from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const { user, role, logout } = useAuth();

  const getMenuItems = () => {
    switch (role) {
      case 'CUSTOMER':
        return [
          { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'kyc', label: 'KYC Verification', icon: FileCheck },
          { id: 'apply', label: 'Apply for Loan', icon: Send },
          { id: 'applications', label: 'My Applications', icon: FolderOpen },
          { id: 'loans', label: 'My Loans & EMIs', icon: CreditCard },
          { id: 'support', label: 'Help & Support', icon: HelpCircle },
        ];
      case 'LOAN_OFFICER':
        return [
          { id: 'officer_dashboard', label: 'Officer Dashboard', icon: LayoutDashboard },
          { id: 'applications_queue', label: 'Loan Applications', icon: FolderOpen },
          { id: 'kyc_review', label: 'KYC Document Desk', icon: FileCheck },
          { id: 'customers_list', label: 'Customer Directory', icon: Users },
        ];
      case 'RISK_ANALYST':
        return [
          { id: 'analyst_dashboard', label: 'Risk Workbench', icon: ShieldAlert },
          { id: 'risk_queue', label: 'Credit Risk Queue', icon: Activity },
          { id: 'risk_analytics', label: 'ML Underwriting Insights', icon: FileText },
        ];
      case 'MANAGER':
        return [
          { id: 'manager_dashboard', label: 'Manager Dashboard', icon: LayoutDashboard },
          { id: 'sanctions_queue', label: 'Sanctions & Approvals', icon: Award },
          { id: 'disbursement_queue', label: 'Disbursement Desk', icon: DollarSign },
          { id: 'portfolio_overview', label: 'Portfolio Analytics', icon: Activity },
        ];
      case 'COLLECTION_OFFICER':
        return [
          { id: 'collection_dashboard', label: 'Collections Hub', icon: LayoutDashboard },
          { id: 'overdue_queue', label: 'Delinquent Accounts', icon: AlertTriangle },
          { id: 'followup_tasks', label: 'Call & Follow-up Log', icon: FileText },
        ];
      case 'ADMIN':
        return [
          { id: 'admin_dashboard', label: 'Executive Overview', icon: LayoutDashboard },
          { id: 'users_mgmt', label: 'User & RBAC Mgmt', icon: Users },
          { id: 'products_mgmt', label: 'Loan Products Config', icon: Sliders },
          { id: 'approval_matrix', label: 'Approval Matrix Limits', icon: Award },
          { id: 'audit_logs', label: 'System Audit Logs', icon: FileText },
          { id: 'reports_export', label: 'Reports & Export', icon: FolderOpen },
        ];
      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Activity color="#ffffff" size={18} />
        </div>
        <div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Loan<span style={{ color: 'var(--primary)' }}>Pulse</span>
          </span>
          <div style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {role ? role.replace('_', ' ') : 'Portal'}
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                border: isActive ? '1px solid #dbeafe' : '1px solid transparent',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={18} color={isActive ? 'var(--primary)' : 'var(--text-secondary)'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            border: '1px solid #dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: 'var(--primary)',
            fontSize: '0.9rem'
          }}>
            {user?.first_name ? user.first_name[0] : (user?.username?.[0] || 'U')}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--danger-light)',
            border: '1px solid #fecaca',
            color: 'var(--danger)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
