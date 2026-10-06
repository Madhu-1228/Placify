import React from 'react';
import Badge from '../common/Badge';
import { CheckCircle2, Clock, Calendar, User, MessageSquare } from 'lucide-react';

const STAGES = ['APPLIED', 'UNDER_REVIEW', 'TEST', 'INTERVIEW', 'SELECTED', 'REJECTED'];

export default function ApplicationTimeline({ currentStatus, stageHistory = [] }) {
  const getStageIndex = (status) => {
    if (status === 'REJECTED') return -1;
    return STAGES.indexOf(status);
  };

  const currentIndex = getStageIndex(currentStatus);
  const isRejected = currentStatus === 'REJECTED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Visual Pipeline Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '0.5rem 0' }}>
        <div style={{
          position: 'absolute',
          top: '18px',
          left: '20px',
          right: '20px',
          height: '4px',
          background: '#E8DAD4',
          zIndex: 0
        }}>
          {!isRejected && (
            <div style={{
              height: '100%',
              width: `${(Math.max(0, currentIndex) / (STAGES.length - 2)) * 100}%`,
              background: '#C65D3A',
              transition: 'width 0.4s ease'
            }} />
          )}
        </div>

        {STAGES.filter(s => s !== 'REJECTED').map((stage, idx) => {
          const isPassed = !isRejected && idx <= currentIndex;
          const isCurrent = !isRejected && idx === currentIndex;

          return (
            <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', zIndex: 1 }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: isPassed ? '#C65D3A' : '#FFFFFF',
                border: isCurrent ? '3px solid #C65D3A' : '2px solid #E8DAD4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isPassed ? '#FFF8F1' : '#746B6D',
                boxShadow: isCurrent ? '0 0 0 4px rgba(198, 93, 58, 0.2)' : 'none'
              }}>
                {isPassed ? <CheckCircle2 size={18} /> : <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{idx + 1}</span>}
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: isCurrent ? 700 : 600, color: isCurrent ? '#C65D3A' : '#746B6D' }}>
                {stage.replace('_', ' ')}
              </span>
            </div>
          );
        })}
      </div>

      {isRejected && (
        <div style={{
          background: '#FDF2F2',
          border: '1px solid #F5CCCC',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          color: '#BF3B3B',
          fontSize: '0.84rem',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          Recruitment Decision: Application marked as REJECTED
        </div>
      )}

      {/* Stage History Logs */}
      <div>
        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.65rem', color: '#292326' }}>
          Stage Transition History & Remarks
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {stageHistory && stageHistory.map((item, idx) => (
            <div key={idx} style={{
              background: '#FDF4EC',
              border: '1px solid #E8DAD4',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Badge status={item.status} />
                <span style={{ fontSize: '0.72rem', color: '#746B6D', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={11} /> {new Date(item.changedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {item.remarks && (
                <div style={{ fontSize: '0.8rem', color: '#3F373A', marginTop: '0.15rem' }}>
                  <strong>Remarks:</strong> {item.remarks}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
