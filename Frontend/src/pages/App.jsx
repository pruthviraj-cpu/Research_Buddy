import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext.jsx';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import Dashboard from '../components/Dashboard.jsx';
import AdminPanel from '../components/AdminPanel.jsx';
import ManagePapers from '../components/Manage_Papers.jsx';
import PaperAnalytics from '../components/PaperAnalytics.jsx';
import LoginForm from '../components/auth/LoginForm.jsx'; // Add this import
import { ToastContainer } from 'react-toastify';

// Main App Component
const AppContent = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public login route */}
        <Route path="/login" element={<LoginForm />} />

        {/* Redirect root to login if not authenticated, or dashboard if authenticated */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />


        {/* User dashboard route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
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

        {/* admin analytics of papers */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredRole="admin">
              <PaperAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

// Root App with Auth Provider
function App() {
  return (
    <>

      <AuthProvider>
        <AppContent />
      </AuthProvider>

      <ToastContainer
        position="top-right"
        autoclose={3000}
        hidePogressBar={false}
        closeOnClick
        pauseOnHover
        draggle
        toastClassname="bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg shadow-lg"
        bodyClassName="text-sm"
      /></>
  );
}

export default App;