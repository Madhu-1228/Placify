import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import Alert from '../../components/common/Alert';
import {
  LogIn,
  Shield,
  GraduationCap,
  Sparkles,
  UserCheck,
  Eye,
  EyeOff,
  User,
  Lock,
  Layers
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Active Login Mode: 'student' | 'admin'
  const [loginMode, setLoginMode] = useState('student');

  const [email, setEmail] = useState('MadhuD');
  const [password, setPassword] = useState('Madhu@300526');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      login(data.token, data);
      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials. Please verify your login details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillStudent = () => {
    setEmail('MadhuD');
    setPassword('Madhu@300526');
    setLoginMode('student');
  };

  const handleQuickFillAdmin = () => {
    setEmail('vvitu@cds.edu');
    setPassword('Admin@123456');
    setLoginMode('admin');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      backgroundColor: '#FFF8F1',
      backgroundImage: 'linear-gradient(180deg, #FFF8F1 0%, #FBE9DF 100%)'
    }}>
      {/* 2-Column Responsive Container */}
      <div style={{
        width: '100%',
        maxWidth: '1020px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '3.5rem',
        alignItems: 'center'
      }}>
        {/* Left Column: College Emblem & Brand Hero */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Logo */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: 'fit-content'
          }}>
            <img
              src="/vvit-logo.png"
              alt="VVIT University"
              style={{
                height: '75px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>

          {/* Ecosystem Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: '#FBE9DF',
            border: '1px solid #E8DAD4',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            color: '#C65D3A',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            width: 'fit-content'
          }}>
            <Sparkles size={14} color="#C65D3A" /> VVITU PLACEMENT ECOSYSTEM – CLASS OF 2027
          </div>

          {/* Title & Tagline */}
          <div>
            <h1 style={{
              fontSize: '3.2rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#321A2E',
              lineHeight: 1.1
            }}>
              PLACIFY
            </h1>

            <p style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              color: '#746B6D',
              marginTop: '0.5rem',
              lineHeight: 1.4
            }}>
              Intelligent Placement Preparation &{' '}
              <span style={{ color: '#C65D3A' }}>Tracking Platform</span>
            </p>

            {/* Accent Divider */}
            <div style={{
              height: '3px',
              width: '80px',
              background: '#C65D3A',
              borderRadius: '2px',
              marginTop: '1rem'
            }} />
          </div>
        </div>

        {/* Right Column: Main Login Card */}
        <div>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E8DAD4',
            borderRadius: '16px',
            padding: '2.25rem',
            boxShadow: '0 8px 24px -4px rgba(50, 26, 46, 0.08)'
          }}>
            {/* Segmented Switch Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.35rem',
              background: '#FDF4EC',
              padding: '0.3rem',
              borderRadius: '9999px',
              marginBottom: '1.25rem',
              border: '1px solid #E8DAD4'
            }}>
              <button
                type="button"
                onClick={() => { setLoginMode('student'); setError(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 0.5rem',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  transition: 'all 0.15s ease',
                  background: loginMode === 'student' ? '#C65D3A' : 'transparent',
                  color: loginMode === 'student' ? '#FFF8F1' : '#746B6D',
                  boxShadow: loginMode === 'student' ? '0 2px 6px rgba(198, 93, 58, 0.3)' : 'none'
                }}
              >
                <GraduationCap size={17} /> Student Portal
              </button>

              <button
                type="button"
                onClick={() => { setLoginMode('admin'); setError(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 0.5rem',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  transition: 'all 0.15s ease',
                  background: loginMode === 'admin' ? '#C65D3A' : 'transparent',
                  color: loginMode === 'admin' ? '#FFF8F1' : '#746B6D',
                  boxShadow: loginMode === 'admin' ? '0 2px 6px rgba(198, 93, 58, 0.3)' : 'none'
                }}
              >
                <Shield size={17} /> Placement Officer
              </button>
            </div>

            {/* Mode Context Notice */}
            <div style={{
              background: '#FBE9DF',
              border: '1px solid #E8DAD4',
              padding: '0.55rem 0.85rem',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {loginMode === 'student' ? (
                <>
                  <GraduationCap size={16} color="#C65D3A" />
                  <span style={{ fontSize: '0.82rem', color: '#321A2E', fontWeight: 600 }}>
                    Student login: Access drives, assessments & track offers
                  </span>
                </>
              ) : (
                <>
                  <Shield size={16} color="#C65D3A" />
                  <span style={{ fontSize: '0.82rem', color: '#321A2E', fontWeight: 600 }}>
                    Officer login: Manage drives, students & review applications
                  </span>
                </>
              )}
            </div>

            <Alert type="error" message={error} onClose={() => setError(null)} />

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 650, color: '#292326' }}>
                  {loginMode === 'student' ? 'Student Username or College Email' : 'Placement Officer Email'}
                </label>
                <input
                  type="text"
                  placeholder={loginMode === 'student' ? 'e.g. MadhuD or 23BQ1A1228@vvit.net' : 'e.g. vvitu@cds.edu'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1px solid #E8DAD4',
                    borderRadius: '10px',
                    padding: '0.65rem 0.85rem',
                    color: '#292326',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    outline: 'none',
                    transition: 'border-color 0.18s ease, box-shadow 0.18s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#C65D3A';
                    e.target.style.boxShadow = '0 0 0 3px rgba(198, 93, 58, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E8DAD4';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 650, color: '#292326' }}>
                  Account Password
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #E8DAD4',
                      borderRadius: '10px',
                      padding: '0.65rem 2.5rem 0.65rem 0.85rem',
                      color: '#292326',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      outline: 'none',
                      transition: 'border-color 0.18s ease, box-shadow 0.18s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#C65D3A';
                      e.target.style.boxShadow = '0 0 0 3px rgba(198, 93, 58, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E8DAD4';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#746B6D',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px'
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.75rem',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: '#C65D3A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 2px 6px rgba(198, 93, 58, 0.25)',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = '#AE4D2C'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.background = '#C65D3A'; e.currentTarget.style.transform = 'none'; } }}
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn size={17} /> Sign In to {loginMode === 'student' ? 'Student Portal' : 'Placement Cell'}
                  </>
                )}
              </button>
            </form>

            {/* Quick-Fill Helpers */}
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #E8DAD4',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#746B6D', textTransform: 'uppercase', fontWeight: 700 }}>
                  ONE-CLICK QUICK LOGIN
                </span>
                <span style={{ fontSize: '0.72rem', color: '#C65D3A', fontWeight: 700 }}>
                  Demo Credentials
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleQuickFillStudent}
                  style={{
                    background: '#FDF4EC',
                    border: '1px solid #E8DAD4',
                    color: '#292326',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FBE9DF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FDF4EC'; }}
                >
                  <UserCheck size={14} color="#C65D3A" /> MadhuD (Student)
                </button>

                <button
                  type="button"
                  onClick={handleQuickFillAdmin}
                  style={{
                    background: '#FDF4EC',
                    border: '1px solid #E8DAD4',
                    color: '#292326',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FBE9DF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FDF4EC'; }}
                >
                  <Shield size={14} color="#D4A24C" /> VVITU CDS (Officer)
                </button>
              </div>
            </div>

            {/* Student Registration Footer */}
            <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.84rem', color: '#746B6D' }}>
              New Student at VVITU?{' '}
              <Link to="/register" style={{ color: '#C65D3A', fontWeight: 700, textDecoration: 'none' }}>
                Create Student Account &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
