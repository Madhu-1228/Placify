import React from 'react';

export default function Card({ title, subtitle, icon: Icon, children, className = '', hover = true, accent, style = {} }) {
  return (
    <div
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {accent && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: accent
        }} />
      )}
      {(title || Icon) && (
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {Icon && (
              <div style={{
                background: '#FBE9DF',
                border: '1px solid #E8DAD4',
                color: '#C65D3A',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={18} />
              </div>
            )}
            <div>
              {title && <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#292326', margin: 0 }}>{title}</h3>}
              {subtitle && <p style={{ fontSize: '0.8rem', color: '#746B6D', marginTop: '0.15rem', margin: 0 }}>{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}
