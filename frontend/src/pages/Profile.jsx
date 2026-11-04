import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/api';
import { 
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlinePencilAlt,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineExternalLink,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineSearch,
  HiOutlineClock,
  HiOutlineSave,
  HiOutlineX,
  HiOutlineCheck
} from 'react-icons/hi';
import './Profile.css';

const Profile = () => {
  const { user: authUser, updateUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
    designation: ''
  });

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      if (res.data?.success) {
        const { user, stats, clearance } = res.data.data;
        setProfileData({ user, stats, clearance });
        setFormData({
          name: user.name || '',
          phone: user.phone || '',
          department: user.department || '',
          designation: user.designation || ''
        });
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to fetch user profile details.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: digitsOnly }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setStatusMessage({ type: 'error', text: 'Full Name is required.' });
      return;
    }

    if (formData.phone && formData.phone.length !== 10) {
      setStatusMessage({ type: 'error', text: 'Phone number must be exactly 10 digits.' });
      return;
    }

    try {
      setSaving(true);
      setStatusMessage(null);

      const res = await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        designation: formData.designation.trim()
      });

      if (res.data?.success) {
        const updatedUser = res.data.data.user;
        // Immediately sync across AuthContext (updates sidebar & navbar)
        updateUser(updatedUser);

        setProfileData(prev => ({
          ...prev,
          user: updatedUser
        }));

        setStatusMessage({
          type: 'success',
          text: 'Profile details updated and synchronized successfully across DocIntel.'
        });
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save changes. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profileData?.user) {
      setFormData({
        name: profileData.user.name || '',
        phone: profileData.user.phone || '',
        department: profileData.user.department || '',
        designation: profileData.user.designation || ''
      });
    }
    setIsEditing(false);
    setStatusMessage(null);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading-skeleton">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-text line-1"></div>
          <div className="skeleton-text line-2"></div>
        </div>
      </div>
    );
  }

  const currentUser = profileData?.user || authUser || {};
  const isAdmin = currentUser.role === 'ADMIN';
  const stats = profileData?.stats || {};
  const clearance = profileData?.clearance || {};

  return (
    <div className="profile-container">
      {/* Page Title & Breadcrumb Header */}
      <div className="profile-header-bar">
        <div>
          <h1 className="profile-title">User Account & Clearance</h1>
          <p className="profile-subtitle">
            Enterprise authentication credentials, verification scope, and personal parameters.
          </p>
        </div>
        <div className="profile-top-actions">
          {isAdmin && (
            <Link to="/admin" className="btn btn-outline-admin">
              <HiOutlineShieldCheck size={18} />
              Open Admin Console
              <HiOutlineExternalLink size={14} />
            </Link>
          )}
          {!isEditing ? (
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => { setIsEditing(true); setStatusMessage(null); }}
            >
              <HiOutlinePencilAlt size={18} />
              Edit Personal Details
            </button>
          ) : (
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleCancelEdit}
            >
              <HiOutlineX size={18} />
              Cancel Editing
            </button>
          )}
        </div>
      </div>

      {/* Global Status Message Toast */}
      {statusMessage && (
        <div className={`profile-alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {statusMessage.type === 'success' ? (
            <HiOutlineCheckCircle size={22} className="alert-icon" />
          ) : (
            <HiOutlineExclamationCircle size={22} className="alert-icon" />
          )}
          <div className="alert-content">{statusMessage.text}</div>
          <button 
            type="button" 
            className="alert-close" 
            onClick={() => setStatusMessage(null)}
          >
            <HiOutlineX size={16} />
          </button>
        </div>
      )}

      {/* Identity Hero Banner Card */}
      <div className={`profile-hero-card ${isAdmin ? 'admin-card-glow' : 'user-card-glow'}`}>
        <div className="profile-hero-content">
          <div className="hero-avatar-wrapper">
            <div className={`hero-avatar ${isAdmin ? 'avatar-admin' : 'avatar-user'}`}>
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="avatar-verified-badge" title="Identity Verified & Active">
              <HiOutlineCheck size={14} />
            </div>
          </div>

          <div className="hero-details">
            <div className="hero-name-row">
              <h2 className="hero-name">{currentUser.name || 'DocIntel User'}</h2>
              <span className={`badge-role ${isAdmin ? 'badge-admin' : 'badge-employee'}`}>
                {isAdmin ? 'ROOT ADMINISTRATOR' : 'ENTERPRISE MEMBER'}
              </span>
              <span className="badge-clearance-chip">
                {isAdmin ? 'SEC-LVL-4' : 'STANDARD TIER'}
              </span>
            </div>

            <div className="hero-meta-row">
              <span className="hero-meta-item">
                <HiOutlineMail size={16} />
                {currentUser.email}
              </span>
              <span className="hero-meta-separator">•</span>
              <span className="hero-meta-item">
                <HiOutlineOfficeBuilding size={16} />
                {currentUser.department || 'General Operations'}
              </span>
              <span className="hero-meta-separator">•</span>
              <span className="hero-meta-item">
                <HiOutlineBriefcase size={16} />
                {currentUser.designation || (isAdmin ? 'System Administrator' : 'Staff Member')}
              </span>
            </div>

            <div className="hero-id-row">
              <span className="account-id-badge">
                ID: <span className="mono">DOC-USR-{String(currentUser.id || 1).padStart(4, '0')}</span>
              </span>
              <span className="member-since">
                <HiOutlineCalendar size={14} />
                Member since {currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Initial System Setup'}
              </span>
              {currentUser.phone && (
                <span className="member-phone">
                  <HiOutlinePhone size={14} />
                  {currentUser.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Role-Specific Clearance & Verification Box */}
      <div className="profile-section-card clearance-card">
        <div className="section-card-header">
          <div className="flex items-center gap-2">
            <div className={`clearance-icon-circle ${isAdmin ? 'bg-admin-icon' : 'bg-user-icon'}`}>
              <HiOutlineShieldCheck size={24} />
            </div>
            <div>
              <h3 className="section-card-title">
                {isAdmin ? 'System Administrator Clearance & Authority' : 'Enterprise Member Clearance & Privileges'}
              </h3>
              <p className="section-card-desc">
                {clearance.tier || (isAdmin ? 'SEC-LVL-4 ROOT CLEARANCE' : 'STANDARD REPOSITORY CLEARANCE')} • {clearance.scope || 'Global Scope'}
              </p>
            </div>
          </div>
          <span className={`status-pill ${isAdmin ? 'status-pill-admin' : 'status-pill-user'}`}>
            <span className="status-dot-pulse"></span>
            {clearance.badge || (isAdmin ? 'Verified Root Administrator' : 'Verified Enterprise Member')}
          </span>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="clearance-stats-grid">
          {isAdmin ? (
            <>
              <div className="stat-card">
                <div className="stat-value">{stats.totalDocuments ?? 0}</div>
                <div className="stat-label">Total Repository Documents</div>
              </div>
              <div className="stat-card">
                <div className="stat-value text-amber">{stats.pendingReview ?? 0}</div>
                <div className="stat-label">Ingestion Review Queue</div>
              </div>
              <div className="stat-card">
                <div className="stat-value text-cyan">{stats.totalUsers ?? 0}</div>
                <div className="stat-label">Active System Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-value text-emerald">{stats.auditEvents ?? 0}</div>
                <div className="stat-label">Immutable Audit Logs</div>
              </div>
            </>
          ) : (
            <>
              <div className="stat-card">
                <div className="stat-value">{stats.totalDocuments ?? 0}</div>
                <div className="stat-label">Documents Uploaded</div>
              </div>
              <div className="stat-card">
                <div className="stat-value text-cyan">{stats.searchesPerformed ?? 0}</div>
                <div className="stat-label">Extraction Searches</div>
              </div>
              <div className="stat-card">
                <div className="stat-value text-emerald">{stats.actionsLogged ?? 0}</div>
                <div className="stat-label">Personal Audit Events</div>
              </div>
            </>
          )}
        </div>

        {/* Privileges Checklist */}
        <div className="privileges-box">
          <div className="privileges-title">Authorized System Capabilities & Verification Scope:</div>
          <div className="privileges-grid">
            {(clearance.privileges || [
              'Document Upload & Ingestion Access',
              'Metadata Viewing & Attribute Extraction Search',
              'Document Preview & Content Search',
              'Personal Activity & Audit Trail History'
            ]).map((priv, idx) => (
              <div key={idx} className="privilege-item">
                <HiOutlineCheckCircle size={18} className="privilege-check" />
                <span>{priv}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personal Details & Editable Profile Parameters */}
      <div className="profile-section-card details-card">
        <div className="section-card-header">
          <div>
            <h3 className="section-card-title">Personal Details & Contact Parameters</h3>
            <p className="section-card-desc">
              {isEditing 
                ? 'Modify your identity details and departmental contact info below.' 
                : 'Your current enterprise details registered in the DocIntel database.'}
            </p>
          </div>
          {!isEditing && (
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => { setIsEditing(true); setStatusMessage(null); }}
            >
              <HiOutlinePencilAlt size={16} />
              Edit Details
            </button>
          )}
        </div>

        {!isEditing ? (
          /* READ-ONLY VIEW */
          <div className="details-display-grid">
            <div className="detail-item">
              <div className="detail-label">Full Name</div>
              <div className="detail-value text-lg font-semibold">{currentUser.name || 'Not provided'}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                Email Address
                <span className="locked-badge" title="Primary Identity Identifier (Locked for security)">
                  <HiOutlineLockClosed size={12} /> SSO Locked
                </span>
              </div>
              <div className="detail-value mono">{currentUser.email}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Phone Number</div>
              <div className="detail-value">
                {currentUser.phone ? (
                  <span>{currentUser.phone}</span>
                ) : (
                  <span className="text-muted italic">Not provided (click edit to add)</span>
                )}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Department</div>
              <div className="detail-value">
                {currentUser.department ? (
                  <span className="department-tag">{currentUser.department}</span>
                ) : (
                  <span className="text-muted italic">General Operations</span>
                )}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Designation / Role Title</div>
              <div className="detail-value">
                {currentUser.designation || (isAdmin ? 'System Administrator' : 'Enterprise Specialist')}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">System Role & Clearance Tier</div>
              <div className="detail-value">
                <span className={`badge-role-sm ${isAdmin ? 'badge-admin' : 'badge-employee'}`}>
                  {currentUser.role}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Account Identification Code</div>
              <div className="detail-value mono text-cyan">
                DOC-USR-{String(currentUser.id || 1).padStart(4, '0')}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Account Verification Status</div>
              <div className="detail-value text-emerald flex items-center gap-1">
                <HiOutlineCheckCircle size={16} /> Active & Authenticated
              </div>
            </div>
          </div>
        ) : (
          /* EDITABLE FORM */
          <form onSubmit={handleSaveProfile} className="profile-edit-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <HiOutlineUser className="input-icon" size={18} />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                  <span className="locked-badge" title="Email is your authentication identifier and cannot be modified directly.">
                    <HiOutlineLockClosed size={12} /> Read Only
                  </span>
                </label>
                <div className="input-with-icon">
                  <HiOutlineMail className="input-icon" size={18} />
                  <input
                    type="email"
                    id="email"
                    value={currentUser.email}
                    disabled
                    className="form-input disabled-input"
                  />
                </div>
                <span className="form-help-text">Email address is bound to SSO and security credentials.</span>
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number (10 Digits)</label>
                <div className="input-with-icon">
                  <HiOutlinePhone className="input-icon" size={18} />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit number (e.g. 9876543210)"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    className="form-input"
                  />
                </div>
                <span className="form-help-text">Direct 10-digit telephone number for compliance contact (numbers only).</span>
              </div>

              <div className="form-group">
                <label htmlFor="department" className="form-label">Department</label>
                <div className="input-with-icon">
                  <HiOutlineOfficeBuilding className="input-icon" size={18} />
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g. Operations, Legal, Finance, Engineering"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="designation" className="form-label">Designation / Official Title</label>
                <div className="input-with-icon">
                  <HiOutlineBriefcase className="input-icon" size={18} />
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="e.g. Lead Administrator, Compliance Officer"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Role</label>
                <div className="input-with-icon">
                  <HiOutlineShieldCheck className="input-icon" size={18} />
                  <input
                    type="text"
                    value={currentUser.role}
                    disabled
                    className="form-input disabled-input"
                  />
                </div>
                <span className="form-help-text">System authority tier is managed by Root Administrators.</span>
              </div>
            </div>

            <div className="form-actions-bar">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm"></span>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <HiOutlineSave size={18} />
                    Save & Synchronize Changes
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleCancelEdit}
                className="btn btn-secondary"
              >
                <HiOutlineX size={18} />
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
