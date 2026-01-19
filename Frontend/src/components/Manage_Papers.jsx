"use client"
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext.jsx"
import { Edit2, Trash2, X, LogOut, BookOpen, Eye, Download, Plus, Minus } from "lucide-react"
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ViewPaperModal from "./ViewPaperModal.jsx";
import { showConfirmToast } from "../utils/confirmToast";
import Loader from "./Loader/Loader.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ManagePapers = ({ onRoleSwitch }) => {
  const navigate = useNavigate()

  const { getAuthHeaders, user, logout, token } = useAuth()
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({ totalPapers: 0, totalViews: 0, domains: 0 })

  const [showModal, setShowModal] = useState(false)
  const [editingPaper, setEditingPaper] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    authors: [""],
    domain: "",
    category: "",
    publication_date: "",
    abstract: "",
    summary: "",
    keywords: [""],
    pdf_url: "",
  })
  const [validationErrors, setValidationErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const [selectedPaper, setSelectedPaper] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  const handleViewPaper = (paper) => {
    setSelectedPaper(paper)
    setShowViewModal(true)
  }

  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setSelectedPaper(null)
  }

  useEffect(() => {
    fetchPapers()
  }, [])

  const fetchPapers = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_BASE_URL}/papers/research-papers`, {
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      const papersList = Array.isArray(data) ? data : data.papers || []
      setPapers(papersList)

      const uniqueDomains = new Set(papersList.map((p) => p.domain)).size
      setStats({
        totalPapers: papersList.length,
        totalViews: papersList.reduce((sum, p) => sum + (p.views || 0), 0),
        domains: uniqueDomains,
      })
    } catch (err) {
      console.error(err)
      setError("Failed to fetch papers")
      setPapers([])
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.title.trim()) {
      errors.title = "Title is required"
    }

    if (formData.authors.filter((author) => author.trim()).length === 0) {
      errors.authors = "At least one author is required"
    }

    if (!formData.domain) {
      errors.domain = "Domain is required"
    }

    if (!formData.category) {
      errors.category = "Category is required"
    }

    if (!formData.publish_date) {
      errors.publish_date = "Publish date is required"
    }

    if (!formData.abstract.trim()) {
      errors.abstract = "Abstract is required"
    }

    if (!formData.summary.trim()) {
      errors.abstract = "Summary is required"
    }

    if (formData.keywords.filter((keyword) => keyword.trim()).length === 0) {
      errors.keywords = "At least one keyword is required"
    }

    if (!formData.pdf_url.trim()) {
      errors.pdf_url = "PDF URL is required"
    } else if (!isValidUrl(formData.pdf_url)) {
      errors.pdf_url = "Please enter a valid URL"
    }

    return errors
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleEditClick = (paper) => {
    setEditingPaper(paper)
    setFormData({
      title: paper.title || "",
      authors: paper.authors ? (Array.isArray(paper.authors) ? paper.authors : [paper.authors]) : [""],
      domain: paper.domain || "",
      category: paper.category || "",
      publication_date: paper.publication_date || "",
      abstract: paper.abstract || paper.content || "",
      summary: paper.summary || paper.content || "",
      keywords: paper.keywords ? (Array.isArray(paper.keywords) ? paper.keywords : [paper.keywords]) : [""],
      pdf_url: paper.pdf_url || "",
    })
    setValidationErrors({})
    setShowModal(true)
  }

  const handleSavePaper = async (e) => {
    e.preventDefault()

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch(`${API_BASE_URL}/papers/update-paper/${editingPaper.paper_id}`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          authors: formData.authors.filter((a) => a.trim()).map((a) => a.trim()),
          domain: formData.domain,
          category: formData.category,
          publication_date: formData.publication_date,
          abstract: formData.abstract.trim(),
          summary: formData.summary.trim(),
          keywords: formData.keywords.filter((k) => k.trim()).map((k) => k.trim()),
          pdf_url: formData.pdf_url.trim(),
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update paper")
      }

      setPapers(papers.map((p) => (p.paper_id === editingPaper.paper_id ? { ...p, ...formData } : p)))
      handleCloseModal()
      // alert("Paper updated successfully!")
      toast.success("Paper updated successfully!")
    } catch (err) {
      console.error(err)
      setValidationErrors({ submit: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = (paper) => {
    showConfirmToast({
      title: `Delete "${paper.title}"?`,
      message: "This action cannot be undone.",
      confirmText: "Delete",
      confirmColor: "bg-red-600",
      onConfirm: async () => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/papers/delete-paper/${paper.paper_id}`,
            {
              method: "DELETE",
              headers: getAuthHeaders(),
            }
          )

          if (!res.ok) throw new Error("Failed to delete paper")

          setPapers((prev) =>
            prev.filter((p) => p.paper_id !== paper.paper_id)
          )

          toast.success("Paper deleted successfully!")
        } catch (err) {
          console.error(err)
          toast.error("Error deleting paper")
        }
      },
    })
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleArrayFieldChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }))
  }

  const addArrayField = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }))
  }

  const removeArrayField = (field, index) => {
    if (formData[field].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }))
    }
  }

  const handleCloseModal = () => {
    setFormData({
      title: "",
      authors: [""],
      domain: "",
      category: "",
      publish_date: "",
      abstract: "",
      summary: "",
      keywords: [""],
      pdf_url: "",
    })
    setValidationErrors({})
    setShowModal(false)
    setEditingPaper(null)
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-container">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="header-text">
              <h1>Admin Dashboard</h1>
              <p>Welcome back, {user?.displayName || user?.name || "Admin"}</p>
            </div>
          </div>

          <div className="header-right">
            <button onClick={() => navigate("/admin")} className="add-paper-btn">
              Back to Admin
            </button>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Stats Cards */}
        {!loading && papers.length > 0 && (
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="flex items-center gap-4">
                  <div className="stat-icon">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.totalPapers}</div>
                    <div className="stat-label">Available Papers</div>
                  </div>
                </div>
              </div>

              <div className="stat-card cyan">
                <div className="flex items-center gap-4">
                  <div className="stat-icon">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">6,454</div>
                    <div className="stat-label">Total Views</div>
                  </div>
                </div>
              </div>

              <div className="stat-card green">
                <div className="flex items-center gap-4">
                  <div className="stat-icon">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.domains}</div>
                    <div className="stat-label">Domains</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Papers Grid */}
        <div className="papers-section">
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="error-text">{error}</p>
            </div>
          ) : papers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400">No papers found.</p>
            </div>
          ) : (
            <div className="papers-grid">
              {papers.map((paper) => (
                <div key={paper.paper_id} className="paper-card">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="paper-title flex-1">{paper.title}</h3>
                    <div className="flex items-center gap-2 ml-3">
                      <button
                        onClick={() => handleEditClick(paper)}
                        className="icon-btn icon-btn-edit"
                        title="Edit paper"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(paper)}
                        className="icon-btn icon-btn-delete"
                        title="Delete paper"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="paper-domain">{paper.domain}</span>
                  </div>

                  {paper.authors && (
                    <div className="mb-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex-shrink-0">👤</span>
                      <span className="paper-authors">
                        {Array.isArray(paper.authors)
                          ? paper.authors.slice(0, 2).join(", ") +
                          (paper.authors.length > 2 ? ", +" + (paper.authors.length - 2) + " more" : "")
                          : paper.authors}
                      </span>
                    </div>
                  )}

                  <div className="mb-4 paper-meta">
                    {paper.publish_date && (
                      <span className="flex items-center gap-1">
                        📅 {new Date(paper.publish_date).toLocaleDateString()}
                      </span>
                    )}
                    {paper.category && <span className="flex items-center gap-1">📄 {paper.category}</span>}
                  </div>

                  <p className="paper-abstract mb-4">{paper.abstract || paper.content || "No description available"}</p>

                  {paper.keywords && (
                    <div className="mb-4 paper-keywords">
                      {(Array.isArray(paper.keywords) ? paper.keywords : [paper.keywords])
                        .slice(0, 3)
                        .map((keyword, idx) => (
                          <span key={idx} className="keyword-tag">
                            {keyword}
                          </span>
                        ))}
                    </div>
                  )}

                  <div className="paper-footer">
                    <div className="paper-actions">
                      <button className="view-btn flex items-center gap-2" onClick={() => handleViewPaper(paper)}>
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      {/* Paper modal */}
      <ViewPaperModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        paper={selectedPaper}
      />

      {showModal && editingPaper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-semibold text-gray-900">Edit Paper</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full"
                disabled={submitting}
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePaper} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${validationErrors.title
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                    }`}
                  placeholder="Enter paper title"
                  disabled={submitting}
                />
                {validationErrors.title && <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>}
              </div>

              {/* Authors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authors <span className="text-red-500">*</span>
                </label>
                {formData.authors.map((author, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => handleArrayFieldChange("authors", index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder={`Author ${index + 1}`}
                      disabled={submitting}
                    />
                    {formData.authors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField("authors", index)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-200 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        disabled={submitting}
                      >
                        <Minus size={20} />
                      </button>
                    )}
                    {index === formData.authors.length - 1 && (
                      <button
                        type="button"
                        onClick={() => addArrayField("authors")}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        disabled={submitting}
                      >
                        <Plus size={20} />
                      </button>
                    )}
                  </div>
                ))}
                {validationErrors.authors && <p className="text-red-500 text-sm mt-1">{validationErrors.authors}</p>}
              </div>

              {/* Domain and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => handleInputChange("domain", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${validationErrors.domain
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                      }`}
                    placeholder="e.g., Computer Science"
                    disabled={submitting}
                  />
                  {validationErrors.domain && <p className="text-red-500 text-sm mt-1">{validationErrors.domain}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${validationErrors.category
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                      }`}
                    placeholder="e.g., Research Article"
                    disabled={submitting}
                  />
                  {validationErrors.category && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.category}</p>
                  )}
                </div>
              </div>

              {/* Publish Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publish Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.publish_date}
                  onChange={(e) => handleInputChange("publish_date", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${validationErrors.publish_date
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                    }`}
                  disabled={submitting}
                />
                {validationErrors.publish_date && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.publish_date}</p>
                )}
              </div>

              {/* Abstract */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Abstract <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.abstract}
                  onChange={(e) => handleInputChange("abstract", e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${validationErrors.abstract
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                    }`}
                  placeholder="Enter paper abstract"
                  disabled={submitting}
                />
                {validationErrors.abstract && <p className="text-red-500 text-sm mt-1">{validationErrors.abstract}</p>}
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${validationErrors.summary
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                    }`}
                  placeholder="Enter paper summary"
                  disabled={submitting}
                />
                {validationErrors.abstract && <p className="text-red-500 text-sm mt-1">{validationErrors.abstract}</p>}
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords <span className="text-red-500">*</span>
                </label>
                {formData.keywords.map((keyword, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => handleArrayFieldChange("keywords", index, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder={`Keyword ${index + 1}`}
                      disabled={submitting}
                    />
                    {formData.keywords.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField("keywords", index)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-200 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        disabled={submitting}
                      >
                        <Minus size={20} />
                      </button>
                    )}
                    {index === formData.keywords.length - 1 && (
                      <button
                        type="button"
                        onClick={() => addArrayField("keywords")}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        disabled={submitting}
                      >
                        <Plus size={20} />
                      </button>
                    )}
                  </div>
                ))}
                {validationErrors.keywords && <p className="text-red-500 text-sm mt-1">{validationErrors.keywords}</p>}
              </div>

              {/* PDF URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.pdf_url}
                  onChange={(e) => handleInputChange("pdf_url", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${validationErrors.pdf_url
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                    }`}
                  placeholder="https://example.com/paper.pdf"
                  disabled={submitting}
                />
                {validationErrors.pdf_url && <p className="text-red-500 text-sm mt-1">{validationErrors.pdf_url}</p>}
              </div>

              {/* Error Display */}
              {validationErrors.submit && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                  <p className="text-sm">Error updating paper: {validationErrors.submit}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


export default ManagePapers