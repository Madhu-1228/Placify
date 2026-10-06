import React from 'react';

export default function Loader({ message = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.75rem' }}>
      <div className="spinner"></div>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message}</span>
    </div>
  );
}
