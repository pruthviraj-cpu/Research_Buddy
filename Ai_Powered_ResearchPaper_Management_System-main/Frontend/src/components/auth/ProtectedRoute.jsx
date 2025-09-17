import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext.jsx';
import LoginForm from './LoginForm.jsx';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

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

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Check role requirement
  if (requiredRole === 'admin' && !user?.is_admin) {
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
