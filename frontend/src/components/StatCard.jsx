import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary', change, changeType = 'positive' }) => {
  const getColorStyles = () => {
    switch (color) {
      case 'success':
        return { bg: 'var(--success-light)', color: 'var(--success)' };
      case 'warning':
        return { bg: 'var(--warning-light)', color: 'var(--warning)' };
      case 'danger':
        return { bg: 'var(--danger-light)', color: 'var(--danger)' };
      case 'info':
        return { bg: 'var(--info-light)', color: 'var(--info)' };
      default:
        return { bg: 'var(--primary-light)', color: 'var(--primary)' };
    }
  };

  const style = getColorStyles();

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: style.bg,
            color: style.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
        {value}
      </div>

      {(subtitle || change) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {change && (
            <span style={{
              fontWeight: 700,
              color: changeType === 'positive' ? 'var(--success)' : (changeType === 'negative' ? 'var(--danger)' : 'var(--text-muted)'),
            }}>
              {change}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
