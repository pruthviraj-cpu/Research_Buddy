import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext.jsx';
import { Navigate, useNavigate } from 'react-router-dom'; // Add this import

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  const hasAccess = 
    !requiredRole || 
    (requiredRole === 'admin' && user?.is_admin);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirement
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this area.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Required role:</span> 
                <span className="capitalize text-red-600 font-medium ml-1">{requiredRole}</span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Your role:</span> 
                <span className="capitalize text-blue-600 font-medium ml-1">{user?.is_admin ? 'admin' : 'user'}</span>
              </p>
            </div>
            {/* Add a button to redirect back to dashboard */}
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string
};

export default ProtectedRoute;