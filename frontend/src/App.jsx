import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { DemoRoleSwitcher } from './components/DemoRoleSwitcher';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ThemeToggle } from './components/ThemeToggle';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CustomerOnboarding } from './pages/customer/CustomerOnboarding';
import { ApplyLoan } from './pages/customer/ApplyLoan';
import { MyApplications } from './pages/customer/MyApplications';
import { MyLoans } from './pages/customer/MyLoans';
import { CustomerSupport } from './pages/customer/CustomerSupport';

// Staff & Executive Portals
import LoanOfficerDashboard from './pages/officer/LoanOfficerDashboard';
import RiskAnalystDashboard from './pages/analyst/RiskAnalystDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import CollectionDashboard from './pages/collection/CollectionDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

import { Activity, User } from 'lucide-react';

function MainApp() {
  const { user, role, isAuthenticated, loading } = useAuth();
  
  // Navigation states: 'landing' | 'login' | 'register' | 'portal'
  const [currentView, setCurrentView] = useState('landing');
  
  // Portal active tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // When authentication changes, auto-switch to portal or default view
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentView('portal');
      // Set appropriate default tab based on role
      switch (role) {
        case 'CUSTOMER':
          setActiveTab('dashboard');
          break;
        case 'LOAN_OFFICER':
          setActiveTab('officer_dashboard');
          break;
        case 'RISK_ANALYST':
          setActiveTab('analyst_dashboard');
          break;
        case 'MANAGER':
          setActiveTab('manager_dashboard');
          break;
        case 'COLLECTION_OFFICER':
          setActiveTab('collection_dashboard');
          break;
        case 'ADMIN':
          setActiveTab('admin_dashboard');
          break;
        default:
          setActiveTab('dashboard');
      }
    } else {
      if (currentView === 'portal') {
        setCurrentView('landing');
      }
    }
  }, [isAuthenticated, role]);

  const handleNavigate = (target) => {
    if (target === 'home' || target === 'features' || target === 'products' || target === 'calculator' || target === 'about' || target === 'contact') {
      setCurrentView('landing');
      // If clicking hash or section, smooth scroll
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (target === 'login') {
      setCurrentView('login');
    } else if (target === 'register') {
      setCurrentView('register');
    } else if (target === 'portal') {
      setCurrentView('portal');
    } else if (target === 'apply') {
      if (isAuthenticated) {
        setCurrentView('portal');
        setActiveTab('apply');
      } else {
        setCurrentView('login');
      }
    } else {
      setCurrentView(target);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            animation: 'pulse 2s infinite'
          }}>
            <Activity color="#fff" size={28} />
          </div>
          <div style={{ fontWeight: 600 }}>Initializing LoanPulse...</div>
        </div>
      </div>
    );
  }

  // Render Portal Component based on Role and active Tab
  const renderPortalContent = () => {
    if (role === 'CUSTOMER') {
      switch (activeTab) {
        case 'dashboard':
          return <CustomerDashboard onNavigate={setActiveTab} onNavigateTab={setActiveTab} />;
        case 'profile':
        case 'kyc':
          return <CustomerOnboarding onComplete={() => setActiveTab('dashboard')} onNavigateTab={setActiveTab} />;
        case 'apply':
          return <ApplyLoan onComplete={() => setActiveTab('applications')} onNavigate={setActiveTab} onNavigateTab={setActiveTab} />;
        case 'applications':
          return <MyApplications onNavigate={setActiveTab} onNavigateTab={setActiveTab} />;
        case 'loans':
          return <MyLoans onNavigate={setActiveTab} onNavigateTab={setActiveTab} />;
        case 'support':
          return <CustomerSupport />;
        default:
          return <CustomerDashboard onNavigate={setActiveTab} onNavigateTab={setActiveTab} />;
      }
    }

    if (role === 'LOAN_OFFICER') {
      return <LoanOfficerDashboard activeTab={activeTab} onSelectTab={setActiveTab} />;
    }

    if (role === 'RISK_ANALYST') {
      return <RiskAnalystDashboard activeTab={activeTab} onSelectTab={setActiveTab} />;
    }

    if (role === 'MANAGER') {
      return <ManagerDashboard activeTab={activeTab} onSelectTab={setActiveTab} />;
    }

    if (role === 'COLLECTION_OFFICER') {
      return <CollectionDashboard activeTab={activeTab} onSelectTab={setActiveTab} />;
    }

    if (role === 'ADMIN') {
      return <AdminDashboard activeTab={activeTab} onSelectTab={setActiveTab} />;
    }

    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>Unknown Role: {role}</h3>
        <p>Please contact system administrator to configure permissions.</p>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1-Click Interactive Persona Switcher */}
      <DemoRoleSwitcher />

      {/* Main Views */}
      {currentView === 'landing' && (
        <>
          <Navbar onNavigate={handleNavigate} currentTab="home" />
          <main style={{ flex: 1 }}>
            <LandingPage onNavigate={handleNavigate} />
          </main>
          <Footer />
        </>
      )}

      {currentView === 'login' && (
        <>
          <Navbar onNavigate={handleNavigate} currentTab="login" />
          <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <LoginPage 
              onNavigate={handleNavigate}
              onSuccess={() => {
                setCurrentView('portal');
              }}
              onNavigateRegister={() => setCurrentView('register')}
            />
          </main>
          <Footer />
        </>
      )}

      {currentView === 'register' && (
        <>
          <Navbar onNavigate={handleNavigate} currentTab="register" />
          <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <RegisterPage 
              onNavigate={handleNavigate}
              onSuccess={() => {
                setCurrentView('portal');
                setActiveTab('profile'); // Send directly to onboarding
              }}
              onNavigateLogin={() => setCurrentView('login')}
            />
          </main>
          <Footer />
        </>
      )}

      {currentView === 'portal' && isAuthenticated && (
        <div className="portal-container" style={{ display: 'flex', minHeight: 'calc(100vh - 40px)' }}>
          {/* Role-Specific Adaptive Sidebar */}
          <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

          {/* Main Dashboard Workspace Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
            {/* Top Workspace Header Bar */}
            <header style={{
              height: '64px',
              padding: '0 24px',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              zIndex: 40
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setCurrentView('landing')}
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  ← Public Website
                </button>
                <div style={{ height: '20px', width: '1px', background: 'var(--border-color)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Workspace: <strong style={{ color: 'var(--text-primary)' }}>{role ? role.replace('_', ' ') : 'Customer'}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <NotificationDrawer />
                <ThemeToggle />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.825rem',
                  fontWeight: 600
                }}>
                  <User size={15} color="var(--primary)" />
                  <span>{user?.first_name || user?.username}</span>
                </div>
              </div>
            </header>

            {/* Dynamic Role Page Body */}
            <main style={{ flex: 1, padding: '24px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
              {renderPortalContent()}
            </main>
          </div>
        </div>
      )}

      {currentView === 'portal' && !isAuthenticated && (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <h3>Session Expired</h3>
          <p>Please log in to access the portal workspace.</p>
          <button onClick={() => setCurrentView('login')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
