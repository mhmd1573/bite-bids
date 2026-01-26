import React, { useState, useEffect } from 'react';
import {
  Wallet, DollarSign, Clock, CheckCircle, XCircle,
  RefreshCw, Eye, Send, AlertTriangle, User,
  Mail, CreditCard, Building2, Bitcoin, Filter,
  ChevronDown, X, Copy, ExternalLink
} from 'lucide-react';
import './AdminPayouts.css';
import { useNotification } from '../NotificationModal/NotificationModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AdminPayouts = () => {
  const { showNotification } = useNotification();

  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');

  // Form states
  const [transactionId, setTransactionId] = useState('');
  const [transactionNotes, setTransactionNotes] = useState('');
  const [failureReason, setFailureReason] = useState('');

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const url = statusFilter
        ? `${BACKEND_URL}/api/admin/payouts?status=${statusFilter}`
        : `${BACKEND_URL}/api/admin/payouts`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayouts(data.payouts);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
      showNotification('error', 'Error', 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async () => {
    if (!selectedPayout) return;

    setProcessing(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/payouts/${selectedPayout.id}/process`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            transaction_id: transactionId || null,
            transaction_notes: transactionNotes || null
          })
        }
      );

      if (response.ok) {
        showNotification('success', 'Processing', 'Payout marked as processing');
        closeModal();
        fetchPayouts();
      } else {
        const error = await response.json();
        showNotification('error', 'Error', error.detail || 'Failed to process payout');
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      showNotification('error', 'Error', 'Failed to process payout');
    } finally {
      setProcessing(false);
    }
  };

  const handleCompletePayout = async () => {
    if (!selectedPayout || !transactionId.trim()) {
      showNotification('error', 'Required', 'Please enter the transaction ID');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/payouts/${selectedPayout.id}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            transaction_id: transactionId,
            transaction_notes: transactionNotes || null
          })
        }
      );

      if (response.ok) {
        showNotification('success', 'Completed', 'Payout marked as completed!');
        closeModal();
        fetchPayouts();
      } else {
        const error = await response.json();
        showNotification('error', 'Error', error.detail || 'Failed to complete payout');
      }
    } catch (error) {
      console.error('Error completing payout:', error);
      showNotification('error', 'Error', 'Failed to complete payout');
    } finally {
      setProcessing(false);
    }
  };

  const handleFailPayout = async () => {
    if (!selectedPayout || !failureReason.trim()) {
      showNotification('error', 'Required', 'Please enter a failure reason');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/payouts/${selectedPayout.id}/fail`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            failure_reason: failureReason
          })
        }
      );

      if (response.ok) {
        showNotification('warning', 'Failed', 'Payout marked as failed');
        closeModal();
        fetchPayouts();
      } else {
        const error = await response.json();
        showNotification('error', 'Error', error.detail || 'Failed to update payout');
      }
    } catch (error) {
      console.error('Error failing payout:', error);
      showNotification('error', 'Error', 'Failed to update payout');
    } finally {
      setProcessing(false);
    }
  };

  const handleRetryPayout = async (payoutId) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/payouts/${payoutId}/retry`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        showNotification('success', 'Retry', 'Payout reset to pending');
        fetchPayouts();
      } else {
        const error = await response.json();
        showNotification('error', 'Error', error.detail);
      }
    } catch (error) {
      console.error('Error retrying payout:', error);
    }
  };

  const openModal = (payout) => {
    setSelectedPayout(payout);
    setTransactionId(payout.transaction_id || '');
    setTransactionNotes(payout.transaction_notes || '');
    setFailureReason('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPayout(null);
    setTransactionId('');
    setTransactionNotes('');
    setFailureReason('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('success', 'Copied', 'Copied to clipboard');
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'paypal': return <CreditCard size={16} />;
      case 'wise': return <ExternalLink size={16} />;
      case 'bank_transfer': return <Building2 size={16} />;
      case 'crypto': return <Bitcoin size={16} />;
      default: return <Wallet size={16} />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'warning', icon: <Clock size={14} />, text: 'Pending' },
      processing: { color: 'info', icon: <RefreshCw size={14} className="spin" />, text: 'Processing' },
      completed: { color: 'success', icon: <CheckCircle size={14} />, text: 'Completed' },
      failed: { color: 'error', icon: <XCircle size={14} />, text: 'Failed' },
      cancelled: { color: 'secondary', icon: <X size={14} />, text: 'Cancelled' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`status-badge status-${badge.color}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-payouts">
      {/* Header */}
      <div className="payouts-header">
        <div className="header-content">
          <Wallet className="header-icon" size={28} />
          <div>
            <h1>Payout Management</h1>
            <p>Process and track developer payouts</p>
          </div>
        </div>

        <button className="btn btn-outline" onClick={fetchPayouts}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div
          className={`stat-card ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.pending?.count || 0}</span>
            <span className="stat-label">Pending</span>
            <span className="stat-amount">${(stats.pending?.total || 0).toFixed(2)}</span>
          </div>
        </div>

        <div
          className={`stat-card ${statusFilter === 'processing' ? 'active' : ''}`}
          onClick={() => setStatusFilter('processing')}
        >
          <div className="stat-icon processing">
            <RefreshCw size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.processing?.count || 0}</span>
            <span className="stat-label">Processing</span>
            <span className="stat-amount">${(stats.processing?.total || 0).toFixed(2)}</span>
          </div>
        </div>

        <div
          className={`stat-card ${statusFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('completed')}
        >
          <div className="stat-icon completed">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed?.count || 0}</span>
            <span className="stat-label">Completed</span>
            <span className="stat-amount">${(stats.completed?.total || 0).toFixed(2)}</span>
          </div>
        </div>

        <div
          className={`stat-card ${statusFilter === 'failed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('failed')}
        >
          <div className="stat-icon failed">
            <XCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.failed?.count || 0}</span>
            <span className="stat-label">Failed</span>
            <span className="stat-amount">${(stats.failed?.total || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="admin-payouts-filter-group">
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Payouts</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Payouts Table */}
      {loading ? (
        <div className="loading-state">
          <RefreshCw size={32} className="spin" />
          <p>Loading payouts...</p>
        </div>
      ) : payouts.length === 0 ? (
        <div className="empty-state">
          <DollarSign size={48} />
          <h3>No payouts found</h3>
          <p>There are no {statusFilter ? statusFilter : ''} payouts at this time.</p>
        </div>
      ) : (
        <div className="payouts-table-container">
          <table className="payouts-table">
            <thead>
              <tr>
                <th>Developer</th>
                <th>Project</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map(payout => (
                <tr key={payout.id}>
                  <td className="developer-cell">
                    <div className="developer-info">
                      <User size={16} />
                      <div>
                        <span className="name">{payout.developer?.name}</span>
                        <span className="email">{payout.developer?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="project-cell">
                    <span className="project-title">{payout.project_title || 'N/A'}</span>
                  </td>
                  <td className="amount-cell">
                    <div className="amount-info">
                      <span className="net">${payout.net_amount?.toFixed(2)}</span>
                      <span className="gross">Gross: ${payout.gross_amount?.toFixed(2)}</span>
                      <span className="fee">Fee: ${payout.platform_fee?.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="method-cell">
                    <span className="method-badge">
                      {getMethodIcon(payout.payout_method)}
                      {payout.payout_method || 'Not set'}
                    </span>
                  </td>
                  <td>{getStatusBadge(payout.status)}</td>
                  <td className="date-cell">{formatDate(payout.created_at)}</td>
                  <td className="actions-cell">
                    <button
                      className="btn-icon"
                      onClick={() => openModal(payout)}
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {payout.status === 'failed' && (
                      <button
                        className="btn-icon retry"
                        onClick={() => handleRetryPayout(payout.id)}
                        title="Retry Payout"
                      >
                        <RefreshCw size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payout Detail Modal */}
      {showModal && selectedPayout && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payout Details</h2>
              <button className="btn-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {/* Developer Info */}
              <div className="detail-section">
                <h3><User size={18} /> Developer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <span>{selectedPayout.developer?.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <span className="copyable" onClick={() => copyToClipboard(selectedPayout.developer?.email)}>
                      {selectedPayout.developer?.email}
                      <Copy size={14} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="detail-section">
                <h3><DollarSign size={18} /> Payment Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Gross Amount</label>
                    <span>${selectedPayout.gross_amount?.toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Platform Fee (6%)</label>
                    <span className="fee">-${selectedPayout.platform_fee?.toFixed(2)}</span>
                  </div>
                  <div className="detail-item highlight">
                    <label>Net Amount (To Pay)</label>
                    <span className="net-amount">${selectedPayout.net_amount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payout Method */}
              <div className="detail-section">
                <h3><Wallet size={18} /> Payout Method</h3>
                {selectedPayout.payout_method ? (
                  <div className="payout-method-details">
                    <div className="method-header">
                      {getMethodIcon(selectedPayout.payout_method)}
                      <span>{selectedPayout.payout_method?.toUpperCase()}</span>
                    </div>

                    {selectedPayout.payout_email && (
                      <div className="detail-item">
                        <label>Payment Email</label>
                        <span className="copyable" onClick={() => copyToClipboard(selectedPayout.payout_email)}>
                          {selectedPayout.payout_email}
                          <Copy size={14} />
                        </span>
                      </div>
                    )}

                    {selectedPayout.payout_details && (
                      <div className="payout-details-json">
                        <label>Additional Details</label>
                        <pre>{JSON.stringify(selectedPayout.payout_details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="warning-box">
                    <AlertTriangle size={18} />
                    <span>Developer has not set up payout preferences</span>
                  </div>
                )}
              </div>

              {/* Action Form */}
              {selectedPayout.status !== 'completed' && selectedPayout.status !== 'cancelled' && (
                <div className="detail-section action-section">
                  <h3><Send size={18} /> Process Payout</h3>

                  <div className="form-group">
                    <label>Transaction ID / Reference</label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g., PayPal transaction ID, bank reference"
                    />
                  </div>

                  <div className="form-group">
                    <label>Notes (Optional)</label>
                    <textarea
                      value={transactionNotes}
                      onChange={(e) => setTransactionNotes(e.target.value)}
                      placeholder="Any notes about this transaction..."
                      rows={3}
                    />
                  </div>

                  <div className="action-buttons">
                    {selectedPayout.status === 'pending' && (
                      <button
                        className="btn btn-info"
                        onClick={handleProcessPayout}
                        disabled={processing}
                      >
                        <RefreshCw size={18} />
                        Mark as Processing
                      </button>
                    )}

                    <button
                      className="btn btn-success"
                      onClick={handleCompletePayout}
                      disabled={processing || !transactionId.trim()}
                    >
                      <CheckCircle size={18} />
                      Mark as Completed
                    </button>
                  </div>

                  {/* Failure Section */}
                  {selectedPayout.status !== 'failed' && (
                    <div className="failure-section">
                      <h4><AlertTriangle size={16} /> Mark as Failed</h4>
                      <div className="form-group">
                        <input
                          type="text"
                          value={failureReason}
                          onChange={(e) => setFailureReason(e.target.value)}
                          placeholder="Reason for failure..."
                        />
                      </div>
                      <button
                        className="btn btn-danger"
                        onClick={handleFailPayout}
                        disabled={processing || !failureReason.trim()}
                      >
                        <XCircle size={18} />
                        Mark as Failed
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Completed Info */}
              {selectedPayout.status === 'completed' && (
                <div className="detail-section completed-section">
                  <h3><CheckCircle size={18} /> Completed</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Transaction ID</label>
                      <span>{selectedPayout.transaction_id || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Completed At</label>
                      <span>{formatDate(selectedPayout.completed_at)}</span>
                    </div>
                    {selectedPayout.transaction_notes && (
                      <div className="detail-item full-width">
                        <label>Notes</label>
                        <span>{selectedPayout.transaction_notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Failed Info */}
              {selectedPayout.status === 'failed' && (
                <div className="detail-section failed-section">
                  <h3><XCircle size={18} /> Failed</h3>
                  <div className="failure-reason">
                    {selectedPayout.failure_reason || 'No reason provided'}
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleRetryPayout(selectedPayout.id)}
                  >
                    <RefreshCw size={18} />
                    Retry Payout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayouts;
