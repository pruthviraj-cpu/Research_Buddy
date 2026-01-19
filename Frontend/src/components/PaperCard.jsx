import { User, Calendar, FileText, Eye, Download } from 'lucide-react';
import PropTypes from 'prop-types';

const PaperCard = ({ paper, onView, onDownload }) => {
  const {
    title,
    domain,
    authors,
    publishedDate,
    type,
    abstract,
    keywords,
    views,
    id
  } = paper;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
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
    
    if (authorsList.length <= 2) {
      return authorsList.join(', ');
    } else {
      return `${authorsList.slice(0, 2).join(', ')}, ${authorsList.length - 2} more`;
    }
  };

  const getKeywordTags = (keywordsList) => {
    if (!keywordsList || keywordsList.length === 0) return [];
    if (typeof keywordsList === 'string') {
      return keywordsList.split(',').map(k => k.trim()).slice(0, 3);
    }
    return keywordsList.slice(0, 3);
  };

  return (
    <div className="paper-card">
      {/* Title */}
      <h3 className="paper-title">{title}</h3>
      
      {/* Domain */}
      <div className="paper-domain">{domain}</div>
      
      {/* Authors */}
      <div className="paper-authors">
        <User className="author-icon" />
        <span>{formatAuthors(authors)}</span>
      </div>
      
      {/* Meta Information */}
      <div className="paper-meta">
        <div className="paper-meta-item">
          <Calendar />
          <span>{formatDate(publishedDate)}</span>
        </div>
        <div className="paper-meta-item">
          <FileText />
          <span>{type || 'Research Article'}</span>
        </div>
      </div>
      
      {/* Description */}
      <div className="paper-description">
        {abstract || 'No abstract available for this research paper.'}
      </div>
      
      {/* Tags */}
      <div className="paper-tags">
        {getKeywordTags(keywords).map((keyword, index) => (
          <span key={index} className="paper-tag">{keyword}</span>
        ))}
        {getKeywordTags(keywords).length > 3 && (
          <span className="paper-tag">+{getKeywordTags(keywords).length - 3} more</span>
        )}
      </div>
      
      {/* Footer */}
      <div className="paper-footer">
        {/* View Count */}
        <div className="paper-stats">
          <Eye />
          <span>{views ? views.toLocaleString() : 0} views</span>
        </div>
        
        {/* Actions */}
        <div className="paper-actions">
          <button 
            onClick={() => onView && onView(id)}
            className="paper-action-btn"
          >
            <Eye size={14} />
            View
          </button>
          <button 
            onClick={() => onDownload && onDownload(paper.pdfUrl, title)}
            className="paper-action-btn"
          >
            <Download size={14} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

PaperCard.propTypes = {
  paper: PropTypes.shape({
    // id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    domain: PropTypes.string,
    authors: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    publishedDate: PropTypes.string,
    type: PropTypes.string,
    abstract: PropTypes.string,
    keywords: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    views: PropTypes.number,
    pdfUrl: PropTypes.string
  }).isRequired,
  onView: PropTypes.func,
  onDownload: PropTypes.func
};

export default PaperCard;
