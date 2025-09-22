import { useAuth } from '../../context/AuthContext.jsx';

const LogoutButton = ({ className = "btn-secondary" }) => {
  const { logout, loading } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        // The AuthContext will automatically redirect to login page
        // because the user will no longer be authenticated
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
