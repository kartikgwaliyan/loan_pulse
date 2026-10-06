import React, { useState, useMemo } from 'react';
import { Calculator, ArrowRight, CheckCircle2 } from 'lucide-react';

export const EmiCalculatorWidget = ({ onApplyNow }) => {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(10.5);
  const [tenureMonths, setTenureMonths] = useState(36);

  const { emi, totalInterest, totalPayable, principalPercent, interestPercent } = useMemo(() => {
    const P = Number(amount);
    const annualRate = Number(rate);
    const n = Number(tenureMonths);

    if (n <= 0 || P <= 0) {
      return { emi: 0, totalInterest: 0, totalPayable: 0, principalPercent: 100, interestPercent: 0 };
    }

    if (annualRate <= 0) {
      const e = P / n;
      return { emi: Math.round(e), totalInterest: 0, totalPayable: P, principalPercent: 100, interestPercent: 0 };
    }

    const r = (annualRate / 12) / 100;
    const factor = Math.pow(1 + r, n);
    const emiVal = (P * r * factor) / (factor - 1);
    const payable = emiVal * n;
    const interest = payable - P;

    const pPct = Math.round((P / payable) * 100);
    const iPct = 100 - pPct;

    return {
      emi: Math.round(emiVal),
      totalInterest: Math.round(interest),
      totalPayable: Math.round(payable),
      principalPercent: pPct,
      interestPercent: iPct,
    };
  }, [amount, rate, tenureMonths]);

  return (
    <div className="card" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Calculator size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Interactive EMI Calculator</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Plan your monthly repayments with real-time financial amortization
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '36px',
        alignItems: 'center',
      }}>
        {/* Sliders Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Amount Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Loan Amount
              </label>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="5000000"
              step="25000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>₹50,000</span>
              <span>₹50,00,000</span>
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Interest Rate (% p.a.)
              </label>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                {rate}%
              </span>
            </div>
            <input
              type="range"
              min="7.5"
              max="20.0"
              step="0.25"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>7.5%</span>
              <span>20.0%</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Loan Tenure ({Math.floor(tenureMonths / 12)}y {tenureMonths % 12}m)
              </label>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                {tenureMonths} Months
              </span>
            </div>
            <input
              type="range"
              min="6"
              max="84"
              step="6"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>6 Months</span>
              <span>7 Years (84m)</span>
            </div>
          </div>
        </div>

        {/* Output & SVG Donut Chart Breakdown */}
        <div style={{
          background: 'var(--bg-muted)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Monthly Repayment (EMI)
          </span>
          <div style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: 'var(--primary)',
            margin: '8px 0 20px',
            letterSpacing: '-0.02em',
          }}>
            ₹{emi.toLocaleString('en-IN')}
          </div>

          {/* SVG Donut Chart */}
          <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '20px' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="4"
                strokeDasharray={`${principalPercent}, 100`}
              />
              {/* Interest arc */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#64748b"
                strokeWidth="4"
                strokeDasharray={`${interestPercent}, 100`}
                strokeDashoffset={`-${principalPercent}`}
              />
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
            }}>
              <span>{principalPercent}% Principal</span>
              <span style={{ color: '#64748b' }}>{interestPercent}% Interest</span>
            </div>
          </div>

          {/* Breakdown summary */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                Principal Amount:
              </span>
              <span style={{ fontWeight: 700 }}>₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }}></span>
                Total Interest Payable:
              </span>
              <span style={{ fontWeight: 700, color: '#64748b' }}>₹{totalInterest.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Total Amount Payable:</span>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₹{totalPayable.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Apply button */}
          <button
            onClick={() => onApplyNow && onApplyNow({ amount, rate, tenureMonths })}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            <span>Apply for this Loan</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
