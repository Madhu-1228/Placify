import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  Briefcase,
  GraduationCap,
  Download,
  FileCheck,
  Building2,
  Layers,
  Sparkles,
  Flame,
  Award,
  Zap,
  Activity,
  Compass
} from 'lucide-react';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
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

  const handleExportSummary = () => {
    const jsonStr = JSON.stringify(stats, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vvitu-placement-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  if (loading) {
    return <Loader message="Computing placement intelligence analytics..." />;
  }

  // Analytics Data for Graphs
  const branchData = [
    { branch: 'CSE', full: 'Computer Science and Engineering', rate: 96, offers: 18, color: '#C65D3A' },
    { branch: 'IT', full: 'Information Technology', rate: 94, offers: 12, color: '#8C4F6E' },
    { branch: 'AI&DS', full: 'Artificial Intelligence and Data Science', rate: 91, offers: 8, color: '#D4A24C' },
    { branch: 'ECE', full: 'Electronics and Communication Engineering', rate: 88, offers: 6, color: '#AE4D2C' },
    { branch: 'EEE', full: 'Electrical and Electronics Engineering', rate: 82, offers: 3, color: '#2E7D56' },
    { branch: 'MECH', full: 'Mechanical Engineering', rate: 76, offers: 2, color: '#BF3B3B' },
    { branch: 'CIVIL', full: 'Civil Engineering', rate: 72, offers: 1, color: '#746B6D' },
  ];

  const packageTiers = [
    { tier: 'Super Dream', range: '20+ LPA', count: 8, share: 16, color: '#C65D3A', desc: 'Amazon, Google, Goldman Sachs, Oracle' },
    { tier: 'Dream Tier', range: '10 - 20 LPA', count: 16, share: 32, color: '#D4A24C', desc: 'Cisco, Microsoft, ServiceNow, Salesforce' },
    { tier: 'Prime Core', range: '6 - 10 LPA', count: 20, share: 40, color: '#8C4F6E', desc: 'SHNOOR, TCS Prime, Cognizant GenC, Accenture' },
    { tier: 'Standard Mass', range: '4 - 6 LPA', count: 6, share: 12, color: '#2E7D56', desc: 'Wipro Elite, Infosys, Capgemini' },
  ];

  const monthlyHiring = [
    { month: 'Aug 2026', applications: 24, selections: 5, label: 'August' },
    { month: 'Sep 2026', applications: 38, selections: 11, label: 'September' },
    { month: 'Oct 2026', applications: 54, selections: 18, label: 'October (Peak)' },
    { month: 'Nov 2026', applications: 42, selections: 12, label: 'November' },
    { month: 'Dec 2026', applications: 20, selections: 4, label: 'December' },
  ];

  const topRecruiters = [
    { company: 'Amazon Web Services', ctc: '44.0 LPA', offers: 3, role: 'Cloud Support Associate', logo: 'AWS' },
    { company: 'Google India', ctc: '32.0 LPA', offers: 2, role: 'Software Engineer', logo: 'GOOG' },
    { company: 'Goldman Sachs', ctc: '30.0 LPA', offers: 2, role: 'Summer Analyst / SDE', logo: 'GS' },
    { company: 'Microsoft India', ctc: '28.0 LPA', offers: 3, role: 'Software Engineer - Azure', logo: 'MSFT' },
    { company: 'Oracle Cloud', ctc: '22.5 LPA', offers: 4, role: 'Member Technical Staff', logo: 'ORCL' },
    { company: 'Cisco Systems', ctc: '18.0 LPA', offers: 5, role: 'Software Engineer - Security', logo: 'CSCO' },
    { company: 'SHNOOR Assessment', ctc: '8.5 LPA', offers: 14, role: 'Associate Software Engineer', logo: 'SHNR' },
    { company: 'Tata Consultancy Services', ctc: '9.0 LPA', offers: 17, role: 'TCS Prime & Digital', logo: 'TCS' },
  ];

  const skillHeatmap = [
    { skill: 'Java & Spring Boot', demand: 96, color: '#C65D3A' },
    { skill: 'React & Full-Stack', demand: 92, color: '#8C4F6E' },
    { skill: 'SQL & Database Architecture', demand: 88, color: '#D4A24C' },
    { skill: 'Data Structures & Algorithms', demand: 85, color: '#2E7D56' },
    { skill: 'AWS Cloud & DevOps', demand: 80, color: '#AE4D2C' },
    { skill: 'AI, Machine Learning & Python', demand: 78, color: '#321A2E' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#321A2E', letterSpacing: '-0.02em' }}>
            Campus Placement Analytics & Insights
          </h1>
          <p style={{ color: '#746B6D', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Executive intelligence on cohort recruitment conversions, department performance, and drive outcomes
          </p>
        </div>

        <Button variant="primary" icon={Download} onClick={handleExportSummary} style={{ padding: '0.55rem 1.15rem' }}>
          Export Analytics JSON
        </Button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-4" style={{ gap: '1rem' }}>
        <Card title="Candidate Pool" icon={Users}>
          <div className="stat-card-value" style={{ color: '#292326' }}>{stats?.totalStudents || 52}</div>
          <span style={{ fontSize: '0.8rem', color: '#746B6D' }}>Verified student records</span>
        </Card>

        <Card title="Recruitment Drives" icon={Briefcase}>
          <div className="stat-card-value" style={{ color: '#C65D3A' }}>{stats?.totalDrives || 8}</div>
          <span style={{ fontSize: '0.8rem', color: '#2E7D56', fontWeight: 650 }}>{stats?.activeDrives || 5} Active Drives</span>
        </Card>

        <Card title="Total Submissions" icon={FileCheck}>
          <div className="stat-card-value" style={{ color: '#D4A24C' }}>{stats?.totalApplications || 14}</div>
          <span style={{ fontSize: '0.8rem', color: '#746B6D' }}>Across all companies</span>
        </Card>

        <Card title="Placement Conversion" icon={GraduationCap}>
          <div className="stat-card-value" style={{ color: '#2E7D56' }}>
            {stats?.placementPercentage || 88}%
          </div>
          <span style={{ fontSize: '0.8rem', color: '#2E7D56', fontWeight: 700 }}>
            {stats?.selectedStudents || 12} Confirmed Offers
          </span>
        </Card>
      </div>

      {/* Visual Analytics Graphs Section */}
      <div className="grid grid-cols-2" style={{ gap: '1.25rem' }}>
        {/* Graph 1: Branch-wise Placement Rate Bar Chart */}
        <Card
          title="Branch-wise Placement Statistics"
          subtitle="Recruitment conversion rate across engineering departments"
          icon={BarChart3}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.35rem' }}>
            {branchData.map(b => (
              <div key={b.branch} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <strong style={{ color: '#292326', minWidth: '45px' }}>{b.branch}</strong>
                    <span style={{ color: '#746B6D', fontSize: '0.76rem' }}>{b.full}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#746B6D' }}>{b.offers} offers</span>
                    <strong style={{ color: b.color, fontSize: '0.88rem', minWidth: '38px', textAlign: 'right' }}>{b.rate}%</strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ height: '8px', background: '#E8DAD4', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${b.rate}%`,
                      background: b.color,
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Graph 2: CTC Package Tier Distribution */}
        <Card
          title="CTC Package Tier Distribution"
          subtitle="Salary breakdown across recruited candidate tiers"
          icon={PieChart}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.35rem' }}>
            {packageTiers.map(t => (
              <div key={t.tier} style={{ background: '#FDF4EC', padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid #E8DAD4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.color }} />
                    <strong style={{ color: '#292326', fontSize: '0.88rem' }}>{t.tier}</strong>
                    <span style={{ fontSize: '0.76rem', color: t.color, fontWeight: 700 }}>({t.range})</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#292326', fontSize: '0.88rem' }}>{t.share}%</strong>
                    <span style={{ fontSize: '0.76rem', color: '#746B6D', marginLeft: '4px' }}>({t.count} offers)</span>
                  </div>
                </div>

                <div style={{ height: '6px', background: '#E8DAD4', borderRadius: '3px', overflow: 'hidden', margin: '0.25rem 0' }}>
                  <div style={{ height: '100%', width: `${t.share}%`, background: t.color, borderRadius: '3px' }} />
                </div>

                <div style={{ fontSize: '0.74rem', color: '#746B6D' }}>
                  {t.desc}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Monthly Trajectory & Top Recruiters Leaderboard */}
      <div className="grid grid-cols-2" style={{ gap: '1.25rem' }}>
        {/* Graph 3: Monthly Recruitment Wave Trend */}
        <Card
          title="Placement Season Timeline & Momentum"
          subtitle="Applications vs offers extended over seasonal hiring cycles"
          icon={TrendingUp}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: '10px', height: '4px', background: '#C65D3A', borderRadius: '2px' }} />
                <span style={{ color: '#746B6D' }}>Submissions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: '10px', height: '4px', background: '#2E7D56', borderRadius: '2px' }} />
                <span style={{ color: '#746B6D' }}>Offers</span>
              </div>
            </div>

            {monthlyHiring.map(m => (
              <div key={m.month} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <strong style={{ color: '#292326' }}>{m.label}</strong>
                  <span style={{ color: '#2E7D56', fontWeight: 700 }}>{m.selections} Hires / {m.applications} Applicants</span>
                </div>

                <div style={{ display: 'flex', gap: '3px', height: '7px' }}>
                  <div style={{ width: `${(m.applications / 60) * 100}%`, background: '#C65D3A', borderRadius: '3px' }} />
                  <div style={{ width: `${(m.selections / 20) * 100}%`, background: '#2E7D56', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Graph 4: Skill Demand Matrix */}
        <Card
          title="Recruiter Skill Demand Index"
          subtitle="Most required technical proficiencies in active campus job descriptions"
          icon={Zap}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.35rem' }}>
            {skillHeatmap.map(s => (
              <div key={s.skill} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                  <span style={{ color: '#292326', fontWeight: 600 }}>{s.skill}</span>
                  <strong style={{ color: s.color }}>{s.demand}% Demand</strong>
                </div>

                <div style={{ height: '7px', background: '#E8DAD4', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.demand}%`, background: s.color, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Campus Recruiters Table */}
      <Card
        title="Top Recruiting Companies & Offer Distribution"
        subtitle="Leading campus recruitment partners for 2026 batch"
        icon={Building2}
      >
        <div style={{ overflowX: 'auto', marginTop: '0.35rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#FDF4EC', borderBottom: '1px solid #E8DAD4', textAlign: 'left' }}>
                <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Recruiting Enterprise</th>
                <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Designation / Role</th>
                <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Package (CTC)</th>
                <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Offers Extended</th>
                <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Drive Status</th>
              </tr>
            </thead>
            <tbody>
              {topRecruiters.map(r => (
                <tr key={r.company} style={{ borderBottom: '1px solid #E8DAD4' }}>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: '#FDF4EC',
                        border: '1px solid #E8DAD4',
                        color: '#C65D3A',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {r.logo}
                      </div>
                      <strong style={{ color: '#292326' }}>{r.company}</strong>
                    </div>
                  </td>
                  <td style={{ padding: '0.65rem 1rem', color: '#3F373A' }}>{r.role}</td>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <strong style={{ color: '#D4A24C' }}>{r.ctc}</strong>
                  </td>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <strong style={{ color: '#C65D3A' }}>{r.offers} Hires</strong>
                  </td>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <Badge status="OPEN" text="ACTIVE PARTNER" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
