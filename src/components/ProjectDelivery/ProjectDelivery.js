import React, { useState, useEffect } from 'react';
import { 
  Package, CheckCircle, XCircle, AlertTriangle, 
  FileText, DollarSign, Clock, MessageSquare,
  Upload, Send, Shield
} from 'lucide-react';
import './ProjectDelivery.css';
import { useNotification } from '../NotificationModal/NotificationModal';

const ProjectDelivery = ({ projectId, currentUser, onNavigateToChat }) => {
  const { showNotification } = useNotification();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  
  const [project, setProject] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeNotes, setDisputeNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  
  // UI states
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    fetchProjectAndDelivery();
  }, [projectId]);

  const fetchProjectAndDelivery = async () => {
    try {
      setLoading(true);
      
      // Fetch project details
      const projectResponse = await fetch(`${BACKEND_URL}/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        setProject(projectData);
      }
      
      // Fetch delivery status
      const deliveryResponse = await fetch(`${BACKEND_URL}/api/projects/${projectId}/delivery`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (deliveryResponse.ok) {
        const deliveryData = await deliveryResponse.json();
        setDelivery(deliveryData.delivery);
        
        if (deliveryData.delivery) {
          setDeliveryUrl(deliveryData.delivery.delivery_url || '');
          setDeliveryNotes(deliveryData.delivery.delivery_notes || '');
        }
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDelivery = async (e) => {
    e.preventDefault();
    
    if (!deliveryNotes.trim()) {
      showNotification('error', 'Delivery Notes Required', 'Please provide delivery notes.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/projects/${projectId}/delivery/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          delivery_url: deliveryUrl,
          delivery_notes: deliveryNotes
        })
      });
      
      if (response.ok) {
        showNotification('success', 'Submitted', 'Project submitted for review.');
        setShowSubmitForm(false);
        fetchProjectAndDelivery();
      } else {
        const error = await response.json();
        showNotification('error', 'Submission Failed', `Failed to submit: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error submitting delivery:', error);
      showNotification('error', 'Submission Failed', 'Failed to submit delivery.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveDelivery = async () => {
    setSubmitting(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/projects/${projectId}/delivery/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          approved: true,
          feedback: feedback
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        showNotification(
          'success',
          'Project Approved',
          `Developer will receive $${result.developer_payout.toFixed(2)}.`
        );
        setShowApprovalModal(false);
        fetchProjectAndDelivery();
      } else {
        const error = await response.json();
        showNotification('error', 'Approval Failed', `Failed to approve: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error approving delivery:', error);
      showNotification('error', 'Approval Failed', 'Failed to approve delivery.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectDelivery = async () => {
    if (!feedback.trim()) {
      showNotification('error', 'Feedback Required', 'Please provide feedback for the developer.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/projects/${projectId}/delivery/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          approved: false,
          feedback: feedback
        })
      });
      
      if (response.ok) {
        showNotification('success', 'Feedback Sent', 'Feedback sent to developer.');
        setShowApprovalModal(false);
        setFeedback('');
        fetchProjectAndDelivery();
      } else {
        const error = await response.json();
        showNotification('error', 'Feedback Failed', `Failed to send feedback: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error rejecting delivery:', error);
      showNotification('error', 'Feedback Failed', 'Failed to send feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDispute = async (e) => {
    e.preventDefault();
    
    if (!disputeReason.trim()) {
      showNotification('error', 'Dispute Reason Required', 'Please provide a dispute reason.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/projects/${projectId}/delivery/dispute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          reason: disputeReason,
          notes: disputeNotes
        })
      });
      
      if (response.ok) {
        showNotification('success', 'Dispute Opened', 'An admin will review your case.');
        setShowDisputeForm(false);
        setDisputeReason('');
        setDisputeNotes('');
        fetchProjectAndDelivery();
      } else {
        const error = await response.json();
        showNotification('error', 'Dispute Failed', `Failed to open dispute: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error opening dispute:', error);
      showNotification('error', 'Dispute Failed', 'Failed to open dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { icon: Clock, color: 'gray', text: 'Pending Submission' },
      'submitted': { icon: Upload, color: 'blue', text: 'Submitted for Review' },
      'under_review': { icon: FileText, color: 'orange', text: 'Under Review' },
      'approved': { icon: CheckCircle, color: 'green', text: 'Approved' },
      'disputed': { icon: AlertTriangle, color: 'red', text: 'Disputed' },
      'resolved': { icon: Shield, color: 'purple', text: 'Resolved' }
    };
    
    const badge = badges[status] || badges['pending'];
    const Icon = badge.icon;
    
    return (
      <span className={`status-badge status-${badge.color}`}>
        <Icon size={16} />
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="delivery-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading delivery information...</p>
        </div>
      </div>
    );
  }

  const isDeveloper = currentUser.id === project?.developer_id;
  const isInvestor = currentUser.id === project?.assigned_to;

  return (
    <div className="delivery-container">
      <div className="delivery-header">
        <div className="delivery-header-content">
          <Package size={32} className="header-icon" />
          <div>
            <h1>Project Delivery</h1>
            <p className="project-title">{project?.title}</p>
          </div>
        </div>
        {delivery && getStatusBadge(delivery.status)}
      </div>

      {/* Payment Information */}
      {delivery && (
        <div className="payment-info-card">
          <h3><DollarSign size={20} /> Payment Breakdown</h3>
          <div className="payment-details">
            <div className="payment-row">
              <span>Project Amount:</span>
              <strong>${delivery.project_amount.toFixed(2)}</strong>
            </div>
            <div className="payment-row">
              <span>Platform Commission (6%):</span>
              <strong className="text-warning">-${delivery.platform_commission.toFixed(2)}</strong>
            </div>
            <div className="payment-row total">
              <span>Developer Payout:</span>
              <strong className="text-success">${delivery.developer_payout.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Developer View */}
      {isDeveloper && (
        <div className="developer-section">
          {!delivery || delivery.status === 'pending' ? (
            <div className="action-card">
              <h3>Submit Your Work</h3>
              <p>Ready to deliver? Submit your project for investor review.</p>
              
              {!showSubmitForm ? (
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => setShowSubmitForm(true)}
                >
                  <Upload size={20} />
                  Submit Delivery
                </button>
              ) : (
                <form onSubmit={handleSubmitDelivery} className="delivery-form">
                  <div className="form-group">
                    <label>Delivery URL (GitHub, Drive, etc.)</label>
                    <input
                      type="url"
                      className="form-input"
                      value={deliveryUrl}
                      onChange={(e) => setDeliveryUrl(e.target.value)}
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Delivery Notes *</label>
                    <textarea
                      className="form-textarea"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Describe what you've delivered, how to access it, any credentials needed, etc."
                      rows={6}
                      required
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={() => setShowSubmitForm(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit for Review'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="status-card">
              <h3>Delivery Status</h3>
              <div className="delivery-details">
                {delivery.delivery_url && (
                  <div className="detail-row">
                    <strong>Delivery URL:</strong>
                    <a href={delivery.delivery_url} target="_blank" rel="noopener noreferrer">
                      {delivery.delivery_url}
                    </a>
                  </div>
                )}
                
                <div className="detail-row">
                  <strong>Notes:</strong>
                  <p>{delivery.delivery_notes}</p>
                </div>
                
                {delivery.submitted_at && (
                  <div className="detail-row">
                    <strong>Submitted:</strong>
                    <span>{new Date(delivery.submitted_at).toLocaleString()}</span>
                  </div>
                )}
                
                {delivery.status === 'approved' && (
                  <div className="success-message">
                    <CheckCircle size={24} />
                    <div>
                      <strong>Project Approved!</strong>
                      <p>Payment of ${delivery.developer_payout.toFixed(2)} has been released.</p>
                    </div>
                  </div>
                )}
                
                {delivery.status === 'disputed' && (
                  <div className="warning-message">
                    <AlertTriangle size={24} />
                    <div>
                      <strong>Dispute Opened</strong>
                      <p>{delivery.dispute_reason}</p>
                      <p className="text-small">An admin is reviewing this case.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Investor View */}
      {isInvestor && delivery && delivery.status === 'submitted' && (
        <div className="investor-section">
          <div className="action-card">
            <h3>Review Delivery</h3>
            
            <div className="delivery-preview">
              {delivery.delivery_url && (
                <div className="preview-row">
                  <strong>Delivery URL:</strong>
                  <a href={delivery.delivery_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                    <FileText size={16} />
                    View Delivery
                  </a>
                </div>
              )}
              
              <div className="preview-row">
                <strong>Developer Notes:</strong>
                <p>{delivery.delivery_notes}</p>
              </div>
            </div>
            
            {!showApprovalModal && !showDisputeForm ? (
              <div className="action-buttons">
                <button 
                  className="btn btn-success btn-lg"
                  onClick={() => setShowApprovalModal(true)}
                >
                  <CheckCircle size={20} />
                  Approve & Release Payment
                </button>
                
                <button 
                  className="btn btn-outline btn-lg"
                  onClick={() => setShowApprovalModal(true)}
                >
                  <MessageSquare size={20} />
                  Request Changes
                </button>
                
                <button 
                  className="btn btn-danger btn-lg"
                  onClick={() => setShowDisputeForm(true)}
                >
                  <AlertTriangle size={20} />
                  Open Dispute
                </button>
              </div>
            ) : null}
            
            {showApprovalModal && (
              <div className="modal-content">
                <h4>Review Project</h4>
                <p>Are you satisfied with the delivered work?</p>
                
                <div className="form-group">
                  <label>Feedback (optional)</label>
                  <textarea
                    className="form-textarea"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback to the developer..."
                    rows={4}
                  />
                </div>
                
                <div className="modal-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      setShowApprovalModal(false);
                      setFeedback('');
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  
                  <button 
                    className="btn btn-warning"
                    onClick={handleRejectDelivery}
                    disabled={submitting}
                  >
                    Request Changes
                  </button>
                  
                  <button 
                    className="btn btn-success"
                    onClick={handleApproveDelivery}
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : `Approve ($${delivery.developer_payout.toFixed(2)})`}
                  </button>
                </div>
                
                <div className="payment-reminder">
                  <Shield size={16} />
                  <span>Payment will be released to developer. Platform commission: ${delivery.platform_commission.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            {showDisputeForm && (
              <form onSubmit={handleOpenDispute} className="dispute-form">
                <h4>Open Dispute</h4>
                <p className="text-warning">This will escalate the issue to admin review.</p>
                
                <div className="form-group">
                  <label>Dispute Reason *</label>
                  <select
                    className="form-select"
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    required
                  >
                    <option value="">Select reason...</option>
                    <option value="incomplete">Project is incomplete</option>
                    <option value="not_working">Project doesn't work as described</option>
                    <option value="poor_quality">Poor quality/not meeting requirements</option>
                    <option value="missing_features">Missing agreed features</option>
                    <option value="other">Other reason</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Additional Details</label>
                  <textarea
                    className="form-textarea"
                    value={disputeNotes}
                    onChange={(e) => setDisputeNotes(e.target.value)}
                    placeholder="Provide details about the issue..."
                    rows={4}
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setShowDisputeForm(false);
                      setDisputeReason('');
                      setDisputeNotes('');
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-danger"
                    disabled={submitting}
                  >
                    {submitting ? 'Opening...' : 'Open Dispute'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Investor View - Other States */}
      {isInvestor && delivery && delivery.status !== 'submitted' && (
        <div className="status-card">
          <h3>Delivery Status</h3>
          <div className="delivery-details">
            {delivery.delivery_url && (
              <div className="detail-row">
                <strong>Delivery URL:</strong>
                <a href={delivery.delivery_url} target="_blank" rel="noopener noreferrer">
                  {delivery.delivery_url}
                </a>
              </div>
            )}
            
            <div className="detail-row">
              <strong>Notes:</strong>
              <p>{delivery.delivery_notes}</p>
            </div>
            
            {delivery.status === 'approved' && (
              <div className="success-message">
                <CheckCircle size={24} />
                <div>
                  <strong>You approved this project</strong>
                  <p>Developer received ${delivery.developer_payout.toFixed(2)}</p>
                </div>
              </div>
            )}
            
            {delivery.status === 'disputed' && (
              <div className="warning-message">
                <AlertTriangle size={24} />
                <div>
                  <strong>Dispute in Progress</strong>
                  <p>Reason: {delivery.dispute_reason}</p>
                  <p className="text-small">An admin is reviewing this case and will make a decision soon.</p>
                </div>
              </div>
            )}
            
            {delivery.status === 'resolved' && (
              <div className="info-message">
                <Shield size={24} />
                <div>
                  <strong>Dispute Resolved</strong>
                  <p>Resolution: {delivery.resolution}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Navigation */}
      <div className="chat-prompt">
        <MessageSquare size={20} />
        <span>Have questions? Discuss in the project chat</span>
        <button 
          className="btn btn-outline btn-sm"
          onClick={onNavigateToChat}
        >
          Open Chat
        </button>
      </div>
      
      {/* Security Notice */}
      <div className="security-notice">
        <Shield size={18} />
        <div>
          <strong>🔒 Platform Protection</strong>
          <p>All communication must happen through BiteBids. Sharing contact information (phone, email, social media) is prohibited and monitored.</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDelivery;
