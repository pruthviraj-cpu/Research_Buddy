import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom'; // Add this import

const LogoutButton = ({ className = "btn-secondary" }) => {
  const { logout, loading } = useAuth();
  const navigate = useNavigate(); // Add this

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        // Navigate to login page after successful logout
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        alert('Failed to logout. Please try again.');
      }
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      disabled={loading}
      className={className}
      style={{ 
        opacity: loading ? 0.6 : 1,
        cursor: loading ? 'not-allowed' : 'pointer'
      }}
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
};

export default LogoutButton;