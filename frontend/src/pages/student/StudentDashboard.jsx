import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { driveService } from '../../services/driveService';
import { applicationService } from '../../services/applicationService';
import { quizService } from '../../services/quizService';
import { resumeService } from '../../services/resumeService';
import { roadmapService } from '../../services/roadmapService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import {
  GraduationCap,
  Building2,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Flame,
  Award,
  BookOpen,
  Compass,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [eligibleDrives, setEligibleDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [latestResume, setLatestResume] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [profData, drivesData, appsData, attemptsData, resumeData, roadmapData] = await Promise.all([
        studentService.getProfile().catch(() => null),
        driveService.getEligibleDrives().catch(() => []),
        applicationService.getMyApplications().catch(() => []),
        quizService.getMyAttempts().catch(() => []),
        resumeService.getLatest().catch(() => null),
        roadmapService.getCurrentRoadmap().catch(() => null)
      ]);

      setProfile(profData);
      setEligibleDrives(drivesData || []);
      setApplications(appsData || []);
      setQuizAttempts(attemptsData || []);
      setLatestResume(resumeData);
      setRoadmap(roadmapData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading your placement dashboard..." />;
  }

  const eligibleCount = eligibleDrives.filter(d => d.eligibility?.eligible).length;
  const activeAppsCount = applications.filter(a => a.status !== 'REJECTED' && a.status !== 'SELECTED').length;
  const selectedCount = applications.filter(a => a.status === 'SELECTED').length;
  const completionPct = profile?.profileCompletionPercentage || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Welcome Hero Banner in Deep Plum & Terracotta */}
      <div className="dashboard-hero" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        padding: '2.25rem 2.5rem'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255, 248, 241, 0.15)',
            border: '1px solid rgba(255, 248, 241, 0.25)',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            color: '#FFF8F1',
            fontSize: '0.74rem',
            fontWeight: 700,
            marginBottom: '0.65rem',
            textTransform: 'uppercase'
          }}>
            <Sparkles size={13} color="#D4A24C" /> CAMPUS PLACEMENTS 2026-2027
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF8F1', margin: 0 }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ color: '#F7DDD4', fontSize: '0.92rem', marginTop: '0.35rem', fontWeight: 500 }}>
            <strong>{profile?.department || 'Information Technology'}</strong> &bull; Roll: <span style={{ color: '#FFF8F1', fontWeight: 700 }}>{profile?.rollNumber || '23BQ1A1228'}</span> &bull; CGPA: <span style={{ color: '#D4A24C', fontWeight: 800 }}>{profile?.cgpa ? profile.cgpa.toFixed(2) : '8.85'}</span>
          </p>
        </div>

        {/* Profile Completion Card */}
        <div style={{
          background: 'rgba(255, 248, 241, 0.12)',
          backdropFilter: 'blur(8px)',
          padding: '1.15rem 1.4rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 248, 241, 0.22)',
          minWidth: '260px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', marginBottom: '0.4rem' }}>
            <span style={{ color: '#F7DDD4', fontWeight: 600 }}>Profile Strength</span>
            <span style={{ fontWeight: 800, color: completionPct >= 80 ? '#D4A24C' : '#FFF8F1', fontSize: '1.05rem' }}>
              {completionPct}%
            </span>
          </div>
          <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.18)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${completionPct}%`, background: '#D4A24C', borderRadius: '4px', transition: 'width 0.5s ease' }} />
          </div>
          {completionPct < 100 ? (
            <Link to="/student/profile" style={{ fontSize: '0.78rem', color: '#FFF8F1', textDecoration: 'none', display: 'inline-block', marginTop: '0.45rem', fontWeight: 700 }}>
              Complete profile details &rarr;
            </Link>
          ) : (
            <span style={{ fontSize: '0.74rem', color: '#D4A24C', display: 'inline-block', marginTop: '0.4rem', fontWeight: 700 }}>
              ✓ Fully Verified for Placements
            </span>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-4">
        <Card
          title="Eligible Drives"
          subtitle="Ready for application"
          icon={Building2}
        >
          <div className="stat-card-value" style={{ color: '#C65D3A' }}>{eligibleCount}</div>
          <span style={{ fontSize: '0.8rem', color: '#746B6D' }}>Matching your CGPA & branch</span>
        </Card>

        <Card
          title="My Applications"
          subtitle="Active recruitment funnels"
          icon={FileCheck}
        >
          <div className="stat-card-value" style={{ color: '#292326' }}>{applications.length}</div>
          <span style={{ fontSize: '0.8rem', color: '#D4A24C', fontWeight: 600 }}>{activeAppsCount} active in review</span>
        </Card>

        <Card
          title="Placement Status"
          subtitle="Offer outcomes"
          icon={GraduationCap}
        >
          <div className="stat-card-value" style={{ color: selectedCount > 0 ? '#2E7D56' : '#292326' }}>
            {selectedCount > 0 ? `${selectedCount} Selected` : 'Active'}
          </div>
          <span style={{ fontSize: '0.8rem', color: selectedCount > 0 ? '#2E7D56' : '#746B6D' }}>
            {selectedCount > 0 ? 'Offer letter extended!' : 'Recruitment in progress'}
          </span>
        </Card>

        <Card
          title="AI Resume Score"
          subtitle="Gemini ATS Engine"
          icon={Sparkles}
        >
          <div className="stat-card-value" style={{ color: latestResume?.overallScore >= 80 ? '#D4A24C' : '#C65D3A' }}>
            {latestResume ? `${latestResume.overallScore}/100` : '90/100'}
          </div>
          <Link to="/student/resume-analyzer" style={{ fontSize: '0.8rem', color: '#C65D3A', textDecoration: 'none', fontWeight: 700 }}>
            {latestResume ? 'View feedback report &rarr;' : 'Analyze new resume &rarr;'}
          </Link>
        </Card>
      </div>

      {/* Featured Core Feature: Personalized Preparation Roadmap Banner */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E8DAD4',
        borderLeft: '4px solid #C65D3A',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(41, 35, 38, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '300px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: '#FBE9DF',
            border: '1px solid #E8DAD4',
            color: '#C65D3A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Compass size={24} color="#C65D3A" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.7rem', background: '#FDF4EC', border: '1px solid #E8DAD4', color: '#C65D3A', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 800 }}>
                AI-POWERED ROADMAP
              </span>
              {roadmap && (
                <span style={{ fontSize: '0.75rem', color: '#D4A24C', fontWeight: 700 }}>
                  Target: {roadmap.targetRole}
                </span>
              )}
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#292326', marginTop: '0.2rem' }}>
              Personalized Preparation Roadmap
            </h3>
            <p style={{ color: '#746B6D', fontSize: '0.85rem', marginTop: '0.15rem' }}>
              {roadmap 
                ? `Current Focus: ${roadmap.currentFocus || 'Core Concepts'} • Next: ${roadmap.nextRecommendedActivity || 'Practice Questions'}`
                : 'Generate a customized multi-week preparation plan tailored to your live skill profile and target dream company.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {roadmap && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#2E7D56' }}>
                {roadmap.completionPercentage || 0}%
              </div>
              <span style={{ fontSize: '0.74rem', color: '#746B6D' }}>
                {roadmap.completedTasksCount || 0}/{roadmap.totalTasksCount || 0} tasks
              </span>
            </div>
          )}
          <Link to="/student/roadmap" style={{ textDecoration: 'none' }}>
            <Button variant="primary" icon={Compass} style={{ padding: '0.6rem 1.15rem', fontWeight: 700 }}>
              {roadmap ? 'Continue Preparation' : 'Generate Roadmap'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Recommended & Eligible Drives */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#292326' }}>
              <Flame size={20} color="#C65D3A" />
              Top Matching Company Drives
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#746B6D' }}>
              Drives matching your branch ({profile?.department || 'IT'}) and minimum CGPA criteria
            </span>
          </div>
          <Link to="/student/drives" style={{ color: '#C65D3A', fontSize: '0.86rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View all drives <ArrowRight size={15} />
          </Link>
        </div>

        {eligibleDrives.length === 0 ? (
          <Card hover={false}>
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#746B6D' }}>
              No placement drives currently active. Check back soon!
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-3">
            {eligibleDrives.slice(0, 3).map(({ drive, eligibility }) => (
              <Card key={drive.id} className="card-hover">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#292326' }}>{drive.companyName}</h4>
                    <span style={{ fontSize: '0.84rem', color: '#C65D3A', fontWeight: 600 }}>{drive.role}</span>
                  </div>
                  <Badge variant={eligibility?.eligible ? 'success' : 'danger'}>
                    {eligibility?.eligible ? 'ELIGIBLE' : 'INELIGIBLE'}
                  </Badge>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0.75rem 0', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#746B6D' }}>Package (CTC):</span>
                    <strong style={{ color: '#D4A24C', fontSize: '0.9rem' }}>{drive.packageCtc}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#746B6D' }}>Drive Date:</span>
                    <span style={{ color: '#3F373A' }}>{drive.driveDate || 'TBD'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#746B6D' }}>Eligibility Match:</span>
                    <strong style={{ color: '#2E7D56' }}>{eligibility?.matchPercentage}%</strong>
                  </div>
                </div>

                <Link to={`/student/drives`} style={{ textDecoration: 'none' }}>
                  <Button variant="primary" style={{ width: '100%', fontSize: '0.82rem', padding: '0.5rem' }}>
                    View & Apply Now
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Applications & Quick Prep Links */}
      <div className="grid grid-cols-2">
        {/* Recent Applications Status */}
        <Card title="Live Application Timeline" subtitle="Recruitment funnel updates" icon={FileCheck}>
          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#746B6D', fontSize: '0.88rem' }}>
              You have not applied for any company drives yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {applications.slice(0, 4).map(app => (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: '#FDF4EC', borderRadius: '8px', border: '1px solid #E8DAD4' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#292326' }}>{app.companyName}</div>
                    <div style={{ fontSize: '0.76rem', color: '#746B6D' }}>{app.driveRole}</div>
                  </div>
                  <Badge status={app.status} />
                </div>
              ))}
              <Link to="/student/applications" style={{ textAlign: 'center', fontSize: '0.82rem', color: '#C65D3A', textDecoration: 'none', fontWeight: 700, marginTop: '0.35rem' }}>
                Open detailed stage tracker &rarr;
              </Link>
            </div>
          )}
        </Card>

        {/* Quick Quiz & Prep Assessment */}
        <Card title="Assessment & Preparation Center" subtitle="Practice test scorecards" icon={BookOpen}>
          {quizAttempts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#746B6D', fontSize: '0.88rem' }}>
              Practice mock assessment tests to sharpen your technical aptitude!
              <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <Link to="/student/preparation" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}>
                    Open Preparation Hub
                  </Button>
                </Link>
                <Link to="/student/quizzes" style={{ textDecoration: 'none' }}>
                  <Button variant="outline" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}>
                    Take Practice Quiz
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {quizAttempts.slice(0, 3).map(att => (
                <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: '#FDF4EC', borderRadius: '8px', border: '1px solid #E8DAD4' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#292326' }}>{att.quizTitle}</div>
                    <div style={{ fontSize: '0.76rem', color: '#746B6D' }}>{att.quizCategory} &bull; Score: <strong style={{ color: '#2E7D56' }}>{att.percentage}%</strong></div>
                  </div>
                  <Badge variant={att.passed ? 'success' : 'danger'}>
                    {att.passed ? 'PASSED' : 'NEEDS PRACTICE'}
                  </Badge>
                </div>
              ))}
              <Link to="/student/quizzes" style={{ textAlign: 'center', fontSize: '0.82rem', color: '#C65D3A', textDecoration: 'none', fontWeight: 700, marginTop: '0.35rem' }}>
                Take another timed assessment &rarr;
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
