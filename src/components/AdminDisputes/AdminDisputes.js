
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Shield, User, FileText, 
  DollarSign, CheckCircle, XCircle, Scale,
  Clock, MessageSquare, ExternalLink, RefreshCw
} from 'lucide-react';
import './AdminDisputes.css';
import { useNotification } from '../NotificationModal/NotificationModal';

const AdminDisputes = () => {
  const { showNotification } = useNotification();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [showModal, setShowModal] = useState(false);  // ✅ NEW: Modal state
  
  // Resolution form
  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      
      // ✅ UPDATED: Use simplified endpoint (works without project_deliveries table)
      const response = await fetch(`${BACKEND_URL}/api/admin/disputes-simple`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDisputes(data.disputes);
      } else {
        showNotification('error', 'Load Failed', 'Failed to load disputes.');
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
      showNotification('error', 'Connection Error', 'Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (e) => {
    e.preventDefault();
    
    if (!resolution || !adminNotes.trim()) {
      showNotification('error', 'Resolution Required', 'Please select a resolution and provide admin notes.');
      return;
    }
    
    setResolving(true);
    
    try {
      const requestBody = {
        dispute_id: selectedDispute.dispute_id,  // ✅ NEW: For multi-dispute support
        resolution,
        admin_notes: adminNotes
      };
      
      // ✅ UPDATED: Use simplified endpoint
      const response = await fetch(
        `${BACKEND_URL}/api/admin/disputes-simple/${selectedDispute.id}/resolve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(requestBody)
        }
      );
      
      if (response.ok) {
        const result = await response.json();

        // Build success message with refund details if applicable
        let successMessage = 'Dispute resolved successfully.';
        if (result.refund) {
          if (result.refund.processed) {
            successMessage = `Dispute resolved! Refund of $${result.refund.refund_amount?.toFixed(2)} has been processed successfully.`;
          } else if (result.refund.error) {
            successMessage = `Dispute resolved, but refund failed: ${result.refund.error}. Please process refund manually.`;
            showNotification('warning', 'Refund Warning', successMessage);
            setSelectedDispute(null);
            setShowModal(false);
            setResolution('');
            setAdminNotes('');
            fetchDisputes();
            return;
          }
        }

        showNotification('success', 'Dispute Resolved', successMessage);
        setSelectedDispute(null);
        setShowModal(false);  // ✅ NEW: Close modal
        setResolution('');
        setAdminNotes('');
        fetchDisputes();
      } else {
        const error = await response.json();
        showNotification('error', 'Resolve Failed', `Failed to resolve: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error resolving dispute:', error);
      showNotification('error', 'Resolve Failed', 'Failed to resolve dispute.');
    } finally {
      setResolving(false);
    }
  };

  // ✅ NEW: Handle dispute card click
  const handleDisputeClick = (dispute) => {
    setSelectedDispute(dispute);
    setShowModal(true);
    setResolution('');
    setAdminNotes('');
  };

  // ✅ NEW: Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDispute(null);
    setResolution('');
    setAdminNotes('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-disputes-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading disputes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-disputes-container">
      <div className="disputes-header">
        <div className="header-content">
          <AlertTriangle size={32} className="header-icon" />
          <div>
            <h1>Dispute Management</h1>
            <p className="header-subtitle">
              {disputes.length} active dispute{disputes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {disputes.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={48} className="empty-icon" />
          <h3>No Active Disputes</h3>
          <p>All disputes have been resolved. Great job!</p>
        </div>
      ) : (
        <div className="disputes-list">
          {/* Disputes List */}
          {disputes.map((dispute) => (
              <div
                key={dispute.dispute_id || dispute.id}
                className={`dispute-card ${selectedDispute?.dispute_id === dispute.dispute_id ? 'active' : ''}`}
                onClick={() => handleDisputeClick(dispute)}
              >
                {/* <div className="dispute-card-header">
                  <h3>{dispute.project.title}</h3>
                  <span className="dispute-amount">
                    ${dispute.project.amount.toFixed(2)}
                  </span>
                </div> */}

                <div className="dispute-card-header">
                <h3>{dispute.project.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {dispute.project.status === 'fixed_price' && (
                    <span className="badge badge-info" style={{ fontSize: '11px', padding: '2px 8px' }}>
                      Fixed Price
                    </span>
                  )}
                  <span className="dispute-amount">
                    ${dispute.project.amount.toFixed(2)}
                  </span>
                </div>
              </div>
                
                <div className="dispute-reason">
                  <AlertTriangle size={16} />
                  <span>{dispute.dispute_reason}</span>
                </div>
                
                <div className="dispute-opened-by">
                  <Shield size={14} />
                  <span>Opened by: <strong>{dispute.opened_by_name}</strong> ({dispute.opened_by})</span>
                </div>
                
                <div className="dispute-parties">
                  <div className="party">
                    <User size={14} />
                    <span>Developer: {dispute.developer.name}</span>
                  </div>
                  <div className="party">
                    <User size={14} />
                    <span>Investor: {dispute.investor.name}</span>
                  </div>
                </div>
                
                <div className="dispute-time">
                  <Clock size={14} />
                  <span>{formatDate(dispute.disputed_at)}</span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ✅ NEW: Modal for Dispute Details */}
      {showModal && selectedDispute && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="dispute-details">
              <div className="details-header">
                <h2>Dispute Details</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="dispute-id">#{selectedDispute.id.slice(0, 8)}</span>
                  <button className="modal-close-btn" onClick={handleCloseModal}>×</button>
                </div>
              </div>

              {/* Project Information */}
              <div className="info-section">
                <h3><FileText size={20} /> Project Information</h3>
                <div className="info-grid">
                  
                  <div className="info-item">
                    <span className="info-label">Project:</span>
                    <strong>{selectedDispute.project.title}</strong>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Project Status:</span>
                    <strong>
                      {selectedDispute.project.status === 'fixed_price' ? (
                        <span className="badge badge-info">Fixed Price (Multi-Purchase)</span>
                      ) : (
                        <span className="badge badge-warning">Disputed (Auction)</span>
                      )}
                    </strong>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Project Amount:</span>
                    <strong>${selectedDispute.project.amount.toFixed(2)}</strong>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Platform Commission (6%):</span>
                    <strong>${selectedDispute.platform_commission.toFixed(2)}</strong>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Developer Payout:</span>
                    <strong>${selectedDispute.developer_payout.toFixed(2)}</strong>
                  </div>

                </div>
              </div>
              
            {/* ✅ ADD THIS NEW SECTION */}
            {selectedDispute.project.status === 'fixed_price' && (
              <div className="info-section" style={{ backgroundColor: '#e8f4fd', border: '1px solid #4a9eff', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <AlertTriangle size={20} style={{ color: '#4a9eff', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#1a5490' }}>Fixed-Price Project Notice</strong>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#2c5282' }}>
                      This is a fixed-price project that can be purchased by multiple investors. 
                      Resolving this dispute will only affect <strong>{selectedDispute.investor.name}</strong>'s purchase. 
                      Other investors can still purchase this project.
                    </p>
                  </div>
                </div>
              </div>
            )}


              {/* Parties */}
              <div className="info-section">
                <h3><User size={20} /> Parties Involved</h3>
                <div className="parties-grid">
                  <div className="party-card developer">
                    <div className="party-header">
                      <User size={18} />
                      <span>Developer</span>
                    </div>
                    <p className="party-name">{selectedDispute.developer.name}</p>
                    <p className="party-email">{selectedDispute.developer.email}</p>
                  </div>
                  
                  <div className="party-card investor">
                    <div className="party-header">
                      <User size={18} />
                      <span>Investor</span>
                    </div>
                    <p className="party-name">{selectedDispute.investor.name}</p>
                    <p className="party-email">{selectedDispute.investor.email}</p>
                  </div>
                </div>
              </div>

              {/* Dispute Information */}
              <div className="info-section">
                <h3><AlertTriangle size={20} /> Dispute Information</h3>
                <div className="dispute-info">
                  <div className="info-item full-width">
                    <span className="info-label">Reason:</span>
                    <p className="dispute-reason-text">{selectedDispute.dispute_reason}</p>
                  </div>
                  
                  {selectedDispute.dispute_notes && (
                    <div className="info-item full-width">
                      <span className="info-label">Additional Notes:</span>
                      <p className="dispute-notes-text">{selectedDispute.dispute_notes}</p>
                    </div>
                  )}
                  
                  <div className="info-item full-width">
                    <span className="info-label">Disputed At:</span>
                    <span>{formatDate(selectedDispute.disputed_at)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="info-section">
                <h3><FileText size={20} /> Delivery Details</h3>
                <div className="delivery-info">
                  {selectedDispute.delivery_url ? (
                    <div className="info-item full-width">
                      <span className="info-label">Delivery URL:</span>
                      <a 
                        href={selectedDispute.delivery_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="external-link"
                      >
                        {selectedDispute.delivery_url}
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  ) : (
                    <div className="info-item full-width">
                      <span className="info-label">Delivery URL:</span>
                      <span className="text-muted">No delivery URL provided</span>
                    </div>
                  )}
                  
                  <div className="info-item full-width">
                    <span className="info-label">Developer Notes:</span>
                    <p className="notes-text">{selectedDispute.delivery_notes || 'No notes provided'}</p>
                  </div>
                </div>
              </div>

              {/* Resolution Form */}
              <form onSubmit={handleResolveDispute} className="resolution-form">
                <h3><Scale size={20} /> Resolve Dispute</h3>
                
                <div className="form-group">
                  <label>Resolution Decision *</label>
                  <select
                    className="form-select"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    required
                  >
                    <option value="">Select resolution...</option>
                    <option value="refund_investor">💰 Refund to Investor (Full refund)</option>
                    <option value="refund_developer">✅ Refund to Developer (Full payment)</option>
                    <option value="continue_project">🔄 Continue Project (Give another chance)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Admin Notes *</label>
                  <textarea
                    className="form-textarea"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Explain your decision and reasoning. This will be sent to both parties."
                    rows={5}
                    required
                  />
                  <span className="form-hint">
                    Be clear and fair in your explanation. Both parties will see this.
                  </span>
                </div>

                <div className="resolution-summary">
                  <h4>Resolution Summary</h4>
                  {resolution === 'refund_developer' && (
                    <div className="summary-content success">
                      <CheckCircle size={20} />
                      <div>
                        <p><strong>Developer receives:</strong> ${selectedDispute.developer_payout.toFixed(2)}</p>
                        <p><strong>Platform commission:</strong> ${selectedDispute.platform_commission.toFixed(2)}</p>
                        <p className="text-small">Project marked as completed</p>
                        <p className="text-small">Investor receives no refund</p>
                      </div>
                    </div>
                  )}
                  
                  {resolution === 'refund_investor' && (
                    <div className="summary-content error">
                      <XCircle size={20} />
                      <div>
                        <p><strong>Investor refund:</strong> ${selectedDispute.project?.amount?.toFixed(2) || 'N/A'}</p>
                        <p className="text-small">Stripe refund will be processed automatically</p>
                        <p className="text-small">Project marked as cancelled</p>
                        <p className="text-small">Developer receives no payment</p>
                        <p className="text-small refund-warning">Refund may take 5-10 business days to appear on investor's statement</p>
                      </div>
                    </div>
                  )}
                  
                  {resolution === 'continue_project' && (
                    <div className="summary-content warning">
                      <RefreshCw size={20} />
                      <div>
                        <p><strong>Project status:</strong> Returns to previous status</p>
                        <p className="text-small">Developer and investor can continue working</p>
                        <p className="text-small">No payment or refund processed</p>
                        <p className="text-small">Another chance to complete the project</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleCloseModal}
                    disabled={resolving}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={resolving || !resolution || !adminNotes.trim()}
                  >
                    {resolving ? 'Resolving...' : 'Resolve Dispute'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
