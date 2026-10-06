import React from 'react';

export default function CircularScore({ score = 0, size = 120, strokeWidth = 10, label = 'Readiness Score' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 85) return '#D4A24C'; // Muted Gold
    if (s >= 70) return '#C65D3A'; // Terracotta
    if (s >= 50) return '#E9826E'; // Warm Coral
    return '#BF3B3B'; // Muted Red
  };

  const strokeColor = getColor(score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E8DAD4"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: size * 0.24, fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>
            {score}%
          </span>
        </div>
      </div>
      {label && (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>
          {label}
        </span>
      )}
    </div>
  );
}
