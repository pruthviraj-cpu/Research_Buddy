import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Minus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useDomains, useCategories } from '../hooks/useStats.js';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AddPaperForm = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth(); // Get token from auth context
  const { domains } = useDomains();
  const { categories } = useCategories();

  const [formData, setFormData] = useState({
    title: '',
    authors: [''],
    domain: '',
    category: '',
    publishDate: '',
    abstract: '',
    summary: '',
    keywords: [''],
    pdfUrl: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (formData.authors.filter(author => author.trim()).length === 0) {
      errors.authors = 'At least one author is required';
    }

    if (!formData.domain) {
      errors.domain = 'Domain is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.publishDate) {
      errors.publishDate = 'Publish date is required';
    }

    if (!formData.abstract.trim()) {
      errors.abstract = 'Abstract is required';
    }

    if (!formData.summary.trim()) {
      errors.abstract = 'Summary is required';
    }

    if (formData.keywords.filter(keyword => keyword.trim()).length === 0) {
      errors.keywords = 'At least one keyword is required';
    }

    if (!formData.pdfUrl.trim()) {
      errors.pdfUrl = 'PDF URL is required';
    } else if (!isValidUrl(formData.pdfUrl)) {
      errors.pdfUrl = 'Please enter a valid URL';
    }

    return errors;
  };

  const handleAddPaper = async (paperData) => {
    setLoading(true);
    setError(null);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', paperData.title);
      formDataToSend.append('authors', JSON.stringify(paperData.authors));
      formDataToSend.append('domain', paperData.domain);
      formDataToSend.append('category', paperData.category);
      formDataToSend.append('publishDate', paperData.publishDate);
      formDataToSend.append('abstract', paperData.abstract);
      formDataToSend.append('summary', paperData.abstract);
      formDataToSend.append('keywords', JSON.stringify(paperData.keywords));
      formDataToSend.append('pdfUrl', paperData.pdfUrl);

      const response = await fetch(`${API_BASE_URL}/papers/add-paper`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Paper added successfully:', result);
        onSuccess?.();
        handleClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add paper');
      }
    } catch (err) {
      console.error('Error adding paper:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear general error
    if (error) {
      setError(null);
    }
  };

  const handleArrayFieldChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Clean up the data
    const cleanedData = {
      ...formData,
      authors: formData.authors.filter(author => author.trim()).map(author => author.trim()),
      keywords: formData.keywords.filter(keyword => keyword.trim()).map(keyword => keyword.trim()),
      title: formData.title.trim(),
      abstract: formData.abstract.trim(),
      summary: formData.summary.trim(),
      pdfUrl: formData.pdfUrl.trim()
    };

    handleAddPaper(cleanedData); // Use custom function
  };

  const handleClose = () => {
    setFormData({
      title: '',
      authors: [''],
      domain: '',
      category: '',
      publishDate: '',
      abstract: '',
      summary: '',
      keywords: [''],
      pdfUrl: ''
    });
    setValidationErrors({});
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">Add New Paper</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-200 rounded-full"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                validationErrors.title ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter paper title"
              disabled={loading}
            />
            {validationErrors.title && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
            )}
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
                  onChange={(e) => handleArrayFieldChange('authors', index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={`Author ${index + 1}`}
                  disabled={loading}
                />
                {formData.authors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('authors', index)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1 hover:bg-red-50 rounded"
                    disabled={loading}
                  >
                    <Minus size={20} />
                  </button>
                )}
                {index === formData.authors.length - 1 && (
                  <button
                    type="button"
                    onClick={() => addArrayField('authors')}
                    className="text-blue-600 hover:text-blue-700 transition-colors duration-200 p-1 hover:bg-blue-50 rounded"
                    disabled={loading}
                  >
                    <Plus size={20} />
                  </button>
                )}
              </div>
            ))}
            {validationErrors.authors && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.authors}</p>
            )}
          </div>

          {/* Domain and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.domain}
                onChange={(e) => handleInputChange('domain', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  validationErrors.domain ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Select Domain</option>
                {domains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
              {validationErrors.domain && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.domain}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  validationErrors.category ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
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
              value={formData.publishDate}
              onChange={(e) => handleInputChange('publishDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                validationErrors.publishDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {validationErrors.publishDate && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.publishDate}</p>
            )}
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Abstract <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.abstract}
              onChange={(e) => handleInputChange('abstract', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                validationErrors.abstract ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter paper abstract"
              disabled={loading}
            />
            {validationErrors.abstract && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.abstract}</p>
            )}
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                validationErrors.summary ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter paper summary"
              disabled={loading}
            />
            {validationErrors.summary && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.summary}</p>
            )}
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
                  onChange={(e) => handleArrayFieldChange('keywords', index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={`Keyword ${index + 1}`}
                  disabled={loading}
                />
                {formData.keywords.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('keywords', index)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1 hover:bg-red-50 rounded"
                    disabled={loading}
                  >
                    <Minus size={20} />
                  </button>
                )}
                {index === formData.keywords.length - 1 && (
                  <button
                    type="button"
                    onClick={() => addArrayField('keywords')}
                    className="text-blue-600 hover:text-blue-700 transition-colors duration-200 p-1 hover:bg-blue-50 rounded"
                    disabled={loading}
                  >
                    <Plus size={20} />
                  </button>
                )}
              </div>
            ))}
            {validationErrors.keywords && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.keywords}</p>
            )}
          </div>

          {/* PDF URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.pdfUrl}
              onChange={(e) => handleInputChange('pdfUrl', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                validationErrors.pdfUrl ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://example.com/paper.pdf"
              disabled={loading}
            />
            {validationErrors.pdfUrl && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.pdfUrl}</p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">Error adding paper: {error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Cancel
            </button>
            
            {/* Add Paper with AI Button */}
            <button
              type="button"
              onClick={() => {
                handleClose();
                // Open AI modal - you can pass a prop to parent or use state management
                if (onSuccess) {
                  onSuccess('openAI'); // Signal to parent to open AI modal
                }
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Add Paper with AI
            </button>
            
            {/* Regular Add Paper Button */}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </span>
              ) : (
                'Add Paper'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddPaperForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default AddPaperForm;