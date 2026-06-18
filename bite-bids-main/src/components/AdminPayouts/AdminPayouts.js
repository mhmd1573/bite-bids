import React, { useState, useEffect } from 'react';
import {
  Wallet, DollarSign, Clock, CheckCircle, XCircle,
  RefreshCw, Eye, AlertTriangle, User,
  Mail, CreditCard, Filter,
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
  const [statusFilter, setStatusFilter] = useState('pending');
  const [retrying, setRetrying] = useState(false);

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

  // Retry failed Stripe transfer
  const handleRetryPayout = async (payoutId) => {
    setRetrying(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/payouts/${payoutId}/retry-stripe`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        showNotification('success', 'Retry Initiated', 'Stripe transfer retry initiated');
        fetchPayouts();
        closeModal();
      } else {
        const error = await response.json();
        showNotification('error', 'Error', error.detail || 'Failed to retry transfer');
      }
    } catch (error) {
      console.error('Error retrying payout:', error);
      showNotification('error', 'Error', 'Failed to retry transfer');
    } finally {
      setRetrying(false);
    }
  };

  const openModal = (payout) => {
    setSelectedPayout(payout);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPayout(null);
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
            <p>Track automatic Stripe Connect payouts to developers</p>
          </div>
        </div>

        <button className="btn btn-outline" onClick={fetchPayouts}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stripe Connect Info Banner */}
      <div className="stripe-info-banner">
        <CreditCard size={20} />
        <div>
          <strong>Automatic Payouts via Stripe Connect</strong>
          <p>All developer payouts are processed automatically through Stripe. When an investor confirms a project, funds are instantly transferred to the developer's connected Stripe account.</p>
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
                <th>Stripe Transfer</th>
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
                  <td className="transfer-cell">
                    {payout.stripe_transfer_id ? (
                      <span className="stripe-transfer-id" title={payout.stripe_transfer_id}>
                        <CreditCard size={14} />
                        {payout.stripe_transfer_id.substring(0, 12)}...
                      </span>
                    ) : (
                      <span className="no-transfer">Awaiting transfer</span>
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
                    {payout.status === 'failed' && (
                      <button
                        className="btn-icon retry"
                        onClick={() => handleRetryPayout(payout.id)}
                        title="Retry Stripe Transfer"
                        disabled={retrying}
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
                    <label>Net Amount (Paid)</label>
                    <span className="net-amount">${selectedPayout.net_amount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Stripe Connect Transfer Details */}
              <div className="detail-section">
                <h3><CreditCard size={18} /> Stripe Connect Transfer</h3>
                <div className="stripe-transfer-details">
                  <div className="detail-grid">
                    <div className="detail-item full-width">
                      <label>Transfer ID</label>
                      {selectedPayout.stripe_transfer_id ? (
                        <span className="copyable" onClick={() => copyToClipboard(selectedPayout.stripe_transfer_id)}>
                          {selectedPayout.stripe_transfer_id}
                          <Copy size={14} />
                        </span>
                      ) : (
                        <span className="no-data">Not yet transferred</span>
                      )}
                    </div>
                    <div className="detail-item">
                      <label>Transfer Status</label>
                      <span>{selectedPayout.stripe_transfer_status || selectedPayout.status}</span>
                    </div>
                    {selectedPayout.developer?.stripe_account_id && (
                      <div className="detail-item">
                        <label>Connected Account</label>
                        <span className="copyable" onClick={() => copyToClipboard(selectedPayout.developer.stripe_account_id)}>
                          {selectedPayout.developer.stripe_account_id.substring(0, 20)}...
                          <Copy size={14} />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* View in Stripe Dashboard Link */}
                  {selectedPayout.stripe_transfer_id && (
                    <a
                      href={`https://dashboard.stripe.com/connect/transfers/${selectedPayout.stripe_transfer_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="stripe-dashboard-link"
                    >
                      <ExternalLink size={16} />
                      View in Stripe Dashboard
                    </a>
                  )}
                </div>
              </div>

              {/* Completed Info */}
              {selectedPayout.status === 'completed' && (
                <div className="detail-section completed-section">
                  <h3><CheckCircle size={18} /> Transfer Completed</h3>
                  <div className="success-message">
                    <CheckCircle size={24} />
                    <div>
                      <strong>Funds transferred successfully</strong>
                      <p>The developer has received ${selectedPayout.net_amount?.toFixed(2)} in their connected Stripe account.</p>
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

              {/* Failed Info with Retry Option */}
              {selectedPayout.status === 'failed' && (
                <div className="detail-section failed-section">
                  <h3><XCircle size={18} /> Transfer Failed</h3>
                  <div className="failure-reason">
                    <AlertTriangle size={20} />
                    <div>
                      <strong>Transfer failed</strong>
                      <p>{selectedPayout.failure_reason || 'The Stripe transfer could not be completed. This may be due to the developer\'s account configuration.'}</p>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleRetryPayout(selectedPayout.id)}
                    disabled={retrying}
                  >
                    {retrying ? (
                      <>
                        <RefreshCw size={18} className="spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={18} />
                        Retry Stripe Transfer
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Pending/Processing Info */}
              {(selectedPayout.status === 'pending' || selectedPayout.status === 'processing') && (
                <div className="detail-section info-section">
                  <div className="info-message">
                    <Clock size={20} />
                    <div>
                      <strong>
                        {selectedPayout.status === 'pending'
                          ? 'Awaiting investor confirmation'
                          : 'Transfer in progress'}
                      </strong>
                      <p>
                        {selectedPayout.status === 'pending'
                          ? 'This payout will be processed automatically when the investor confirms the project completion.'
                          : 'The Stripe transfer is being processed. Funds will arrive in the developer\'s account shortly.'}
                      </p>
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
