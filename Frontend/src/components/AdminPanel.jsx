// import { useState } from 'react';
// import PropTypes from 'prop-types';
// import { 
//   Settings, 
//   Plus, 
//   BookOpen, 
//   Eye, 
//   Globe, 
//   FolderOpen, 
//   BarChart3,
//   ArrowLeft,
//   Trash2,
//   Edit
// } from 'lucide-react';
// import { useStats } from '../hooks/useStats.js';
// import { useRecentPapers } from '../hooks/usePapers.js';
// import { useDeletePaper } from '../hooks/useAddPaper.js';
// import StatsCard from './StatsCard.jsx';
// import AddPaperForm from './AddPaperForm.jsx';

// const AdminPanel = ({ onRoleSwitch }) => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [showAddForm, setShowAddForm] = useState(false);
//   const { stats, loading: statsLoading, refetch: refetchStats } = useStats();
//   const { papers: recentPapers, loading: recentLoading, refetch: refetchRecent } = useRecentPapers(10);
//   const { deletePaper, loading: deleteLoading } = useDeletePaper();

//   const handleAddPaper = () => {
//     setShowAddForm(true);
//   };

//   const handleFormClose = () => {
//     setShowAddForm(false);
//   };

//   const handleFormSuccess = () => {
//     setShowAddForm(false);
//     refetchStats();
//     refetchRecent();
//   };

//   const handleDeletePaper = async (paperId, paperTitle) => {
//     if (window.confirm(`Are you sure you want to delete "${paperTitle}"?`)) {
//       try {
//         await deletePaper(paperId);
//         refetchStats();
//         refetchRecent();
//       } catch (error) {
//         alert('Error deleting paper: ' + error.message);
//       }
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: BarChart3 },
//     { id: 'manage', label: 'Manage Papers', icon: BookOpen },
//     { id: 'analytics', label: 'Analytics', icon: BarChart3 }
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div className="flex items-center">
//               <button
//                 onClick={onRoleSwitch}
//                 className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mr-4 transition-colors duration-200"
//               >
//                 <ArrowLeft size={16} className="mr-1" />
//                 Back to Dashboard
//               </button>
//               <Settings className="h-8 w-8 text-primary-600 mr-3" />
//               <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
//             </div>
//             <button
//               onClick={handleAddPaper}
//               className="btn-primary inline-flex items-center"
//             >
//               <Plus size={16} className="mr-2" />
//               Add Paper
//             </button>
//           </div>

//           {/* Tabs */}
//           <nav className="flex space-x-8">
//             {tabs.map(tab => {
//               const Icon = tab.icon;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
//                     activeTab === tab.id
//                       ? 'border-primary-500 text-primary-600'
//                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                   }`}
//                 >
//                   <Icon size={16} className="mr-2" />
//                   {tab.label}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Overview Tab */}
//         {activeTab === 'overview' && (
//           <div className="space-y-8">
//             {/* Statistics Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               <StatsCard
//                 title="Total Papers"
//                 value={statsLoading ? '...' : stats?.totalPapers}
//                 icon={BookOpen}
//                 color="blue"
//               />
//               <StatsCard
//                 title="Total Views"
//                 value={statsLoading ? '...' : stats?.totalViews}
//                 icon={Eye}
//                 color="green"
//               />
//               <StatsCard
//                 title="Domains"
//                 value={statsLoading ? '...' : stats?.totalDomains}
//                 icon={Globe}
//                 color="purple"
//               />
//               <StatsCard
//                 title="Categories"
//                 value={statsLoading ? '...' : stats?.totalCategories}
//                 icon={FolderOpen}
//                 color="orange"
//               />
//             </div>

//             {/* Recent Activity */}
//             <div className="card">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-xl font-semibold text-gray-900">Recently Added Papers</h2>
//                 <span className="text-sm text-gray-500">
//                   {recentPapers.length} papers in the last week
//                 </span>
//               </div>

