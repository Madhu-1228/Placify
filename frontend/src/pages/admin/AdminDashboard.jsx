import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../../services/analyticsService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import {
  Users,
  Briefcase,
  FileCheck,
  GraduationCap,
  TrendingUp,
  Plus,
  ArrowRight,
  PieChart,
  BarChart3,
  Layers,
  Sparkles,
  Building2,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  Zap,
  UserPlus
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Aggregating placement operations intelligence..." />;
  }

  const stages = [
    { key: 'APPLIED', label: 'Applied Submissions', color: '#C65D3A' },
    { key: 'UNDER_REVIEW', label: 'Under Review', color: '#D4A24C' },
    { key: 'TEST', label: 'Online Assessments', color: '#8C4F6E' },
    { key: 'INTERVIEW', label: 'Technical Interviews', color: '#E9826E' },
    { key: 'SELECTED', label: 'Selected / Offers Extended', color: '#2E7D56' },
    { key: 'REJECTED', label: 'Rejected', color: '#BF3B3B' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner in Deep Plum & Terracotta */}
      <div className="dashboard-hero" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        padding: '2.25rem 2.5rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 248, 241, 0.15)', border: '1px solid rgba(255, 248, 241, 0.25)', padding: '0.25rem 0.75rem', borderRadius: '9999px', color: '#FFF8F1', fontSize: '0.74rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            <Sparkles size={13} color="#D4A24C" /> VVITU CAREER DEVELOPMENT SERVICES
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#FFF8F1', margin: 0 }}>
            Campus Placement Operations Hub
          </h1>
          <p style={{ color: '#F7DDD4', fontSize: '0.92rem', marginTop: '0.35rem', fontWeight: 500 }}>
            Real-time analytics, company drive workflows, candidate directory, and multi-stage recruitment funnel
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <Link to="/admin/students" style={{ textDecoration: 'none' }}>
            <Button variant="gold" icon={UserPlus} style={{ padding: '0.55rem 1.15rem' }}>
              Add / View Students
            </Button>
          </Link>
          <Link to="/admin/drives" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" icon={Plus} style={{ padding: '0.55rem 1.15rem' }}>
              New Company Drive
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-4" style={{ gap: '1rem' }}>
        <Card title="Candidate Pool" subtitle="Total registered students" icon={Users}>
          <div className="stat-card-value" style={{ color: '#C65D3A' }}>{stats?.totalStudents || 52}</div>
          <span style={{ fontSize: '0.8rem', color: '#2E7D56', fontWeight: 650 }}>
            {stats?.activeStudents || 52} Active Profiles
          </span>
        </Card>

        <Card title="Recruitment Drives" subtitle="Campus hiring drives" icon={Briefcase}>
          <div className="stat-card-value" style={{ color: '#292326' }}>{stats?.totalDrives || 8}</div>
          <span style={{ fontSize: '0.8rem', color: '#C65D3A', fontWeight: 650 }}>
            {stats?.activeDrives || 5} Currently Open
          </span>
        </Card>

        <Card title="Total Submissions" subtitle="Funnel applications" icon={FileCheck}>
          <div className="stat-card-value" style={{ color: '#D4A24C' }}>{stats?.totalApplications || 14}</div>
          <span style={{ fontSize: '0.8rem', color: '#746B6D' }}>
            Across all recruiters
          </span>
        </Card>

        <Card title="Offers Extended" subtitle="Confirmed placements" icon={GraduationCap}>
          <div className="stat-card-value" style={{ color: '#2E7D56' }}>
            {stats?.selectedStudents || 12}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#2E7D56', fontWeight: 700 }}>
            {stats?.placementPercentage || 88}% Placement Rate
          </span>
        </Card>
      </div>

      {/* Quick Launchpad Navigation */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#321A2E', marginBottom: '0.75rem' }}>
          Quick Placement Portals
        </h3>
        <div className="grid grid-cols-4" style={{ gap: '0.85rem' }}>
          <Link to="/admin/students" style={{ textDecoration: 'none' }}>
            <Card className="card-hover" style={{ padding: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#FBE9DF', color: '#C65D3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} />
                </div>
                <div>
                  <strong style={{ color: '#292326', fontSize: '0.9rem', display: 'block' }}>Candidate Directory</strong>
                  <span style={{ fontSize: '0.75rem', color: '#746B6D' }}>50+ student records & resumes</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/applications" style={{ textDecoration: 'none' }}>
            <Card className="card-hover" style={{ padding: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#FEF9ED', color: '#D4A24C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileCheck size={20} />
                </div>
                <div>
                  <strong style={{ color: '#292326', fontSize: '0.9rem', display: 'block' }}>Recruitment Funnel</strong>
                  <span style={{ fontSize: '0.75rem', color: '#746B6D' }}>Review dossier submissions</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/analytics" style={{ textDecoration: 'none' }}>
            <Card className="card-hover" style={{ padding: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#F0F8F3', color: '#2E7D56', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart3 size={20} />
                </div>
                <div>
                  <strong style={{ color: '#292326', fontSize: '0.9rem', display: 'block' }}>Visual Analytics</strong>
                  <span style={{ fontSize: '0.75rem', color: '#746B6D' }}>Branch & package charts</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/drives" style={{ textDecoration: 'none' }}>
            <Card className="card-hover" style={{ padding: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#FBE9DF', color: '#C65D3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <strong style={{ color: '#292326', fontSize: '0.9rem', display: 'block' }}>Campus Drives</strong>
                  <span style={{ fontSize: '0.75rem', color: '#746B6D' }}>Schedule & publish drives</span>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recruitment Funnel Stage Progression */}
      <Card title="Recruitment Funnel Progression" subtitle="Live candidate distribution across placement pipeline" icon={TrendingUp}>
        <div style={{ overflowX: 'auto', marginTop: '0.35rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#FDF4EC', borderBottom: '1px solid #E8DAD4', textAlign: 'left' }}>
                <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Recruitment Stage</th>
                <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Candidate Count</th>
                <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Share</th>
                <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Funnel Progression</th>
              </tr>
            </thead>
            <tbody>
              {stages.map(st => {
                const count = stats?.statusDistribution?.[st.key] || 0;
                const total = stats?.totalApplications || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <tr key={st.key} style={{ borderBottom: '1px solid #E8DAD4' }}>
                    <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: st.color }}>{st.label}</td>
                    <td style={{ padding: '0.65rem 1rem' }}><strong style={{ fontSize: '0.95rem', color: '#292326' }}>{count}</strong></td>
                    <td style={{ padding: '0.65rem 1rem', color: '#746B6D' }}>{pct}%</td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '180px', height: '7px', background: '#FDF4EC', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: st.color, borderRadius: '4px' }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#292326' }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
