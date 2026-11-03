import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'var(--accent)' }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <h3 className="stat-card-title">{title}</h3>
        {Icon && <Icon size={20} className="stat-card-icon" style={{ color }} />}
      </div>
      <div className="stat-card-value">{value}</div>
      {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
      <div className="stat-card-progress">
        <div className="stat-card-progress-bar" style={{ backgroundColor: color, width: '70%' }}></div>
      </div>
    </div>
  );
};

export default StatCard;
