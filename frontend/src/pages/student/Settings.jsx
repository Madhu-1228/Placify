import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import Card from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Lock, ShieldCheck, User } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: 'Password successfully updated!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '680px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#321A2E' }}>Account & Security Settings</h1>
        <p style={{ color: '#746B6D', fontSize: '0.88rem' }}>
          Manage your credentials and institutional authentication preferences
        </p>
      </div>

      <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />

      {/* Account Info */}
      <Card title="User Account Information" icon={User}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.86rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E8DAD4', paddingBottom: '0.45rem' }}>
            <span style={{ color: '#746B6D' }}>Registered Name:</span>
            <strong style={{ color: '#292326' }}>{user?.name}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E8DAD4', paddingBottom: '0.45rem' }}>
            <span style={{ color: '#746B6D' }}>Email Address:</span>
            <strong style={{ color: '#292326' }}>{user?.email}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#746B6D' }}>Institutional Role:</span>
            <strong style={{ color: '#C65D3A' }}>{user?.role}</strong>
          </div>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card title="Update Password" subtitle="Ensure your account is protected" icon={Lock}>
        <form onSubmit={handlePasswordChange}>
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter existing password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div style={{ marginTop: '1.25rem' }}>
            <Button
              type="submit"
              variant="primary"
              icon={ShieldCheck}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
