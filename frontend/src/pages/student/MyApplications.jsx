import React, { useState, useEffect } from 'react';
import { applicationService } from '../../services/applicationService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import ApplicationTimeline from '../../components/student/ApplicationTimeline';
import {
  FileCheck,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Clock
} from 'lucide-react';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getMyApplications();
      setApplications(data || []);
      if (data && data.length > 0) {
        setExpandedAppId(data[0].id); // Expand the latest application by default
      }
    } catch (e) {
      console.error(e);
      setError('Failed to retrieve your application history.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedAppId(prev => prev === id ? null : id);
  };

  if (loading) {
    return <Loader message="Loading your recruitment application timelines..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#321A2E' }}>My Placement Applications</h1>
        <p style={{ color: '#746B6D', fontSize: '0.88rem' }}>
          Track recruitment funnel stages from application review through technical interview and final selection
        </p>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      {applications.length === 0 ? (
        <Card hover={false}>
          <div style={{ textAlign: 'center', padding: '3rem', color: '#746B6D' }}>
            <FileCheck size={44} style={{ opacity: 0.3, margin: '0 auto 0.75rem', color: '#C65D3A' }} />
            <h3 style={{ color: '#292326', fontSize: '1.1rem' }}>No Active Applications</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
              Explore eligible company drives and apply to initiate your recruitment process.
            </p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applications.map(app => {
            const isExpanded = expandedAppId === app.id;

            return (
              <Card key={app.id} hover={false} style={{ overflow: 'hidden' }}>
                {/* Header Summary Row */}
                <div
                  onClick={() => toggleExpand(app.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    flexWrap: 'wrap',
                    gap: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#FBE9DF',
                      border: '1px solid #E8DAD4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#C65D3A'
                    }}>
                      <Building2 size={20} />
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#292326', margin: 0 }}>{app.companyName}</h3>
                      <div style={{ fontSize: '0.82rem', color: '#746B6D', marginTop: '0.15rem' }}>
                        {app.driveRole} &bull; Applied on {new Date(app.appliedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <Badge status={app.status} />
                    <button style={{ background: 'transparent', border: 'none', color: '#746B6D', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Stage Timeline */}
                {isExpanded && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #E8DAD4' }}>
                    <ApplicationTimeline currentStatus={app.status} stageHistory={app.stageHistory} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
