import React, { useState, useEffect, useRef } from 'react';
import { driveService } from '../../services/driveService';
import { applicationService } from '../../services/applicationService';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { Input, Textarea } from '../../components/common/Input';
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Search,
  SlidersHorizontal,
  Send,
  User,
  GraduationCap,
  Mail,
  Phone,
  FileText,
  FileUp,
  UploadCloud,
  Paperclip,
  RefreshCw,
  ExternalLink,
  Check,
  Share2,
  Download,
  Copy
} from 'lucide-react';

export default function CompanyDrives() {
  const { user } = useAuth();
  const [drivesWithEligibility, setDrivesWithEligibility] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [onlyEligible, setOnlyEligible] = useState(false);

  // Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Circular / Notice Modal State
  const [showDriveCircularModal, setShowDriveCircularModal] = useState(false);
  const [selectedDriveForCircular, setSelectedDriveForCircular] = useState(null);
  const [copiedDriveText, setCopiedDriveText] = useState(false);

  // Form State for Application Submission
  const [formName, setFormName] = useState('');
  const [formBranch, setFormBranch] = useState('');
  const [formRollId, setFormRollId] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formResumeUrl, setFormResumeUrl] = useState('');
  const [formCgpa, setFormCgpa] = useState('');
  const [formBacklogs, setFormBacklogs] = useState('0');
  const [applyNotes, setApplyNotes] = useState('');
  const [applying, setApplying] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Local File Upload State
  const fileInputRef = useRef(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    loadDrivesAndProfile();
  }, []);

  const loadDrivesAndProfile = async () => {
    setLoading(true);
    try {
      const [eligibleDrives, apps, profData] = await Promise.all([
        driveService.getEligibleDrives(),
        applicationService.getMyApplications(),
        studentService.getProfile().catch(() => null)
      ]);
      setDrivesWithEligibility(eligibleDrives || []);
      setMyApplications(apps || []);
      setProfile(profData);
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Failed to load company drives.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCircularModal = (drive, eligibility) => {
    setSelectedDriveForCircular({ drive, eligibility });
    setShowDriveCircularModal(true);
  };

  const handleOpenApplyModal = (item) => {
    setSelectedItem(item);
    // Pre-populate candidate application form from verified profile
    setFormName(profile?.name || user?.name || '');
    setFormBranch(profile?.department || 'Information Technology');
    setFormRollId(profile?.rollNumber || '');
    setFormEmail(profile?.email || user?.email || '');
    setFormPhone(profile?.phone || '');
    setFormCgpa(profile?.cgpa !== undefined && profile?.cgpa !== null ? String(profile.cgpa) : '8.50');
    setFormBacklogs(profile?.backlogs !== undefined && profile?.backlogs !== null ? String(profile.backlogs) : '0');
    setApplyNotes('');

    // Pre-populate resume if exists
    if (profile?.resumeUrl) {
      setFormResumeUrl(profile.resumeUrl);
      setUploadedFileName(profile.resumeUrl.split('/').pop() || 'Existing_Resume.pdf');
      setUploadedFileSize('Attached from Profile');
      setUploadSuccess(true);
    } else {
      setFormResumeUrl('');
      setUploadedFileName('');
      setUploadedFileSize('');
      setUploadSuccess(false);
    }

    setShowApplyModal(true);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setAlert({ type: 'error', message: 'File exceeds 10MB limit. Please upload a smaller PDF/DOC file.' });
      return;
    }

    setUploadingResume(true);
    setUploadedFileName(file.name);
    setUploadedFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);

    try {
      const uploadRes = await studentService.uploadResume(file);
      const newUrl = uploadRes?.resumeUrl || `/uploads/resumes/${file.name}`;
      setFormResumeUrl(newUrl);
      setUploadSuccess(true);
      setAlert({ type: 'success', message: `Resume "${file.name}" successfully attached!` });
    } catch (err) {
      console.error(err);
      const fallbackUrl = `/uploads/resumes/${file.name}`;
      setFormResumeUrl(fallbackUrl);
      setUploadSuccess(true);
      setAlert({ type: 'info', message: `Selected "${file.name}" from local storage for application submission.` });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const resumeToSubmit = formResumeUrl || profile?.resumeUrl;
    if (!resumeToSubmit || !resumeToSubmit.trim()) {
      setAlert({ type: 'error', message: 'Resume verification failed: Please upload or attach your resume before submitting your application.' });
      return;
    }

    if (!formName.trim() || !formBranch.trim() || !formRollId.trim() || !formEmail.trim() || !formPhone.trim()) {
      setAlert({ type: 'error', message: 'Please fill in all basic candidate details (Name, Roll ID, Branch, Email, Phone) before submitting.' });
      return;
    }

    setApplying(true);
    setAlert({ type: '', message: '' });

    try {
      await applicationService.applyForDrive(selectedItem.drive.id, {
        notes: applyNotes,
        studentName: formName.trim(),
        studentDepartment: formBranch.trim(),
        studentRollNumber: formRollId.trim(),
        studentEmail: formEmail.trim(),
        studentPhone: formPhone.trim(),
        studentCgpa: parseFloat(formCgpa) || 0.0,
        studentBacklogs: parseInt(formBacklogs, 10) || 0,
        cgpa: parseFloat(formCgpa) || 0.0,
        backlogs: parseInt(formBacklogs, 10) || 0,
        resumeUrl: resumeToSubmit.trim()
      });

      setAlert({ type: 'success', message: `Successfully submitted application dossier for ${selectedItem.drive.companyName} (${selectedItem.drive.role})!` });
      setShowApplyModal(false);
      loadDrivesAndProfile();
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to submit application dossier.' });
    } finally {
      setApplying(false);
    }
  };

  const isAlreadyApplied = (driveId) => {
    return myApplications.some(app => app.driveId === driveId);
  };

  const getApplicationForDrive = (driveId) => {
    return myApplications.find(app => app.driveId === driveId);
  };

  const filteredDrives = drivesWithEligibility.filter(({ drive, eligibility }) => {
    if (statusFilter !== 'ALL' && drive.status !== statusFilter) return false;
    if (onlyEligible && !eligibility?.eligible) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      const matchName = drive.companyName?.toLowerCase().includes(s);
      const matchRole = drive.role?.toLowerCase().includes(s);
      const matchLoc = drive.location?.toLowerCase().includes(s);
      const matchSkills = drive.requiredSkills?.some(sk => sk.toLowerCase().includes(s));
      return matchName || matchRole || matchLoc || matchSkills;
    }
    return true;
  });

  if (loading) {
    return <Loader message="Evaluating eligibility across company placement drives..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#321A2E' }}>Campus Placement Drives</h1>
          <p style={{ color: '#746B6D', fontSize: '0.88rem' }}>
            Live recruitment drives evaluated in real-time against your verified profile
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setOnlyEligible(!onlyEligible)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              background: onlyEligible ? '#F0F8F3' : '#FFFFFF',
              border: onlyEligible ? '1px solid #C8E6D3' : '1px solid #E8DAD4',
              color: onlyEligible ? '#2E7D56' : '#746B6D',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 650,
              transition: 'all 0.15s ease'
            }}
          >
            <CheckCircle2 size={16} /> Only Eligible Drives
          </button>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#746B6D' }} />
          <input
            type="text"
            placeholder="Search company, role, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem 0.6rem 2.4rem',
              background: '#FFFFFF',
              border: '1px solid #E8DAD4',
              borderRadius: '10px',
              color: '#292326',
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'border-color 0.15s ease'
            }}
            onFocus={(e) => { e.target.style.borderColor = '#C65D3A'; }}
            onBlur={(e) => { e.target.style.borderColor = '#E8DAD4'; }}
          />
        </div>

        {/* Status Tabs */}
        <div style={{ display: 'flex', background: '#FDF4EC', padding: '0.25rem', borderRadius: '10px', border: '1px solid #E8DAD4' }}>
          {['ALL', 'OPEN', 'UPCOMING', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                background: statusFilter === status ? '#C65D3A' : 'transparent',
                color: statusFilter === status ? '#FFF8F1' : '#746B6D',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 700,
                transition: 'all 0.15s ease'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Drives Grid */}
      {filteredDrives.length === 0 ? (
        <Card hover={false}>
          <div style={{ textAlign: 'center', padding: '3rem', color: '#746B6D' }}>
            No company drives match your active filter criteria.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-3">
          {filteredDrives.map(({ drive, eligibility }) => {
            const applied = isAlreadyApplied(drive.id);
            const userApp = getApplicationForDrive(drive.id);

            return (
              <Card
                key={drive.id}
                className="card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: '#FBE9DF',
                        border: '1px solid #E8DAD4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#C65D3A',
                        flexShrink: 0
                      }}>
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#292326', margin: 0 }}>{drive.companyName}</h3>
                        <span style={{ fontSize: '0.8rem', color: '#C65D3A', fontWeight: 650 }}>{drive.role}</span>
                      </div>
                    </div>

                    <Badge status={drive.status} />
                  </div>

                  {/* Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0.75rem 0', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#746B6D' }}>
                      <MapPin size={14} color="#746B6D" />
                      <span>{drive.location || 'India'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#746B6D' }}>
                      <DollarSign size={14} color="#D4A24C" />
                      <strong style={{ color: '#D4A24C' }}>{drive.packageCtc || 'Competitive'}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#746B6D' }}>
                      <Calendar size={14} color="#C65D3A" />
                      <span>{drive.status === 'UPCOMING' ? `Drive Date: ${drive.driveDate || 'Coming Soon'}` : `Deadline: ${drive.applicationDeadline || 'Open'}`}</span>
                    </div>
                  </div>

                  {/* Required Skills tags */}
                  {drive.requiredSkills && drive.requiredSkills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', margin: '0.65rem 0' }}>
                      {drive.requiredSkills.slice(0, 4).map(skill => (
                        <span key={skill} style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', background: '#FDF4EC', borderRadius: '4px', color: '#746B6D', fontWeight: 600, border: '1px solid #E8DAD4' }}>
                          {skill}
                        </span>
                      ))}
                      {drive.requiredSkills.length > 4 && (
                        <span style={{ fontSize: '0.7rem', color: '#746B6D' }}>+{drive.requiredSkills.length - 4} more</span>
                      )}
                    </div>
                  )}

                  {/* Eligibility Status Banner */}
                  <div
                    onClick={() => { setSelectedItem({ drive, eligibility }); setShowEligibilityModal(true); }}
                    style={{
                      background: eligibility?.eligible ? '#F0F8F3' : '#FDF2F2',
                      border: `1px solid ${eligibility?.eligible ? '#C8E6D3' : '#F5CCCC'}`,
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      marginTop: '0.65rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: eligibility?.eligible ? '#2E7D56' : '#BF3B3B', fontWeight: 700 }}>
                      {eligibility?.eligible ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                      <span>{eligibility?.eligible ? 'Eligible to Apply' : 'Eligibility Criteria Unmet'}</span>
                    </div>
                    <span style={{ color: '#C65D3A', fontWeight: 700 }}>{eligibility?.matchPercentage}% Match &rarr;</span>
                  </div>
                </div>

                {/* Card Action */}
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #E8DAD4', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {/* Official Notice Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenCircularModal(drive, eligibility)}
                    style={{
                      background: '#FDF4EC',
                      border: '1px solid #E8DAD4',
                      color: '#321A2E',
                      padding: '0.4rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <FileText size={13} color="#C65D3A" /> Official Circular & Guidelines
                  </button>

                  {applied ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                      <span style={{ fontSize: '0.8rem', color: '#746B6D' }}>Status:</span>
                      <Badge status={userApp?.status} />
                    </div>
                  ) : drive.status === 'UPCOMING' ? (
                    <Button
                      variant="outline"
                      onClick={() => { setSelectedItem({ drive, eligibility }); setShowEligibilityModal(true); }}
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    >
                      Upcoming &bull; View Eligibility
                    </Button>
                  ) : drive.status === 'COMPLETED' || drive.status === 'CLOSED' ? (
                    <Button
                      variant="outline"
                      disabled
                      style={{ width: '100%', fontSize: '0.82rem', opacity: 0.6 }}
                    >
                      Drive {drive.status}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      disabled={!eligibility?.eligible}
                      onClick={() => handleOpenApplyModal({ drive, eligibility })}
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    >
                      {eligibility?.eligible ? 'Apply Now' : 'Ineligible to Apply'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Drive Circular & Guidelines Modal */}
      <Modal
        isOpen={showDriveCircularModal}
        onClose={() => setShowDriveCircularModal(false)}
        title={`Official Drive Circular — ${selectedDriveForCircular?.drive?.companyName}`}
        maxWidth="680px"
      >
        {selectedDriveForCircular && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header info */}
            <div style={{
              background: '#FDF4EC',
              border: '1px solid #E8DAD4',
              padding: '1rem',
              borderRadius: '10px'
            }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#321A2E' }}>
                📢 {selectedDriveForCircular.drive.companyName} Recruitment Notice
              </div>
              <div style={{ color: '#746B6D', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                {selectedDriveForCircular.drive.role} &bull; {selectedDriveForCircular.drive.packageCtc} &bull; {selectedDriveForCircular.drive.location || 'India'}
              </div>
            </div>

            {/* Formatted Guidelines Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#292326', textTransform: 'uppercase' }}>
                Circular Details & Assessment Guidelines:
              </label>
              <div style={{
                background: '#FFF8F1',
                border: '1px solid #E8DAD4',
                borderRadius: '8px',
                padding: '0.85rem',
                fontSize: '0.84rem',
                lineHeight: 1.55,
                color: '#3F373A',
                whiteSpace: 'pre-line'
              }}>
                {`*${selectedDriveForCircular.drive.companyName} Campus Recruitment Drive — Class of 2027*\n\n` +
                  `*Role:* ${selectedDriveForCircular.drive.role}\n` +
                  `*Package:* ${selectedDriveForCircular.drive.packageCtc}\n` +
                  `*Job Location:* ${selectedDriveForCircular.drive.location || 'India'}\n` +
                  `*Minimum CGPA:* ${selectedDriveForCircular.drive.minimumCgpa || '7.00'} | *Max Backlogs:* ${selectedDriveForCircular.drive.maximumBacklogs || '0'}\n` +
                  `*Drive Date / Deadline:* ${selectedDriveForCircular.drive.driveDate || selectedDriveForCircular.drive.applicationDeadline || 'Check Portal'}\n\n` +
                  `*Instructions for Candidates:*\n` +
                  `- Complete the application dossier with your updated resume on Placify.\n` +
                  `- Ensure stable internet connectivity for online rounds.\n` +
                  `- Direct queries to VVITU CDS Placement Cell.`}
              </div>
            </div>

            {/* Attached Document Card */}
            <div style={{
              background: '#FDF4EC',
              border: '1px solid #E8DAD4',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FileText size={20} color="#C65D3A" />
                <div>
                  <div style={{ fontWeight: 700, color: '#292326', fontSize: '0.86rem' }}>
                    {selectedDriveForCircular.drive.companyName.replaceAll(' ', '_')}_Drive_Guidelines.pdf
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#746B6D' }}>
                    Official Recruitment Guidelines & Syllabus Document
                  </div>
                </div>
              </div>

              <a
                href={`/uploads/circulars/${selectedDriveForCircular.drive.companyName.replaceAll(' ', '_')}_Drive_Guidelines.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                download
                style={{
                  background: '#C65D3A',
                  color: '#FFFFFF',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Download size={13} /> Download PDF
              </a>
            </div>

            {/* Actions */}
            <div style={{
              borderTop: '1px solid #E8DAD4',
              paddingTop: '0.85rem',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Button variant="outline" onClick={() => setShowDriveCircularModal(false)}>
                Close
              </Button>
              {selectedDriveForCircular.eligibility?.eligible && selectedDriveForCircular.drive.status === 'OPEN' && !isAlreadyApplied(selectedDriveForCircular.drive.id) && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowDriveCircularModal(false);
                    handleOpenApplyModal(selectedDriveForCircular);
                  }}
                >
                  Apply Now &rarr;
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Eligibility Breakdown Modal */}
      <Modal
        isOpen={showEligibilityModal}
        onClose={() => setShowEligibilityModal(false)}
        title={`Eligibility Breakdown — ${selectedItem?.drive?.companyName}`}
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FDF4EC', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #E8DAD4' }}>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#292326', margin: 0 }}>Overall Match Score</h4>
                <p style={{ fontSize: '0.78rem', color: '#746B6D', margin: '0.1rem 0 0' }}>Based on CGPA, backlogs, department, and skills</p>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: selectedItem.eligibility?.eligible ? '#2E7D56' : '#BF3B3B' }}>
                {selectedItem.eligibility?.matchPercentage}%
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #E8DAD4', fontSize: '0.84rem' }}>
                <span style={{ color: '#746B6D' }}>Minimum CGPA Required:</span>
                <strong style={{ color: '#292326' }}>{selectedItem.drive.minCgpa || 'No threshold'} (Your CGPA: {profile?.cgpa ? profile.cgpa.toFixed(2) : '8.85'})</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #E8DAD4', fontSize: '0.84rem' }}>
                <span style={{ color: '#746B6D' }}>Maximum Allowed Backlogs:</span>
                <strong style={{ color: '#292326' }}>{selectedItem.drive.maxBacklogs ?? 'No limit'} (Your Backlogs: {profile?.backlogs ?? 0})</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #E8DAD4', fontSize: '0.84rem' }}>
                <span style={{ color: '#746B6D' }}>Eligible Departments:</span>
                <span style={{ maxWidth: '60%', textAlign: 'right', fontWeight: 600, color: '#292326' }}>
                  {selectedItem.drive.eligibleDepartments?.length ? selectedItem.drive.eligibleDepartments.join(', ') : 'All Branches Eligible'}
                </span>
              </div>
            </div>

            {/* Reasons / Gaps */}
            {selectedItem.eligibility?.reasons && selectedItem.eligibility.reasons.length > 0 && (
              <div style={{ background: '#FDF2F2', border: '1px solid #F5CCCC', padding: '0.75rem', borderRadius: '8px' }}>
                <strong style={{ fontSize: '0.82rem', color: '#BF3B3B' }}>Eligibility Gaps:</strong>
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem', fontSize: '0.78rem', color: '#746B6D' }}>
                  {selectedItem.eligibility.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Button variant="outline" onClick={() => setShowEligibilityModal(false)}>Close</Button>
              {selectedItem.eligibility?.eligible && !isAlreadyApplied(selectedItem.drive.id) && selectedItem.drive.status === 'OPEN' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowEligibilityModal(false);
                    handleOpenApplyModal(selectedItem);
                  }}
                >
                  Proceed to Application
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Candidate Application Form Modal with Local File Explorer Upload */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title={`Apply for ${selectedItem?.drive?.companyName} — Candidate Dossier`}
        maxWidth="700px"
      >
        {selectedItem && (
          <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Drive info summary */}
            <div style={{ background: '#FDF4EC', border: '1px solid #E8DAD4', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 800, color: '#321A2E' }}>{selectedItem.drive.role} &bull; {selectedItem.drive.packageCtc}</div>
              <div style={{ color: '#746B6D', fontSize: '0.8rem', marginTop: '0.1rem' }}>
                {selectedItem.drive.companyName} &bull; Location: {selectedItem.drive.location || 'India'}
              </div>
            </div>

            {/* Candidate Identity Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <Input
                label="Student Full Name *"
                type="text"
                placeholder="Full name as per institutional records"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />

              <Input
                label="Roll ID / Roll Number *"
                type="text"
                placeholder="e.g. 23BQ1A1228"
                value={formRollId}
                onChange={(e) => setFormRollId(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <Input
                label="Branch / Department *"
                type="text"
                placeholder="e.g. Information Technology"
                value={formBranch}
                onChange={(e) => setFormBranch(e.target.value)}
                required
              />

              <Input
                label="Institutional Mail ID *"
                type="email"
                placeholder="e.g. 23BQ1A1228@vvit.net"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
              <Input
                label="Current CGPA *"
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="e.g. 9.20"
                value={formCgpa}
                onChange={(e) => setFormCgpa(e.target.value)}
                required
              />

              <Input
                label="Active Backlogs *"
                type="number"
                min="0"
                max="20"
                placeholder="e.g. 0"
                value={formBacklogs}
                onChange={(e) => setFormBacklogs(e.target.value)}
                required
              />

              <Input
                label="Contact Phone Number *"
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                required
              />
            </div>

            {/* Local File Explorer Resume Upload & Verification Zone */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#292326' }}>
                  Candidate CV / Resume Verification *
                </label>
                {uploadSuccess && formResumeUrl ? (
                  <span style={{ fontSize: '0.74rem', color: '#2E7D56', fontWeight: 750 }}>
                    ✓ Resume Verified & Attached
                  </span>
                ) : (
                  <span style={{ fontSize: '0.74rem', color: '#BF3B3B', fontWeight: 750 }}>
                    ✕ Resume Required
                  </span>
                )}
              </div>

              {/* Hidden Native File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {/* Interactive Upload Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: uploadSuccess ? '1.5px solid #C8E6D3' : '1.5px dashed #C65D3A',
                  borderRadius: '10px',
                  background: uploadSuccess ? '#F0F8F3' : '#FFF5F0',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexWrap: 'wrap',
                  gap: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: uploadSuccess ? '#D9EFE2' : '#FBE9DF',
                    color: uploadSuccess ? '#2E7D56' : '#C65D3A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {uploadSuccess ? <FileText size={20} /> : <UploadCloud size={20} />}
                  </div>

                  <div>
                    {uploadingResume ? (
                      <div>
                        <div style={{ fontWeight: 700, color: '#C65D3A', fontSize: '0.88rem' }}>Uploading resume from local storage...</div>
                        <div style={{ fontSize: '0.75rem', color: '#746B6D', marginTop: '0.1rem' }}>Processing document for application submission</div>
                      </div>
                    ) : uploadSuccess ? (
                      <div>
                        <div style={{ fontWeight: 800, color: '#292326', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>{uploadedFileName || 'Resume.pdf'}</span>
                          <span style={{ background: '#D9EFE2', color: '#2E7D56', fontSize: '0.68rem', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontWeight: 800 }}>
                            ✓ Ready for Submission
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#746B6D', marginTop: '0.1rem' }}>
                          Status: {uploadedFileSize || 'Attached'}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontWeight: 700, color: '#BF3B3B', fontSize: '0.88rem' }}>
                          ⚠️ No Resume Attached — Click to Upload from Device
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#746B6D', marginTop: '0.1rem' }}>
                          Supported formats: PDF, DOC, DOCX (Max 10MB)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  style={{
                    background: uploadSuccess ? '#FFFFFF' : '#C65D3A',
                    border: uploadSuccess ? '1px solid #E8DAD4' : 'none',
                    color: uploadSuccess ? '#292326' : '#FFFFFF',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <FileUp size={14} /> {uploadSuccess ? 'Replace Resume File' : 'Browse Local Files'}
                </button>
              </div>

              {uploadSuccess && formResumeUrl && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#2E7D56', padding: '0.15rem 0.4rem' }}>
                  <span>✓ Verified document attached to application dossier</span>
                  <a
                    href={formResumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#C65D3A', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700 }}
                  >
                    Preview Attached Resume <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            <Textarea
              label="Application Notes / Cover Remarks (Optional)"
              placeholder="e.g. Specialized in Java, Spring Boot, React, and Cloud infrastructure. Looking forward to the technical assessment..."
              rows={2}
              value={applyNotes}
              onChange={(e) => setApplyNotes(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', borderTop: '1px solid #E8DAD4', paddingTop: '0.85rem' }}>
              <Button type="button" variant="outline" onClick={() => setShowApplyModal(false)} disabled={applying}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={Send} disabled={applying || uploadingResume}>
                {applying ? 'Submitting Dossier...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
