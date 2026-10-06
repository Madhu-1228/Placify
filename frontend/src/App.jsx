import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import PlacifyAi from './pages/student/PlacifyAi';
import PersonalizedRoadmap from './pages/student/PersonalizedRoadmap';
import StudentProfile from './pages/student/StudentProfile';
import CompanyDrives from './pages/student/CompanyDrives';
import MyApplications from './pages/student/MyApplications';
import PreparationHub from './pages/student/PreparationHub';
import Quizzes from './pages/student/Quizzes';
import ResumeAnalyzer from './pages/student/ResumeAnalyzer';
import Settings from './pages/student/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import AdminDrives from './pages/admin/AdminDrives';
import DriveDetails from './pages/admin/DriveDetails';
import AdminApplications from './pages/admin/AdminApplications';
import AdminResources from './pages/admin/AdminResources';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return user.role === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/student/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Root Entry */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student Portal Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="placify-ai" element={<PlacifyAi />} />
        <Route path="ai-assistant" element={<PlacifyAi />} />
        <Route path="roadmap" element={<PersonalizedRoadmap />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="drives" element={<CompanyDrives />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="preparation" element={<PreparationHub />} />
        <Route path="quizzes" element={<Quizzes />} />
        <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="drives" element={<AdminDrives />} />
        <Route path="drives/:driveId" element={<DriveDetails />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="resources" element={<AdminResources />} />
        <Route path="quizzes" element={<AdminQuizzes />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
