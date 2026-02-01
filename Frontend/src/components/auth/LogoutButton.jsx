import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom'; // Add this import
import { showConfirmToast } from '../../utils/confirmToast.jsx';
import { toast } from 'react-toastify';

const LogoutButton = ({ className = "btn-secondary" }) => {
  const { logout, loading } = useAuth();
  const navigate = useNavigate(); // Add this

  const handleLogout = async () => {
    showConfirmToast({
      title: "Confirm Logout",
      message: "Are you sure you want to logout?",
      confirmText: "Logout",
      confirmColor: "bg-red-600",
      onConfirm: async () => {
        try {
          await logout();
          toast.success('Logged out successfully');
          navigate('/login');
        } catch (error) {
          console.error('Logout failed:', error);
        }
      }
    })
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