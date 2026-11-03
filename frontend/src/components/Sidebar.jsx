import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineViewGrid, 
  HiOutlineDocumentText, 
  HiOutlineCloudUpload, 
  HiOutlineSearch, 
  HiOutlineClock, 
  HiOutlineCalendar,
  HiOutlineLogout,
  HiOutlineShieldCheck,
  HiOutlineUser
} from 'react-icons/hi';
import docIntelIcon from '../assets/docintel-icon.png';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-brand-container" title="DocIntel - Store • Process • Analyze">
          <img src={docIntelIcon} alt="DocIntel Icon" className="sidebar-brand-icon" />
          <div className="sidebar-brand-text">
            <span className="brand-name">
              Doc<span className="brand-highlight">Intel</span>
            </span>
            <span className="brand-subtitle">Document Intelligence</span>
          </div>
        </Link>
      </div>
      
      <div className="role-indicator">
        <button className={`role-btn ${user?.role === 'ADMIN' ? 'active' : ''}`}>Admin</button>
        <button className={`role-btn ${user?.role !== 'ADMIN' ? 'active' : ''}`}>Employee</button>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-item">
          <HiOutlineViewGrid size={20} /> Dashboard
        </NavLink>
        <NavLink to="/documents" className="nav-item">
          <HiOutlineDocumentText size={20} /> Documents
        </NavLink>
        <NavLink to="/upload" className="nav-item">
          <HiOutlineCloudUpload size={20} /> Upload Document
        </NavLink>
        <NavLink to="/search" className="nav-item">
          <HiOutlineSearch size={20} /> Search
        </NavLink>
        <NavLink to="/history" className="nav-item">
          <HiOutlineClock size={20} /> History
        </NavLink>
        <NavLink to="/dates" className="nav-item">
          <HiOutlineCalendar size={20} /> Document Dates
        </NavLink>
        <NavLink to="/profile" className="nav-item">
          <HiOutlineUser size={20} /> Profile & Account
        </NavLink>

        {user?.role === 'ADMIN' && (
          <div className="admin-section">
            <span className="section-title">ADMINISTRATION</span>
            <NavLink to="/admin" className="nav-item">
              <HiOutlineShieldCheck size={20} /> Admin Management
              <span className="badge-root">ROOT</span>
            </NavLink>
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <Link 
          to="/profile"
          className="user-info clickable-account" 
          title="Click to view & edit Profile"
        >
          <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </Link>
        <button onClick={logout} className="logout-btn" title="Logout">
          <HiOutlineLogout size={20} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
