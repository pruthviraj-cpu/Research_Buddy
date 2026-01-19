import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, User, Calendar, FileText, Eye, Tag, Hash, BookOpen } from 'lucide-react';

const ViewPaperModal = ({ isOpen, onClose, paper }) => {
  if (!isOpen || !paper) return null;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatAuthors = (authorsList) => {
    if (!authorsList || authorsList.length === 0) return 'Unknown Authors';
    if (typeof authorsList === 'string') return authorsList;
    return authorsList.join(', ');
  };

  const formatKeywords = (keywordsList) => {
    if (!keywordsList || keywordsList.length === 0) return [];
    if (typeof keywordsList === 'string') {
      return keywordsList.split(',').map(k => k.trim());
    }
    return keywordsList;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start rounded-t-xl z-10">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{paper.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {paper.domain}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {paper.type || 'Research Article'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Paper ID and Views */}
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-200">
            {/* <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Hash className="h-5 w-5 text-gray-400" />
              </div> */}
              
            {/* </div> */}
            {/* <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Eye className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Views</p>
                <p className="text-sm font-medium text-gray-900">
                  {paper.views ? paper.views.toLocaleString() : '0'}
                </p>
              </div>
            </div> */}
          </div>

          {/* Authors */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-700">
              <User size={18} />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Authors</h3>
            </div>
            <p className="text-gray-900 leading-relaxed pl-6">
              {formatAuthors(paper.authors)}
            </p>
          </div>

          {/* Published Date */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-700">
              <Calendar size={18} />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Published Date</h3>
            </div>
            <p className="text-gray-900 pl-6">
              {formatDate(paper.publication_date)}
            </p>
          </div>

          {/* Abstract */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-700">
              <FileText size={18} />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Abstract</h3>
            </div>
            <p className="text-gray-700 leading-relaxed pl-6 text-justify">
              {paper.abstract || 'No abstract available.'}
            </p>
          </div>

          {/* Summary */}
          {paper.summary && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-700">
                <BookOpen size={18} />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Summary</h3>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-gray-700 leading-relaxed text-justify">
                  {paper.summary}
                </p>
              </div>
            </div>
          )}

          {/* Keywords */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-700">
              <Tag size={18} />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Keywords</h3>
            </div>
            <div className="flex flex-wrap gap-2 pl-6">
              {formatKeywords(paper.keywords).length > 0 ? (
                formatKeywords(paper.keywords).map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {keyword}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No keywords available</span>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ViewPaperModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  paper: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    domain: PropTypes.string,
    authors: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    publishedDate: PropTypes.string,
    type: PropTypes.string,
    abstract: PropTypes.string,
    summary: PropTypes.string,
    keywords: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    views: PropTypes.number,
  }),
};

export default ViewPaperModal;