import React from 'react';

export default function Badge({ status, text, variant, type = 'neutral', children }) {
  const label = children || text || status;
  const key = (variant || status || type || 'neutral').toLowerCase().replace(/\s+/g, '_');

  const getBadgeClass = () => {
    switch (key) {
      case 'applied': return 'badge-applied';
      case 'under_review':
      case 'review': return 'badge-review';
      case 'test': return 'badge-test';
      case 'interview': return 'badge-interview';
      case 'selected':
      case 'success':
      case 'eligible': return 'badge-success';
      case 'rejected':
      case 'danger':
      case 'ineligible': return 'badge-rejected';
      case 'warning': return 'badge-warning';
      case 'info': return 'badge-info';
      case 'primary': return 'badge-primary';
      default: return 'badge-neutral';
    }
  };

  return (
    <span className={`badge ${getBadgeClass()}`}>
      {label}
    </span>
  );
}
