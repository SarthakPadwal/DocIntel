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
  HiOutlineRefresh,
  HiOutlineLightningBolt,
  HiOutlineCheck,
  HiOutlineSearch,
  HiOutlineDatabase
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
  'Logistics'
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
  // introStage: 'splash' (2.5s logo animation) -> 'briefing' (10s full-screen overview) -> 'none' (split auth)
  const [introStage, setIntroStage] = useState('none');
  const [countdown, setCountdown] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if first-time visit in this tab to display the 2-stage animated intro
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('docintel_intro_seen');
    if (!hasSeenIntro) {
      setIntroStage('splash');
      sessionStorage.setItem('docintel_intro_seen', 'true');
    }
  }, []);

  // Stage 1: 2.5-second Logo Splash Animation -> then automatically move to 'briefing'
  useEffect(() => {
    let splashTimer;
    if (introStage === 'splash') {
      splashTimer = setTimeout(() => {
        setIntroStage('briefing');
      }, 2600);
    }
    return () => clearTimeout(splashTimer);
  }, [introStage]);

  // Stage 2: 10-second Countdown for Platform Briefing
  useEffect(() => {
    let timer;
    if (introStage === 'briefing') {
      setCountdown(10);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIntroStage('none');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [introStage]);

  // Sync active tab with route
  useEffect(() => {
    if (location.pathname.includes('signup')) {
      setActiveTab('signup');
    } else if (location.pathname.includes('login')) {
      setActiveTab('login');
    }
  }, [location.pathname]);

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

  // Instant Demo Logins (works offline, locally, and on GitHub Pages)
  const handleQuickDemo = async (roleType) => {
    setLoading(true);
    setError('');
    try {
      if (roleType === 'ADMIN') {
        await login('admin@docintel.com', 'password123');
      } else {
        await login('employee.user@docintel.com', 'password123');
      }
      navigate('/dashboard');
    } catch (err) {
      setError('Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-master-wrapper">
      {/* ============================================================== */}
      {/* 1. INITIAL 2.5-SECOND FULL-SCREEN LOGO ANIMATION (STAGE: SPLASH)*/}
      {/* ============================================================== */}
      {introStage === 'splash' && (
        <div className="splash-fullscreen-cover" onClick={() => setIntroStage('briefing')}>
          <div className="splash-ambient-aura"></div>
          <div className="splash-center-content">
            <div className="splash-logo-container">
              <img src={docIntelIcon} alt="DocIntel Logo" className="splash-animated-logo" />
              <div className="splash-scan-line"></div>
            </div>
            <h1 className="splash-brand-title">
              Doc<span className="text-cyan-brand">Intel</span>
            </h1>
            <p className="splash-brand-motto">DOCUMENT INTELLIGENCE PLATFORM</p>
            <div className="splash-loader-bar">
              <div className="splash-loader-progress"></div>
            </div>
            <span className="splash-skip-hint">Click anywhere to skip</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. FULL-SCREEN PLATFORM BRIEFING SCREEN (STAGE: BRIEFING)     */}
      {/* ============================================================== */}
      {introStage === 'briefing' && (
        <div className="briefing-fullscreen-view">
          {/* Header Bar */}
          <div className="briefing-navbar">
            <div className="briefing-brand-group">
              <img src={docIntelIcon} alt="DocIntel Icon" className="briefing-nav-icon" />
              <div>
                <span className="briefing-nav-title">Doc<span className="text-cyan-brand">Intel</span></span>
                <span className="briefing-nav-tag">Platform Overview</span>
              </div>
            </div>
            <button 
              type="button" 
              className="btn-skip-to-auth"
              onClick={() => setIntroStage('none')}
            >
              Proceed to Sign In <HiOutlineArrowRight size={16} />
            </button>
          </div>

          {/* Central Full-Screen Hero & Executive Summary */}
          <div className="briefing-main-canvas">
            <div className="briefing-hero-header">
              <div className="briefing-hero-icon-wrap">
                <img src={docIntelIcon} alt="DocIntel" className="briefing-hero-logo" />
              </div>
              <h1 className="briefing-headline">
                Centralized Document <span className="text-cyan-brand">Intelligence</span>
              </h1>
              <p className="briefing-category-motto">STORE • PROCESS • ANALYZE</p>
              <p className="briefing-lead-desc">
                DocIntel is an enterprise platform engineered to eliminate manual documentation overhead. 
                Seamlessly ingest business files, automatically extract critical metadata, monitor upcoming due dates, 
                and maintain complete role-governed compliance across all departments.
              </p>
            </div>

            {/* 3 Core Value Pillars (Zero code / technical stack leaks) */}
            <div className="briefing-pillars-row">
              <div className="briefing-pillar-box">
                <div className="pillar-icon-shield cyan-tint">
                  <HiOutlineDocumentText size={24} />
                </div>
                <h3>01. Document Ingestion</h3>
                <p>
                  Centralize invoices, quotations, contracts, and tenders into a unified, secure repository with automated indexing.
                </p>
                <div className="pillar-metric-tag">Centralized Intake</div>
              </div>

              <div className="briefing-pillar-box">
                <div className="pillar-icon-shield purple-tint">
                  <HiOutlineSparkles size={24} />
                </div>
                <h3>02. Intelligent Extraction</h3>
                <p>
                  Instantly extracts invoice numbers, vendor records, total amounts, and transaction dates without manual typing.
                </p>
                <div className="pillar-metric-tag">Zero Manual Entry</div>
              </div>

              <div className="briefing-pillar-box">
                <div className="pillar-icon-shield emerald-tint">
                  <HiOutlineClock size={24} />
                </div>
                <h3>03. Chronometry Radar</h3>
                <p>
                  Proactive milestone monitoring, due-date radar, and expiration alerts to ensure zero delayed approvals or penalties.
                </p>
                <div className="pillar-metric-tag">Milestone Tracking</div>
              </div>
            </div>

            {/* Progress Countdown Bar */}
            <div className="briefing-footer-timer">
              <div className="timer-status-row">
                <span className="timer-text">
                  Entering DocIntel Portal in <strong>{countdown}s</strong>...
                </span>
                <button 
                  type="button" 
                  className="timer-skip-action" 
                  onClick={() => setIntroStage('none')}
                >
                  Enter Portal Now &rarr;
                </button>
              </div>
              <div className="timer-track-bar">
                <div 
                  className="timer-fill-bar"
                  style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SPLIT-SCREEN AUTHENTICATION (LEFT HALF & RIGHT HALF)       */}
      {/* ============================================================== */}
      <div className="split-auth-container">
        {/* ----------------- LEFT HALF: BRAND & BUSINESS CAPABILITIES ----------------- */}
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
                Automate your enterprise document lifecycle with precision extraction & chronometry.
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
                  <strong>Automated Data Extraction Pipeline</strong>
                  <span>High-speed attribute extraction, vendor recognition, and total calculations</span>
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
                  <strong>Role Clearance & Audit Governance</strong>
                  <span>Multi-tier permission policies with immutable enterprise audit logs</span>
                </div>
              </div>
            </div>

            {/* Business Value Highlights (Replaced all code/tech stack chips) */}
            <div className="business-values-ribbon">
              <span className="value-chip">✓ Zero Manual Data Entry</span>
              <span className="value-chip">✓ Instant Attribute Search</span>
              <span className="value-chip">✓ Automated Due-Date Tracking</span>
              <span className="value-chip">✓ Multi-Department Security</span>
            </div>

            {/* Footer Status & Replay Tour */}
            <div className="left-panel-footer">
              <div className="engine-status-pill">
                <span className="status-live-dot"></span>
                DocIntel Core Active &bull; Enterprise Protocol
              </div>
              <button 
                type="button" 
                className="btn-replay-intro"
                onClick={() => setIntroStage('briefing')}
                title="View animated DocIntel showcase & overview"
              >
                <HiOutlineRefresh size={14} />
                Platform Overview
              </button>
            </div>
          </div>
        </div>

        {/* ----------------- RIGHT HALF: AUTH FORMS (LOGIN / SIGNUP) ----------------- */}
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
                    placeholder="john.doe@company.com"
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
                    <span>Instant Demo Access:</span>
                  </div>
                  <div className="demo-buttons-grid">
                    <button 
                      type="button" 
                      className="demo-btn admin-demo"
                      onClick={() => handleQuickDemo('ADMIN')}
                    >
                      <HiOutlineShieldCheck size={16} />
                      Sign In as Administrator
                    </button>
                    <button 
                      type="button" 
                      className="demo-btn employee-demo"
                      onClick={() => handleQuickDemo('USER')}
                    >
                      <HiOutlineUserGroup size={16} />
                      Sign In as Staff Member
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
                  <p>Register as an Administrator or Departmental Staff Member.</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name <span className="text-red">*</span></label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    placeholder="e.g. John Doe"
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
                    placeholder="john.doe@company.com"
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
                        <strong>Staff Member</strong>
                      </div>
                      <span className="role-desc">Ingestion, Search, Department Operations</span>
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
