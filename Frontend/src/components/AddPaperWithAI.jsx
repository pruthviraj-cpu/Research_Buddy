import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Upload, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = 'http://127.0.0.1:8000';

const AddPaperWithAI = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
      setPdfFile(null);
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      setError('Please select a PDF file');
      toast.error('Please select a PDF file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUploaded(true);
      setUploading(false);
    } catch (err) {
      setError('Failed to upload PDF. Please try again.');
      toast.error('Failed to upload PDF. Please try again.');
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const formData = new FormData();
      formData.append('file', pdfFile);
      const response = await fetch(`${API_BASE_URL}/process-research-paper/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      setGenerating(false);
      setSuccess(true);
      
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 2000);
      
    } catch (err) {
      setError('Failed to generate paper. Please try again.');
      toast.error('Failed to generate paper. Please try again.');
      setGenerating(false);
    }
  };

  const handleClose = () => {
    setPdfFile(null);
    setUploaded(false);
    setUploading(false);
    setGenerating(false);
    setSuccess(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-xl">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Add Paper with AI</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-200 rounded-full"
            disabled={uploading || generating}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Success Message */}
          {success ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600">Research paper added to database successfully</p>
            </div>
          ) : (
            <>
              {/* Upload Section */}
              {!uploaded ? (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Upload your research paper PDF
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      AI will automatically extract and populate all paper details
                    </p>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pdf-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
                    >
                      Choose PDF File
                    </label>
                  </div>

                  {pdfFile && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Selected file:</p>
                      <p className="text-sm text-purple-600">{pdfFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Size: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpload}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!pdfFile || uploading}
                    >
                      {uploading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </span>
                      ) : (
                        'Upload'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // Generate Section
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Uploaded Successfully!</h3>
                    <p className="text-sm text-gray-600 mb-1">File: {pdfFile?.name}</p>
                    <p className="text-sm text-gray-500">Click Generate to extract paper details using AI</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      disabled={generating}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={generating}
                    >
                      {generating ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Sparkles size={16} className="mr-2" />
                          Generate
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

AddPaperWithAI.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default AddPaperWithAI;
