import React from 'react';
import { Activity, ShieldCheck, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-sidebar)',
      color: '#94a3b8',
      borderTop: '1px solid var(--border-color)',
      paddingTop: '64px',
      paddingBottom: '32px',
      marginTop: '64px',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '48px',
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Activity color="#ffffff" size={20} />
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                Loan<span style={{ color: '#60a5fa' }}>Pulse</span>
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px' }}>
              Powering smarter lending. From customer onboarding and instant credit underwriting to automated disbursement and loan closure.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
              <ShieldCheck size={18} />
              <span>Enterprise Grade Security & Compliance</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '16px', fontWeight: 700 }}>Solutions</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li><a href="#products" onClick={() => onNavigate && onNavigate('products')} style={{ color: 'inherit', textDecoration: 'none' }}>Personal Loans</a></li>
              <li><a href="#products" onClick={() => onNavigate && onNavigate('products')} style={{ color: 'inherit', textDecoration: 'none' }}>Home Mortgages</a></li>
              <li><a href="#products" onClick={() => onNavigate && onNavigate('products')} style={{ color: 'inherit', textDecoration: 'none' }}>Auto & Fleet Finance</a></li>
              <li><a href="#products" onClick={() => onNavigate && onNavigate('products')} style={{ color: 'inherit', textDecoration: 'none' }}>Education Financing</a></li>
              <li><a href="#calculator" onClick={() => onNavigate && onNavigate('calculator')} style={{ color: 'inherit', textDecoration: 'none' }}>EMI Calculator</a></li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '16px', fontWeight: 700 }}>Platform Portals</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li>Customer Portal</li>
              <li>Loan Officer Review Desk</li>
              <li>Credit & ML Risk Workbench</li>
              <li>Branch Manager Sanctions</li>
              <li>Delinquency & Collections Desk</li>
              <li>Executive & Admin Console</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '16px', fontWeight: 700 }}>Contact & HQ</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={16} color="#60a5fa" />
                <span>Financial District, BKC, Mumbai 400051</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} color="#60a5fa" />
                <span>1800-202-PULSE (7857)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} color="#60a5fa" />
                <span>support@loanpulse.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '0.85rem',
        }}>
          <div>
            © 2026 LoanPulse Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Architecture</span>
            <span>API Docs (OpenAPI 3.0)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
