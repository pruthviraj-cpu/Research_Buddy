import { useState, useEffect } from 'react';
import { Search, BookOpen, Eye, Globe, LogOut } from 'lucide-react';
import { useStats, useDomains, useCategories } from '../hooks/useStats.js';
import { useAuth } from '../context/AuthContext.jsx';
import PaperCard from './PaperCard.jsx';

const Dashboard = ({ onRoleSwitch }) => {
  const { user, logout, token } = useAuth();

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { stats, loading: statsLoading } = useStats();
  const { domains } = useDomains();
  const { categories } = useCategories();

  //fetch papers directly (same as AdminPanel)
  const fetchPapers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/papers/research-papers", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Fetched papers:", result);

        // ensure it's always an array
        setPapers(Array.isArray(result) ? result : result.papers || []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch papers");
      }
    } catch (err) {
      console.error("Error fetching papers:", err);
      setError(err.message);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleViewPaper = (paperId) => {
    console.log("View count increment not yet wired:", paperId);
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await logout();
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };

  const handleDownloadPaper = (pdfUrl, title) => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    } else {
      alert(`Download link not available for: ${title}`);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-container">
              <BookOpen size={24} />
            </div>
            <div className="header-text">
              <h1>Research Hub</h1>
              <p>Welcome back, {user?.displayName || user?.name || user?.email}</p>
            </div>
          </div>

          <div className="header-right">
            {user?.is_admin && onRoleSwitch && (
              <button onClick={onRoleSwitch} className="add-paper-btn">
                Admin Panel
              </button>
            )}
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Stats Section */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-icon"><BookOpen size={24} /></div>
              <div className="stat-content">
                <div className="stat-number">
                  {statsLoading ? "..." : stats?.totalPapers || 0}
                </div>
                <div className="stat-label">Available Papers</div>
              </div>
            </div>

            <div className="stat-card cyan">
              <div className="stat-icon"><Eye size={24} /></div>
              <div className="stat-content">
                <div className="stat-number">
                  {statsLoading ? "..." : (stats?.totalViews || 0).toLocaleString()}
                </div>
                <div className="stat-label">Total Views</div>
              </div>
            </div>

            <div className="stat-card green">
              <div className="stat-icon"><Globe size={24} /></div>
              <div className="stat-content">
                <div className="stat-number">
                  {statsLoading ? "..." : stats?.totalDomains || 0}
                </div>
                <div className="stat-label">Domains</div>
              </div>
            </div>
          </div>
        </div>

        {/* Papers Grid */}
        <div className="papers-section">
          {loading ? (
            <p>Loading papers...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : papers.length === 0 ? (
            <p>No papers found.</p>
          ) : (
            <div className="papers-grid">
              {papers.map((paper) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  onView={() => handleViewPaper(paper.id)}
                  onDownload={() => handleDownloadPaper(paper.pdfUrl, paper.title)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default Dashboard;