import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import {
  LayoutDashboard,
  User,
  Building2,
  FileCheck,
  BookOpen,
  HelpCircle,
  Sparkles,
  Settings,
  LogOut,
  Bell,
  Users,
  Briefcase,
  Layers,
  BarChart3,
  CheckCircle,
  Menu,
  X,
  Compass,
  FileText,
  Download,
  Bot
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout, isStudent, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Selected Notification / Drive Circular Modal
  const [selectedCircular, setSelectedCircular] = useState(null);
  const [showCircularModal, setShowCircularModal] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const list = await notificationService.getNotifications();
      setNotifications(list || []);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  const handleMarkAsRead = async (n) => {
    if (!n.read) {
      try {
        await notificationService.markAsRead(n.id);
        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
      } catch (e) {
        console.error(e);
      }
    }
    if (n.noticeText || n.documentUrl || n.type === 'CIRCULAR' || n.type === 'DRIVE') {
      setSelectedCircular(n);
      setShowCircularModal(true);
      setShowNotifications(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/placify-ai', label: 'Placify AI', icon: Bot },
    { to: '/student/roadmap', label: 'Preparation Roadmap', icon: Compass },
    { to: '/student/profile', label: 'My Profile', icon: User },
    { to: '/student/drives', label: 'Company Drives', icon: Building2 },
    { to: '/student/applications', label: 'My Applications', icon: FileCheck },
    { to: '/student/preparation', label: 'Preparation Hub', icon: BookOpen },
    { to: '/student/quizzes', label: 'Placement Quizzes', icon: HelpCircle },
    { to: '/student/resume-analyzer', label: 'AI Resume Analyzer', icon: Sparkles },
    { to: '/student/settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Student Directory', icon: Users },
    { to: '/admin/drives', label: 'Drive Management', icon: Briefcase },
    { to: '/admin/applications', label: 'Recruitment Funnel', icon: FileCheck },
    { to: '/admin/resources', label: 'Resource Hub', icon: BookOpen },
    { to: '/admin/quizzes', label: 'Quiz Management', icon: HelpCircle },
    { to: '/admin/analytics', label: 'Placement Analytics', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const navLinks = isAdmin ? adminLinks : studentLinks;

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* Sidebar Desktop: Deep Plum Signature Styling */}
      <aside className="sidebar" style={{
        width: '260px',
        background: 'linear-gradient(180deg, #321A2E 0%, #24151F 100%)',
        borderRight: '1px solid rgba(232, 218, 212, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 50,
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        {/* Brand Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1.25rem 1.35rem',
          borderBottom: '1px solid rgba(232, 218, 212, 0.1)'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: '#C65D3A',
            color: '#FFF8F1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(198, 93, 58, 0.35)'
          }}>
            <Layers size={19} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFF8F1', margin: 0 }}>PLACIFY</h2>
            <span style={{ fontSize: '0.7rem', color: '#E9826E', textTransform: 'uppercase', fontWeight: 700 }}>
              {isAdmin ? 'Placement Admin' : 'Student Portal'}
            </span>
          </div>
        </div>

        {/* Dashboard Navigation Options on the Left */}
        <nav style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          flex: 1,
          padding: '1rem 0.85rem',
          overflowY: 'auto'
        }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.7rem',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  color: isActive ? '#FFF8F1' : '#C2B6BC',
                  background: isActive ? 'rgba(198, 93, 58, 0.24)' : 'transparent',
                  borderLeft: isActive ? '3px solid #C65D3A' : '3px solid transparent',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.15s ease'
                })}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={17} style={{ color: ({ isActive }) => isActive ? '#E9826E' : 'inherit' }} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Bottom Left Sign Out */}
        <div style={{
          padding: '1rem 1.1rem',
          borderTop: '1px solid rgba(232, 218, 212, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          background: 'rgba(0, 0, 0, 0.18)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.45rem',
            background: 'rgba(255, 248, 241, 0.06)',
            borderRadius: '8px',
            border: '1px solid rgba(232, 218, 212, 0.08)'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: '#C65D3A',
              color: '#FFF8F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.8rem',
              flexShrink: 0
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF8F1', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#C2B6BC', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {user?.email}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.45rem',
              background: 'rgba(191, 59, 59, 0.15)',
              border: '1px solid rgba(191, 59, 59, 0.3)',
              color: '#E9826E',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.78rem',
              transition: 'all 0.15s ease',
              width: '100%'
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0, background: 'var(--bg-page)' }}>
        {/* Top Navbar */}
        <header style={{
          height: '60px',
          background: 'rgba(255, 248, 241, 0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.75rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 650, color: 'var(--text-heading)' }}>
              Intelligent Placement Preparation & Tracking
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', position: 'relative' }}>
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                position: 'relative',
                background: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.45rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--terracotta-500)',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFF8F1'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '120%',
                width: '360px',
                background: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
                maxHeight: '420px',
                overflowY: 'auto'
              }}>
                <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FDF4EC' }}>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 750, color: 'var(--text-heading)' }}>Notifications & Circulars</h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--terracotta-500)', fontWeight: 700 }}>{unreadCount} new</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid var(--border-color-light)',
                          background: n.read ? '#FFFFFF' : 'var(--terracotta-50)',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: n.read ? 600 : 700, color: 'var(--text-heading)' }}>
                            {n.title}
                          </span>
                          {!n.read && (
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--terracotta-500)', flexShrink: 0, marginTop: '4px' }} />
                          )}
                        </div>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                          {n.message}
                        </p>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
                          {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Role Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.65rem',
              background: isAdmin ? 'var(--warning-bg)' : 'var(--terracotta-50)',
              border: `1px solid ${isAdmin ? 'var(--warning-border)' : 'var(--border-muted-rose)'}`,
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: isAdmin ? 'var(--warning-primary)' : 'var(--terracotta-500)'
            }}>
              <span>{isAdmin ? '🛡️ Placement Cell' : '🎓 Student'}</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="page-container" style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      {/* Circular Notice Modal */}
      {showCircularModal && selectedCircular && (
        <Modal
          isOpen={showCircularModal}
          onClose={() => setShowCircularModal(false)}
          title={selectedCircular.title || 'Placement Drive Circular'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-body)' }}>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
              {selectedCircular.message}
            </p>

            {selectedCircular.noticeText && (
              <div style={{
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '0.84rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-line'
              }}>
                {selectedCircular.noticeText}
              </div>
            )}

            {selectedCircular.documentUrl && (
              <a
                href={selectedCircular.documentUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 1rem',
                  background: 'var(--terracotta-50)',
                  border: '1px solid var(--border-muted-rose)',
                  borderRadius: '8px',
                  color: 'var(--terracotta-500)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textDecoration: 'none'
                }}
              >
                <Download size={16} /> Download Attached Official Notice
              </a>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
