import React, { useState, useEffect } from 'react';
import {
  Wallet, DollarSign, Clock, CheckCircle, XCircle,
  RefreshCw, Eye, AlertTriangle, User,
  Landmark, Filter,
  X, Copy, Check
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
  const [statusFilter, setStatusFilter] = useState('pending');
  const [processing, setProcessing] = useState(false);

  // Mark as paid form
  const [showMarkPaidForm, setShowMarkPaidForm] = useState(false);
  const [transferReference, setTransferReference] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Mark as failed form
  const [showMarkFailedForm, setShowMarkFailedForm] = useState(false);
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

  const handleMarkPaid = async () => {
    if (!transferReference.trim()) {
      showNotification('error', 'Validation Error', 'Please enter a transfer reference.');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/payouts/${selectedPayout.id}/mark-paid`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bank_transfer_reference: transferReference,
            admin_notes: adminNotes
          })
        }
      );

      if (response.ok) {
        showNotification('success', 'Paid', 'Payout marked as paid successfully');
        fetchPayouts();
        closeModal();
      } else {
        const error = await response.json();
        showNotification('error', 'Error', error.detail || 'Failed to mark as paid');
      }
    } catch (error) {
      console.error('Error marking payout as paid:', error);
      showNotification('error', 'Error', 'Failed to mark as paid');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkFailed = async () => {
    if (!failureReason.trim()) {
      showNotification('error', 'Validation Error', 'Please enter a failure reason.');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/payouts/${selectedPayout.id}/mark-failed`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            failure_reason: failureReason,
            admin_notes: adminNotes
          })
        }
      );

      if (response.ok) {
        showNotification('success', 'Failed', 'Payout marked as failed');
        fetchPayouts();
        closeModal();
      } else {
        const error = await response.json();
        showNotification('error', 'Error', error.detail || 'Failed to mark as failed');
      }
    } catch (error) {
      console.error('Error marking payout as failed:', error);
      showNotification('error', 'Error', 'Failed to mark as failed');
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (payout) => {
    setSelectedPayout(payout);
    setShowModal(true);
    setShowMarkPaidForm(false);
    setShowMarkFailedForm(false);
    setTransferReference('');
    setAdminNotes('');
    setFailureReason('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPayout(null);
    setShowMarkPaidForm(false);
    setShowMarkFailedForm(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('success', 'Copied', 'Copied to clipboard');
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
            <p>Manage manual bank transfer payouts to developers</p>
          </div>
        </div>

        <button className="btn btn-outline" onClick={fetchPayouts}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Bank Transfer Info Banner */}
      <div className="bank-transfer-info-banner">
        <Landmark size={20} />
        <div>
          <strong>Manual Bank Transfer Payouts</strong>
          <p>Developer payouts are processed manually via bank transfer. When an investor confirms a project, a payout is created as pending. An admin must initiate the bank transfer and mark the payout as paid with a transfer reference.</p>
        </div>
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
                <th>Bank Details</th>
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
                  
                  <td className="bank-cell">
                    {payout.developer?.bank_name ? (
                      <span className="bank-info" title={`${payout.developer.bank_name} - ${payout.developer.bank_account_holder}`}>
                        <Landmark size={14} />
                        {payout.developer.bank_name}
                      </span>
                    ) : (
                      <span className="no-bank">No bank details</span>
                    )}
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
                    <label>Net Amount (Paid)</label>
                    <span className="net-amount">${selectedPayout.net_amount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Bank Transfer Details */}
              <div className="detail-section">
                <h3><Landmark size={18} /> Bank Account Details</h3>
                <div className="bank-transfer-details">
                  <div className="detail-grid">
                    <div className="detail-item full-width">
                      <label>Bank Name</label>
                      <span>{selectedPayout.developer?.bank_name || 'Not provided'}</span>
                    </div>
                    <div className="detail-item full-width">
                      <label>Account Holder</label>
                      <span>{selectedPayout.developer?.bank_account_holder || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Account Number</label>
                      <span>{selectedPayout.developer?.bank_account_number || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Routing Number</label>
                      <span>{selectedPayout.developer?.bank_routing_number || 'Not provided'}</span>
                    </div>
                    {selectedPayout.developer?.bank_iban && (
                      <div className="detail-item">
                        <label>IBAN</label>
                        <span>{selectedPayout.developer.bank_iban}</span>
                      </div>
                    )}
                    {selectedPayout.developer?.bank_swift_code && (
                      <div className="detail-item">
                        <label>SWIFT Code</label>
                        <span>{selectedPayout.developer.bank_swift_code}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <label>Currency</label>
                      <span>{selectedPayout.developer?.bank_currency || 'USD'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transfer Reference */}
              {selectedPayout.bank_transfer_reference && (
                <div className="detail-section">
                  <h3><CheckCircle size={18} /> Transfer Reference</h3>
                  <div className="detail-grid">
                    <div className="detail-item full-width">
                      <label>Bank Transfer Reference</label>
                      <span className="copyable" onClick={() => copyToClipboard(selectedPayout.bank_transfer_reference)}>
                        {selectedPayout.bank_transfer_reference}
                        <Copy size={14} />
                      </span>
                    </div>
                    {selectedPayout.admin_notes && (
                      <div className="detail-item full-width">
                        <label>Admin Notes</label>
                        <span>{selectedPayout.admin_notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Completed Info */}
              {selectedPayout.status === 'completed' && (
                <div className="detail-section completed-section">
                  <h3><CheckCircle size={18} /> Transfer Completed</h3>
                  <div className="success-message">
                    <CheckCircle size={24} />
                    <div>
                      <strong>Funds transferred successfully</strong>
                      <p>The developer has received ${selectedPayout.net_amount?.toFixed(2)} via bank transfer.</p>
                    </div>
                  </div>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Completed At</label>
                      <span>{formatDate(selectedPayout.completed_at)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending/Processing - Show Mark Paid/Failed Actions */}
              {(selectedPayout.status === 'pending' || selectedPayout.status === 'failed') && (
                <div className="detail-section actions-section">
                  <h3>Admin Actions</h3>
                  {!showMarkPaidForm && !showMarkFailedForm && (
                    <div className="admin-action-buttons">
                      <button
                        className="btn btn-success"
                        onClick={() => {
                          setShowMarkPaidForm(true);
                          setShowMarkFailedForm(false);
                        }}
                      >
                        <CheckCircle size={18} />
                        Mark as Paid
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          setShowMarkFailedForm(true);
                          setShowMarkPaidForm(false);
                        }}
                      >
                        <XCircle size={18} />
                        Mark as Failed
                      </button>
                    </div>
                  )}
                  {showMarkPaidForm && (
                    <div className="mark-paid-form">
                      <div className="form-group">
                        <label>Bank Transfer Reference *</label>
                        <input
                          type="text"
                          value={transferReference}
                          onChange={(e) => setTransferReference(e.target.value)}
                          placeholder="e.g. Wire confirmation number, transaction ID"
                        />
                      </div>
                      <div className="form-group">
                        <label>Admin Notes (Optional)</label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Any notes about this transfer"
                          rows={3}
                        />
                      </div>
                      <div className="form-actions">
                        <button
                          className="btn btn-primary"
                          onClick={handleMarkPaid}
                          disabled={processing}
                        >
                          {processing ? <RefreshCw size={18} className="spin" /> : <Check size={18} />}
                          Confirm Paid
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() => setShowMarkPaidForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {showMarkFailedForm && (
                    <div className="mark-failed-form">
                      <div className="form-group">
                        <label>Failure Reason *</label>
                        <textarea
                          value={failureReason}
                          onChange={(e) => setFailureReason(e.target.value)}
                          placeholder="Why did the transfer fail?"
                          rows={3}
                        />
                      </div>
                      <div className="form-group">
                        <label>Admin Notes (Optional)</label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Any additional notes"
                          rows={3}
                        />
                      </div>
                      <div className="form-actions">
                        <button
                          className="btn btn-danger"
                          onClick={handleMarkFailed}
                          disabled={processing}
                        >
                          {processing ? <RefreshCw size={18} className="spin" /> : <XCircle size={18} />}
                          Confirm Failed
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() => setShowMarkFailedForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pending/Processing Info */}
              {selectedPayout.status === 'processing' && (
                <div className="detail-section info-section">
                  <div className="info-message">
                    <Clock size={20} />
                    <div>
                      <strong>Transfer in progress</strong>
                      <p>This payout is being processed. Please check the status and mark as paid or failed when appropriate.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Failed Info */}
              {selectedPayout.status === 'failed' && !showMarkPaidForm && !showMarkFailedForm && (
                <div className="detail-section failed-section">
                  <h3><XCircle size={18} /> Transfer Failed</h3>
                  <div className="failure-reason">
                    <AlertTriangle size={20} />
                    <div>
                      <strong>Transfer failed</strong>
                      <p>{selectedPayout.failure_reason || "The bank transfer failed. Please check the developer's bank details and retry."}</p>
                    </div>
                  </div>
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