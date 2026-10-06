import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function Input({ label, error, helperText, type = 'text', className = '', ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPasswordType = type === 'password';
  const effectiveType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.9rem', width: '100%' }}>
      {label && <label style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-heading)' }}>{label}</label>}
      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        <input
          type={effectiveType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            background: '#ffffff',
            border: error 
              ? '1px solid var(--danger-primary)' 
              : focused 
              ? '1px solid var(--terracotta-500)' 
              : '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: isPasswordType ? '0.6rem 2.5rem 0.6rem 0.85rem' : '0.6rem 0.85rem',
            color: 'var(--text-heading)',
            fontSize: '0.88rem',
            outline: 'none',
            transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
            boxShadow: focused && !error ? '0 0 0 3px rgba(198, 93, 58, 0.15)' : 'none',
            width: '100%'
          }}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem'
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger-primary)' }}>{error}</span>}
      {helperText && !error && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{helperText}</span>}
    </div>
  );
}

export function Textarea({ label, error, helperText, rows = 3, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.9rem', width: '100%' }}>
      {label && <label style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-heading)' }}>{label}</label>}
      <textarea
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: '#ffffff',
          border: error 
            ? '1px solid var(--danger-primary)' 
            : focused 
            ? '1px solid var(--terracotta-500)' 
            : '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '0.6rem 0.85rem',
          color: 'var(--text-heading)',
          fontSize: '0.88rem',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
          boxShadow: focused && !error ? '0 0 0 3px rgba(198, 93, 58, 0.15)' : 'none',
          width: '100%'
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger-primary)' }}>{error}</span>}
      {helperText && !error && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{helperText}</span>}
    </div>
  );
}

export function Select({ label, error, helperText, options = [], children, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.9rem', width: '100%' }}>
      {label && <label style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-heading)' }}>{label}</label>}
      <select
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: '#ffffff',
          border: error 
            ? '1px solid var(--danger-primary)' 
            : focused 
            ? '1px solid var(--terracotta-500)' 
            : '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '0.6rem 0.85rem',
          color: 'var(--text-heading)',
          fontSize: '0.88rem',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
          boxShadow: focused && !error ? '0 0 0 3px rgba(198, 93, 58, 0.15)' : 'none',
          width: '100%'
        }}
        {...props}
      >
        {options.length > 0
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger-primary)' }}>{error}</span>}
      {helperText && !error && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{helperText}</span>}
    </div>
  );
}
