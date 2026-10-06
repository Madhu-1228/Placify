import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <strong>PLACIFY</strong> – Intelligent Placement Preparation & Tracking Platform
        </div>
        <div>
          B.Tech Final-Year Project &bull; React.js &bull; Spring Boot &bull; MongoDB &bull; Gemini AI
        </div>
      </div>
    </footer>
  );
}
