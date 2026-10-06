import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { applicationService } from '../../services/applicationService';
import { certificateService } from '../../services/certificateService';
import Card from '../../components/common/Card';
import { Input, Textarea, Select } from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import {
  User,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  Link as LinkIcon,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  BookOpen,
  FileText,
  FileUp,
  UploadCloud,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building,
  Check,
  AlertCircle,
  Clock,
  X,
  Eye,
  Download
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

export default function StudentProfile() {
  const { user, updateUserData } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    rollNumber: '',
    department: DEPARTMENTS[1],
    section: 'A',
    year: 3,
    semester: 6,
    cgpa: 8.85,
    backlogs: 0,
    phone: '',
    skills: [],
    projects: [],
    certifications: [],
    resumeUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    profileCompletionPercentage: 0
  });

  const [activeTab, setActiveTab] = useState('academic');
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadingResume, setUploadingResume] = useState(false);

  // Certificate Form & Modal State
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [certForm, setCertForm] = useState({
    name: '',
    issuer: '',
    year: '',
    credentialUrl: '',
    file: null
  });
  const [certFileError, setCertFileError] = useState('');
  const [uploadingCert, setUploadingCert] = useState(false);
  const [certValidationMsg, setCertValidationMsg] = useState('');

  // Certificate Preview Modal State
  const [previewCert, setPreviewCert] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const profileFileInputRef = useRef(null);
  const certFileInputRef = useRef(null);

  const handleProfileResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Selected file is too large. Please select a resume under 10MB.' });
      return;
    }

    setUploadingResume(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await applicationService.uploadResume(file);
      setProfile(prev => ({ ...prev, resumeUrl: data.fileUrl }));
      setMessage({ type: 'success', text: `Resume (${file.name}) uploaded successfully from local device!` });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload resume file.' });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleOpenAddCert = () => {
    setCertForm({
      name: '',
      issuer: '',
      year: new Date().getFullYear().toString(),
      credentialUrl: '',
      file: null
    });
    setCertFileError('');
    setShowAddCertModal(true);
  };

  const handleCertFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting same file triggers change
    e.target.value = '';

    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setCertFileError('Unsupported file type. Please select a PDF, JPG, JPEG, or PNG certificate.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setCertFileError('File size exceeds 10 MB limit. Please select a certificate under 10 MB.');
      return;
    }

    setCertFileError('');
    setCertForm(prev => ({ ...prev, file }));
  };

  const handleSubmitCertificateForm = async (e) => {
    if (e) e.preventDefault();

    if (!certForm.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter the Certificate Name / Title.' });
      return;
    }
    if (!certForm.issuer.trim()) {
      setMessage({ type: 'error', text: 'Please enter the Issuing Organization (Issued By).' });
      return;
    }
    if (!certForm.year.trim()) {
      setMessage({ type: 'error', text: 'Please enter the Year of issuance.' });
      return;
    }
    if (!certForm.file) {
      setCertFileError('Please select your certificate file from your local device.');
      return;
    }

    setUploadingCert(true);
    setCertValidationMsg('Validating certificate document with AI verification pipeline...');
    setMessage({ type: '', text: '' });

    try {
      const verifiedCert = await certificateService.uploadCertificate(certForm.file, {
        name: certForm.name.trim(),
        issuer: certForm.issuer.trim(),
        year: certForm.year.trim(),
        credentialUrl: certForm.credentialUrl.trim()
      });

      setProfile(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), verifiedCert]
      }));

      setMessage({
        type: 'success',
        text: `✓ Certificate verified & saved: ${verifiedCert.certificateTitle || verifiedCert.name} (${verifiedCert.issuer || 'Authorized'})`
      });

      setShowAddCertModal(false);
      setCertForm({ name: '', issuer: '', year: '', credentialUrl: '', file: null });
      setCertFileError('');
      loadProfile();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to verify and upload certificate.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setUploadingCert(false);
      setCertValidationMsg('');
    }
  };

  const getCertificateFileUrl = (cert) => {
    if (!cert) return '';
    const rawUrl = cert.fileUrl || cert.credentialUrl || '';
    if (!rawUrl) return '';
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl;
    }
    // Relative upload path, route to active host or proxy
    return rawUrl;
  };

  const handleOpenCertificatePreview = (cert) => {
    setPreviewCert(cert);
    setShowPreviewModal(true);
  };

  const handleDeleteVerifiedCert = async (certId, index) => {
    if (!window.confirm('Are you sure you want to delete this verified certification?')) return;
    if (certId) {
      try {
        await certificateService.deleteCertification(certId);
        setProfile(prev => ({
          ...prev,
          certifications: prev.certifications.filter(c => c.id !== certId)
        }));
        setMessage({ type: 'success', text: 'Certification removed successfully.' });
        loadProfile();
      } catch (err) {
        handleRemoveCert(index);
      }
    } else {
      handleRemoveCert(index);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await studentService.getProfile();
      if (data) {
        setProfile({
          ...data,
          skills: data.skills || [],
          projects: data.projects || [],
          certifications: data.certifications || [],
          department: data.department || DEPARTMENTS[1]
        });
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Failed to fetch profile data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updated = await studentService.updateProfile(profile);
      setProfile({
        ...updated,
        skills: updated.skills || [],
        projects: updated.projects || [],
        certifications: updated.certifications || []
      });
      if (updateUserData) {
        updateUserData({ name: updated.name, email: updated.email });
      }
      setMessage({
        type: 'success',
        text: 'Profile successfully updated! All personal, academic, and eligibility details are synchronized across both student and admin portals in real time.'
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleAddProject = () => {
    setProfile(prev => ({
      ...prev,
      projects: [...prev.projects, { title: '', description: '', technologies: '', link: '' }]
    }));
  };

  const handleUpdateProject = (index, field, value) => {
    const updated = [...profile.projects];
    updated[index][field] = value;
    setProfile(prev => ({ ...prev, projects: updated }));
  };

  const handleRemoveProject = (index) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveCert = (index) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <Loader message="Loading profile information..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header & Completion Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#321A2E' }}>Student Placement Profile</h1>
          <p style={{ color: '#746B6D', fontSize: '0.88rem' }}>
            Keep your academic and personal profile updated. All changes are synchronized in real time with the Administrator portal.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: '#FFFFFF', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #E8DAD4', fontSize: '0.82rem', color: '#746B6D' }}>
            Profile Strength: <strong style={{ color: profile.profileCompletionPercentage >= 80 ? '#2E7D56' : '#D4A24C' }}>{profile.profileCompletionPercentage}%</strong>
          </div>

          <Button variant="primary" icon={Save} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>

      <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.45rem', borderBottom: '1px solid #E8DAD4', paddingBottom: '0.45rem', flexWrap: 'wrap' }}>
        {[
          { id: 'academic', label: 'Academic & Personal', icon: GraduationCap },
          { id: 'skills', label: 'Technical Skills', icon: Code2 },
          { id: 'projects', label: 'Projects & Experience', icon: FolderGit2 },
          { id: 'certifications', label: 'Certifications', icon: Award },
          { id: 'links', label: 'Links & Resume', icon: LinkIcon }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.1rem',
                border: 'none',
                background: isActive ? '#C65D3A' : 'transparent',
                color: isActive ? '#FFFFFF' : '#746B6D',
                fontWeight: isActive ? 750 : 600,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.86rem',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              {tab.label}
              {tab.id === 'certifications' && profile.certifications?.length > 0 && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#FBE9DF',
                  color: isActive ? '#FFFFFF' : '#C65D3A',
                  fontSize: '0.7rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '9999px',
                  fontWeight: 800
                }}>
                  {profile.certifications.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Cards */}
      <Card style={{ padding: '1.75rem', background: '#FFFFFF', border: '1px solid #E8DAD4', borderRadius: '12px' }}>
        {activeTab === 'academic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#321A2E', fontWeight: 800 }}>Academic & Personal Details</h3>

            <div className="grid grid-cols-2">
              <Input
                label="Full Student Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Devanaboyina Madhu"
              />
              <Input
                label="Registered College Email"
                value={profile.email}
                disabled
                placeholder="23BQ1A1228@vvit.net"
              />
            </div>

            <div className="grid grid-cols-3">
              <Input
                label="Roll Number / Registration No."
                value={profile.rollNumber}
                onChange={(e) => setProfile({ ...profile, rollNumber: e.target.value })}
                placeholder="23BQ1A1228"
              />
              <Select
                label="Department / Engineering Branch"
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
              />
              <Input
                label="Section"
                value={profile.section}
                onChange={(e) => setProfile({ ...profile, section: e.target.value })}
                placeholder="A"
              />
            </div>

            <div className="grid grid-cols-4">
              <Input
                label="Current Year of Study"
                type="number"
                value={profile.year}
                onChange={(e) => setProfile({ ...profile, year: parseInt(e.target.value) || 1 })}
              />
              <Input
                label="Semester"
                type="number"
                value={profile.semester}
                onChange={(e) => setProfile({ ...profile, semester: parseInt(e.target.value) || 1 })}
              />
              <Input
                label="Cumulative CGPA"
                type="number"
                step="0.01"
                value={profile.cgpa}
                onChange={(e) => setProfile({ ...profile, cgpa: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Active Backlogs Count"
                type="number"
                value={profile.backlogs}
                onChange={(e) => setProfile({ ...profile, backlogs: parseInt(e.target.value) || 0 })}
              />
            </div>

            <Input
              label="Primary Contact Phone Number"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <Button variant="primary" icon={Save} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Academic Details'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: '#321A2E', fontWeight: 800 }}>Technical Skills & Core Proficiencies</h3>
              <p style={{ color: '#746B6D', fontSize: '0.82rem' }}>Add technical skills to match candidate eligibility filters for placement drives</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="e.g. Java, Python, Spring Boot, React, MongoDB, SQL, DSA"
                />
              </div>
              <Button variant="primary" icon={Plus} onClick={handleAddSkill}>Add Skill</Button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: '#FFF8F1', border: '1px solid #E8DAD4', borderRadius: '10px', padding: '1rem', minHeight: '80px', alignItems: 'center' }}>
              {profile.skills.length === 0 ? (
                <span style={{ color: '#746B6D', fontSize: '0.82rem' }}>No skills added yet. Type a skill and click "Add Skill".</span>
              ) : (
                profile.skills.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#FFFFFF',
                      border: '1px solid #E8DAD4',
                      color: '#C65D3A',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 650
                    }}
                  >
                    {s}
                    <button
                      onClick={() => handleRemoveSkill(s)}
                      style={{ background: 'none', border: 'none', color: '#746B6D', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                    >
                      &times;
                    </button>
                  </span>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <Button variant="primary" icon={Save} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Skills'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#321A2E', fontWeight: 800 }}>Projects & Practical Experience</h3>
                <p style={{ color: '#746B6D', fontSize: '0.82rem' }}>Showcase software engineering, capstone, and internship projects</p>
              </div>
              <Button variant="outline" icon={Plus} onClick={handleAddProject}>Add Project</Button>
            </div>

            {profile.projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#746B6D', fontSize: '0.85rem' }}>
                No projects listed. Click "Add Project" to add your work.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {profile.projects.map((proj, i) => (
                  <div key={i} style={{ background: '#FDF4EC', border: '1px solid #E8DAD4', borderRadius: '10px', padding: '1rem', position: 'relative' }}>
                    <button
                      onClick={() => handleRemoveProject(i)}
                      style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', color: '#BF3B3B', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="grid grid-cols-2" style={{ marginBottom: '0.75rem' }}>
                      <Input
                        label="Project Title"
                        value={proj.title}
                        onChange={(e) => handleUpdateProject(i, 'title', e.target.value)}
                        placeholder="e.g. Smart Placement Portal with AI"
                      />
                      <Input
                        label="Technologies Used"
                        value={proj.technologies}
                        onChange={(e) => handleUpdateProject(i, 'technologies', e.target.value)}
                        placeholder="e.g. React, Spring Boot, MongoDB, Python"
                      />
                    </div>

                    <Textarea
                      label="Description & Key Contributions"
                      value={proj.description}
                      onChange={(e) => handleUpdateProject(i, 'description', e.target.value)}
                      placeholder="Describe architectural challenges solved and measurable results..."
                    />

                    <div style={{ marginTop: '0.75rem' }}>
                      <Input
                        label="Repository / Live Demo URL"
                        value={proj.link}
                        onChange={(e) => handleUpdateProject(i, 'link', e.target.value)}
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <Button variant="primary" icon={Save} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Projects'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'certifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header & Primary Action Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#321A2E', fontWeight: 850, margin: 0 }}>CERTIFICATIONS & CREDENTIALS</h3>
                <p style={{ color: '#746B6D', fontSize: '0.84rem', margin: '0.2rem 0 0' }}>
                  For every certificate, enter the certificate name, issuing authority, year, and upload the official document from your local device.
                </p>
              </div>

              <Button
                variant="primary"
                icon={Plus}
                onClick={handleOpenAddCert}
                style={{ fontSize: '0.84rem', padding: '0.5rem 1.05rem' }}
              >
                Add & Upload Certificate
              </Button>
            </div>

            {/* List of Verified Certification Cards */}
            {profile.certifications.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                background: '#FFF8F1',
                borderRadius: '12px',
                border: '1.5px dashed #E8DAD4'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#FBE9DF',
                  color: '#C65D3A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.85rem'
                }}>
                  <Award size={28} />
                </div>
                <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#321A2E', margin: '0 0 0.35rem' }}>
                  No Verified Certifications Yet
                </h4>
                <p style={{ color: '#746B6D', fontSize: '0.84rem', maxWidth: '460px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
                  Add your credentials from AWS, Oracle, Google Cloud, Cisco, Coursera, or NPTEL. For each certificate, enter the details and upload the file from your local device.
                </p>
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={handleOpenAddCert}
                >
                  Add Your First Certificate
                </Button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {profile.certifications.map((cert, i) => (
                  <div
                    key={cert.id || i}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E8DAD4',
                      borderRadius: '12px',
                      padding: '1.2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: '0 2px 8px rgba(50, 26, 46, 0.04)',
                      position: 'relative'
                    }}
                  >
                    {/* Header Row: Icon + Title + Verified Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          background: '#FBE9DF',
                          color: '#C65D3A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Award size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#292326', margin: 0, lineHeight: 1.3 }}>
                            {cert.certificateTitle || cert.name || 'Technical Certification'}
                          </h4>
                          <span style={{ fontSize: '0.78rem', color: '#746B6D', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                            <Building size={12} /> {cert.issuer || 'Issuing Authority'}
                          </span>
                        </div>
                      </div>

                      {/* Verified Badge */}
                      <span style={{
                        background: '#F0F8F3',
                        color: '#2E7D56',
                        border: '1px solid #C8E6D3',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        flexShrink: 0
                      }}>
                        <Check size={11} strokeWidth={3} /> Verified
                      </span>
                    </div>

                    {/* Metadata Details: Issued By + Year + Attached File */}
                    <div style={{
                      background: '#FFF8F1',
                      border: '1px solid #E8DAD4',
                      borderRadius: '8px',
                      padding: '0.55rem 0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      fontSize: '0.76rem',
                      color: '#746B6D'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={12} /> Issued: <strong>{cert.issueDate || '2026'}</strong>
                        </span>
                        {cert.fileType && (
                          <span style={{ background: '#FBE9DF', color: '#C65D3A', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.68rem' }}>
                            {cert.fileType}
                          </span>
                        )}
                      </div>

                      {cert.fileName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#321A2E', fontSize: '0.74rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <FileText size={12} color="#C65D3A" />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{cert.fileName}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: View Preview & Delete */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.35rem' }}>
                      {(cert.fileUrl || cert.credentialUrl) ? (
                        <button
                          type="button"
                          onClick={() => handleOpenCertificatePreview(cert)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: '#FFF8F1',
                            border: '1px solid #E8DAD4',
                            color: '#C65D3A',
                            fontSize: '0.78rem',
                            fontWeight: 750,
                            borderRadius: '6px',
                            padding: '0.35rem 0.65rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Eye size={14} /> View Certificate
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: '#746B6D' }}>Institutional Record</span>
                      )}

                      <button
                        onClick={() => handleDeleteVerifiedCert(cert.id, i)}
                        style={{
                          background: '#FDF2F2',
                          border: '1px solid #F5CCCC',
                          color: '#BF3B3B',
                          borderRadius: '6px',
                          padding: '0.35rem 0.55rem',
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontWeight: 650
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <Button variant="primary" icon={Save} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#321A2E', fontWeight: 800 }}>Resume & Professional Links</h3>

            {/* Local File Explorer Resume Upload Zone */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 650, color: '#292326' }}>
                Active Resume / CV Document (Upload from Device)
              </label>

              <input
                type="file"
                ref={profileFileInputRef}
                accept=".pdf,.doc,.docx"
                onChange={handleProfileResumeUpload}
                style={{ display: 'none' }}
              />

              <div
                onClick={() => profileFileInputRef.current?.click()}
                style={{
                  border: profile.resumeUrl ? '1.5px solid #C8E6D3' : '1.5px dashed #E8DAD4',
                  borderRadius: '10px',
                  background: profile.resumeUrl ? '#F0F8F3' : '#FDF4EC',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  flexWrap: 'wrap',
                  gap: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: profile.resumeUrl ? '#D9EFE2' : '#FBE9DF',
                    color: profile.resumeUrl ? '#2E7D56' : '#C65D3A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {profile.resumeUrl ? <FileText size={20} /> : <UploadCloud size={20} />}
                  </div>

                  <div>
                    {uploadingResume ? (
                      <div>
                        <div style={{ fontWeight: 700, color: '#C65D3A', fontSize: '0.88rem' }}>Uploading resume from local storage...</div>
                        <div style={{ fontSize: '0.75rem', color: '#746B6D' }}>Saving to your profile directory</div>
                      </div>
                    ) : profile.resumeUrl ? (
                      <div>
                        <div style={{ fontWeight: 800, color: '#292326', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>{profile.resumeUrl.split('/').pop()}</span>
                          <span style={{ background: '#D9EFE2', color: '#2E7D56', fontSize: '0.68rem', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontWeight: 800 }}>
                            ✓ Active Profile Resume
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#746B6D', marginTop: '0.1rem' }}>
                          File Path: {profile.resumeUrl}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontWeight: 700, color: '#292326', fontSize: '0.88rem' }}>
                          Click to upload your resume from local device
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#746B6D' }}>
                          PDF, DOC, DOCX (Max 10MB)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant={profile.resumeUrl ? 'outline' : 'primary'}
                  icon={UploadCloud}
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
                >
                  {profile.resumeUrl ? 'Replace Resume' : 'Browse File'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2">
              <Input
                label="Direct Resume Web Link (Optional)"
                value={profile.resumeUrl}
                onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
                placeholder="https://drive.google.com/... or /uploads/..."
              />
              <Input
                label="LinkedIn Profile URL"
                value={profile.linkedinUrl}
                onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <Input
              label="GitHub Portfolio URL"
              value={profile.githubUrl}
              onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
              placeholder="https://github.com/username"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <Button variant="primary" icon={Save} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Links & Resume'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal: Add & Upload Verified Certificate from Local Device */}
      <Modal
        isOpen={showAddCertModal}
        onClose={() => !uploadingCert && setShowAddCertModal(false)}
        title="Add & Upload Certificate"
        maxWidth="580px"
      >
        <form onSubmit={handleSubmitCertificateForm} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div style={{
            background: '#FFF8F1',
            border: '1px solid #E8DAD4',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            fontSize: '0.82rem',
            color: '#746B6D',
            lineHeight: 1.45
          }}>
            Enter your certificate title, issuing organization, year of issuance, and upload the official document from your local device.
          </div>

          <Input
            label="Certificate Name / Title *"
            value={certForm.name}
            onChange={(e) => setCertForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. AWS Certified Solutions Architect, Oracle Java SE Developer"
            required
          />

          <div className="grid grid-cols-2">
            <Input
              label="Issued By (Organization) *"
              value={certForm.issuer}
              onChange={(e) => setCertForm(prev => ({ ...prev, issuer: e.target.value }))}
              placeholder="e.g. Amazon Web Services, Oracle, Google"
              required
            />

            <Input
              label="Year / Date of Issuance *"
              value={certForm.year}
              onChange={(e) => setCertForm(prev => ({ ...prev, year: e.target.value }))}
              placeholder="e.g. 2025 or Aug 2025"
              required
            />
          </div>

          <Input
            label="Credential URL / ID (Optional)"
            value={certForm.credentialUrl}
            onChange={(e) => setCertForm(prev => ({ ...prev, credentialUrl: e.target.value }))}
            placeholder="https://www.credly.com/badges/... or Cert-ID-98124"
          />

          {/* Local Device File Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#321A2E', marginBottom: '0.4rem' }}>
              Upload Certificate File (From Local Device) *
            </label>

            <input
              type="file"
              ref={certFileInputRef}
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleCertFileSelected}
              style={{ display: 'none' }}
            />

            {!certForm.file ? (
              <div
                onClick={() => certFileInputRef.current?.click()}
                style={{
                  border: '2px dashed #D4A24C',
                  background: '#FFF8F1',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <UploadCloud size={32} color="#C65D3A" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 750, color: '#321A2E', fontSize: '0.9rem' }}>
                  Click to Browse & Upload File from Local Device
                </div>
                <div style={{ fontSize: '0.78rem', color: '#746B6D', marginTop: '0.25rem' }}>
                  Supports PDF, JPG, JPEG, or PNG (Max 10 MB)
                </div>
              </div>
            ) : (
              <div style={{
                background: '#FDF4EC',
                border: '1.5px solid #C65D3A',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <FileText size={24} color="#C65D3A" />
                  <div>
                    <div style={{ fontWeight: 750, color: '#321A2E', fontSize: '0.86rem', wordBreak: 'break-all' }}>
                      {certForm.file.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#746B6D' }}>
                      {(certForm.file.size / (1024 * 1024)).toFixed(2)} MB • {certForm.file.name.split('.').pop().toUpperCase()}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCertForm(prev => ({ ...prev, file: null }))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#BF3B3B',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <Trash2 size={14} /> Change
                </button>
              </div>
            )}

            {certFileError && (
              <div style={{ color: '#BF3B3B', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 600 }}>
                {certFileError}
              </div>
            )}
          </div>

          {/* Verification in progress message */}
          {uploadingCert && (
            <div style={{
              background: '#FEF9ED',
              border: '1.5px solid #F3E3B6',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
              <div style={{ fontSize: '0.82rem', color: '#321A2E', fontWeight: 700 }}>
                {certValidationMsg || 'Validating document with AI pipeline...'}
              </div>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddCertModal(false)}
              disabled={uploadingCert}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={ShieldCheck}
              disabled={uploadingCert || !certForm.name.trim() || !certForm.issuer.trim() || !certForm.year.trim() || !certForm.file}
            >
              {uploadingCert ? 'Verifying...' : 'Verify & Add Certificate'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Interactive Certificate Viewer / Previewer */}
      <Modal
        isOpen={showPreviewModal && !!previewCert}
        onClose={() => setShowPreviewModal(false)}
        title={previewCert ? (previewCert.certificateTitle || previewCert.name || 'Certificate Preview') : 'Certificate Preview'}
        maxWidth="850px"
      >
        {previewCert && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header Details & Quick Action Links */}
            <div style={{
              background: '#FFF8F1',
              border: '1px solid #E8DAD4',
              borderRadius: '10px',
              padding: '0.85rem 1.1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.65rem'
            }}>
              <div>
                <div style={{ fontWeight: 800, color: '#321A2E', fontSize: '0.98rem' }}>
                  {previewCert.certificateTitle || previewCert.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#746B6D', display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                  <span><strong>Issued By:</strong> {previewCert.issuer || 'Institutional Authority'}</span>
                  <span>•</span>
                  <span><strong>Year:</strong> {previewCert.issueDate || '2026'}</span>
                  {previewCert.fileType && (
                    <>
                      <span>•</span>
                      <span style={{ background: '#FBE9DF', color: '#C65D3A', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 750, fontSize: '0.7rem' }}>
                        {previewCert.fileType}
                      </span>
                    </>
                  )}
                  {previewCert.verificationStatus && (
                    <>
                      <span>•</span>
                      <span style={{ background: '#F0F8F3', color: '#2E7D56', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.7rem' }}>
                        ✓ {previewCert.verificationStatus}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <a
                  href={getCertificateFileUrl(previewCert)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E8DAD4',
                    color: '#321A2E',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={13} /> Open in New Tab
                </a>

                <a
                  href={getCertificateFileUrl(previewCert)}
                  download={previewCert.fileName || 'certificate'}
                  style={{
                    background: '#C65D3A',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    textDecoration: 'none'
                  }}
                >
                  <Download size={13} /> Download
                </a>
              </div>
            </div>

            {/* Embedded Document Viewer Area */}
            <div style={{
              background: '#F7F5F4',
              border: '1px solid #E8DAD4',
              borderRadius: '10px',
              overflow: 'hidden',
              minHeight: '480px',
              maxHeight: '75vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {getCertificateFileUrl(previewCert) ? (
                (previewCert.fileType === 'PNG' || previewCert.fileType === 'JPG' || previewCert.fileType === 'JPEG' || (previewCert.fileName && /\.(png|jpg|jpeg|webp)$/i.test(previewCert.fileName))) ? (
                  <img
                    src={getCertificateFileUrl(previewCert)}
                    alt="Certificate Document"
                    style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: '6px' }}
                  />
                ) : (
                  <iframe
                    src={getCertificateFileUrl(previewCert)}
                    title="Certificate Viewer"
                    style={{ width: '100%', height: '70vh', border: 'none' }}
                  />
                )
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#746B6D' }}>
                  <Award size={40} color="#C65D3A" style={{ margin: '0 auto 0.65rem' }} />
                  <div style={{ fontWeight: 750, fontSize: '0.92rem', color: '#321A2E' }}>No document file attached</div>
                  <div style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>This certificate was created as an institutional or manual record.</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
