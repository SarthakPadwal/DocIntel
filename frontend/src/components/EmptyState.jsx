import React from 'react';
import { HiOutlineFolderOpen } from 'react-icons/hi';

const EmptyState = ({ icon: Icon = HiOutlineFolderOpen, title = 'No Data Found', description = 'There is no data to display here.', action }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      color: 'var(--text-muted)'
    }}>
      <Icon size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
      <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '18px' }}>{title}</h3>
      <p style={{ marginBottom: action ? '20px' : '0', fontSize: '14px', maxWidth: '400px' }}>{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
