import React, { useState, useRef } from 'react';
import { Activity, Wifi, ShieldCheck, RefreshCw } from 'lucide-react';

export const Card3D = ({ 
  customerName = "KARTIK SHARMA", 
  accountNumber = "LP-8842-9901", 
  expiry = "09/29", 
  tier = "PLATINUM FINTECH",
  balance = "₹ 5,00,000",
  showBalance = true
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -14;
    const rY = ((x - centerX) / centerX) * 14;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      {/* 3D Perspective Card Container */}
      <div
        style={{
          perspective: '1200px',
          width: '360px',
          height: '215px',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={toggleFlip}
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: isFlipped 
              ? 'rotateY(180deg)' 
              : `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: isFlipped ? 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 0.1s ease-out',
            borderRadius: '20px',
            boxShadow: '0 20px 30px -10px rgba(15, 23, 42, 0.25), 0 4px 6px -2px rgba(15, 23, 42, 0.1)',
          }}
        >
          {/* FRONT OF 3D CARD */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderRadius: '20px',
              padding: '22px 24px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              color: '#ffffff'
            }}
          >
            {/* Dynamic Holographic Glare Overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '20px',
                pointerEvents: 'none',
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, ${glarePos.opacity}) 0%, rgba(255, 255, 255, 0) 60%)`,
                transition: 'opacity 0.2s ease',
              }}
            />

            {/* Card Header: Brand & Contactless */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Activity size={16} color="#fff" />
                </div>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Loan<span style={{ color: 'var(--primary)' }}>Pulse</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wifi size={18} style={{ transform: 'rotate(90deg)', opacity: 0.8 }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase' }}>
                  {tier}
                </span>
              </div>
            </div>

            {/* Microchip & NFC Aura */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 2, margin: '8px 0' }}>
              <div style={{
                width: '42px',
                height: '32px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)',
                border: '1px solid #f1f5f9',
                position: 'relative',
                boxShadow: 'inset 0 0 3px rgba(0,0,0,0.3)',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '10px', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.2)' }} />
                <div style={{ position: 'absolute', top: '20px', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.2)' }} />
                <div style={{ position: 'absolute', left: '20px', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.2)' }} />
              </div>
              {showBalance && (
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#94a3b8' }}>Available Facility</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#38bdf8' }}>{balance}</div>
                </div>
              )}
            </div>

            {/* Embossed Card Number */}
            <div style={{
              fontFamily: 'monospace',
              fontSize: '1.15rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#f8fafc',
              textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.4)',
              zIndex: 2
            }}>
              4532 •••• •••• {accountNumber.slice(-4) || '8912'}
            </div>

            {/* Card Footer: Name & Expiry */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2 }}>
              <div>
                <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
                  Authorized Borrower
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {customerName}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
                  Valid Thru
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace' }}>
                  {expiry}
                </div>
              </div>
            </div>
          </div>

          {/* BACK OF 3D CARD */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #090d16 0%, #171d2d 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transform: 'rotateY(180deg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              color: '#ffffff',
              padding: '16px 0'
            }}
          >
            {/* Magnetic Stripe */}
            <div style={{
              width: '100%',
              height: '42px',
              background: '#020617',
              borderTop: '1px solid #1e293b',
              borderBottom: '1px solid #1e293b',
              marginTop: '4px'
            }} />

            {/* Signature & CVV Panel */}
            <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  flex: 1,
                  height: '32px',
                  background: 'repeating-linear-gradient(45deg, #e2e8f0, #e2e8f0 10px, #cbd5e1 10px, #cbd5e1 20px)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '12px',
                  color: '#334155',
                  fontStyle: 'italic',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  {customerName}
                </div>
                <div style={{
                  width: '48px',
                  height: '32px',
                  background: '#ffffff',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  fontSize: '0.9rem'
                }}>
                  937
                </div>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', lineHeight: 1.3 }}>
                This digital lending card is issued by LoanPulse under RBI/Regulatory guidelines. 
                256-Bit SSL Tokenized & Non-Transferable.
              </div>
            </div>

            {/* Back Footer */}
            <div style={{ padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#10b981" />
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Secure Digital Credit Facility</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#60a5fa' }}>LoanPulse</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flip Prompt */}
      <button
        onClick={toggleFlip}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--primary)',
          fontSize: '0.78rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          transition: 'all 0.2s ease'
        }}
      >
        <RefreshCw size={12} />
        <span>Click card or button to flip {isFlipped ? 'to front' : 'to back (CVV)'}</span>
      </button>
    </div>
  );
};

export default Card3D;
