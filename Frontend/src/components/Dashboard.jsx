import { useState, useEffect } from "react"
import { BookOpen, Eye, Globe, LogOut } from "lucide-react"
import { useStats, useDomains, useCategories } from "../hooks/useStats.js"
import { useAuth } from "../context/AuthContext.jsx"
import PaperCard from "./PaperCard.jsx"
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"
import ViewPaperModal from "./ViewPaperModal.jsx"
import { showConfirmToast } from "../utils/confirmToast.jsx"
import Loader from "./Loader/Loader.jsx"
import ErrorState from "./Loader/NotFound.jsx"
import ErrorState2 from "./Loader/NotFoundPapers.jsx"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// const API_BASE_URL = 'http://127.0.0.1:8000';

const Dashboard = ({ onRoleSwitch }) => {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()

  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDomain, setFilterDomain] = useState("All")

  const [selectedPaper, setSelectedPaper] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  const { stats, loading: statsLoading } = useStats()
  const { domains } = useDomains()
  const { categories } = useCategories()

  //fetch papers directly (same as AdminPanel)
  const fetchPapers = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/papers/research-papers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        // console.log("Fetched papers:", result)

        // ensure it's always an array
        setPapers(Array.isArray(result) ? result : result.papers || [])
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to fetch papers")
      }
    } catch (err) {
      console.error("Error fetching papers:", err)
      setError(err.message)
      setPapers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPapers()
  }, [])

  const handleViewPaper = (paper) => {
    setSelectedPaper(paper)
    setShowViewModal(true)
  }
  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setSelectedPaper(null)
  }

  // const handleLogout = async () => {
  //   if (window.confirm("Are you sure you want to logout?")) {
  //     try {
  //       await logout()
  //     } catch (error) {
  //       console.error("Logout failed:", error)
  //     }
  //   }
  // }

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

  const handleDownloadPaper = (pdfUrl, title) => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank")
    } else {
      // alert(`Download link not available for: ${title}`)
      toast.info(`Download link feature will be available soon for: ${title}`);
    }
  }

  const filteredPapers = papers.filter((paper) => {
    const matchesDomain = filterDomain === "All" || paper.domain === filterDomain
    const matchesSearch =
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (paper.author && paper.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (paper.authors && paper.authors.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase())))
    return matchesDomain && matchesSearch
  })

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
            {user?.is_admin && (
              <button onClick={() => navigate("/admin")} className="add-paper-btn">
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
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="Search by paper title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />


          <div className="flex flex-wrap gap-2">
            {["All", ...(domains || [])].map((domain) => (
              <button
                key={domain}
                onClick={() => setFilterDomain(domain)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${filterDomain === domain
                  ? "bg-slate-600 text-white"
                  : "bg-white-700 dark:bg-slate-200 text-black hover:bg-slate-600"
                  }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-icon">
                <BookOpen size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{statsLoading ? "..." : filteredPapers.length}</div>
                <div className="stat-label">Papers Found</div>
              </div>
            </div>

            <div className="stat-card cyan">
              <div className="stat-icon">
                <Eye size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{statsLoading ? "..." : (stats?.totalViews || 0).toLocaleString()}</div>
                <div className="stat-label">Total Views</div>
              </div>
            </div>

            <div className="stat-card green">
              <div className="stat-icon">
                <Globe size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{statsLoading ? "..." : stats?.totalDomains || 0}</div>
                <div className="stat-label">Domains</div>
              </div>
            </div>
          </div>
        </div>

        {/* Papers Grid */}
        <div className="papers-section">
          {loading ? (
              <Loader />
          ) : error ? (
            <ErrorState />
          ) : filteredPapers.length === 0 ? (
            <ErrorState2 />
          ) : (
            <div className="papers-grid">
              {filteredPapers.map((paper) => (
                <PaperCard
                  key={paper.paper_id}
                  paper={paper}
                  onView={() => handleViewPaper(paper)}
                  onDownload={() => handleDownloadPaper(paper.pdfUrl, paper.title)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <ViewPaperModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        paper={selectedPaper}
      />
    </div>
  )
}
export default Dashboard