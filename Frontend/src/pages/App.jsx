import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext.jsx';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import Dashboard from '../components/Dashboard.jsx';
import AdminPanel from '../components/AdminPanel.jsx';
import ManagePapers from '../components/Manage_Papers.jsx';
import PaperAnalytics from '../components/PaperAnalytics.jsx';

// Main App Component
const AppContent = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { user } = useAuth();

  // const switchToAdmin = () => {
  //   if (isAdmin()) {
  //     setCurrentView('admin');
  //   } else {
  //     alert('Access denied. Admin role required.');
  //   }
  // };

  const switchToAdmin = () => {
    if (user?.is_admin) {
      setCurrentView('admin');
    } else {
      alert('Access denied. Admin role required.');
    }
  };

  const switchToDashboard = () => setCurrentView('dashboard');

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {currentView === 'dashboard' ? (
                <Dashboard onRoleSwitch={switchToAdmin} />
              ) : (
                <ProtectedRoute requiredRole="admin">
                  <AdminPanel onRoleSwitch={switchToDashboard} />
                </ProtectedRoute>
              )}
            </ProtectedRoute>
          }
        />

        {/* Admin-only route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel onRoleSwitch={switchToDashboard} />
            </ProtectedRoute>
          }
        />

        {/* User dashboard route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard onRoleSwitch={switchToAdmin} />
            </ProtectedRoute>
          }
        />


        {/* admin manage papers */}
        <Route
          path="/manage-papers"
          element={
            <ProtectedRoute requiredRole="admin">
              <ManagePapers />
            </ProtectedRoute>
          }
        />

        {/* admin analytics of paper papers */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredRole="admin">
              <PaperAnalytics />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// Root App with Auth Provider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
