import { useState } from 'react';
import { Search, BookOpen, Eye, Globe, LogOut } from 'lucide-react';
import { usePapers } from '../hooks/usePapers.js';
import { useStats, useDomains, useCategories } from '../hooks/useStats.js';
import { useAuth } from '../context/AuthContext.jsx';
import { paperService } from '../services/paperService.js';
import PaperCard from './PaperCard.jsx';

const Dashboard = ({ onRoleSwitch }) => {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    domain: 'all',
    category: 'all',
    page: 1,
    limit: 9
  });

  const { papers, loading: papersLoading, totalCount, totalPages, refetch } = usePapers(filters);
  const { stats, loading: statsLoading } = useStats();
  const { domains } = useDomains();
  const { categories } = useCategories();

  const handleViewPaper = async (paperId) => {
    try {
      await paperService.incrementViewCount(paperId);
      refetch();
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  const handleDownloadPaper = (pdfUrl, title) => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
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
        {/* Statistics Cards */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-icon">
                <BookOpen size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {statsLoading ? '...' : stats?.totalPapers || 0}
                </div>
                <div className="stat-label">Available Papers</div>
                <div className="stat-description">Research papers in database</div>
              </div>
            </div>

            <div className="stat-card cyan">
              <div className="stat-icon">
                <Eye size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {statsLoading ? '...' : (stats?.totalViews || 0).toLocaleString()}
                </div>
                <div className="stat-label">Total Views</div>
                <div className="stat-description">Across all papers</div>
              </div>
            </div>

            <div className="stat-card green">
              <div className="stat-icon">
                <Globe size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {statsLoading ? '...' : stats?.totalDomains || 0}
                </div>
                <div className="stat-label">Domains</div>
                <div className="stat-description">Research domains covered</div>
              </div>
            </div>
          </div>
        </div>

     {/* Search Section */}
<div className="search-section">
  <div className="section-header">
    <BookOpen size={24} />
    <h2>Discover Research Papers</h2>
  </div>

  <div className="search-container">
    <div className="search-input-wrapper">
      <Search size={20} className="search-icon" />
      <input
        type="text"
        placeholder="Search papers by title, author, or keywords..."
        value={filters.search}
        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
        className="search-input"
      />
    </div>

    <div className="filters-row">
      <select
        value={filters.domain}
        onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value, page: 1 }))}
        className="filter-select"
      >
        <option value="all">All Domains</option>
        {domains.map(domain => (
          <option key={domain} value={domain}>{domain}</option>
        ))}
      </select>

      <select
        value={filters.category}
        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
        className="filter-select"
      >
        <option value="all">All Categories</option>
        {categories.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
    </div>
  </div>

  <div className="results-info">
    {papersLoading ? 'Loading papers...' : `${totalCount} Papers Found`}
  </div>
</div>


        {/* Papers Grid */}
        <div className="papers-section">
          {papersLoading ? (
            <div className="papers-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="paper-card loading">
                  <div className="loading-shimmer"></div>
                </div>
              ))}
            </div>
          ) : papers.length === 0 ? (
            <div className="no-papers">
              <BookOpen size={48} />
              <h3>No papers found</h3>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="papers-grid">
              {papers.map(paper => (
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

        {/* Pagination */}
        {totalPages > 1 && !papersLoading && (
          <div className="pagination">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={filters.page === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <span className="pagination-info">
              Page {filters.page} of {totalPages}
            </span>
            
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={filters.page === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
