import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineEye, 
  HiOutlineEyeOff, 
  HiOutlineShieldCheck, 
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineRefresh,
  HiOutlineLightningBolt,
  HiOutlineCheck
} from 'react-icons/hi';
import docIntelIcon from '../assets/docintel-icon.png';
import './Auth.css';

const ADMIN_DESIGNATIONS = [
  'Compliance Officer',
  'System Administrator',
  'Team Manager',
  'Approval Authority',
  'Audit Lead'
];

const USER_DEPARTMENTS = [
  'Operations',
  'Finance',
  'Legal & Compliance',
  'Procurement',
  'Development',
  'Sales',
  'Human Resources',
  'Distributors'
];

const USER_DESIGNATIONS = [
  'Team Member',
  'Team Lead',
  'Senior Associate',
  'Analyst',
  'Executive'
];

const Auth = ({ initialMode = 'login' }) => {
  const [activeTab, setActiveTab] = useState(initialMode); // 'login' or 'signup'
  const [showIntro, setShowIntro] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if first-time visit in this tab to display the 10s animated intro
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('docintel_intro_seen');
    if (!hasSeenIntro) {
      setShowIntro(true);
      sessionStorage.setItem('docintel_intro_seen', 'true');
    }
  }, []);

  // Sync active tab with route
  useEffect(() => {
    if (location.pathname.includes('signup')) {
      setActiveTab('signup');
    } else if (location.pathname.includes('login')) {
      setActiveTab('login');
    }
  }, [location.pathname]);

  // 10-second countdown for animated intro
  useEffect(() => {
    let timer;
    if (showIntro) {
      setCountdown(10);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowIntro(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showIntro]);

  // Form states
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ADMIN',
    department: '',
    designation: 'Compliance Officer'
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!loginData.email || !/\S+@\S+\.\S+/.test(loginData.email)) {
      setError('Please enter a valid corporate email address.');
      return;
    }
    if (!loginData.password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      setError('All fields marked with an asterisk are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (signupData.role === 'ADMIN' && !signupData.designation) {
      setError('Please select an Administrator designation.');
      return;
    }
    if (signupData.role === 'USER' && !signupData.department) {
      setError('Please select your enterprise department.');
      return;
    }
    if (signupData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await signup(
        signupData.name.trim(),
        signupData.email.trim(),
        signupData.password,
        signupData.role,
        signupData.department,
        signupData.designation
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Instant Demo Logins (works on localhost AND GitHub Pages)
  const handleQuickDemo = async (roleType) => {
    setLoading(true);
    setError('');
    try {
      if (roleType === 'ADMIN') {
        await login('sarthakpadwal111@gmail.com', 'password123');
      } else {
        await login('employee.user@docintel.com', 'password123');
      }
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login fallback triggered. Redirecting...');
      setTimeout(() => navigate('/dashboard'), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-master-wrapper">
      {/* ============================================================== */}
      {/* 1. ANIMATED INTRO SCREEN / DOCINTEL GUIDE BANNER (10-SEC AUTO) */}
      {/* ============================================================== */}
      {showIntro && (
        <div className="intro-overlay">
          <div className="intro-backdrop-glow"></div>
          
          <div className="intro-content-container">
            {/* Top Navigation in Splash */}
            <div className="intro-top-bar">
              <div className="intro-brand-pill">
                <img src={docIntelIcon} alt="DocIntel Icon" className="intro-pill-icon" />
                <span>DocIntel • Platform Briefing</span>
              </div>
              <button 
                type="button" 
                className="btn-skip-intro"
                onClick={() => setShowIntro(false)}
              >
                Proceed to Portal Now <HiOutlineArrowRight size={16} />
              </button>
            </div>

            {/* Central Animated Hero Box */}
            <div className="intro-hero-showcase">
              <div className="intro-logo-glow-wrapper">
                <img src={docIntelIcon} alt="DocIntel" className="intro-pulse-logo" />
                <div className="scanner-laser-line"></div>
              </div>

              <h1 className="intro-hero-title">
                Doc<span className="text-cyan-gradient">Intel</span>
              </h1>
              <p className="intro-hero-tagline">STORE • PROCESS • ANALYZE</p>
              <p className="intro-hero-desc">
                Next-generation Document Intelligence Platform engineered for automated OCR extraction, 
                chronometry compliance, and role-governed document lifecycle management.
              </p>
            </div>

            {/* 3 Core Architecture Pillars Banner */}
            <div className="intro-pillars-grid">
              <div className="intro-pillar-card">
                <div className="pillar-icon-box cyan-box">
                  <HiOutlineDocumentText size={22} />
                </div>
                <h3>01. Ingestion & Storage</h3>
                <p>High-integrity PDF & image intake with checksum validation and structured metadata registration.</p>
              </div>

              <div className="intro-pillar-card">
                <div className="pillar-icon-box purple-box">
                  <HiOutlineSparkles size={22} />
                </div>
                <h3>02. Python AI OCR</h3>
                <p>FastAPI microservice extracting invoice numbers, vendors, total amounts, and dates in milliseconds.</p>
              </div>

              <div className="intro-pillar-card">
                <div className="pillar-icon-box emerald-box">
                  <HiOutlineClock size={22} />
                </div>
                <h3>03. Chronometry Radar</h3>
                <p>Automated deadline calculations, overdue expiration alerts, and immutable audit chronometry.</p>
              </div>
            </div>

            {/* Progress Countdown Bar */}
            <div className="intro-timer-section">
              <div className="intro-timer-header">
                <span className="mono">Entering DocIntel Portal in {countdown}s...</span>
                <button 
                  type="button" 
                  className="intro-forward-link" 
                  onClick={() => setShowIntro(false)}
                >
                  Skip & Enter Portal &rarr;
                </button>
              </div>
              <div className="intro-progress-track">
                <div 
                  className="intro-progress-bar"
                  style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. SPLIT-SCREEN AUTHENTICATION (LEFT HALF & RIGHT HALF)       */}
      {/* ============================================================== */}
      <div className="split-auth-container">
        {/* ----------------- LEFT HALF: BRAND & SYSTEM BRIEFING ----------------- */}
        <div className="auth-left-panel">
          <div className="left-panel-ambient"></div>
          
          <div className="left-panel-content">
            {/* Brand Header */}
            <div className="left-brand-header">
              <img src={docIntelIcon} alt="DocIntel Logo" className="left-brand-icon" />
              <div>
                <h1 className="left-brand-title">
                  Doc<span className="brand-highlight">Intel</span>
                </h1>
                <span className="left-brand-subtitle">Document Intelligence Platform</span>
              </div>
            </div>

            {/* Main Value Proposition */}
            <div className="left-hero-body">
              <h2 className="left-statement">
                Automate your enterprise document lifecycle with precision OCR & chronometry.
              </h2>
              <p className="left-statement-desc">
                DocIntel eliminates manual document review by extracting structured intelligence from invoices, 
                quotations, tenders, and contracts while keeping audit trails synchronized.
              </p>
            </div>

            {/* Capability Feature Badges */}
            <div className="left-features-list">
              <div className="feature-row">
                <div className="feature-check"><HiOutlineCheck size={16} /></div>
                <div>
                  <strong>Automated Python OCR Pipeline</strong>
                  <span>High-speed attribute extraction and vendor recognition</span>
                </div>
              </div>

              <div className="feature-row">
                <div className="feature-check"><HiOutlineCheck size={16} /></div>
                <div>
                  <strong>Chronometry & Expiration Radars</strong>
                  <span>Dynamic due-date milestone monitoring and overdue risk flags</span>
                </div>
              </div>

              <div className="feature-row">
                <div className="feature-check"><HiOutlineCheck size={16} /></div>
                <div>
                  <strong>Sec-Lvl-4 Root Role Clearance</strong>
                  <span>Multi-tier permission policies with immutable audit tracking</span>
                </div>
              </div>
            </div>

            {/* Microservice Tech Stack Ribbon */}
            <div className="tech-stack-ribbon">
              <span className="tech-chip">React 19 Vite</span>
              <span className="tech-chip">Node.js Express</span>
              <span className="tech-chip">Python FastAPI</span>
              <span className="tech-chip">MySQL 8.0</span>
            </div>

            {/* Footer Status & Replay Tour */}
            <div className="left-panel-footer">
              <div className="engine-status-pill">
                <span className="status-live-dot"></span>
                Engine v4.8 Active &bull; Secure Protocol
              </div>
              <button 
                type="button" 
                className="btn-replay-intro"
                onClick={() => setShowIntro(true)}
                title="View animated DocIntel showcase & overview"
              >
                <HiOutlineRefresh size={14} />
                Replay Intro
              </button>
            </div>
          </div>
        </div>

        {/* ----------------- RIGHT HALF: PROPER AUTH FORMS (LOGIN / SIGNUP) ----------------- */}
        <div className="auth-right-panel">
          <div className="auth-form-card">
            {/* Mode Switcher Tabs */}
            <div className="auth-tabs-header">
              <button 
                type="button" 
                className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => { setActiveTab('login'); setError(''); }}
              >
                Sign In
              </button>
              <button 
                type="button" 
                className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => { setActiveTab('signup'); setError(''); }}
              >
                Create Account
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="auth-error-alert">
                <span>{error}</span>
              </div>
            )}

            {/* ---------------- TAB 1: SIGN IN FORM ---------------- */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="auth-form-body">
                <div className="form-header-text">
                  <h3>Welcome to DocIntel</h3>
                  <p>Authenticate with your corporate credentials to continue.</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Corporate Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="sarthakpadwal111@gmail.com"
                  />
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center">
                    <label className="form-label">Password</label>
                  </div>
                  <div className="pwd-input-wrapper">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      className="form-input"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="••••••••••••"
                    />
                    <button 
                      type="button" 
                      className="pwd-toggle" 
                      onClick={() => setShowPwd(!showPwd)}
                    >
                      {showPwd ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary auth-btn-submit" 
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In to Portal'}
                </button>

                {/* 1-Click Instant Demo Credentials */}
                <div className="demo-access-box">
                  <div className="demo-access-title">
                    <HiOutlineLightningBolt size={15} />
                    <span>Instant Demo Access (GitHub & Sandbox Mode):</span>
                  </div>
                  <div className="demo-buttons-grid">
                    <button 
                      type="button" 
                      className="demo-btn admin-demo"
                      onClick={() => handleQuickDemo('ADMIN')}
                    >
                      <HiOutlineShieldCheck size={16} />
                      Sign In as Root Admin
                    </button>
                    <button 
                      type="button" 
                      className="demo-btn employee-demo"
                      onClick={() => handleQuickDemo('USER')}
                    >
                      <HiOutlineUserGroup size={16} />
                      Sign In as Employee
                    </button>
                  </div>
                </div>

                <div className="auth-switch-prompt">
                  New to DocIntel?{' '}
                  <button 
                    type="button" 
                    className="link-switch-btn"
                    onClick={() => { setActiveTab('signup'); setError(''); }}
                  >
                    Create a new account &rarr;
                  </button>
                </div>
              </form>
            ) : (
              /* ---------------- TAB 2: SIGN UP FORM ---------------- */
              <form onSubmit={handleSignupSubmit} className="auth-form-body">
                <div className="form-header-text">
                  <h3>Create Your Account</h3>
                  <p>Register as an Administrator or Departmental Employee.</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name <span className="text-red">*</span></label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    placeholder="e.g. Sarthak Padwal"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address <span className="text-red">*</span></label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="sarthak111@gmail.com"
                  />
                </div>

                {/* Role Selector Card Buttons */}
                <div className="form-group">
                  <label className="form-label">Select Account Role <span className="text-red">*</span></label>
                  <div className="role-selection-grid">
                    <div 
                      className={`role-option-card ${signupData.role === 'ADMIN' ? 'selected' : ''}`}
                      onClick={() => setSignupData({ ...signupData, role: 'ADMIN', department: '', designation: 'Compliance Officer' })}
                    >
                      <div className="role-option-header">
                        <HiOutlineShieldCheck size={18} className="role-icon" />
                        <strong>Admin</strong>
                      </div>
                      <span className="role-desc">Manager, Approver, Compliance Oversight</span>
                    </div>

                    <div 
                      className={`role-option-card ${signupData.role === 'USER' ? 'selected' : ''}`}
                      onClick={() => setSignupData({ ...signupData, role: 'USER', department: 'Operations', designation: 'Team Member' })}
                    >
                      <div className="role-option-header">
                        <HiOutlineUserGroup size={18} className="role-icon" />
                        <strong>Employee</strong>
                      </div>
                      <span className="role-desc">Ingestion, Search, Department Staff</span>
                    </div>
                  </div>
                </div>

                {/* Role-Specific Dropdowns */}
                {signupData.role === 'ADMIN' ? (
                  <div className="form-group">
                    <label className="form-label">Admin Designation <span className="text-red">*</span></label>
                    <select
                      className="form-select"
                      value={signupData.designation}
                      onChange={(e) => setSignupData({ ...signupData, designation: e.target.value })}
                    >
                      {ADMIN_DESIGNATIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Department <span className="text-red">*</span></label>
                      <select
                        className="form-select"
                        value={signupData.department}
                        onChange={(e) => setSignupData({ ...signupData, department: e.target.value })}
                      >
                        {USER_DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Designation</label>
                      <select
                        className="form-select"
                        value={signupData.designation}
                        onChange={(e) => setSignupData({ ...signupData, designation: e.target.value })}
                      >
                        {USER_DESIGNATIONS.map((desig) => (
                          <option key={desig} value={desig}>{desig}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Password Fields */}
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Password <span className="text-red">*</span></label>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      className="form-input"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      placeholder="Min 6 characters"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password <span className="text-red">*</span></label>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      className="form-input"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      placeholder="Repeat password"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary auth-btn-submit" 
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Complete Registration & Enter'}
                </button>

                <div className="auth-switch-prompt">
                  Already registered?{' '}
                  <button 
                    type="button" 
                    className="link-switch-btn"
                    onClick={() => { setActiveTab('login'); setError(''); }}
                  >
                    Sign in to your account &rarr;
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
