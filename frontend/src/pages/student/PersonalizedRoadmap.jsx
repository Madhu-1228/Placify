import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { roadmapService } from '../../services/roadmapService';
import { driveService } from '../../services/driveService';
import { studentService } from '../../services/studentService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import CircularScore from '../../components/common/CircularScore';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Clock,
  Building2,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  BookOpen,
  HelpCircle,
  FolderGit2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Check,
  Flame,
  Award,
  Zap,
  Target,
  FileCheck
} from 'lucide-react';

const DURATION_OPTIONS = [
  { days: 7, label: '7 Days (Crash Sprint)' },
  { days: 14, label: '14 Days (Fast Track)' },
  { days: 30, label: '30 Days (Standard Prep)' },
  { days: 60, label: '60 Days (Comprehensive)' }
];

export default function PersonalizedRoadmap() {
  const [searchParams] = useSearchParams();
  const initialDriveId = searchParams.get('driveId') || '';

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [scanStep, setScanStep] = useState(1);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Form State
  const [targetRoles, setTargetRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('Java Full Stack Developer');
  const [customRole, setCustomRole] = useState('');
  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState(initialDriveId);
  const [selectedDuration, setSelectedDuration] = useState(30);

  // Regeneration Warning Modal
  const [showRegenModal, setShowRegenModal] = useState(false);

  // Expanded Milestones State
  const [expandedMilestones, setExpandedMilestones] = useState({ 0: true, 1: true });

  const timelineRef = useRef(null);

  useEffect(() => {
    loadInitialRoadmapAndOptions();
  }, []);

  const loadInitialRoadmapAndOptions = async () => {
    setLoading(true);
    try {
      const [currentRoadmap, roleList, drivesList] = await Promise.all([
        roadmapService.getCurrentRoadmap().catch(() => null),
        roadmapService.getTargetRoles().catch(() => []),
        driveService.getEligibleDrives().catch(() => [])
      ]);

      setRoadmap(currentRoadmap);
      setTargetRoles(roleList || []);
      setDrives(drivesList || []);

      if (currentRoadmap) {
        setSelectedRole(currentRoadmap.targetRole || 'Java Full Stack Developer');
        setSelectedDuration(currentRoadmap.durationDays || 30);
        if (currentRoadmap.targetDriveId) {
          setSelectedDriveId(currentRoadmap.targetDriveId);
        }
      }
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Failed to load preparation roadmap data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (forceRegenerate = false) => {
    if (!forceRegenerate && roadmap && roadmap.completedTasksCount > 0 && !showRegenModal) {
      setShowRegenModal(true);
      return;
    }

    setShowRegenModal(false);
    setGenerating(true);
    setScanStep(1);
    setAlert({ type: '', message: '' });

    const step1Timer = setTimeout(() => setScanStep(2), 1400);
    const step2Timer = setTimeout(() => setScanStep(3), 3000);

    const finalRole = customRole.trim() ? customRole.trim() : selectedRole;

    try {
      const generated = await roadmapService.generateRoadmap({
        targetRole: finalRole,
        targetDriveId: selectedDriveId || null,
        durationDays: selectedDuration,
        regenerate: true
      });

      clearTimeout(step1Timer);
      clearTimeout(step2Timer);

      setRoadmap(generated);
      setAlert({
        type: 'success',
        message: `✨ Personalized preparation roadmap for "${finalRole}" generated successfully!`
      });

      setTimeout(() => {
        timelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (e) {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      console.error(e);
      setAlert({ type: 'error', message: 'Failed to generate personalized roadmap. Please try again.' });
    } finally {
      setGenerating(false);
      setScanStep(1);
    }
  };

  const handleTaskStatusCycle = async (taskId, currentStatus) => {
    let nextStatus = 'IN_PROGRESS';
    if (currentStatus === 'NOT_STARTED') nextStatus = 'IN_PROGRESS';
    else if (currentStatus === 'IN_PROGRESS') nextStatus = 'COMPLETED';
    else nextStatus = 'NOT_STARTED';

    try {
      const updated = await roadmapService.updateTaskProgress(taskId, nextStatus);
      setRoadmap(updated);
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Failed to update task progress.' });
    }
  };

  const toggleMilestoneExpand = (idx) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 size={18} color="#2E7D56" />;
      case 'IN_PROGRESS':
        return <Clock size={18} color="#D4A24C" />;
      default:
        return <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: '2px solid #E8DAD4' }} />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <span style={{ fontSize: '0.7rem', background: '#FDF2F2', border: '1px solid #F5CCCC', color: '#BF3B3B', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 800 }}>HIGH PRIORITY</span>;
      case 'MEDIUM':
        return <span style={{ fontSize: '0.7rem', background: '#FEF9ED', border: '1px solid #FADDAE', color: '#C07D1E', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 800 }}>MEDIUM</span>;
      default:
        return <span style={{ fontSize: '0.7rem', background: '#FDF4EC', border: '1px solid #E8DAD4', color: '#C65D3A', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 800 }}>LOW</span>;
    }
  };

  const getTaskTypeBadge = (type) => {
    switch (type) {
      case 'PRACTICE':
        return <span style={{ fontSize: '0.7rem', background: '#F0F8F3', border: '1px solid #C8E6D3', color: '#2E7D56', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>PRACTICE</span>;
      case 'CONCEPT':
        return <span style={{ fontSize: '0.7rem', background: '#FDF4EC', border: '1px solid #E8DAD4', color: '#C65D3A', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>CONCEPT</span>;
      case 'INTERVIEW':
        return <span style={{ fontSize: '0.7rem', background: '#FEF9ED', border: '1px solid #FADDAE', color: '#C07D1E', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>INTERVIEW</span>;
      case 'ASSESSMENT':
        return <span style={{ fontSize: '0.7rem', background: '#FAF0F5', border: '1px solid #EACEDD', color: '#8C4F6E', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>ASSESSMENT</span>;
      default:
        return <span style={{ fontSize: '0.7rem', background: '#FDF4EC', color: '#746B6D', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>PROJECT</span>;
    }
  };

  if (loading) {
    return <Loader message="Analyzing your placement skill gaps & generating customized roadmap..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header Banner in Deep Plum & Terracotta */}
      <div className="dashboard-hero" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        padding: '2.25rem 2.5rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 248, 241, 0.15)', border: '1px solid rgba(255, 248, 241, 0.25)', padding: '0.25rem 0.75rem', borderRadius: '9999px', color: '#FFF8F1', fontSize: '0.74rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            <Compass size={14} color="#D4A24C" /> PLACEMENT READINESS ARCHITECT
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#FFF8F1', margin: 0 }}>
            Personalized Preparation Roadmap
          </h1>
          <p style={{ color: '#F7DDD4', fontSize: '0.92rem', marginTop: '0.35rem', fontWeight: 500, maxWidth: '650px' }}>
            Your AI-generated, structured plan to eliminate technical skill gaps and become placement-ready for campus recruitments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="gold"
            icon={Sparkles}
            onClick={() => handleGenerate(false)}
            disabled={generating}
            style={{ padding: '0.65rem 1.25rem', fontWeight: 700 }}
          >
            {generating ? 'Generating...' : roadmap ? 'Regenerate Plan' : 'Generate Roadmap'}
          </Button>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Generation Configuration Card */}
      <Card hover={false} title="Personalization & Goal Configuration" subtitle="Select target placement role, target company drive, and preparation horizon" icon={Target}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '0.35rem' }}>
          {/* Target Role Dropdown */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#292326', display: 'block', marginBottom: '0.35rem' }}>
              Target Job Role *
            </label>
            <select
              value={selectedRole}
              onChange={(e) => { setSelectedRole(e.target.value); setCustomRole(''); }}
              style={{
                width: '100%',
                background: '#FFFFFF',
                border: '1px solid #E8DAD4',
                borderRadius: '10px',
                padding: '0.6rem 0.85rem',
                color: '#292326',
                fontSize: '0.88rem',
                outline: 'none',
                marginBottom: '0.35rem'
              }}
            >
              {targetRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
              <option value="CUSTOM">-- Enter Custom Target Role --</option>
            </select>

            {selectedRole === 'CUSTOM' && (
              <input
                type="text"
                placeholder="e.g. Embedded Systems Engineer, Cloud Architect..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  border: '1px solid #E8DAD4',
                  borderRadius: '10px',
                  padding: '0.6rem 0.85rem',
                  color: '#292326',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            )}
          </div>

          {/* Target Company / Campus Drive */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#292326', display: 'block', marginBottom: '0.35rem' }}>
              Benchmark Against Specific Drive (Optional)
            </label>
            <select
              value={selectedDriveId}
              onChange={(e) => setSelectedDriveId(e.target.value)}
              style={{
                width: '100%',
                background: '#FFFFFF',
                border: '1px solid #E8DAD4',
                borderRadius: '10px',
                padding: '0.6rem 0.85rem',
                color: '#292326',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            >
              <option value="">-- General Role Benchmark (No Specific Drive) --</option>
              {drives.map(({ drive }) => (
                <option key={drive.id} value={drive.id}>
                  {drive.companyName} &bull; {drive.role} ({drive.packageCtc})
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.72rem', color: '#746B6D', display: 'block', marginTop: '0.25rem' }}>
              Pulls actual required skills from the recruiter's official placement circular
            </span>
          </div>

          {/* Preparation Duration */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#292326', display: 'block', marginBottom: '0.35rem' }}>
              Preparation Duration *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem' }}>
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setSelectedDuration(opt.days)}
                  style={{
                    background: selectedDuration === opt.days ? '#C65D3A' : '#FDF4EC',
                    border: selectedDuration === opt.days ? '1px solid #C65D3A' : '1px solid #E8DAD4',
                    color: selectedDuration === opt.days ? '#FFF8F1' : '#746B6D',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Real-time AI Generation Scanner */}
      {generating && (
        <Card hover={false} style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div className="spinner" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#321A2E', marginBottom: '0.25rem' }}>
                Architecting Your Personalized Roadmap
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#C65D3A', fontWeight: 600 }}>
                {scanStep === 1 && 'Step 1/3: Analyzing academic skills, resume analysis gaps & target requirements...'}
                {scanStep === 2 && 'Step 2/3: Formulating milestone curriculum with Google Gemini AI...'}
                {scanStep === 3 && 'Step 3/3: Mapping actionable coding tasks, resources & quizzes...'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Active Roadmap Dashboard */}
      {roadmap && (
        <div ref={timelineRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Progress & Metrics Panel */}
          <div
            style={{
              padding: '1.75rem',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              border: '1px solid #E8DAD4',
              borderRadius: '16px',
              background: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(41, 35, 38, 0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
              <CircularScore score={roadmap.completionPercentage || 0} size={120} strokeWidth={10} label="Roadmap Progress" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxWidth: '360px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ background: '#FDF4EC', color: '#C65D3A', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 800, border: '1px solid #E8DAD4' }}>
                    {roadmap.generatedBy === 'GEMINI_AI' ? '🤖 GEMINI AI GENERATED' : '⚙️ HEURISTIC ENGINE'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#746B6D' }}>
                    {roadmap.durationDays} Days Duration
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#321A2E', margin: 0 }}>
                  {roadmap.targetRole}
                </h3>

                {roadmap.targetCompany && (
                  <div style={{ fontSize: '0.82rem', color: '#D4A24C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Building2 size={13} /> Drive Target: {roadmap.targetCompany}
                  </div>
                )}

                <div style={{ fontSize: '0.82rem', color: '#746B6D' }}>
                  <strong style={{ color: '#292326' }}>{roadmap.completedTasksCount || 0}</strong> of <strong style={{ color: '#292326' }}>{roadmap.totalTasksCount || 0}</strong> tasks completed ({roadmap.completionPercentage || 0}%)
                </div>
              </div>
            </div>

            {/* Current Focus & Next Action Card */}
            <div style={{
              background: '#FDF4EC',
              border: '1px solid #E8DAD4',
              borderRadius: '10px',
              padding: '1rem',
              minWidth: '260px',
              maxWidth: '340px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#746B6D', textTransform: 'uppercase', fontWeight: 800 }}>
                  CURRENT FOCUS TOPIC
                </span>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#C65D3A', marginTop: '0.1rem' }}>
                  {roadmap.currentFocus || 'Core Foundations'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#746B6D', textTransform: 'uppercase', fontWeight: 800 }}>
                  NEXT RECOMMENDED ACTIVITY
                </span>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#292326', marginTop: '0.1rem' }}>
                  {roadmap.nextRecommendedActivity || 'Review upcoming milestone tasks'}
                </div>
              </div>

              {roadmap.adaptiveAdvice && (
                <div style={{ fontSize: '0.78rem', color: '#746B6D', borderTop: '1px solid #E8DAD4', paddingTop: '0.4rem', lineHeight: 1.35 }}>
                  💡 <strong style={{ color: '#D4A24C' }}>Strategy:</strong> {roadmap.adaptiveAdvice}
                </div>
              )}
            </div>
          </div>

          {/* Skill Gap Analysis Breakdown */}
          <div className="grid grid-cols-2">
            {/* Technical Skill Gaps */}
            <Card title="Identified Technical Skill Gaps" subtitle="Specific requirements needed for your target goal" icon={AlertTriangle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {roadmap.skillGaps && roadmap.skillGaps.length > 0 ? (
                  roadmap.skillGaps.map((gap, idx) => (
                    <div key={idx} style={{ padding: '0.65rem 0.85rem', background: '#FDF4EC', borderRadius: '8px', border: '1px solid #E8DAD4', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.65rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#292326' }}>
                          {gap.skillName}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#746B6D', marginTop: '0.15rem' }}>
                          {gap.reason}
                        </div>
                      </div>
                      {getPriorityBadge(gap.priority)}
                    </div>
                  ))
                ) : (
                  <span style={{ color: '#746B6D', fontSize: '0.82rem' }}>No critical skill gaps identified.</span>
                )}
              </div>
            </Card>

            {/* Current Strengths & Resources */}
            <Card title="Current Verified Strengths" subtitle="Skills detected from profile and resume" icon={CheckCircle2}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {roadmap.currentStrengths && roadmap.currentStrengths.length > 0 ? (
                  roadmap.currentStrengths.map((str, idx) => (
                    <span key={idx} style={{ background: '#F0F8F3', border: '1px solid #C8E6D3', color: '#2E7D56', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                      ✓ {str}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#746B6D', fontSize: '0.82rem' }}>Core programming foundations</span>
                )}
              </div>

              <div style={{ marginTop: '1.25rem', borderTop: '1px solid #E8DAD4', paddingTop: '0.85rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#292326', marginBottom: '0.45rem' }}>
                  Quick Platform Study Resources
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link to="/student/preparation" style={{ textDecoration: 'none' }}>
                    <Button variant="outline" icon={BookOpen} style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem' }}>
                      Preparation Hub Notes
                    </Button>
                  </Link>
                  <Link to="/student/quizzes" style={{ textDecoration: 'none' }}>
                    <Button variant="outline" icon={HelpCircle} style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem' }}>
                      Placement Quizzes
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Interactive Milestone Timeline */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#321A2E' }}>
                  <Calendar size={20} color="#C65D3A" />
                  Timeline & Milestone Action Plan
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#746B6D' }}>
                  Click on any task checkbox (□ &rarr; ◐ &rarr; ✓) to mark progress.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {roadmap.milestones && roadmap.milestones.map((milestone, mIdx) => {
                const isExpanded = expandedMilestones[mIdx] !== false;
                const completedTasksInMilestone = milestone.tasks?.filter(t => t.status === 'COMPLETED').length || 0;
                const totalTasksInMilestone = milestone.tasks?.length || 0;
                const milestoneDone = totalTasksInMilestone > 0 && completedTasksInMilestone === totalTasksInMilestone;

                return (
                  <div
                    key={mIdx}
                    style={{
                      background: '#FFFFFF',
                      border: milestoneDone ? '1.5px solid #C8E6D3' : '1px solid #E8DAD4',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(41, 35, 38, 0.05)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Milestone Header */}
                    <div
                      onClick={() => toggleMilestoneExpand(mIdx)}
                      style={{
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: milestoneDone ? '#F0F8F3' : '#FDF4EC',
                        borderBottom: isExpanded ? '1px solid #E8DAD4' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: '6px',
                          background: milestoneDone ? '#2E7D56' : '#C65D3A',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.78rem'
                        }}>
                          {milestone.milestoneNumber}
                        </div>

                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#292326', margin: 0 }}>
                            {milestone.title}
                          </h4>
                          <span style={{ fontSize: '0.78rem', color: '#C65D3A', fontWeight: 600 }}>
                            Focus: {milestone.focusArea} &bull; {milestone.learningObjective}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: milestoneDone ? '#2E7D56' : '#746B6D' }}>
                          {completedTasksInMilestone}/{totalTasksInMilestone} Completed
                        </span>
                        {isExpanded ? <ChevronUp size={16} color="#746B6D" /> : <ChevronDown size={16} color="#746B6D" />}
                      </div>
                    </div>

                    {/* Milestone Tasks */}
                    {isExpanded && (
                      <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {milestone.tasks && milestone.tasks.map((task) => (
                          <div
                            key={task.id}
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '10px',
                              background: task.status === 'COMPLETED' ? '#F0F8F3' : task.status === 'IN_PROGRESS' ? '#FEF9ED' : '#FFF8F1',
                              border: task.status === 'COMPLETED' ? '1px solid #C8E6D3' : task.status === 'IN_PROGRESS' ? '1px solid #FADDAE' : '1px solid #E8DAD4',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '0.75rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                              {/* Clickable Status Checkbox */}
                              <button
                                type="button"
                                onClick={() => handleTaskStatusCycle(task.id, task.status)}
                                title="Click to cycle status: Not Started -> In Progress -> Completed"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginTop: '2px', flexShrink: 0 }}
                              >
                                {getStatusIcon(task.status)}
                              </button>

                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                  <strong style={{ fontSize: '0.9rem', color: task.status === 'COMPLETED' ? '#746B6D' : '#292326', textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                                    {task.title}
                                  </strong>
                                  {getTaskTypeBadge(task.type)}
                                  {task.estimatedMinutes && (
                                    <span style={{ fontSize: '0.7rem', color: '#746B6D', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                      <Clock size={11} /> {task.estimatedMinutes} mins
                                    </span>
                                  )}
                                </div>
                                <p style={{ fontSize: '0.78rem', color: '#746B6D', marginTop: '0.15rem', lineHeight: 1.4 }}>
                                  {task.description}
                                </p>
                              </div>
                            </div>

                            {/* Resource / Action Button */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {task.resourceTitle && (
                                <Link to={task.resourceLink || '/student/preparation'} style={{ textDecoration: 'none' }}>
                                  <Button variant="outline" style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem' }}>
                                    {task.resourceTitle} &rarr;
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Regeneration Warning Modal */}
      <Modal
        isOpen={showRegenModal}
        onClose={() => setShowRegenModal(false)}
        title="Regenerate Preparation Roadmap?"
        maxWidth="480px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertTriangle size={22} color="#D4A24C" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#321A2E', margin: 0 }}>
                You have active tasks completed ({roadmap?.completedTasksCount || 0} tasks)
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#746B6D', marginTop: '0.25rem', lineHeight: 1.45 }}>
                Generating a new roadmap will replace your current milestones and recalculate your preparation milestones for <strong>{selectedRole}</strong>.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button variant="outline" onClick={() => setShowRegenModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => handleGenerate(true)}>
              Yes, Generate New Roadmap
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
