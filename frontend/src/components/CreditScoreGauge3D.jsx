import React, { useState } from 'react';
import { Award, TrendingUp, ShieldCheck, Info } from 'lucide-react';

export const CreditScoreGauge3D = ({ score = 785, maxScore = 900, minScore = 300 }) => {
  const [hovered, setHovered] = useState(false);

  // Normalize score between 0 and 1
  const percentage = Math.min(Math.max((score - minScore) / (maxScore - minScore), 0), 1);
  
  // Circumference for semi-circle gauge (radius = 80)
  const radius = 80;
  const strokeWidth = 14;
  const arcLength = Math.PI * radius; // Half circumference
  const strokeDashoffset = arcLength * (1 - percentage);

  // Score categorization
  let category = 'Excellent';
  let color = '#059669'; // Muted Green
  let recommendation = 'Eligible for lowest interest rates & instant sanctions';

  if (score < 600) {
    category = 'Poor';
    color = '#dc2626';
    recommendation = 'High credit risk; additional collateral required';
  } else if (score < 700) {
    category = 'Fair';
    color = '#d97706';
    recommendation = 'Moderate terms; standard KYC verification required';
  } else if (score < 750) {
    category = 'Good';
    color = '#2563eb';
    recommendation = 'Preferred rates; expedited underwriting path';
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
      }}
    >

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '12px', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={18} color={color} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Credit Health Rating</span>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            background: `${color}18`,
            color: color,
            border: `1px solid ${color}40`,
          }}
        >
          {category}
        </span>
      </div>

      {/* SVG 3D Semi-Circle Arc */}
      <div style={{ position: 'relative', width: '220px', height: '125px', display: 'flex', justifyContent: 'center' }}>
        <svg width="220" height="130" viewBox="0 0 220 130" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="scoreArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={color} floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d="M 20 115 A 80 80 0 0 1 200 115"
            fill="none"
            stroke="var(--bg-muted)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Animated Value Arc */}
          <path
            d="M 20 115 A 80 80 0 0 1 200 115"
            fill="none"
            stroke="url(#scoreArcGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            filter="url(#arcGlow)"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
        </svg>

        {/* Center Score Readout with 3D Depth */}
        <div
          style={{
            position: 'absolute',
            bottom: '5px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1,
              textShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {score}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
            Bureau Range: 300 – 900
          </span>
        </div>
      </div>

      {/* Underwriting Recommendation */}
      <div
        style={{
          marginTop: '16px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-muted)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
        }}
      >
        <ShieldCheck size={16} color={color} style={{ flexShrink: 0 }} />
        <span>{recommendation}</span>
      </div>
    </div>
  );
};

export default CreditScoreGauge3D;
