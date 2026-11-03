import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCloudUpload, HiCheckCircle, HiExclamationCircle, HiOutlineDocument } from 'react-icons/hi';
import { uploadDocument } from '../services/api';
import './UploadDocument.css';

const UploadDocument = () => {
  const [file, setFile] = useState(null);
  const [type, setType] = useState('Other');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [newDocId, setNewDocId] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setStatus('idle');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    
    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', type);
    if (dueDate) formData.append('due_date', dueDate);
    
    try {
      const res = await uploadDocument(formData);
      setNewDocId(res.data?.data?.document?.id);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Failed to upload document');
    }
  };

  const resetForm = () => {
    setFile(null);
    setStatus('idle');
    setNewDocId(null);
  };

  return (
    <div className="page-container">
      <div className="page-header mb-6">
        <h2>Upload Document</h2>
        <p className="text-muted">Upload a new document to the intelligence pipeline</p>
      </div>

      <div className="upload-container">
        {status === 'success' ? (
          <div className="upload-success">
            <HiCheckCircle size={64} className="text-success mb-4" style={{ color: 'var(--status-done)' }} />
            <h3>Upload Successful!</h3>
            <p className="text-muted mb-6">Your document has been added to the processing queue.</p>
            <div className="flex gap-4 justify-center">
              <button className="btn btn-secondary" onClick={resetForm}>Upload Another</button>
              {newDocId && (
                <button className="btn btn-primary" onClick={() => navigate(`/documents/${newDocId}`)}>View Document</button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div 
              className="dropzone" 
              onDragOver={handleDragOver} 
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <HiOutlineCloudUpload size={48} className="text-muted mb-4" />
              <p><strong>Drag & drop your document here</strong></p>
              <p className="text-muted text-sm mb-4">or click to Browse Files</p>
              <p className="text-xs text-muted">Supported formats: PDF, DOC, DOCX, TIFF, PNG, JPG (Max 25MB)</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                accept=".pdf,.png,.jpg,.jpeg,.tiff,.doc,.docx"
              />
            </div>

            {file && (
              <div className="file-info-card mt-6">
                <div className="flex items-center gap-4 mb-4">
                  <HiOutlineDocument size={32} className="text-accent" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{file.name}</div>
                    <div className="text-xs text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown Type'}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Submission / Target Due Date (Optional)
                  </label>
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Optional: Specify milestone or cutoff deadline for lifecycle ledger tracking.
                  </span>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="upload-error mt-4">
                <HiExclamationCircle size={20} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="mt-6 flex justify-between items-center">
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                disabled={!file || status === 'uploading'} 
                onClick={handleUpload}
              >
                {status === 'uploading' ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadDocument;
