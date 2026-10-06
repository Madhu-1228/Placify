import React from 'react';
import { Layers, ShieldCheck, Activity } from 'lucide-react';

export default function Header({ apiHealth }) {
  return (
    <header className="navbar" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.85rem 1.5rem',
      background: '#FFF8F1',
      borderBottom: '1px solid #E8DAD4'
    }}>
      <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div className="nav-logo-icon" style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#321A2E', color: '#E9826E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Layers size={18} />
        </div>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#321A2E', letterSpacing: '-0.02em' }}>PLACIFY</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem' }}>
          <span className={`status-dot ${apiHealth ? 'online' : 'offline'}`}></span>
          <span style={{ color: apiHealth ? '#2E7D56' : '#BF3B3B', fontWeight: 600 }}>
            {apiHealth ? 'Backend Online' : 'Connecting to API...'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#FBE9DF', padding: '0.25rem 0.65rem', borderRadius: '9999px', border: '1px solid #E8DAD4', fontSize: '0.76rem', color: '#C65D3A', fontWeight: 600 }}>
          <ShieldCheck size={13} color="#C65D3A" />
          <span>VVITU Class of 2027</span>
        </div>
      </div>
    </header>
  );
}
