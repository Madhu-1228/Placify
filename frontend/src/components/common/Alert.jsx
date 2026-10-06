import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function Alert({ type = 'info', message, onClose, className = '' }) {
  if (!message) return null;

  const getTheme = () => {
    switch (type) {
      case 'error':
      case 'danger':
        return { 
          bg: 'var(--danger-bg)', 
          border: 'var(--danger-border)', 
          color: 'var(--danger-primary)', 
          Icon: AlertCircle 
        };
      case 'success':
        return { 
          bg: 'var(--success-bg)', 
          border: 'var(--success-border)', 
          color: 'var(--success-primary)', 
          Icon: CheckCircle2 
        };
      case 'warning':
        return {
          bg: 'var(--warning-bg)',
          border: 'var(--warning-border)',
          color: 'var(--warning-primary)',
          Icon: AlertCircle
        };
      default:
        return { 
          bg: 'var(--info-bg)', 
          border: 'var(--info-border)', 
          color: 'var(--info-primary)', 
          Icon: Info 
        };
    }
  };

  const { bg, border, color, Icon } = getTheme();

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      color: color,
      padding: '0.65rem 0.85rem',
      borderRadius: 'var(--radius-sm)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      fontSize: '0.86rem',
      marginBottom: '1rem'
    }} className={className}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon size={16} style={{ flexShrink: 0 }} />
        <span style={{ fontWeight: 500 }}>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'currentColor',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            opacity: 0.75
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
