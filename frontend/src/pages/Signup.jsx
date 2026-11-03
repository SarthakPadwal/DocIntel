import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineShieldCheck, HiOutlineUserGroup } from 'react-icons/hi';
import './Signup.css';

const ADMIN_DESIGNATIONS = [
  'Team Manager',
  'Approval Authority',
  'Compliance Officer',
  'Audit Lead',
  'System Administrator'
];

const USER_DEPARTMENTS = [
  'Development',
  'Sales',
  'Retail',
  'Distributors',
  'Operations',
  'Finance',
  'Human Resources',
  'Marketing',
  'Legal',
  'Procurement'
];

const USER_DESIGNATIONS = [
  'Team Member',
  'Team Lead',
  'Senior Associate',
  'Junior Associate',
  'Intern',
  'Analyst',
  'Executive'
];

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    department: '',
    designation: ''
  });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // When role changes, reset department and designation
    if (name === 'role') {
      setFormData({ ...formData, role: value, department: '', designation: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Name, email and password fields are required.');
      return;
    }
    if (!formData.role) {
      setError('Please select your account role.');
      return;
    }
    if (formData.role === 'ADMIN' && !formData.designation) {
      setError('Please select your admin designation.');
      return;
    }
    if (formData.role === 'USER' && !formData.department) {
      setError('Please select your department.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.department,
        formData.designation
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <h2>DocIntel</h2>
          <p>Create your account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
            />
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${formData.role === 'ADMIN' ? 'active admin' : ''}`}
                onClick={() => handleChange({ target: { name: 'role', value: 'ADMIN' } })}
              >
                <HiOutlineShieldCheck size={22} />
                <div>
                  <strong>Admin</strong>
                  <span>Manager, Approver, Compliance</span>
                </div>
              </button>
              <button
                type="button"
                className={`role-option ${formData.role === 'USER' ? 'active user' : ''}`}
                onClick={() => handleChange({ target: { name: 'role', value: 'USER' } })}
              >
                <HiOutlineUserGroup size={22} />
                <div>
                  <strong>Employee</strong>
                  <span>Team member, Department staff</span>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional: Admin Designation */}
          {formData.role === 'ADMIN' && (
            <div className="form-group slide-in">
              <label className="form-label">Admin Designation</label>
              <select
                name="designation"
                className="form-select"
                value={formData.designation}
                onChange={handleChange}
              >
                <option value="">-- Select your designation --</option>
                {ADMIN_DESIGNATIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional: User Department + Designation */}
          {formData.role === 'USER' && (
            <>
              <div className="form-group slide-in">
                <label className="form-label">Department</label>
                <select
                  name="department"
                  className="form-select"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">-- Select your department --</option>
                  {USER_DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="form-group slide-in">
                <label className="form-label">Designation</label>
                <select
                  name="designation"
                  className="form-select"
                  value={formData.designation}
                  onChange={handleChange}
                >
                  <option value="">-- Select your designation --</option>
                  {USER_DESIGNATIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="pwd-input-wrapper">
              <input
                type={showPwd ? 'text' : 'password'}
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
