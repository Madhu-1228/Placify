import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { Input, Select, Textarea } from '../../components/common/Input';
import {
  Users,
  Search,
  Eye,
  SlidersHorizontal,
  GraduationCap,
  Award,
  FolderGit2,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  LayoutGrid,
  List,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FileText,
  ExternalLink,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  UserPlus,
  Lock,
  Plus
} from 'lucide-react';

const DEPARTMENTS = [
  'ALL',
  'Computer Science and Engineering',
  'Information Technology',
  'Artificial Intelligence and Data Science',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering'
];

const FORM_DEPARTMENTS = DEPARTMENTS.filter(d => d !== 'ALL');

const getBranchBadgeColor = (dept) => {
  if (!dept) return { bg: '#FDF4EC', border: '#E8DAD4', text: '#746B6D' };
  if (dept.includes('Computer Science')) return { bg: '#FDF4EC', border: '#E8DAD4', text: '#C65D3A' };
  if (dept.includes('Information Technology')) return { bg: '#FAF0F5', border: '#EACEDD', text: '#8C4F6E' };
  if (dept.includes('Artificial Intelligence')) return { bg: '#FEF9ED', border: '#FADDAE', text: '#C07D1E' };
  if (dept.includes('Electronics and Communication')) return { bg: '#FDF4EC', border: '#E8DAD4', text: '#AE4D2C' };
  if (dept.includes('Electrical')) return { bg: '#F0F8F3', border: '#C8E6D3', text: '#2E7D56' };
  if (dept.includes('Mechanical')) return { bg: '#FDF2F2', border: '#F5CCCC', text: '#BF3B3B' };
  return { bg: '#FDF4EC', border: '#E8DAD4', text: '#746B6D' };
};

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [year, setYear] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add Student Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addRoll, setAddRoll] = useState('');
  const [addDept, setAddDept] = useState(FORM_DEPARTMENTS[1]);
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('+91 98765 43210');
  const [addSection, setAddSection] = useState('A');
  const [addYear, setAddYear] = useState(3);
  const [addSemester, setAddSemester] = useState(6);
  const [addCgpa, setAddCgpa] = useState('8.50');
  const [addBacklogs, setAddBacklogs] = useState(0);
  const [addSkills, setAddSkills] = useState('Java, Spring Boot, React, SQL');
  const [addPassword, setAddPassword] = useState('Student@1234');
  const [addResumeUrl, setAddResumeUrl] = useState('');
  const [adding, setAdding] = useState(false);

  // Selected Student Detail Modal
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    loadStudents();
  }, [department, year, minCgpa]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (department !== 'ALL') params.department = department;
      if (year) params.year = parseInt(year);
      if (minCgpa) params.minCgpa = parseFloat(minCgpa);
      if (search.trim()) params.search = search.trim();

      const data = await studentService.getAllStudents(params);
      setStudents(data || []);
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Failed to load student directory.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadStudents();
  };

  const handleRollChange = (val) => {
    setAddRoll(val);
    if (!addEmail || addEmail.endsWith('@vvit.net')) {
      setAddEmail(val ? `${val.toLowerCase().trim()}@vvit.net` : '');
    }
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    setAlert({ type: '', message: '' });

    try {
      const studentPayload = {
        name: addName.trim(),
        rollNumber: addRoll.trim(),
        department: addDept,
        email: addEmail.trim(),
        phone: addPhone.trim(),
        section: addSection.trim(),
        year: parseInt(addYear) || 3,
        semester: parseInt(addSemester) || 6,
        cgpa: parseFloat(addCgpa) || 8.0,
        backlogs: parseInt(addBacklogs) || 0,
        skills: addSkills.split(',').map(s => s.trim()).filter(Boolean),
        password: addPassword,
        resumeUrl: addResumeUrl || `/uploads/resumes/${addRoll.trim()}_Resume.pdf`
      };

      await studentService.createStudent(studentPayload);
      setAlert({
        type: 'success',
        message: `Student "${addName}" (${addRoll}) successfully registered and synchronized across all placement portals!`
      });

      setShowAddModal(false);
      // Reset form
      setAddName('');
      setAddRoll('');
      setAddEmail('');
      setAddResumeUrl('');
      loadStudents();
    } catch (err) {
      console.error(err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to enroll student. Verify email or roll number uniqueness.'
      });
    } finally {
      setAdding(false);
    }
  };

  const handleViewDetail = async (student) => {
    try {
      const full = await studentService.getStudentById(student.id);
      setSelectedStudentDetail(full);
      setShowDetailModal(true);
    } catch (e) {
      console.error(e);
      // Fallback to local item
      setSelectedStudentDetail({ profile: student });
      setShowDetailModal(true);
    }
  };

  // Pagination calculation
  const totalStudents = students.length;
  const totalPages = Math.ceil(totalStudents / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStudents = students.slice(startIndex, startIndex + pageSize);

  // Quick stats
  const highCgpaCount = students.filter(s => (s.cgpa || 0) >= 8.5).length;
  const zeroBacklogsCount = students.filter(s => (s.backlogs || 0) === 0).length;
  const avgCgpa = totalStudents > 0
    ? (students.reduce((acc, curr) => acc + (curr.cgpa || 0), 0) / totalStudents).toFixed(2)
    : '0.00';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#321A2E' }}>Student Candidates Directory</h1>
          <p style={{ color: '#746B6D', fontSize: '0.88rem' }}>
            Comprehensive institutional candidate database, academic eligibility records & resume repository
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <Button variant="primary" icon={UserPlus} onClick={() => setShowAddModal(true)}>
            Enroll Student Candidate
          </Button>

          {/* Toggle View Mode */}
          <div style={{ display: 'flex', background: '#FDF4EC', padding: '0.2rem', borderRadius: '8px', border: '1px solid #E8DAD4' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: viewMode === 'table' ? '#C65D3A' : 'transparent',
                color: viewMode === 'table' ? '#FFF8F1' : '#746B6D',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <List size={14} /> Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: viewMode === 'grid' ? '#C65D3A' : 'transparent',
                color: viewMode === 'grid' ? '#FFF8F1' : '#746B6D',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <LayoutGrid size={14} /> Grid
            </button>
          </div>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Directory Metrics Overview Bar */}
      <div className="grid grid-cols-4" style={{ gap: '1rem' }}>
        <Card title="Total Candidates" subtitle="Active in registry" icon={Users}>
          <div className="stat-card-value" style={{ color: '#292326' }}>{totalStudents}</div>
          <span style={{ fontSize: '0.78rem', color: '#746B6D' }}>Verified student profiles</span>
        </Card>

        <Card title="High CGPA Tier" subtitle="CGPA ≥ 8.50" icon={Sparkles}>
          <div className="stat-card-value" style={{ color: '#2E7D56' }}>{highCgpaCount}</div>
          <span style={{ fontSize: '0.78rem', color: '#2E7D56', fontWeight: 600 }}>Top tier talent pool</span>
        </Card>

        <Card title="Zero Backlogs Rate" subtitle="Clean academic standing" icon={ShieldCheck}>
          <div className="stat-card-value" style={{ color: '#C65D3A' }}>
            {totalStudents > 0 ? `${Math.round((zeroBacklogsCount / totalStudents) * 100)}%` : '100%'}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#746B6D' }}>{zeroBacklogsCount} of {totalStudents} eligible</span>
        </Card>

        <Card title="Average CGPA" subtitle="Batch cumulative" icon={GraduationCap}>
          <div className="stat-card-value" style={{ color: '#D4A24C' }}>{avgCgpa}</div>
          <span style={{ fontSize: '0.78rem', color: '#746B6D' }}>Across all departments</span>
        </Card>
      </div>

      {/* Search & Filter Controls Bar */}
      <Card hover={false} style={{ padding: '1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem', alignItems: 'flex-end' }}>
          <Input
            label="Search Candidates"
            placeholder="Name, Roll No, Skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            label="Department / Branch"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>

          <Input
            label="Year of Study"
            type="number"
            placeholder="e.g. 3 or 4"
            min="1"
            max="4"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />

          <Input
            label="Minimum CGPA"
            type="number"
            step="0.1"
            placeholder="e.g. 8.0"
            value={minCgpa}
            onChange={(e) => setMinCgpa(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.85rem' }}>
            <Button type="submit" variant="primary" icon={Search} style={{ flex: 1, height: '38px', fontSize: '0.8rem' }}>
              Filter
            </Button>
            <Button type="button" variant="outline" onClick={() => { setSearch(''); setDepartment('ALL'); setYear(''); setMinCgpa(''); }} style={{ height: '38px', fontSize: '0.8rem' }}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {/* Directory Table / Grid */}
      {loading ? (
        <Loader message="Loading candidate records..." />
      ) : students.length === 0 ? (
        <Card hover={false}>
          <div style={{ textAlign: 'center', padding: '3rem', color: '#746B6D' }}>
            No student candidates found matching the selected filter criteria.
          </div>
        </Card>
      ) : viewMode === 'table' ? (
        <Card hover={false} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#FDF4EC', borderBottom: '1px solid #E8DAD4', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Candidate</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Roll & Sec</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Department</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Year & Sem</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>CGPA</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Backlogs</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Profile Strength</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((s, idx) => {
                  const bColor = getBranchBadgeColor(s.department);
                  const initials = s.name
                    ? s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'ST';

                  return (
                    <tr
                      key={s.id || idx}
                      style={{
                        borderBottom: '1px solid #E8DAD4',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Candidate Avatar & Name */}
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#FBE9DF',
                            color: '#C65D3A',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#292326', fontSize: '0.88rem' }}>{s.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#746B6D' }}>{s.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Roll Number & Section */}
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#C65D3A', fontSize: '0.82rem' }}>{s.rollNumber || 'N/A'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#746B6D' }}>Sec {s.section || 'A'}</div>
                      </td>

                      {/* Department Badge */}
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: bColor.bg,
                          border: `1px solid ${bColor.border}`,
                          color: bColor.text,
                          fontSize: '0.74rem',
                          fontWeight: 700
                        }}>
                          {s.department || 'Engineering'}
                        </span>
                      </td>

                      {/* Year & Sem */}
                      <td style={{ padding: '0.65rem 1rem', fontSize: '0.8rem', color: '#3F373A' }}>
                        Year {s.year || 3} &bull; Sem {s.semester || 6}
                      </td>

                      {/* CGPA */}
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <strong style={{
                          color: s.cgpa >= 8.5 ? '#2E7D56' : s.cgpa >= 7.5 ? '#C65D3A' : '#D4A24C',
                          fontSize: '0.88rem'
                        }}>
                          {s.cgpa ? s.cgpa.toFixed(2) : '0.00'}
                        </strong>
                      </td>

                      {/* Backlogs */}
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: (s.backlogs || 0) === 0 ? '#F0F8F3' : '#FDF2F2',
                          color: (s.backlogs || 0) === 0 ? '#2E7D56' : '#BF3B3B',
                          fontWeight: 700,
                          fontSize: '0.74rem'
                        }}>
                          {(s.backlogs || 0) === 0 ? '0 Backlogs' : `${s.backlogs} Backlogs`}
                        </span>
                      </td>

                      {/* Profile Strength */}
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '55px', height: '6px', background: '#E8DAD4', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${s.profileCompletionPercentage || 80}%`, background: '#C65D3A' }} />
                          </div>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#292326' }}>{s.profileCompletionPercentage || 80}%</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                        <Button
                          variant="outline"
                          icon={Eye}
                          style={{ fontSize: '0.74rem', padding: '0.25rem 0.55rem' }}
                          onClick={() => handleViewDetail(s)}
                        >
                          Dossier
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
          {paginatedStudents.map((s, idx) => {
            const bColor = getBranchBadgeColor(s.department);
            const initials = s.name
              ? s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              : 'ST';

            return (
              <Card key={s.id || idx} className="card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.15rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#FBE9DF',
                      color: '#C65D3A',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {initials}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#292326', margin: 0 }}>{s.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#C65D3A', fontWeight: 700 }}>{s.rollNumber} &bull; Sec {s.section || 'A'}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.45rem',
                      borderRadius: '4px',
                      background: bColor.bg,
                      border: `1px solid ${bColor.border}`,
                      color: bColor.text,
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      {s.department || 'Engineering'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', background: '#FDF4EC', padding: '0.65rem', borderRadius: '6px', border: '1px solid #E8DAD4', fontSize: '0.78rem', margin: '0.5rem 0' }}>
                    <div>
                      <span style={{ color: '#746B6D' }}>CGPA:</span>
                      <strong style={{ color: '#2E7D56', display: 'block', fontSize: '0.9rem' }}>{s.cgpa?.toFixed(2) || '0.00'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#746B6D' }}>Backlogs:</span>
                      <strong style={{ color: (s.backlogs || 0) === 0 ? '#2E7D56' : '#BF3B3B', display: 'block', fontSize: '0.9rem' }}>{s.backlogs || 0}</strong>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#746B6D' }}>Email:</span>
                      <span style={{ color: '#292326', display: 'block', fontSize: '0.74rem' }}>{s.email}</span>
                    </div>
                  </div>

                  {s.skills && s.skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', margin: '0.45rem 0' }}>
                      {s.skills.slice(0, 3).map((sk, i) => (
                        <span key={i} style={{ background: '#FDF4EC', color: '#C65D3A', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', border: '1px solid #E8DAD4' }}>
                          {sk}
                        </span>
                      ))}
                      {s.skills.length > 3 && (
                        <span style={{ fontSize: '0.7rem', color: '#746B6D' }}>+{s.skills.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  variant="primary"
                  icon={Eye}
                  style={{ width: '100%', fontSize: '0.78rem', marginTop: '0.65rem' }}
                  onClick={() => handleViewDetail(s)}
                >
                  View Candidate Dossier
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls Bar */}
      {totalStudents > 0 && (
        <Card hover={false} style={{ padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.82rem', color: '#746B6D' }}>
              <span>Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + pageSize, totalStudents)}</strong> of <strong>{totalStudents}</strong> candidates</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.85rem' }}>
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                  style={{ background: '#FFFFFF', border: '1px solid #E8DAD4', borderRadius: '4px', color: '#292326', padding: '0.2rem 0.45rem', fontSize: '0.78rem', outline: 'none' }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem' }}
              >
                <ChevronLeft size={14} /> Prev
              </Button>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0 0.35rem', color: '#292326' }}>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem' }}
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Add New Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Enroll New Student Candidate in Registry"
        maxWidth="720px"
      >
        <form onSubmit={handleAddStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#FDF4EC', border: '1px solid #E8DAD4', padding: '0.75rem 0.95rem', borderRadius: '8px', fontSize: '0.84rem' }}>
            <span style={{ color: '#C65D3A', fontWeight: 700 }}>
              Placement Cell Candidate Onboarding
            </span>
            <div style={{ color: '#746B6D', fontSize: '0.76rem', marginTop: '0.1rem' }}>
              Creates the institutional student login account and generates the baseline placement profile.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <Input
              label="Student Full Name *"
              placeholder="e.g. Ramesh Chandra"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              required
            />

            <Input
              label="University Roll Number / PRN *"
              placeholder="e.g. 23BQ1A1235"
              value={addRoll}
              onChange={(e) => handleRollChange(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <Select
              label="Engineering Department / Branch *"
              value={addDept}
              onChange={(e) => setAddDept(e.target.value)}
            >
              {FORM_DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>

            <Input
              label="College Email ID *"
              placeholder="e.g. 23bq1a1235@vvit.net"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
            <Input
              label="Contact Phone"
              placeholder="+91 98765 43210"
              value={addPhone}
              onChange={(e) => setAddPhone(e.target.value)}
            />

            <Input
              label="Section / Division"
              placeholder="e.g. A"
              value={addSection}
              onChange={(e) => setAddSection(e.target.value)}
            />

            <Input
              label="Year of Study"
              type="number"
              min="1"
              max="4"
              value={addYear}
              onChange={(e) => setAddYear(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
            <Input
              label="Current Semester"
              type="number"
              min="1"
              max="8"
              value={addSemester}
              onChange={(e) => setAddSemester(e.target.value)}
            />

            <Input
              label="Cumulative CGPA *"
              type="number"
              step="0.01"
              min="0"
              max="10"
              placeholder="e.g. 8.50"
              value={addCgpa}
              onChange={(e) => setAddCgpa(e.target.value)}
              required
            />

            <Input
              label="Active Backlogs"
              type="number"
              min="0"
              value={addBacklogs}
              onChange={(e) => setAddBacklogs(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <Input
              label="Initial Account Password"
              type="password"
              value={addPassword}
              onChange={(e) => setAddPassword(e.target.value)}
              helperText="Default: Student@1234"
              required
            />

            <Input
              label="Resume URL / File Path"
              placeholder="e.g. /uploads/resumes/23BQ1A1235_Resume.pdf"
              value={addResumeUrl}
              onChange={(e) => setAddResumeUrl(e.target.value)}
            />
          </div>

          <Input
            label="Technical Skills (Comma separated)"
            placeholder="e.g. Java, Python, React, Spring Boot, SQL, AWS"
            value={addSkills}
            onChange={(e) => setAddSkills(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', borderTop: '1px solid #E8DAD4', paddingTop: '0.85rem' }}>
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} disabled={adding}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={UserPlus} disabled={adding}>
              {adding ? 'Registering...' : 'Enroll Student Candidate'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Full Record Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedStudentDetail?.profile?.name ? `Candidate Dossier — ${selectedStudentDetail.profile.name}` : 'Student Candidate Dossier'}
        maxWidth="750px"
      >
        {selectedStudentDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.86rem' }}>
            {/* Header info card */}
            <div style={{
              background: '#FDF4EC',
              border: '1px solid #E8DAD4',
              padding: '1rem',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#321A2E', margin: 0 }}>{selectedStudentDetail.profile.name}</h3>
                <div style={{ fontSize: '0.82rem', color: '#C65D3A', marginTop: '0.15rem', fontWeight: 600 }}>
                  {selectedStudentDetail.profile.department} &bull; Roll: <strong style={{ color: '#292326' }}>{selectedStudentDetail.profile.rollNumber}</strong> &bull; Sec {selectedStudentDetail.profile.section || 'A'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#746B6D', textTransform: 'uppercase', fontWeight: 700 }}>CGPA</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2E7D56' }}>
                  {selectedStudentDetail.profile.cgpa?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>

            {/* Contact & Academics 2-column */}
            <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
              <div style={{ background: '#FFFFFF', padding: '0.85rem', borderRadius: '6px', border: '1px solid #E8DAD4', fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ color: '#C65D3A', fontWeight: 700, fontSize: '0.76rem', textTransform: 'uppercase', marginBottom: '0.1rem' }}>Contact Information</div>
                <div><Mail size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle', color: '#746B6D' }} /> {selectedStudentDetail.profile.email}</div>
                <div><Phone size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle', color: '#746B6D' }} /> {selectedStudentDetail.profile.phone || '+91 98765 43210'}</div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '0.85rem', borderRadius: '6px', border: '1px solid #E8DAD4', fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ color: '#C65D3A', fontWeight: 700, fontSize: '0.76rem', textTransform: 'uppercase', marginBottom: '0.1rem' }}>Academic Profile</div>
                <div><strong>Year & Semester:</strong> Year {selectedStudentDetail.profile.year || 3}, Semester {selectedStudentDetail.profile.semester || 6}</div>
                <div><strong>Active Backlogs:</strong> <span style={{ color: (selectedStudentDetail.profile.backlogs || 0) === 0 ? '#2E7D56' : '#BF3B3B', fontWeight: 700 }}>{selectedStudentDetail.profile.backlogs || 0} Backlogs</span></div>
              </div>
            </div>

            {/* Resume Link */}
            {selectedStudentDetail.profile.resumeUrl && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F0F8F3', border: '1px solid #C8E6D3', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: '#292326' }}>Verified Student Resume / CV</strong>
                  <div style={{ fontSize: '0.74rem', color: '#746B6D' }}>{selectedStudentDetail.profile.resumeUrl}</div>
                </div>
                <a
                  href={selectedStudentDetail.profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: '#C65D3A',
                    color: '#FFFFFF',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <FileText size={13} /> Open CV <ExternalLink size={11} />
                </a>
              </div>
            )}

            {/* Technical Skills */}
            <div>
              <h4 style={{ fontSize: '0.88rem', color: '#292326', marginBottom: '0.35rem', fontWeight: 800 }}>Verified Technical Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {selectedStudentDetail.profile.skills?.length > 0 ? (
                  selectedStudentDetail.profile.skills.map((s, i) => (
                    <span key={i} style={{ background: '#FDF4EC', border: '1px solid #E8DAD4', color: '#C65D3A', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.76rem', fontWeight: 600 }}>
                      {s}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#746B6D', fontSize: '0.8rem' }}>No skills entered</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid #E8DAD4', paddingTop: '0.85rem' }}>
              <Button variant="primary" onClick={() => setShowDetailModal(false)}>Close Dossier</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
