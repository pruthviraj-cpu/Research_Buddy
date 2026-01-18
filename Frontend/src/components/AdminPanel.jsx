import { useState, useEffect } from 'react';
import { Shield, Plus, LogOut, FileText, BarChart, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useStats } from '../hooks/useStats.js';
import AddPaperForm from './AddPaperForm.jsx';
import AddPaperWithAI from './AddPaperWithAI.jsx';
import { useNavigate } from "react-router-dom";
import ViewPaperModal from './ViewPaperModal.jsx';
import { showConfirmToast } from "../utils/confirmToast"
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// const API_BASE_URL = 'http://127.0.0.1:8000';

const AdminPanel = ({ onRoleSwitch }) => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const { stats, loading: statsLoading, refetch: refetchStats } = useStats();

  const [activeTab, setActiveTab] = useState('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddAIForm, setShowAddAIForm] = useState(false);

  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // NEW STATES
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ CORRECT: View paper handler - opens modal with paper data
  const handleViewPaper = (paper) => {
    setSelectedPaper(paper)
    setShowViewModal(true)
  }

  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setSelectedPaper(null)
  }

  // 🔹 Fetch Papers Function
  const fetchPapers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/papers/research-papers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Fetched result:', result);
        setPapers(Array.isArray(result) ? result : result.papers || []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch papers');
      }
    } catch (err) {
      console.error('Error fetching papers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch when component mounts
  useEffect(() => {
    fetchPapers();
  }, []);

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

  const handleAddPaper = () => {
    setShowAddForm(true);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
  };

  // ✅ MODIFIED: Handle both regular and AI form success
  const handleFormSuccess = (action) => {
    if (action === 'openAI') {
      // User clicked "Add Paper with AI" button in the form
      setShowAddForm(false);
      setShowAddAIForm(true); // Open AI modal
    } else {
      // Regular paper added successfully
      setShowAddForm(false);
      refetchStats();
      fetchPapers();
    }
  };

  // ✅ ADD THIS: Handle AI form close
  const handleAIFormClose = () => {
    setShowAddAIForm(false);
  };

  // ✅ ADD THIS: Handle AI form success
  const handleAIFormSuccess = () => {
    setShowAddAIForm(false);
    refetchStats();
    fetchPapers(); // refresh papers list after AI adds paper
  };



  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-container">
              <Shield size={24} />
            </div>
            <div className="header-text">
              <h1>Admin Dashboard</h1>
              <p>Welcome back, {user?.displayName || user?.name || user?.email}</p>
            </div>
          </div>

          <div className="header-right">
            <button onClick={handleAddPaper} className="add-paper-btn">
              <Plus size={18} />
              Add Paper
            </button>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-nav">
        <div className="nav-content">
          <button
            onClick={() => navigate("/admin")}
            className={`nav-tab ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => navigate("/manage-papers")}
            className={`nav-tab ${location.pathname === '/manage-papers' ? 'active' : ''}`}
          >
            Manage Papers
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className={`nav-tab ${location.pathname === '/analytics' ? 'active' : ''}`}
          >
            Analytics
          </button>
        </div>
      </nav>

      {/* Main Content */}
      < main className="admin-main" >
        {/* Stats Section */}
        < div className="stats-section" >
          <div className="admin-stats-grid">
            <div className="stat-card blue">
              <div className="stat-icon"><FileText size={24} /></div>
              <div className="stat-content">
                <div className="stat-number">
                  {statsLoading ? '...' : stats?.totalPapers || 0}
                </div>
                <div className="stat-label">Total Papers</div>
              </div>
            </div>

            <div className="stat-card cyan">
              <div className="stat-icon"><BarChart size={24} /></div>
              <div className="stat-content">
                <div className="stat-number">
                  {statsLoading ? '...' : (stats?.totalViews || 0).toLocaleString()}
                </div>
                <div className="stat-label">Total Views</div>
              </div>
            </div>

            <div className="stat-card green">
              <div className="stat-icon"><TrendingUp size={24} /></div>
              <div className="stat-content">
                <div className="stat-number">
                  {statsLoading ? '...' : stats?.totalDomains || 0}
                </div>
                <div className="stat-label">Domains</div>
              </div>
            </div>

            <div className="stat-card orange">
              <div className="stat-icon"><Users size={24} /></div>
              <div className="stat-content">
                <div className="stat-number">
                  {statsLoading ? '...' : stats?.totalCategories || 0}
                </div>
                <div className="stat-label">Categories</div>
              </div>
            </div>
          </div>
        </div >

        {/* Recently Added Papers */}
        < div className="recent-papers-section" >
          <h2>Recently Added Papers</h2>

          {loading && <p>Loading papers...</p>}
          {error && <p className="error-text">{error}</p>}

          <div className="recent-papers-grid">
            {Array.isArray(papers) && papers.length > 0 ? (
              papers.map(paper => (
                <div key={paper.id} className="recent-paper-card">
                  <div className="paper-category">{paper.category}</div>
                  <h3 className="paper-title">{paper.title}</h3>
                  <div className="paper-date">{paper.date}</div>
                </div>
              ))
            ) : (
              <p>No papers found</p>
            )}
          </div>
        </div >
      </main >

      {/* ✅ Regular Add Paper Form */}
      < AddPaperForm
        isOpen={showAddForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

      {/* ✅ ADD THIS: AI Add Paper Form */}
      < AddPaperWithAI
        isOpen={showAddAIForm}
        onClose={handleAIFormClose}
        onSuccess={handleAIFormSuccess}
      />

      {/* ✅ ADD THIS */}
      <ViewPaperModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        paper={selectedPaper}
      />
    </div >
  );
};

export default AdminPanel;
