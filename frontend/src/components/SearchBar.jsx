import React from 'react';
import { HiOutlineSearch, HiX } from 'react-icons/hi';

const SearchBar = ({ value, onChange, placeholder = 'Search documents...' }) => {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
      <HiOutlineSearch 
        size={20} 
        style={{ 
          position: 'absolute', 
          left: '12px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          color: 'var(--text-secondary)'
        }} 
      />
      <input
        type="text"
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: '40px', paddingRight: '40px', height: '44px', fontSize: '15px' }}
      />
      {value && (
        <button 
          onClick={() => onChange('')}
          style={{ 
            position: 'absolute', 
            right: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            display: 'flex'
          }}
        >
          <HiX size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
