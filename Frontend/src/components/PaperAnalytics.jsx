"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext.jsx"
import { Trash2, X, LogOut, BookOpen, RefreshCw, Eye, Download, PlusCircle, Minus, Edit2 } from "lucide-react"
import { useNavigate } from "react-router-dom";
import { showConfirmToast } from "../utils/confirmToast.jsx";
import { toast } from "react-toastify";
import Loader from "./Loader/Loader.jsx";
import ErrorState from "./Loader/NotFound.jsx";
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// const API_BASE_URL = 'http://127.0.0.1:8000';

const PaperAnalytics = () => {
  const { getAuthHeaders, user, logout, token } = useAuth()
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterAction, setFilterAction] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const navigate = useNavigate();
  const fetchActions = useCallback(async (showLoader = true) => {
    try {
      setError(null)
      if (showLoader) setLoading(true)

      const response = await fetch(`${API_BASE_URL}/analytics/paper-actions`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch actions")

      const data = await response.json()
      setActions(Array.isArray(data) ? data : data.actions || [])
    } catch (err) {
      setError("Failed to fetch actions")
      setActions([])
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [token])



  useEffect(() => {
    fetchActions()
    const interval = setInterval(async () => {
      setIsRefreshing(true)
      await fetchActions(false)
      setIsRefreshing(false)
    }, 5000)
    return () => clearInterval(interval)
  }, [fetchActions])

  const getActionIcon = (action) => {
    switch (action) {
      case "Added":
        return <PlusCircle size={24} />;
      case "Updated":
        return <Edit2 size={24} />;
      case "Deleted":
        return <Trash2 size={24} />;
      default:
        return null
    }
  }

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

  const getActionColor = (action) => {
    switch (action) {
      case "Added":
        return "bg-green-100 text-green-900 dark:text-green-700 dark:bg-green-900/30 dark:text-green-300"
      case "Updated":
        return "bg-yellow-100 text-yellow-900 dark:text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "Deleted":
        return "bg-red-100 text-red-900 dark:text-red-700 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-900 dark:text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const getActionBorderColor = (action) => {
    switch (action) {
      case "Added":
        return "border-green-100 dark:border-green-400"
      case "Updated":
        return "border-yellow-100 dark:border-yellow-400"
      case "Deleted":
        return "border-red-100 dark:border-red-400"
      default:
        return "border-gray-100 dark:border-gray-400"
    }
  }

  const filteredActions = actions.filter((action) => {
    const matchesFilter = filterAction === "All" || action.action === filterAction
    const matchesSearch =
      action.paper_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.user.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    added: filteredActions.filter((a) => a.action === "Added").length,
    updated: filteredActions.filter((a) => a.action === "Updated").length,
    deleted: filteredActions.filter((a) => a.action === "Deleted").length,
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-container">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="header-text">
              <h1>Admin Dashboard</h1>
              <p>Welcome back, {"Admin"}</p>
            </div>
          </div>
          <div className="header-right">
            <button onClick={() => navigate("/admin")} className="add-paper-btn">
              Back to Admin
            </button>
            <button
              onClick={async () => {
                setIsRefreshing(true)
                try {
                  await fetchActions()
                } finally {
                  setIsRefreshing(false)
                }
              }}
              disabled={isRefreshing}
              className="add-paper-btn"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button onClick={handleLogout} className="logout-btn">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="Search by paper title or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />

          <div className="flex flex-wrap gap-2">
            {["All", "Added", "Updated", "Deleted"].map((action) => (
              <button
                key={action}
                onClick={() => setFilterAction(action)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${filterAction === action
                  ? action === "Added"
                    ? "bg-green-500 text-white"
                    : action === "Updated"
                      ? "bg-yellow-500 text-white"
                      : action === "Deleted"
                        ? "bg-red-500 text-white"
                        : "bg-blue-500 text-white"
                  : "bg-slate-700 dark:bg-slate-800 text-slate-300 hover:bg-slate-600"
                  }`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && filteredActions.length > 0 && (
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card green">
                <div className="flex items-center gap-4">
                  <div className="stat-icon"><PlusCircle size={24} /></div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.added}</div>
                    <div className="stat-label">Added</div>
                  </div>
                </div>
              </div>

              <div className="stat-card yellow">
                <div className="flex items-center gap-4">
                  <div className="stat-icon"><Edit2 size={24} /></div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.updated}</div>
                    <div className="stat-label">Updated</div>
                  </div>
                </div>
              </div>

              <div className="stat-card red">
                <div className="flex items-center gap-4">
                  <div className="stat-icon"><Trash2 size={24} /></div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.deleted}</div>
                    <div className="stat-label">Deleted</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Table Section */}
        <div className="papers-section">
          {loading ? (
            <Loader />
          ) : error ? (
            <ErrorState />
          ) : filteredActions.length === 0 ? (
            <ErrorState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Paper Title</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Action</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">User</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Timestamp</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActions.map((action, idx) => (
                    <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-black font-medium max-w-xs truncate">
                        {action.paper_title}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-xs border ${getActionColor(action.action)} ${getActionBorderColor(action.action)}`}
                        >
                          {getActionIcon(action.action)}
                          {action.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-black font-medium max-w-xs truncate">{action.user}</td>
                      <td className="px-6 py-4 text-sm text-black font-medium max-w-xs truncate">
                        {new Date(action.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-black font-medium max-w-xs truncate">{action.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default PaperAnalytics