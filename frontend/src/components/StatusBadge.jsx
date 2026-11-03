import React from 'react';

const StatusBadge = ({ status, size = 'default' }) => {
  const colors = {
    pending: 'var(--status-pending)',
    done: 'var(--status-done)',
    upcoming: 'var(--status-upcoming)',
    failed: 'var(--status-failed)',
    overdue: 'var(--status-failed, #ef4444)',
    uploaded: 'var(--status-uploaded)'
  };

  const normalizedStatus = (status || 'uploaded').toLowerCase();
  const color = colors[normalizedStatus] || colors.uploaded;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: size === 'small' ? '2px 6px' : '4px 10px',
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      fontSize: size === 'small' ? '11px' : '12px',
      color: 'var(--text-primary)',
      textTransform: 'capitalize'
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: color
      }}></span>
      {status}
    </span>
  );
};

export default StatusBadge;
