import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import Card from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Layers, UserPlus } from 'lucide-react';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.register(name, email, password);
      login(data.token, data);
      navigate('/student/profile');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      backgroundColor: '#FFF8F1',
      backgroundImage: 'linear-gradient(180deg, #FFF8F1 0%, #FBE9DF 100%)'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            background: '#321A2E',
            color: '#E9826E',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem',
            boxShadow: '0 2px 6px rgba(50, 26, 46, 0.25)'
          }}>
            <Layers size={22} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#321A2E' }}>Create Student Account</h2>
          <p style={{ color: '#746B6D', fontSize: '0.86rem', marginTop: '0.2rem' }}>
            Register your profile to begin placement tracking
          </p>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E8DAD4',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 24px -4px rgba(50, 26, 46, 0.08)'
        }}>
          <Alert type="error" message={error} onClose={() => setError(null)} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Input
              label="Full Name"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Institutional Email"
              type="email"
              placeholder="e.g. 23BQ1A0501@vvit.net"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              icon={UserPlus}
              disabled={loading}
              style={{ width: '100%', marginTop: '0.75rem' }}
            >
              {loading ? 'Creating Account...' : 'Register as Student'}
            </Button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.84rem', color: '#746B6D' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#C65D3A', fontWeight: 700, textDecoration: 'none' }}>
              Sign In &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
