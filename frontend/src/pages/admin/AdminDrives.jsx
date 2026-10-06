import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { driveService } from '../../services/driveService';
import { notificationService } from '../../services/notificationService';
import { applicationService } from '../../services/applicationService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { Input, Textarea, Select } from '../../components/common/Input';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle2,
  XCircle,
  Share2,
  Send,
  Copy,
  Check,
  FileText,
  FileUp,
  Download,
  Bell,
  FileSpreadsheet,
  BarChart3
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Artificial Intelligence and Data Science',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering'
];

export default function AdminDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Broadcast Circular Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [selectedBroadcastDrive, setSelectedBroadcastDrive] = useState(null);
  const [broadcasting, setBroadcasting] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    driveId: '',
    title: '',
    message: '',
    documentUrl: '',
    documentName: '',
    noticeText: '',
    whatsappText: '',
    targetDepartment: 'ALL'
  });

  const broadcastFileInputRef = useRef(null);

  const initialForm = {
    companyName: '',
    role: '',
    jobDescription: '',
    packageCtc: '',
    location: '',
    driveDate: '',
    applicationDeadline: '',
    minimumCgpa: 7.0,
    maximumBacklogs: 0,
    eligibleDepartments: [...DEPARTMENTS],
    eligibleYears: [4],
    requiredSkills: [],
    selectionRounds: ['Online Test', 'Technical Interview', 'HR Round'],
    status: 'OPEN'
  };

  const [form, setForm] = useState(initialForm);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    loadDrives();
  }, []);

  const loadDrives = async () => {
    setLoading(true);
    try {
      const data = await driveService.getAllDrives();
      setDrives(data || []);
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Failed to retrieve company placement drives.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (drive) => {
    setIsEditing(true);
    setEditingId(drive.id);
    setForm({
      companyName: drive.companyName || '',
      role: drive.role || '',
      jobDescription: drive.jobDescription || '',
      packageCtc: drive.packageCtc || '',
      location: drive.location || '',
      driveDate: drive.driveDate || '',
      applicationDeadline: drive.applicationDeadline || '',
      minimumCgpa: drive.minimumCgpa || 0.0,
      maximumBacklogs: drive.maximumBacklogs || 0,
      eligibleDepartments: drive.eligibleDepartments || [],
      eligibleYears: drive.eligibleYears || [4],
      requiredSkills: drive.requiredSkills || [],
      selectionRounds: drive.selectionRounds || [],
      status: drive.status || 'OPEN'
    });
    setShowModal(true);
  };

  const handleOpenBroadcast = (drive) => {
    setSelectedBroadcastDrive(drive);

    const defaultTitle = `📢 ${drive.companyName} Campus Recruitment Drive Notice`;
    const defaultMsg = `Dear Students,\n\n${drive.companyName} is visiting VVITU for campus recruitment for the position of ${drive.role} with an attractive CTC of ${drive.packageCtc}.\n\n` +
      `Eligible candidates (Min CGPA: ${drive.minimumCgpa || 7.00}, Max Backlogs: ${drive.maximumBacklogs || 0}) must submit their application dossier on Placify before ${drive.applicationDeadline || 'the deadline'}.\n\n` +
      `Official recruitment syllabus & guidelines PDF is attached.\n\nPlacement Team,\nVVITU Career Development Services`;

    const defaultWhatsapp = `*VVITU CDS PLACEMENT CIRCULAR*\n\n` +
      `🏢 *Company:* ${drive.companyName}\n` +
      `💼 *Role:* ${drive.role}\n` +
      `💰 *Package (CTC):* ${drive.packageCtc}\n` +
      `📍 *Location:* ${drive.location || 'India'}\n` +
      `🎯 *Min CGPA:* ${drive.minimumCgpa || 7.00} | *Max Backlogs:* ${drive.maximumBacklogs || 0}\n` +
      `📅 *Drive Date / Deadline:* ${drive.driveDate || drive.applicationDeadline || 'Check Portal'}\n\n` +
      `🔗 *Apply on Placify Portal:* http://localhost:5173/student/drives\n` +
      `📄 *Official Syllabus / Circular PDF:* Attached on student portal\n\n` +
      `_– Training & Placement Cell, VVITU_`;

    setBroadcastForm({
      driveId: drive.id,
      title: defaultTitle,
      message: defaultMsg,
      documentUrl: `/uploads/circulars/${drive.companyName.replaceAll(' ', '_')}_Drive_Guidelines.pdf`,
      documentName: `${drive.companyName}_Recruitment_Circular.pdf`,
      noticeText: defaultMsg,
      whatsappText: defaultWhatsapp,
      targetDepartment: 'ALL'
    });

    setShowBroadcastModal(true);
  };

  const handleBroadcastFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBroadcastForm(prev => ({
        ...prev,
        documentName: file.name,
        documentUrl: `/uploads/circulars/${file.name}`
      }));
      setAlert({ type: 'info', message: `Attached circular document: "${file.name}"` });
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    setBroadcasting(true);
    try {
      await notificationService.broadcastCircular(broadcastForm);
      setAlert({
        type: 'success',
        message: `📢 Successfully broadcasted "${selectedBroadcastDrive?.companyName}" drive circular to all eligible candidates!`
      });
      setShowBroadcastModal(false);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to broadcast notification.' });
    } finally {
      setBroadcasting(false);
    }
  };

  const handleCopyBroadcastText = () => {
    navigator.clipboard.writeText(broadcastForm.whatsappText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleOpenWhatsappWeb = () => {
    const encoded = encodeURIComponent(broadcastForm.whatsappText);
    window.open(`https://web.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this placement drive?')) return;
    try {
      await driveService.deleteDrive(id);
      setAlert({ type: 'success', message: 'Placement drive successfully deleted.' });
      loadDrives();
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Failed to delete drive.' });
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await driveService.changeStatus(id, status);
      setAlert({ type: 'success', message: `Drive status set to ${status}.` });
      loadDrives();
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Failed to update status.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert({ type: '', message: '' });

    try {
      if (isEditing) {
        await driveService.updateDrive(editingId, form);
        setAlert({ type: 'success', message: 'Company drive updated successfully.' });
      } else {
        await driveService.createDrive(form);
        setAlert({ type: 'success', message: 'New placement drive announced successfully!' });
      }
      setShowModal(false);
      loadDrives();
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: e.response?.data?.message || 'Failed to save drive.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!form.requiredSkills.includes(skillInput.trim())) {
        setForm({ ...form, requiredSkills: [...form.requiredSkills, skillInput.trim()] });
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setForm({ ...form, requiredSkills: form.requiredSkills.filter(s => s !== skill) });
  };

  const toggleDepartment = (dept) => {
    if (form.eligibleDepartments.includes(dept)) {
      setForm({ ...form, eligibleDepartments: form.eligibleDepartments.filter(d => d !== dept) });
    } else {
      setForm({ ...form, eligibleDepartments: [...form.eligibleDepartments, dept] });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#321A2E' }}>Company Placement Drives Management</h1>
          <p style={{ color: '#746B6D', fontSize: '0.88rem' }}>
            Publish new campus recruitment drives, broadcast circulars, and track applicants
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
          Announce New Drive
        </Button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Drives Grid */}
      {loading ? (
        <Loader message="Loading company drives..." />
      ) : drives.length === 0 ? (
        <Card hover={false}>
          <div style={{ textAlign: 'center', padding: '3rem', color: '#746B6D' }}>
            No company drives created yet. Click "Announce New Drive" to post your first recruitment drive.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-3">
          {drives.map(drive => (
            <Card key={drive.id} className="card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.45rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#292326', margin: 0 }}>{drive.companyName}</h3>
                    <span style={{ fontSize: '0.82rem', color: '#C65D3A', fontWeight: 650 }}>{drive.role}</span>
                  </div>
                  <Badge status={drive.status} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem', margin: '0.65rem 0', color: '#746B6D' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <DollarSign size={14} color="#D4A24C" />
                    <strong style={{ color: '#D4A24C' }}>{drive.packageCtc}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="#746B6D" />
                    <span>{drive.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} color="#C65D3A" />
                    <span>Date: {drive.driveDate || 'TBD'}</span>
                  </div>
                </div>

                {/* Eligibility Criteria Summary */}
                <div style={{ background: '#FDF4EC', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #E8DAD4', fontSize: '0.74rem', display: 'flex', flexDirection: 'column', gap: '0.15rem', marginBottom: '0.65rem', color: '#3F373A' }}>
                  <div><strong>Min CGPA:</strong> {drive.minimumCgpa} | <strong>Max Backlogs:</strong> {drive.maximumBacklogs}</div>
                  <div><strong>Branches:</strong> {drive.eligibleDepartments?.length === DEPARTMENTS.length ? 'All Branches' : `${drive.eligibleDepartments?.length} Eligible`}</div>
                </div>
              </div>

              {/* Action Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingTop: '0.65rem', borderTop: '1px solid #E8DAD4' }}>
                {/* Broadcast Circular Button */}
                <button
                  type="button"
                  onClick={() => handleOpenBroadcast(drive)}
                  style={{
                    background: '#FDF4EC',
                    border: '1px solid #E8DAD4',
                    color: '#321A2E',
                    padding: '0.4rem',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Share2 size={13} color="#C65D3A" /> 📢 Broadcast Drive Circular
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <select
                    value={drive.status}
                    onChange={(e) => handleStatusChange(drive.id, e.target.value)}
                    style={{ background: '#FFFFFF', border: '1px solid #E8DAD4', color: '#292326', fontSize: '0.74rem', borderRadius: '6px', padding: '0.25rem 0.45rem', outline: 'none' }}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>

                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button
                      onClick={() => handleOpenEdit(drive)}
                      title="Edit Drive Details"
                      style={{ background: '#FDF4EC', border: '1px solid #E8DAD4', color: '#746B6D', padding: '0.25rem 0.45rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(drive.id)}
                      title="Delete Drive"
                      style={{ background: '#FDF2F2', border: '1px solid #F5CCCC', color: '#BF3B3B', padding: '0.25rem 0.45rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <Link to={`/admin/drives/${drive.id}`} style={{ textDecoration: 'none' }}>
                  <Button
                    variant="primary"
                    icon={FileSpreadsheet}
                    style={{
                      width: '100%',
                      fontSize: '0.76rem',
                      padding: '0.4rem',
                      fontWeight: 700
                    }}
                  >
                    📊 Drive Details & Student Export
                  </Button>
                </Link>

                <Link to={`/admin/applications?driveId=${drive.id}`} style={{ textDecoration: 'none' }}>
                  <Button variant="outline" icon={Users} style={{ width: '100%', fontSize: '0.74rem', padding: '0.3rem' }}>
                    Review Applicants
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Broadcast Drive Circular Modal */}
      <Modal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        title={`Broadcast Placement Notice — ${selectedBroadcastDrive?.companyName}`}
        maxWidth="720px"
      >
        {selectedBroadcastDrive && (
          <form onSubmit={handleBroadcastSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#FDF4EC', border: '1px solid #E8DAD4', padding: '0.75rem 0.95rem', borderRadius: '8px', fontSize: '0.84rem' }}>
              <div style={{ fontWeight: 800, color: '#321A2E' }}>{selectedBroadcastDrive.companyName} &bull; {selectedBroadcastDrive.role}</div>
              <div style={{ color: '#2E7D56', fontSize: '0.78rem', marginTop: '0.1rem' }}>
                Instant live broadcast: Sends in-app circular alerts with attached document & generates WhatsApp group broadcast copy.
              </div>
            </div>

            <Input
              label="Notification / Circular Headline *"
              value={broadcastForm.title}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
              required
            />

            <Textarea
              label="Full Circular Message / Guidelines *"
              rows={5}
              value={broadcastForm.message}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
              required
            />

            {/* Document attachment zone */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 650, color: '#292326' }}>
                Attach Official PDF Circular / Syllabus Guide
              </label>

              <input
                type="file"
                ref={broadcastFileInputRef}
                accept=".pdf,.doc,.docx"
                onChange={handleBroadcastFileSelect}
                style={{ display: 'none' }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E8DAD4', borderRadius: '6px', padding: '0.45rem 0.75rem', fontSize: '0.82rem', color: '#292326', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FileText size={15} color="#C65D3A" />
                  <span>{broadcastForm.documentName || 'Default_Placement_Circular.pdf'}</span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  icon={FileUp}
                  onClick={() => broadcastFileInputRef.current?.click()}
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
                >
                  Attach File
                </Button>
              </div>
            </div>

            {/* WhatsApp formatted copy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 650, color: '#292326' }}>
                  WhatsApp Class Broadcast Format
                </label>
                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  <button
                    type="button"
                    onClick={handleCopyBroadcastText}
                    style={{ background: '#FDF4EC', border: '1px solid #E8DAD4', borderRadius: '4px', padding: '0.2rem 0.55rem', fontSize: '0.74rem', color: '#C65D3A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}
                  >
                    {copiedText ? <Check size={13} color="#2E7D56" /> : <Copy size={13} />}
                    {copiedText ? 'Copied!' : 'Copy Text'}
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenWhatsappWeb}
                    style={{ background: '#F0F8F3', border: '1px solid #C8E6D3', borderRadius: '4px', padding: '0.2rem 0.55rem', fontSize: '0.74rem', color: '#2E7D56', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}
                  >
                    <Send size={13} /> Open WhatsApp Web
                  </button>
                </div>
              </div>

              <textarea
                rows={4}
                value={broadcastForm.whatsappText}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, whatsappText: e.target.value })}
                style={{ width: '100%', background: '#FFF8F1', border: '1px solid #E8DAD4', borderRadius: '8px', padding: '0.65rem', color: '#292326', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid #E8DAD4', paddingTop: '0.85rem' }}>
              <Button type="button" variant="outline" onClick={() => setShowBroadcastModal(false)} disabled={broadcasting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={Send} disabled={broadcasting}>
                {broadcasting ? 'Broadcasting...' : 'Broadcast to All Eligible Students'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Create / Edit Drive Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? `Edit Placement Drive — ${form.companyName}` : 'Announce New Placement Drive'}
        maxWidth="750px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid grid-cols-2">
            <Input
              label="Company Name *"
              placeholder="e.g. Google, Microsoft, Infosys"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              required
            />

            <Input
              label="Job Role / Designation *"
              placeholder="e.g. Associate Software Engineer"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            />

            <Input
              label="Package (CTC) *"
              placeholder="e.g. 14.5 LPA or 8.0 - 12.0 LPA"
              value={form.packageCtc}
              onChange={(e) => setForm({ ...form, packageCtc: e.target.value })}
              required
            />

            <Input
              label="Job Location *"
              placeholder="e.g. Hyderabad / Bangalore / Remote"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />

            <Input
              label="Drive Date (Optional)"
              type="date"
              value={form.driveDate}
              onChange={(e) => setForm({ ...form, driveDate: e.target.value })}
            />

            <Input
              label="Application Deadline *"
              type="date"
              value={form.applicationDeadline}
              onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
              required
            />

            <Input
              label="Minimum CGPA Requirement *"
              type="number"
              step="0.01"
              min="0"
              max="10"
              placeholder="e.g. 7.50"
              value={form.minimumCgpa}
              onChange={(e) => setForm({ ...form, minimumCgpa: parseFloat(e.target.value) || 0.0 })}
              required
            />

            <Input
              label="Maximum Allowed Backlogs *"
              type="number"
              min="0"
              value={form.maximumBacklogs}
              onChange={(e) => setForm({ ...form, maximumBacklogs: parseInt(e.target.value) || 0 })}
              required
            />
          </div>

          <Textarea
            label="Job Description & Eligibility Highlights"
            rows={3}
            placeholder="Key responsibilities, qualification requirements, service agreements..."
            value={form.jobDescription}
            onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
          />

          {/* Department Eligibility Multiselect */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 650, color: '#292326', display: 'block', marginBottom: '0.45rem' }}>
              Eligible Engineering Departments *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
              {DEPARTMENTS.map(dept => {
                const isSelected = form.eligibleDepartments.includes(dept);
                return (
                  <div
                    key={dept}
                    onClick={() => toggleDepartment(dept)}
                    style={{
                      padding: '0.4rem 0.65rem',
                      borderRadius: '6px',
                      background: isSelected ? '#FDF4EC' : '#FFF8F1',
                      border: isSelected ? '1px solid #C65D3A' : '1px solid #E8DAD4',
                      color: isSelected ? '#C65D3A' : '#746B6D',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 650 : 400,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: '#C65D3A' }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dept}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills Required Tags */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 650, color: '#292326', display: 'block', marginBottom: '0.35rem' }}>
              Target Technical Skills (Press Enter to add)
            </label>
            <input
              placeholder="e.g. Java, Python, React, Spring Boot, MySQL..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              style={{
                width: '100%',
                background: '#FFFFFF',
                border: '1px solid #E8DAD4',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                color: '#292326',
                fontSize: '0.84rem',
                outline: 'none',
                marginBottom: '0.45rem'
              }}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {form.requiredSkills.map(sk => (
                <span
                  key={sk}
                  style={{
                    background: '#FDF4EC',
                    border: '1px solid #E8DAD4',
                    color: '#C65D3A',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '9999px',
                    fontSize: '0.76rem',
                    fontWeight: 650,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  {sk}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(sk)}
                    style={{ background: 'none', border: 'none', color: '#BF3B3B', cursor: 'pointer', padding: 0 }}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid #E8DAD4', paddingTop: '0.85rem' }}>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Plus} disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update Drive Details' : 'Publish Recruitment Drive'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