//               {recentLoading ? (
//                 <div className="space-y-4">
//                   {[...Array(5)].map((_, i) => (
//                     <div key={i} className="animate-pulse">
//                       <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
//                       <div className="h-3 bg-gray-200 rounded w-1/2"></div>
//                     </div>
//                   ))}
//                 </div>
//               ) : recentPapers.length === 0 ? (
//                 <div className="text-center py-8 text-gray-500">
//                   <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                   <p>No recent papers added</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {recentPapers.map(paper => (
//                     <div key={paper.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
//                       <div className="flex-1">
//                         <h3 className="font-medium text-gray-900 mb-1">{paper.title}</h3>
//                         <p className="text-sm text-gray-600">
//                           {paper.authors.join(', ')} • {paper.domain} • {formatDate(paper.createdAt)}
//                         </p>
//                         <div className="flex items-center mt-2 space-x-4">
//                           <span className="inline-flex items-center text-xs text-gray-500">
//                             <Eye size={12} className="mr-1" />
//                             {paper.viewCount} views
//                           </span>
//                           <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
//                             {paper.category}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="flex items-center space-x-2 ml-4">
//                         <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
//                           <Edit size={16} />
//                         </button>
//                         <button
//                           onClick={() => handleDeletePaper(paper.id, paper.title)}
//                           disabled={deleteLoading}
//                           className="text-red-400 hover:text-red-600 transition-colors duration-200 disabled:opacity-50"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Manage Papers Tab */}
//         {activeTab === 'manage' && (
//           <div className="card">
//             <div className="text-center py-12">
//               <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">Paper Management</h3>
//               <p className="text-gray-600 mb-4">
//                 Advanced paper management features will be implemented here.
//               </p>
//               <button
//                 onClick={handleAddPaper}
//                 className="btn-primary inline-flex items-center"
//               >
//                 <Plus size={16} className="mr-2" />
//                 Add New Paper
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Analytics Tab */}
//         {activeTab === 'analytics' && (
//           <div className="space-y-6">
//             {/* Analytics Overview */}
//             <div className="card">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics Overview</h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="text-center p-4 bg-blue-50 rounded-lg">
//                   <div className="text-2xl font-bold text-blue-600">
//                     {statsLoading ? '...' : stats?.monthlyGrowth}%
//                   </div>
//                   <div className="text-sm text-blue-600 font-medium">Monthly Growth</div>
//                 </div>
//                 <div className="text-center p-4 bg-green-50 rounded-lg">
//                   <div className="text-2xl font-bold text-green-600">
//                     {statsLoading ? '...' : Math.round((stats?.totalViews || 0) / (stats?.totalPapers || 1))}
//                   </div>
//                   <div className="text-sm text-green-600 font-medium">Avg. Views per Paper</div>
//                 </div>
//                 <div className="text-center p-4 bg-purple-50 rounded-lg">
//                   <div className="text-2xl font-bold text-purple-600">
//                     {statsLoading ? '...' : stats?.recentPapers}
//                   </div>
//                   <div className="text-sm text-purple-600 font-medium">Recent Papers</div>
//                 </div>
//               </div>
//             </div>

//             {/* Placeholder for Charts */}
//             <div className="card">
//               <div className="text-center py-12">
//                 <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h3>
//                 <p className="text-gray-600">
//                   Detailed analytics charts and insights will be implemented here.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>

//       {/* Add Paper Form Modal */}
//       <AddPaperForm
//         isOpen={showAddForm}
//         onClose={handleFormClose}
//         onSuccess={handleFormSuccess}
//       />
//     </div>
//   );
// };

// AdminPanel.propTypes = {
//   onRoleSwitch: PropTypes.func.isRequired
// };

// export default AdminPanel;

import { useState } from 'react';
import { Shield, Plus, LogOut, FileText, BarChart, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useStats } from '../hooks/useStats.js';
import AddPaperForm from './AddPaperForm.jsx';

// const AdminPanel = ({ onRoleSwitch }) => {
//   const { user, logout } = useAuth();
//   const { stats, loading: statsLoading } = useStats();
//   const [activeTab, setActiveTab] = useState('overview');

const AdminPanel = ({ onRoleSwitch }) => {
  const { user, logout } = useAuth();
  const { stats, loading: statsLoading, refetch: refetchStats } = useStats(); // Add refetch
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddForm, setShowAddForm] = useState(false); // Add this state

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  // const handleAddPaper = () => {
  //   alert('Add Paper functionality will be implemented here');
  // };

  const handleAddPaper = () => {
    setShowAddForm(true);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    refetchStats();
  };

  const recentPapers = [
    {
      id: 1,
      title: "Artificial Intelligence in Drug Discovery: From Molecules to Medicine",
      category: "Pharmaceutical Research",
      date: "2 hours ago"
    },
    {
      id: 2,
      title: "Computer Vision for Autonomous Vehicle Navigation in Urban Environments",
      category: "Autonomous Vehicles",
      date: "5 hours ago"
    },
    {
      id: 3,
      title: "Deep Learning Approaches for Natural Language Processing in Healthcare",
      category: "Healthcare AI",
      date: "1 day ago"
    }
  ];

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
            className="nav-tab inactive"
          >
            Manage Papers
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className="nav-tab inactive"
          >
            Analytics
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="admin-main">
        {/* Statistics Cards */}
        <div className="stats-section">
          <div className="admin-stats-grid">
            <div className="stat-card blue">
              <div className="stat-icon">
                <FileText size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {statsLoading ? '...' : stats?.totalPapers || 0}
                </div>
                <div className="stat-label">Total Papers</div>
                <div className="stat-description">Research papers in database</div>
              </div>
            </div>

            <div className="stat-card cyan">
              <div className="stat-icon">
                <BarChart size={24} />
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
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {statsLoading ? '...' : stats?.totalDomains || 0}
                </div>
                <div className="stat-label">Domains</div>
                <div className="stat-description">Research domains</div>
              </div>
            </div>

            <div className="stat-card orange">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {statsLoading ? '...' : stats?.totalCategories || 0}
                </div>
                <div className="stat-label">Categories</div>
                <div className="stat-description">Paper categories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Added Papers */}
        <div className="recent-papers-section">
          <h2>Recently Added Papers</h2>
          <div className="recent-papers-grid">
            {recentPapers.map(paper => (
              <div key={paper.id} className="recent-paper-card">
                <div className="paper-category">{paper.category}</div>
                <h3 className="paper-title">{paper.title}</h3>
                <div className="paper-date">{paper.date}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      {/* <div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"> */}
        <AddPaperForm
        isOpen={showAddForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
      {/* </div> */}
    </div>
  );
};

export default AdminPanel;


