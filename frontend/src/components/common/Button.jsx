import React from 'react';

export default function Button({ children, variant = 'primary', icon: Icon, onClick, disabled = false, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
