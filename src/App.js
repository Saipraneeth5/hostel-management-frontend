import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import AppLayout from './components/layout/AppLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';

// Admin/Warden pages
import DashboardPage    from './pages/admin/DashboardPage';
import StudentsPage     from './pages/admin/StudentsPage';
import RoomsPage        from './pages/admin/RoomsPage';
import ComplaintsPage   from './pages/admin/ComplaintsPage';
import PaymentsPage     from './pages/admin/PaymentsPage';
import MessMenuPage     from './pages/admin/MessMenuPage';
import NotificationsAdminPage from './pages/admin/NotificationsAdminPage';
import WardenManagementPage   from './pages/admin/WardenManagementPage';

// Student pages
import StudentDashboard    from './pages/student/StudentDashboard';
import StudentProfile      from './pages/student/StudentProfile';
import StudentComplaints   from './pages/student/StudentComplaints';
import StudentPayments     from './pages/student/StudentPayments';
import StudentMess         from './pages/student/StudentMess';
import StudentNotifications from './pages/student/StudentNotifications';
import WardenProfile       from './pages/warden/WardenProfile';

// Misc pages
import NotFoundPage from './pages/NotFoundPage';

function ProtectedRoute({ children, staffOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><span className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (staffOnly && user.role === 'STUDENT') return <Navigate to="/student" replace />;
  return children;
}

function RoleRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)',
            },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/"      element={<RoleRouter />} />

          {/* Admin / Warden */}
          <Route path="/admin" element={
            <ProtectedRoute staffOnly>
              <AppLayout role="staff" />
            </ProtectedRoute>
          }>
            <Route index                element={<DashboardPage />} />
            <Route path="students"      element={<StudentsPage />} />
            <Route path="wardens"       element={<WardenManagementPage />} />
            <Route path="rooms"         element={<RoomsPage />} />
            <Route path="complaints"    element={<ComplaintsPage />} />
            <Route path="payments"      element={<PaymentsPage />} />
            <Route path="mess"          element={<MessMenuPage />} />
            <Route path="notifications" element={<NotificationsAdminPage />} />
          </Route>

          {/* Warden profile (shared layout but warden-specific page) */}
          <Route path="/warden-profile" element={
            <ProtectedRoute>
              <AppLayout role="staff" />
            </ProtectedRoute>
          }>
            <Route index element={<WardenProfile />} />
          </Route>

          {/* Student */}
          <Route path="/student" element={
            <ProtectedRoute>
              <AppLayout role="student" />
            </ProtectedRoute>
          }>
            <Route index                element={<StudentDashboard />} />
            <Route path="profile"       element={<StudentProfile />} />
            <Route path="complaints"    element={<StudentComplaints />} />
            <Route path="payments"      element={<StudentPayments />} />
            <Route path="mess"          element={<StudentMess />} />
            <Route path="notifications" element={<StudentNotifications />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
