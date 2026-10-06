import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { 
  Server, 
  Database, 
  Cpu, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  GraduationCap, 
  Building2, 
  FileText, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Home({ setApiHealth }) {
  const [healthData, setHealthData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, statusRes] = await Promise.all([
        api.get('/health'),
        api.get('/status')
      ]);
      setHealthData(healthRes.data);
      setStatusData(statusRes.data);
      if (setApiHealth) {
        setApiHealth(healthRes.data.status === 'UP');
      }
    } catch (err) {
      console.error('API connection failed:', err);
      setError(err.message || 'Unable to connect to Spring Boot API');
      if (setApiHealth) {
        setApiHealth(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Banner in Deep Plum & Terracotta */}
      <div className="dashboard-hero" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 248, 241, 0.15)', border: '1px solid rgba(255, 248, 241, 0.25)', padding: '0.35rem 1rem', borderRadius: '9999px', marginBottom: '1rem' }}>
          <Sparkles size={16} color="#FFF8F1" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF8F1' }}>Final-Year B.Tech Project Scaffolding</span>
        </div>
        
        <h1 style={{ fontSize: '2.5rem', lineHeight: 1.2, marginBottom: '0.75rem', color: '#FFF8F1' }}>
          Welcome to <span style={{ color: '#D4A24C' }}>PLACIFY</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#F7DDD4', maxWidth: '680px', margin: '0 auto 1.5rem' }}>
          Intelligent Placement Preparation & Tracking Platform with Automated Eligibility Matching & Gemini AI Resume Analysis.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="gold" icon={RefreshCw} onClick={fetchHealth} disabled={loading}>
            {loading ? 'Pinging API...' : 'Test Backend Connection'}
          </Button>
        </div>
      </div>

      {/* Live System Connectivity Cards */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#292326' }}>
            <Server size={20} color="#C65D3A" />
            Phase 1 Infrastructure & Connectivity
          </h2>
          <Badge 
            status={healthData?.status === 'UP' ? 'success' : 'rejected'} 
            text={healthData?.status === 'UP' ? 'SYSTEM OPERATIONAL' : 'DISCONNECTED'} 
          />
        </div>

        {loading ? (
          <Loader message="Querying Spring Boot and MongoDB services..." />
        ) : error ? (
          <div className="card" style={{ borderColor: '#F5CCCC', background: '#FDF2F2' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <AlertCircle size={24} color="#BF3B3B" />
              <div>
                <h4 style={{ color: '#BF3B3B', marginBottom: '0.25rem' }}>Backend Connection Error</h4>
                <p style={{ fontSize: '0.9rem', color: '#746B6D', marginBottom: '0.75rem' }}>{error}</p>
                <p style={{ fontSize: '0.85rem', color: '#8C8385' }}>
                  Make sure the Spring Boot server is running on <code>http://localhost:8080</code> and MongoDB is listening on <code>localhost:27017</code>.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {/* Spring Boot Service Card */}
            <Card title="Spring Boot REST API" subtitle="Port 8080" icon={Server}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="text-secondary">Status</span>
                  <span style={{ color: '#2E7D56', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={14} /> ONLINE
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="text-secondary">App Name</span>
                  <span style={{ fontWeight: 600, color: '#292326' }}>{healthData?.app}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="text-secondary">Version</span>
                  <span style={{ color: '#292326' }}>{healthData?.version}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="text-secondary">CORS Policy</span>
                  <span style={{ color: '#C65D3A' }}>localhost:5173</span>
                </div>
              </div>
            </Card>

            {/* MongoDB Service Card */}
            <Card title="MongoDB Database" subtitle="Port 27017 (placify_db)" icon={Database}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="text-secondary">Database Status</span>
                  <span style={{ 
                    color: healthData?.database === 'CONNECTED' ? '#2E7D56' : '#BF3B3B', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    {healthData?.database === 'CONNECTED' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {healthData?.database}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="text-secondary">Engine</span>
                  <span style={{ color: '#292326' }}>WiredTiger / Local</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="text-secondary">Target Collections</span>
                  <span style={{ color: '#292326' }}>users, drives, apps...</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="text-secondary">Auto-Indexing</span>
                  <span style={{ color: '#2E7D56' }}>Enabled</span>
                </div>
              </div>
            </Card>

            {/* Security & Roles Card */}
            <Card title="Security & Authentication" subtitle="JWT + BCrypt" icon={Shield}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="text-secondary">Auth Strategy</span>
                  <span style={{ fontWeight: 600, color: '#292326' }}>Stateless JWT</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="text-secondary">Password Hash</span>
                  <span style={{ color: '#292326' }}>BCrypt (Strength 10)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="text-secondary">Configured Roles</span>
                  <span style={{ color: '#C65D3A' }}>STUDENT, ADMIN</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="text-secondary">Token Lifespan</span>
                  <span style={{ color: '#292326' }}>24 Hours</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* Planned Modules Overview */}
      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#292326' }}>
          <GraduationCap size={20} color="#C65D3A" />
          Placify Core Modules
        </h2>

        <div className="grid grid-cols-4">
          <Card title="Automated Eligibility" subtitle="Instant rule checking" icon={CheckCircle2}>
            <p style={{ fontSize: '0.85rem', color: '#746B6D' }}>
              Automatically verifies CGPA, Branch, Backlogs, and Technical Skills against drive criteria.
            </p>
          </Card>

          <Card title="Drive Explorer" subtitle="Company management" icon={Building2}>
            <p style={{ fontSize: '0.85rem', color: '#746B6D' }}>
              Centralized placement drives with package (CTC), deadline, and 1-click application submission.
            </p>
          </Card>

          <Card title="Stage Tracker" subtitle="Recruitment pipeline" icon={FileText}>
            <p style={{ fontSize: '0.85rem', color: '#746B6D' }}>
              Live 6-stage recruitment funnel (Applied, Review, Test, Interview, Selected, Rejected) with remarks.
            </p>
          </Card>

          <Card title="AI Resume Analyzer" subtitle="Gemini API" icon={Sparkles}>
            <p style={{ fontSize: '0.85rem', color: '#746B6D' }}>
              Parses PDF resumes, calculates 0-100 readiness score, and identifies critical missing skill gaps.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
