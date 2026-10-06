import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { driveService } from '../../services/driveService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { Select, Textarea } from '../../components/common/Input';
import {
  FileCheck,
  Edit,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  MessageSquare,
  FileText,
  ExternalLink,
  Mail,
  Phone,
  GraduationCap
} from 'lucide-react';

const STAGES = [
  'APPLIED',
  'UNDER_REVIEW',
  'TEST',
  'INTERVIEW',
  'SELECTED',
  'REJECTED'
];

export default function AdminApplications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDriveId = searchParams.get('driveId') || 'ALL';

  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDriveId, setSelectedDriveId] = useState(initialDriveId);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  // Status Update & Candidate Dossier Modal
  const [editingApp, setEditingApp] = useState(null);
  const [newStatus, setNewStatus] = useState('UNDER_REVIEW');
  const [stageNotes, setStageNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    loadDrivesAndApplications();
  }, []);

  useEffect(() => {
    loadApplicationsOnly();
  }, [selectedDriveId, selectedStatus]);

  const loadDrivesAndApplications = async () => {
    setLoading(true);
    try {
      const [dList, aList] = await Promise.all([
        driveService.getAllDrives(),
        applicationService.getAllApplications({
          driveId: selectedDriveId !== 'ALL' ? selectedDriveId : undefined,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined
        })
      ]);
      setDrives(dList || []);
      setApplications(aList || []);
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Failed to load application funnel data.' });
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationsOnly = async () => {
    try {
      const params = {};
      if (selectedDriveId !== 'ALL') params.driveId = selectedDriveId;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;

      const aList = await applicationService.getAllApplications(params);
      setApplications(aList || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenStatusModal = (app) => {
    setEditingApp(app);
    setNewStatus(app.status);
    setStageNotes('');
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!editingApp) return;
    setUpdating(true);
    setAlert({ type: '', message: '' });

    try {
      await applicationService.updateStatus(editingApp.id, newStatus, stageNotes);
      setAlert({ type: 'success', message: `Candidate ${editingApp.studentName} updated to stage: ${newStatus}` });
      setEditingApp(null);
      loadApplicationsOnly();
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update stage.' });
    } finally {
      setUpdating(false);
    }
  };

  const filteredApps = applications.filter(a => {
    if (search.trim()) {
      const s = search.toLowerCase();
      const matchName = a.studentName?.toLowerCase().includes(s);
      const matchRoll = a.studentRollNumber?.toLowerCase().includes(s);
      const matchComp = a.companyName?.toLowerCase().includes(s);
      const matchDept = a.studentDepartment?.toLowerCase().includes(s);
      const matchEmail = a.studentEmail?.toLowerCase().includes(s);
      return matchName || matchRoll || matchComp || matchDept || matchEmail;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#321A2E' }}>Recruitment Funnel & Application Pipeline</h1>
        <p style={{ color: '#746B6D', fontSize: '0.88rem' }}>
          Evaluate candidate submissions, student profiles, verified CVs, schedule interviews, and advance recruitment stages
        </p>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Filter Controls Bar */}
      <Card hover={false} style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 650, color: '#292326' }}>Filter by Company Drive</label>
            <select
              value={selectedDriveId}
              onChange={(e) => setSelectedDriveId(e.target.value)}
              style={{ background: '#FFFFFF', border: '1px solid #E8DAD4', borderRadius: '8px', padding: '0.5rem 0.65rem', color: '#292326', fontSize: '0.84rem', outline: 'none' }}
            >
              <option value="ALL">All Company Drives</option>
              {drives.map(d => (
                <option key={d.id} value={d.id}>{d.companyName} ({d.role})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 650, color: '#292326' }}>Recruitment Stage</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ background: '#FFFFFF', border: '1px solid #E8DAD4', borderRadius: '8px', padding: '0.5rem 0.65rem', color: '#292326', fontSize: '0.84rem', outline: 'none' }}
            >
              <option value="ALL">All Stages</option>
              {STAGES.map(st => (
                <option key={st} value={st}>{st.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 650, color: '#292326' }}>Search Applicant</label>
            <input
              placeholder="Candidate name, roll ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: '#FFFFFF', border: '1px solid #E8DAD4', borderRadius: '8px', padding: '0.5rem 0.65rem', color: '#292326', fontSize: '0.84rem', outline: 'none' }}
            />
          </div>
        </div>
      </Card>

      {/* Applications Table */}
      {loading ? (
        <Loader message="Loading recruitment pipeline submissions..." />
      ) : filteredApps.length === 0 ? (
        <Card hover={false}>
          <div style={{ textAlign: 'center', padding: '3rem', color: '#746B6D' }}>
            No candidate applications found matching the selected pipeline criteria.
          </div>
        </Card>
      ) : (
        <Card hover={false} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#FDF4EC', borderBottom: '1px solid #E8DAD4', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Candidate Name</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Branch & Roll ID</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Email & Phone</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Company & Role</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>CV / Resume</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Applied On</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Current Stage</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #E8DAD4' }}>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#292326' }}>{app.studentName}</div>
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', marginTop: '0.15rem' }}>
                        {app.studentCgpa && (
                          <span style={{ fontSize: '0.74rem', color: '#2E7D56', fontWeight: 700 }}>
                            CGPA: {app.studentCgpa}
                          </span>
                        )}
                        <span style={{ fontSize: '0.74rem', color: (app.studentBacklogs || 0) > 0 ? '#BF3B3B' : '#746B6D', fontWeight: 700 }}>
                          &bull; Backlogs: {app.studentBacklogs ?? 0}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#C65D3A' }}>{app.studentRollNumber || 'N/A'}</div>
                      <div style={{ fontSize: '0.76rem', color: '#746B6D' }}>{app.studentDepartment || 'Information Technology'}</div>
                    </td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#292326' }}>{app.studentEmail || 'student@placify.edu'}</div>
                      {app.studentPhone && <div style={{ fontSize: '0.74rem', color: '#746B6D' }}>{app.studentPhone}</div>}
                    </td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#292326' }}>{app.companyName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#746B6D' }}>{app.driveRole}</div>
                    </td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      {app.resumeUrl ? (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: '#FDF4EC',
                            border: '1px solid #E8DAD4',
                            color: '#C65D3A',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            textDecoration: 'none'
                          }}
                        >
                          <FileText size={12} /> View CV
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: '#746B6D' }}>In Profile</span>
                      )}
                    </td>
                    <td style={{ padding: '0.65rem 1rem', fontSize: '0.78rem', color: '#746B6D' }}>
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <Badge status={app.status} />
                    </td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                      <Button
                        variant="primary"
                        icon={Edit}
                        style={{ fontSize: '0.74rem', padding: '0.25rem 0.55rem' }}
                        onClick={() => handleOpenStatusModal(app)}
                      >
                        Stage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Candidate Application Dossier & Stage Update Modal */}
      <Modal
        isOpen={!!editingApp}
        onClose={() => setEditingApp(null)}
        title={`Candidate Application Dossier — ${editingApp?.studentName}`}
      >
        {editingApp && (
          <form onSubmit={handleSaveStatus} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Candidate Submitted Details Summary Card */}
            <div style={{
              background: '#FDF4EC',
              border: '1px solid #E8DAD4',
              padding: '1rem',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E8DAD4', paddingBottom: '0.45rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#321A2E', margin: 0 }}>{editingApp.studentName}</h3>
                  <div style={{ fontSize: '0.8rem', color: '#C65D3A', fontWeight: 600 }}>
                    {editingApp.studentDepartment || 'Information Technology'} &bull; Roll: {editingApp.studentRollNumber}
                  </div>
                </div>
                <Badge status={editingApp.status} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: '#746B6D' }}>Candidate Full Name:</span>
                  <div style={{ fontWeight: 700, color: '#292326' }}>{editingApp.studentName}</div>
                </div>
                <div>
                  <span style={{ color: '#746B6D' }}>Roll ID / Number:</span>
                  <div style={{ fontWeight: 700, color: '#C65D3A' }}>{editingApp.studentRollNumber || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: '#746B6D' }}>Branch / Department:</span>
                  <div style={{ fontWeight: 600, color: '#292326' }}>{editingApp.studentDepartment || 'Information Technology'}</div>
                </div>
                <div>
                  <span style={{ color: '#746B6D' }}>Institutional Mail ID:</span>
                  <div style={{ fontWeight: 600, color: '#292326' }}>{editingApp.studentEmail || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: '#746B6D' }}>Contact Phone Number:</span>
                  <div style={{ fontWeight: 600, color: '#292326' }}>{editingApp.studentPhone || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: '#746B6D' }}>Current CGPA:</span>
                  <div style={{ fontWeight: 800, color: '#2E7D56' }}>{editingApp.studentCgpa !== undefined && editingApp.studentCgpa !== null ? editingApp.studentCgpa : 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: '#746B6D' }}>Active Backlogs:</span>
                  <div style={{ fontWeight: 800, color: (editingApp.studentBacklogs || 0) > 0 ? '#BF3B3B' : '#2E7D56' }}>
                    {editingApp.studentBacklogs ?? 0} Backlogs
                  </div>
                </div>
                <div>
                  <span style={{ color: '#746B6D' }}>Recruitment Drive & Role:</span>
                  <div style={{ fontWeight: 600, color: '#292326' }}>{editingApp.companyName} ({editingApp.driveRole})</div>
                </div>
              </div>

              {/* Submitted Resume Button */}
              {editingApp.resumeUrl && (
                <div style={{ marginTop: '0.35rem', paddingTop: '0.45rem', borderTop: '1px solid #E8DAD4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#746B6D' }}>Verified Candidate Resume:</span>
                  <a
                    href={editingApp.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: '#C65D3A',
                      color: '#FFFFFF',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '5px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <FileText size={13} /> Open Submitted Resume / CV <ExternalLink size={11} />
                  </a>
                </div>
              )}

              {editingApp.notes && (
                <div style={{ background: '#FFFFFF', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #E8DAD4', fontSize: '0.76rem', color: '#3F373A' }}>
                  <strong style={{ color: '#292326' }}>Cover Note / Remarks:</strong> {editingApp.notes}
                </div>
              )}
            </div>

            {/* Advance Stage Control */}
            <Select
              label="Update Candidate Recruitment Stage"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {STAGES.map(st => (
                <option key={st} value={st}>{st.replace('_', ' ')}</option>
              ))}
            </Select>

            <Textarea
              label="Admin Remarks & Stage Instructions (Visible on Student Portal Timeline)"
              placeholder="e.g. Cleared Technical Round 1. HR Round scheduled for Aug 12 at 2:00 PM."
              rows={3}
              value={stageNotes}
              onChange={(e) => setStageNotes(e.target.value)}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.45rem' }}>
              <Button variant="outline" onClick={() => setEditingApp(null)} disabled={updating}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={updating}>
                {updating ? 'Saving...' : 'Update Stage & Notify Student'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
