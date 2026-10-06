import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { driveService } from '../../services/driveService';
import { driveManagementService } from '../../services/driveManagementService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import {
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  Filter,
  ArrowLeft,
  ChevronDown,
  Award,
  TrendingUp,
  BarChart3,
  FileSpreadsheet,
  Sparkles,
  GraduationCap,
  Info,
  Check,
  Building2,
  Layers,
  FileText,
  UserCheck,
  Clock
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

const EXPORT_OPTIONS = [
  { type: 'COMPLETE_REPORT', label: 'Complete Drive Report', desc: 'Full student candidate dataset with all eligibility & application records' },
  { type: 'ALL_ELIGIBLE', label: 'All Eligible Students', desc: 'Candidates meeting CGPA, department, backlog & year criteria' },
  { type: 'APPLIED', label: 'Applied Students Only', desc: 'Students who actively submitted applications for this drive' },
  { type: 'ELIGIBLE_NOT_APPLIED', label: 'Eligible but Not Applied', desc: 'Eligible candidates who did not submit an application' },
  { type: 'SELECTED', label: 'Selected Candidates', desc: 'Candidates with final offer letters / selected status' },
  { type: 'REJECTED', label: 'Rejected Candidates', desc: 'Candidates screened out or rejected' }
];

export default function DriveDetails() {
  const { driveId } = useParams();

  const [drive, setDrive] = useState(null);
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [eligibleFilter, setEligibleFilter] = useState('ALL');
  const [appliedFilter, setAppliedFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');

  // Export State
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(null);

  // Candidate Details Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  useEffect(() => {
    loadDriveAndAnalytics();
  }, [driveId]);

  useEffect(() => {
    loadStudents();
  }, [driveId, eligibleFilter, appliedFilter, statusFilter, branchFilter]);

  const loadDriveAndAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [driveData, analyticsData] = await Promise.all([
        driveService.getDriveById(driveId),
        driveManagementService.getDriveAnalytics(driveId)
      ]);
      setDrive(driveData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error(err);
      setError('Failed to load drive details and analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    setTableLoading(true);
    try {
      const params = {};
      if (eligibleFilter === 'ELIGIBLE') params.eligible = true;
      if (eligibleFilter === 'INELIGIBLE') params.eligible = false;
      if (appliedFilter === 'APPLIED') params.applied = true;
      if (appliedFilter === 'NOT_APPLIED') params.applied = false;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (branchFilter !== 'ALL') params.branch = branchFilter;
      if (search.trim()) params.search = search.trim();

      const data = await driveManagementService.getDriveStudents(driveId, params);
      setStudents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadStudents();
  };

  const handleExport = async (exportType, label) => {
    setExporting(true);
    setExportSuccess(null);
    setExportDropdownOpen(false);
    try {
      const companyName = drive?.companyName || 'Drive';
      const role = drive?.role || 'Position';
      const safeCompany = companyName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeRole = role.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fallbackName = `${safeCompany}_${safeRole}_${exportType}.xlsx`;

      const filename = await driveManagementService.downloadDriveExcel(driveId, exportType, fallbackName);
      setExportSuccess(`Successfully downloaded: ${filename}`);
      setTimeout(() => setExportSuccess(null), 5000);
    } catch (err) {
      console.error(err);
      alert('Failed to generate and download Excel spreadsheet. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SELECTED':
        return <Badge status="success" text="SELECTED" />;
      case 'REJECTED':
        return <Badge status="rejected" text="REJECTED" />;
      case 'INTERVIEW':
        return <Badge status="interview" text="INTERVIEW" />;
      case 'TEST':
        return <Badge status="review" text="ASSESSMENT / TEST" />;
      case 'UNDER_REVIEW':
        return <Badge status="review" text="UNDER REVIEW" />;
      case 'APPLIED':
        return <Badge status="applied" text="APPLIED" />;
      default:
        return <span style={{ color: '#746B6D', fontSize: '0.78rem' }}>NOT APPLIED</span>;
    }
  };

  if (loading) {
    return <Loader message="Loading Placement Drive Pipeline & Candidate Data..." />;
  }

  if (error || !drive) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Alert type="error" message={error || 'Placement Drive not found.'} />
        <Link to="/admin/drives" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginTop: '1rem', textDecoration: 'none', color: '#C65D3A', fontWeight: 650 }}>
          <ArrowLeft size={16} /> Back to Placement Drives
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Top Breadcrumb & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          to="/admin/drives"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: '#C65D3A',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 700
          }}
        >
          <ArrowLeft size={16} /> Back to Placement Drives
        </Link>

        {/* Prominent Excel Export Dropdown */}
        <div style={{ position: 'relative' }}>
          <Button
            variant="primary"
            icon={Download}
            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
            disabled={exporting}
            style={{
              padding: '0.55rem 1.15rem',
              fontWeight: 700,
              fontSize: '0.84rem'
            }}
          >
            {exporting ? 'Generating Excel File...' : '📥 Download Excel Report'}
            <ChevronDown size={14} style={{ marginLeft: '0.35rem' }} />
          </Button>

          {exportDropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '110%',
              width: '330px',
              background: '#FFFFFF',
              border: '1px solid #E8DAD4',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(50, 26, 46, 0.12)',
              zIndex: 100,
              padding: '0.45rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem'
            }}>
              <div style={{ padding: '0.45rem 0.65rem', fontSize: '0.72rem', fontWeight: 800, color: '#746B6D', textTransform: 'uppercase', borderBottom: '1px solid #E8DAD4' }}>
                Select Export Dataset
              </div>
              {EXPORT_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => handleExport(opt.type, opt.label)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '0.1rem',
                    padding: '0.55rem 0.65rem',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FDF4EC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#C65D3A' }}>
                    📊 {opt.label}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#746B6D' }}>
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {exportSuccess && (
        <Alert type="success" message={exportSuccess} onClose={() => setExportSuccess(null)} />
      )}

      {/* 1. Drive Overview Banner Card */}
      <Card style={{
        background: '#FFFFFF',
        border: '1px solid #E8DAD4',
        padding: '1.5rem',
        borderRadius: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#321A2E', margin: 0 }}>
                {drive.companyName}
              </h1>
              <Badge status={drive.status} />
            </div>
            <p style={{ fontSize: '1.05rem', color: '#C65D3A', fontWeight: 700, marginTop: '0.2rem', margin: 0 }}>
              {drive.role}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.86rem', color: '#746B6D' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <DollarSign size={15} color="#D4A24C" />
              <strong style={{ color: '#D4A24C' }}>{drive.packageCtc || 'Competitive CTC'}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={15} color="#746B6D" />
              <span>{drive.location || 'Pan India / Flexible'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={15} color="#C65D3A" />
              <span>Drive Date: <strong style={{ color: '#292326' }}>{drive.driveDate || 'TBD'}</strong></span>
            </div>
          </div>
        </div>

        {/* Eligibility Criteria Tags */}
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #E8DAD4',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.65rem',
          alignItems: 'center',
          fontSize: '0.8rem'
        }}>
          <span style={{ color: '#746B6D', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem' }}>
            Eligibility Rules:
          </span>
          <span style={{ background: '#FDF4EC', padding: '0.25rem 0.55rem', borderRadius: '4px', border: '1px solid #E8DAD4', color: '#3F373A' }}>
            Min CGPA: <strong>{drive.minimumCgpa || 0.0}</strong>
          </span>
          <span style={{ background: '#FDF4EC', padding: '0.25rem 0.55rem', borderRadius: '4px', border: '1px solid #E8DAD4', color: '#3F373A' }}>
            Max Backlogs: <strong>{drive.maximumBacklogs || 0}</strong>
          </span>
          <span style={{ background: '#FDF4EC', padding: '0.25rem 0.55rem', borderRadius: '4px', border: '1px solid #E8DAD4', color: '#3F373A' }}>
            Allowed Branches: <strong>{drive.eligibleDepartments?.length === DEPARTMENTS.length ? 'All Branches' : `${drive.eligibleDepartments?.length} Departments`}</strong>
          </span>
          {drive.requiredSkills && drive.requiredSkills.length > 0 && (
            <span style={{ background: '#FDF4EC', color: '#C65D3A', padding: '0.25rem 0.55rem', borderRadius: '4px', border: '1px solid #E8DAD4' }}>
              Skills: <strong>{drive.requiredSkills.join(', ')}</strong>
            </span>
          )}
        </div>
      </Card>

      {/* 2. Drive Summary Cards (KPI Metrics) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <Card style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '4px solid #C65D3A' }}>
          <span style={{ fontSize: '0.74rem', color: '#746B6D', fontWeight: 800, textTransform: 'uppercase' }}>
            Total Eligible
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#292326' }}>
            {analytics?.totalEligible ?? 0}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#746B6D' }}>
            Candidates matching all criteria
          </span>
        </Card>

        <Card style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '4px solid #E9826E' }}>
          <span style={{ fontSize: '0.74rem', color: '#746B6D', fontWeight: 800, textTransform: 'uppercase' }}>
            Total Applied
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#C65D3A' }}>
            {analytics?.totalApplied ?? 0}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#746B6D' }}>
            Applications received
          </span>
        </Card>

        <Card style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '4px solid #D4A24C' }}>
          <span style={{ fontSize: '0.74rem', color: '#746B6D', fontWeight: 800, textTransform: 'uppercase' }}>
            Eligible Not Applied
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#D4A24C' }}>
            {analytics?.eligibleNotApplied ?? 0}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#746B6D' }}>
            Eligible students to follow up
          </span>
        </Card>

        <Card style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '4px solid #2E7D56' }}>
          <span style={{ fontSize: '0.74rem', color: '#746B6D', fontWeight: 800, textTransform: 'uppercase' }}>
            Selected (Offers)
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2E7D56' }}>
            {analytics?.selectedCount ?? 0}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#746B6D' }}>
            Candidates selected
          </span>
        </Card>

        <Card style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '4px solid #8C4F6E' }}>
          <span style={{ fontSize: '0.74rem', color: '#746B6D', fontWeight: 800, textTransform: 'uppercase' }}>
            Application Rate
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#321A2E' }}>
            {analytics?.applicationRate ?? 0}%
          </div>
          <span style={{ fontSize: '0.72rem', color: '#746B6D' }}>
            Applied vs Total Eligible
          </span>
        </Card>
      </div>

      {/* 3. Visual Analytics & Pipeline Conversion */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
        {/* Funnel Progression */}
        <Card style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#321A2E', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
              <TrendingUp size={16} color="#C65D3A" /> Recruitment Funnel Conversion
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#746B6D' }}>
              Selection Rate: <strong style={{ color: '#2E7D56' }}>{analytics?.selectionRate ?? 0}%</strong>
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Eligible */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem', color: '#3F373A' }}>
                <span>1. Eligible Pool</span>
                <strong>{analytics?.totalEligible ?? 0} Students (100%)</strong>
              </div>
              <div style={{ height: '7px', background: '#E8DAD4', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: '#C65D3A' }} />
              </div>
            </div>

            {/* Applied */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem', color: '#3F373A' }}>
                <span>2. Applications Submitted</span>
                <strong>{analytics?.totalApplied ?? 0} Applied ({analytics?.applicationRate ?? 0}%)</strong>
              </div>
              <div style={{ height: '7px', background: '#E8DAD4', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(analytics?.applicationRate ?? 0, 100)}%`, height: '100%', background: '#E9826E' }} />
              </div>
            </div>

            {/* In Assessment / Interview */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem', color: '#3F373A' }}>
                <span>3. Assessment / Interview Stage</span>
                <strong>{(analytics?.testCount ?? 0) + (analytics?.interviewCount ?? 0)} Active</strong>
              </div>
              <div style={{ height: '7px', background: '#E8DAD4', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: analytics?.totalApplied > 0 ? `${(((analytics?.testCount ?? 0) + (analytics?.interviewCount ?? 0)) * 100) / analytics.totalApplied}%` : '0%',
                  height: '100%',
                  background: '#D4A24C'
                }} />
              </div>
            </div>

            {/* Selected */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem', color: '#3F373A' }}>
                <span>4. Final Selection (Offers)</span>
                <strong style={{ color: '#2E7D56' }}>{analytics?.selectedCount ?? 0} Selected ({analytics?.selectionRate ?? 0}%)</strong>
              </div>
              <div style={{ height: '7px', background: '#E8DAD4', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(analytics?.selectionRate ?? 0, 100)}%`, height: '100%', background: '#2E7D56' }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Branch Participation & Academic CGPA Benchmarks */}
        <Card style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#321A2E', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
            <BarChart3 size={16} color="#D4A24C" /> Branch Participation & CGPA Benchmarks
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem', textAlign: 'center' }}>
            <div style={{ background: '#FDF4EC', padding: '0.65rem', borderRadius: '8px', border: '1px solid #E8DAD4' }}>
              <div style={{ fontSize: '0.68rem', color: '#746B6D', fontWeight: 700 }}>AVG ELIGIBLE CGPA</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#C65D3A' }}>{analytics?.avgCgpaEligible ?? '0.00'}</div>
            </div>
            <div style={{ background: '#FDF4EC', padding: '0.65rem', borderRadius: '8px', border: '1px solid #E8DAD4' }}>
              <div style={{ fontSize: '0.68rem', color: '#746B6D', fontWeight: 700 }}>AVG APPLICANT CGPA</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#D4A24C' }}>{analytics?.avgCgpaApplied ?? '0.00'}</div>
            </div>
            <div style={{ background: '#FDF4EC', padding: '0.65rem', borderRadius: '8px', border: '1px solid #E8DAD4' }}>
              <div style={{ fontSize: '0.68rem', color: '#746B6D', fontWeight: 700 }}>AVG SELECTED CGPA</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2E7D56' }}>{analytics?.avgCgpaSelected ?? '0.00'}</div>
            </div>
          </div>

          {/* Branch Breakdown Mini-Table */}
          <div style={{ overflowX: 'auto', maxHeight: '150px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E8DAD4', color: '#746B6D', textAlign: 'left', background: '#FDF4EC' }}>
                  <th style={{ padding: '0.4rem' }}>Department</th>
                  <th style={{ padding: '0.4rem', textAlign: 'center' }}>Eligible</th>
                  <th style={{ padding: '0.4rem', textAlign: 'center' }}>Applied</th>
                  <th style={{ padding: '0.4rem', textAlign: 'center' }}>Selected</th>
                  <th style={{ padding: '0.4rem', textAlign: 'right' }}>Participation</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.branchStats && analytics.branchStats.length > 0 ? (
                  analytics.branchStats.map((b) => (
                    <tr key={b.branch} style={{ borderBottom: '1px solid #E8DAD4' }}>
                      <td style={{ padding: '0.4rem', fontWeight: 600, color: '#292326' }}>{b.branch}</td>
                      <td style={{ padding: '0.4rem', textAlign: 'center' }}>{b.eligibleCount}</td>
                      <td style={{ padding: '0.4rem', textAlign: 'center', color: '#C65D3A' }}>{b.appliedCount}</td>
                      <td style={{ padding: '0.4rem', textAlign: 'center', color: '#2E7D56' }}>{b.selectedCount}</td>
                      <td style={{ padding: '0.4rem', textAlign: 'right', fontWeight: 700, color: '#292326' }}>{b.participationRate}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '0.65rem', textAlign: 'center', color: '#746B6D' }}>No branch breakdown available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* 4. Drive Student Applications & Candidate Directory */}
      <Card style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#321A2E', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
              <Users size={18} color="#C65D3A" /> Drive Student Applications & Candidate Pool
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#746B6D', marginTop: '0.1rem', margin: 0 }}>
              Showing {students.length} evaluated students for this drive
            </p>
          </div>

          {/* Quick Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.45rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search Name, Roll No, Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E8DAD4',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem 0.5rem 1.8rem',
                  fontSize: '0.82rem',
                  color: '#292326',
                  width: '240px',
                  outline: 'none'
                }}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#746B6D' }} />
            </div>
            <Button type="submit" variant="secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}>
              Search
            </Button>
          </form>
        </div>

        {/* Filter Controls Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.65rem',
          padding: '0.85rem',
          background: '#FDF4EC',
          borderRadius: '10px',
          border: '1px solid #E8DAD4'
        }}>
          {/* Eligibility Filter */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#746B6D', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
              ELIGIBILITY
            </label>
            <select
              value={eligibleFilter}
              onChange={(e) => setEligibleFilter(e.target.value)}
              style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E8DAD4', color: '#292326', padding: '0.35rem 0.55rem', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }}
            >
              <option value="ALL">All Candidates</option>
              <option value="ELIGIBLE">Eligible Only</option>
              <option value="INELIGIBLE">Ineligible Only</option>
            </select>
          </div>

          {/* Application Status Filter */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#746B6D', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
              APPLICATION STATUS
            </label>
            <select
              value={appliedFilter}
              onChange={(e) => setAppliedFilter(e.target.value)}
              style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E8DAD4', color: '#292326', padding: '0.35rem 0.55rem', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }}
            >
              <option value="ALL">All Candidates</option>
              <option value="APPLIED">Applied Candidates</option>
              <option value="NOT_APPLIED">Not Applied</option>
            </select>
          </div>

          {/* Recruitment Stage Filter */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#746B6D', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
              RECRUITMENT STAGE
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E8DAD4', color: '#292326', padding: '0.35rem 0.55rem', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }}
            >
              <option value="ALL">All Stages</option>
              <option value="APPLIED">Applied</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="TEST">Assessment / Test</option>
              <option value="INTERVIEW">Interview</option>
              <option value="SELECTED">Selected</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#746B6D', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
              DEPARTMENT / BRANCH
            </label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E8DAD4', color: '#292326', padding: '0.35rem 0.55rem', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }}
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Student Table */}
        {tableLoading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#746B6D' }}>
            <Loader message="Filtering candidates..." />
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#746B6D', background: '#FDF4EC', borderRadius: '10px' }}>
            <Users size={32} color="#746B6D" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#292326' }}>No students found matching the selected filters.</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Try clearing filters or search query to view all evaluated candidates.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#FDF4EC', borderBottom: '1px solid #E8DAD4', color: '#746B6D', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.6rem' }}>#</th>
                  <th style={{ padding: '0.65rem 0.6rem' }}>Roll No</th>
                  <th style={{ padding: '0.65rem 0.6rem' }}>Student Name</th>
                  <th style={{ padding: '0.65rem 0.6rem' }}>Branch</th>
                  <th style={{ padding: '0.65rem 0.6rem', textAlign: 'center' }}>CGPA</th>
                  <th style={{ padding: '0.65rem 0.6rem', textAlign: 'center' }}>Backlogs</th>
                  <th style={{ padding: '0.65rem 0.6rem', textAlign: 'center' }}>Eligibility</th>
                  <th style={{ padding: '0.65rem 0.6rem', textAlign: 'center' }}>Applied?</th>
                  <th style={{ padding: '0.65rem 0.6rem', textAlign: 'center' }}>Stage</th>
                  <th style={{ padding: '0.65rem 0.6rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr
                    key={s.studentId || idx}
                    style={{
                      borderBottom: '1px solid #E8DAD4',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '0.65rem 0.6rem', color: '#746B6D' }}>{idx + 1}</td>
                    <td style={{ padding: '0.65rem 0.6rem', fontWeight: 700, color: '#C65D3A' }}>
                      {s.rollNumber || 'N/A'}
                    </td>
                    <td style={{ padding: '0.65rem 0.6rem' }}>
                      <div style={{ fontWeight: 700, color: '#292326' }}>{s.name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#746B6D' }}>{s.email}</div>
                    </td>
                    <td style={{ padding: '0.65rem 0.6rem', color: '#3F373A', fontSize: '0.78rem' }}>
                      {s.department || 'N/A'}
                    </td>
                    <td style={{ padding: '0.65rem 0.6rem', textAlign: 'center', fontWeight: 800, color: '#292326' }}>
                      {s.cgpa ? s.cgpa.toFixed(2) : '0.00'}
                    </td>
                    <td style={{ padding: '0.65rem 0.6rem', textAlign: 'center' }}>
                      <span style={{ color: (s.backlogs || 0) > 0 ? '#BF3B3B' : '#2E7D56', fontWeight: 700 }}>
                        {s.backlogs || 0}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.6rem', textAlign: 'center' }}>
                      {s.eligible ? (
                        <Badge status="success" text={`Eligible (${s.matchPercentage.toFixed(0)}%)`} />
                      ) : (
                        <Badge status="rejected" text="Ineligible" />
                      )}
                    </td>
                    <td style={{ padding: '0.65rem 0.6rem', textAlign: 'center' }}>
                      {s.applied ? (
                        <Badge status="applied" text="APPLIED" />
                      ) : (
                        <span style={{ color: '#746B6D', fontSize: '0.78rem' }}>No</span>
                      )}
                    </td>
                    <td style={{ padding: '0.65rem 0.6rem', textAlign: 'center' }}>
                      {getStatusBadge(s.applicationStatus)}
                    </td>
                    <td style={{ padding: '0.65rem 0.6rem', textAlign: 'right' }}>
                      <Button
                        variant="secondary"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                        onClick={() => {
                          setSelectedStudent(s);
                          setShowStudentModal(true);
                        }}
                      >
                        View Dossier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Candidate Dossier Modal */}
      {showStudentModal && selectedStudent && (
        <Modal
          isOpen={showStudentModal}
          onClose={() => {
            setShowStudentModal(false);
            setSelectedStudent(null);
          }}
          title={`Candidate Dossier: ${selectedStudent.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.86rem' }}>
            {/* Header Identity */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FDF4EC', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E8DAD4' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#321A2E' }}>{selectedStudent.name}</div>
                <div style={{ color: '#C65D3A', fontWeight: 700, fontSize: '0.82rem' }}>{selectedStudent.rollNumber} • {selectedStudent.department}</div>
                <div style={{ color: '#746B6D', fontSize: '0.78rem' }}>{selectedStudent.email} | {selectedStudent.phone || 'No phone provided'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2E7D56' }}>{selectedStudent.cgpa?.toFixed(2)} CGPA</div>
                <div style={{ fontSize: '0.76rem', color: selectedStudent.backlogs > 0 ? '#BF3B3B' : '#2E7D56' }}>
                  {selectedStudent.backlogs || 0} Active Backlogs
                </div>
              </div>
            </div>

            {/* Eligibility Evaluation */}
            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#292326', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Drive Eligibility Evaluation
              </h4>
              <div style={{ background: selectedStudent.eligible ? '#F0F8F3' : '#FDF2F2', padding: '0.75rem', borderRadius: '6px', border: `1px solid ${selectedStudent.eligible ? '#C8E6D3' : '#F5CCCC'}` }}>
                <div style={{ fontWeight: 800, color: selectedStudent.eligible ? '#2E7D56' : '#BF3B3B', marginBottom: '0.25rem' }}>
                  {selectedStudent.eligible ? `✓ Candidate meets all requirements (${selectedStudent.matchPercentage.toFixed(0)}% Match)` : '✕ Candidate is Ineligible for this Drive'}
                </div>

                {selectedStudent.passedCriteria && selectedStudent.passedCriteria.length > 0 && (
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.78rem', color: '#2E7D56', marginTop: '0.25rem' }}>
                    {selectedStudent.passedCriteria.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                )}

                {selectedStudent.eligibilityReasons && selectedStudent.eligibilityReasons.length > 0 && (
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.78rem', color: '#BF3B3B', marginTop: '0.25rem' }}>
                    {selectedStudent.eligibilityReasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                )}
              </div>
            </div>

            {/* Application Info & Attached Resume */}
            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#292326', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Application Status & Dossier
              </h4>
              <div style={{ background: '#FDF4EC', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E8DAD4', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>Applied: <strong>{selectedStudent.applied ? 'YES' : 'NO'}</strong></div>
                {selectedStudent.applied && (
                  <>
                    <div>Current Stage: <strong>{selectedStudent.applicationStatus}</strong></div>
                    {selectedStudent.appliedAt && (
                      <div style={{ color: '#746B6D', fontSize: '0.76rem' }}>
                        Submitted At: {new Date(selectedStudent.appliedAt).toLocaleString()}
                      </div>
                    )}
                  </>
                )}
                {selectedStudent.resumeUrl && (
                  <div style={{ marginTop: '0.25rem', paddingTop: '0.45rem', borderTop: '1px solid #E8DAD4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#746B6D' }}>Attached Resume:</span>
                    <a
                      href={selectedStudent.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: '#C65D3A',
                        color: '#FFFFFF',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '4px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        textDecoration: 'none'
                      }}
                    >
                      <FileText size={13} /> View Resume / CV <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Student Skills */}
            {selectedStudent.skills && selectedStudent.skills.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#292326', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Candidate Skills
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {selectedStudent.skills.map((sk, i) => (
                    <span key={i} style={{ background: '#FDF4EC', color: '#C65D3A', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.76rem', border: '1px solid #E8DAD4' }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
