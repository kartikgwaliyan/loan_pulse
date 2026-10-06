import React, { useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { UserCheck, Shield, ChevronDown, Sparkles } from 'lucide-react';

export const DemoRoleSwitcher = () => {
  const { user, role, switchDemoRole, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectRole = async (rKey) => {
    setIsOpen(false);
    await switchDemoRole(rKey);
  };

  return (
    <div style={{
      background: 'var(--bg-muted)',
      color: 'var(--text-secondary)',
      padding: '6px 20px',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 999,
      position: 'relative',
      borderBottom: '1px solid var(--border-color)',
      flexWrap: 'wrap',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={14} color="var(--primary)" />
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.75rem', letterSpacing: '0.04em' }}>ROLE PREVIEW:</span>
        <span style={{ color: 'var(--text-muted)' }}>Active Persona:</span>
        <span style={{
          background: 'var(--bg-card)',
          padding: '2px 8px',
          borderRadius: '4px',
          fontWeight: 700,
          color: 'var(--primary)',
          border: '1px solid var(--border-color)'
        }}>
          {user ? `${user.first_name || user.username} (${role})` : 'Public Visitor (Unauthenticated)'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
        <span style={{ color: 'var(--text-muted)' }}>Switch Role:</span>
        {Object.entries(DEMO_CREDENTIALS).map(([k, item]) => {
          const isActive = role === k;
          return (
            <button
              key={k}
              onClick={() => handleSelectRole(k)}
              disabled={loading}
              style={{
                background: isActive ? 'var(--primary)' : 'var(--bg-card)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={`Switch to ${item.label}`}
            >
              {k.replace('_', ' ')}
            </button>
          );
        })}
      </div>
    </div>
  );
};
