import { useState, useEffect } from 'react';
import { Shield, Plus, LogOut, FileText, BarChart, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useStats } from '../hooks/useStats.js';
import AddPaperForm from './AddPaperForm.jsx';

const AdminPanel = ({ onRoleSwitch }) => {
  const { user, logout, token } = useAuth(); // get token from AuthContext
  const { stats, loading: statsLoading, refetch: refetchStats } = useStats();

  const [activeTab, setActiveTab] = useState('overview');
  const [showAddForm, setShowAddForm] = useState(false);

  // NEW STATES
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Fetch Papers Function
  const fetchPapers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/papers/research-papers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // needs token
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Fetched result:', result);

        // Ensure we always store an array
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
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  const handleAddPaper = () => {
    setShowAddForm(true);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    refetchStats();
    fetchPapers(); // refresh papers list after adding
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
            onClick={() => setActiveTab('overview')}
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('papers')}
            className={`nav-tab ${activeTab === 'papers' ? 'active' : ''}`}
          >
            Manage Papers
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            Analytics
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="admin-main">
        {/* Stats Section */}
        <div className="stats-section">
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
        </div>

        {/* Recently Added Papers */}
        <div className="recent-papers-section">
          <h2>Recently Added Papers</h2>

          {loading && <p>Loading papers...</p>}
          {error && <p className="error-text">{error}</p>}

          <div className="recent-papers-grid">
            {/* {papers.length === 0 && !loading ? (
              <p>No papers found</p>
            ) : (
              papers.map(paper => (
                <div key={paper.id} className="recent-paper-card">
                  <div className="paper-category">{paper.category}</div>
                  <h3 className="paper-title">{paper.title}</h3>
                  <div className="paper-date">{paper.date}</div>
                </div>
              ))
            )} */}
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
        </div>


      </main>

      {/* Add Paper Form */}
      <AddPaperForm
        isOpen={showAddForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default AdminPanel;
