import React, { useState, useEffect } from 'react';
import {
  Wallet, CreditCard, ExternalLink,
  Check, AlertCircle, DollarSign, Clock,
  CheckCircle, XCircle, RefreshCw, Loader
} from 'lucide-react';
import './PayoutSettings.css';
import { useNotification } from '../NotificationModal/NotificationModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const PayoutSettings = () => {
  const { showNotification } = useNotification();

  // Stripe Connect status
  const [stripeStatus, setStripeStatus] = useState({
    stripe_account_id: null,
    stripe_account_status: null,
    stripe_payouts_enabled: false,
    stripe_onboarding_completed: false,
    total_earnings: 0
  });

  // Payout history state
  const [payouts, setPayouts] = useState([]);
  const [pendingTotal, setPendingTotal] = useState(0);

  // UI state
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [activeSection, setActiveSection] = useState('connect');

  // Check for Stripe redirect params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('stripe_success') === 'true') {
      showNotification('success', 'Stripe Connected', 'Your Stripe account has been set up successfully!');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('stripe_refresh') === 'true') {
      showNotification('info', 'Setup Incomplete', 'Please complete your Stripe account setup.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    fetchStripeStatus();
    fetchPayoutHistory();
  }, []);

  const fetchStripeStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/stripe-connect/account-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStripeStatus(data);
      }
    } catch (error) {
      console.error('Error fetching Stripe status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutHistory = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/me/payouts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayouts(data.payouts || []);
        setPendingTotal(data.pending_total || 0);
      }
    } catch (error) {
      console.error('Error fetching payout history:', error);
    }
  };

  const handleConnectStripe = async () => {
    setConnecting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/stripe-connect/create-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.onboarding_url) {
          window.location.href = data.onboarding_url;
        }
      } else {
        const error = await response.json();
        showNotification('error', 'Error', error.detail || 'Failed to start Stripe Connect setup');
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      showNotification('error', 'Error', 'Failed to connect with Stripe');
    } finally {
      setConnecting(false);
    }
  };

  const handleOpenStripeDashboard = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/stripe-connect/dashboard-link`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.dashboard_url) {
          window.open(data.dashboard_url, '_blank');
        }
      } else {
        showNotification('error', 'Error', 'Failed to open Stripe dashboard');
      }
    } catch (error) {
      console.error('Error opening dashboard:', error);
      showNotification('error', 'Error', 'Failed to open Stripe dashboard');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'warning', icon: <Clock size={14} />, text: 'Pending' },
      processing: { color: 'info', icon: <RefreshCw size={14} className="spin" />, text: 'Processing' },
      completed: { color: 'success', icon: <CheckCircle size={14} />, text: 'Completed' },
      failed: { color: 'error', icon: <XCircle size={14} />, text: 'Failed' }
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
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="payout-settings loading">
        <div className="loading-spinner"></div>
        <p>Loading payout settings...</p>
      </div>
    );
  }

  return (
    <div className="payout-settings">
      {/* Header */}
      <div className="payout-header">
        <div className="header-content">
          <Wallet className="header-icon" size={28} />
          <div>
            <h2>Payout Settings</h2>
            <p>Receive automatic payments via Stripe when projects are completed</p>
          </div>
        </div>

        <div className="earnings-summary">
          <div className="earnings-card">
            <span className="label">Total Earnings</span>
            <span className="value">${stripeStatus.total_earnings?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="earnings-card pending">
            <span className="label">Pending Payout</span>
            <span className="value">${pendingTotal?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="section-tabs">
        <button
          className={`section-tab ${activeSection === 'connect' ? 'active' : ''}`}
          onClick={() => setActiveSection('connect')}
        >
          <CreditCard size={18} />
          Stripe Connect
        </button>
        <button
          className={`section-tab ${activeSection === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSection('history')}
        >
          <Clock size={18} />
          Payout History
          {payouts.length > 0 && <span className="tab-count">{payouts.length}</span>}
        </button>
      </div>

      {/* Stripe Connect Section */}
      {activeSection === 'connect' && (
        <div className="preferences-section">
          {/* Connected Status */}
          {stripeStatus.stripe_payouts_enabled ? (
            <div className="stripe-connected">
              <div className="connected-banner verified">
                <CheckCircle size={24} />
                <div>
                  <h3>Stripe Connected</h3>
                  <p>Your account is set up to receive automatic payouts</p>
                </div>
              </div>

              <div className="stripe-info-card">
                <div className="info-row">
                  <span className="label">Account Status</span>
                  <span className="value status-enabled">
                    <CheckCircle size={16} /> Enabled
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Payouts</span>
                  <span className="value status-enabled">
                    <CheckCircle size={16} /> Active
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Account ID</span>
                  <span className="value account-id">{stripeStatus.stripe_account_id}</span>
                </div>
              </div>

              <div className="stripe-actions">
                <button className="btn btn-secondary" onClick={handleOpenStripeDashboard}>
                  <ExternalLink size={18} />
                  Open Stripe Dashboard
                </button>
                <button className="btn btn-outline" onClick={fetchStripeStatus}>
                  <RefreshCw size={18} />
                  Refresh Status
                </button>
              </div>

              <div className="stripe-note">
                <AlertCircle size={16} />
                <p>
                  When an investor confirms project completion, your payment will be automatically
                  transferred to your connected Stripe account. Funds typically arrive in 1-2 business days.
                </p>
              </div>
            </div>
          ) : stripeStatus.stripe_account_id ? (
            /* Account created but not fully set up */
            <div className="stripe-pending">
              <div className="connected-banner unverified">
                <AlertCircle size={24} />
                <div>
                  <h3>Complete Your Setup</h3>
                  <p>Your Stripe account needs additional information to receive payouts</p>
                </div>
              </div>

              <div className="stripe-info-card">
                <div className="info-row">
                  <span className="label">Account Status</span>
                  <span className="value status-pending">
                    <Clock size={16} /> Pending Setup
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Payouts</span>
                  <span className="value status-disabled">
                    <XCircle size={16} /> Not Enabled
                  </span>
                </div>
              </div>

              <div className="stripe-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleConnectStripe}
                  disabled={connecting}
                >
                  {connecting ? (
                    <>
                      <Loader size={18} className="spin" />
                      Opening Stripe...
                    </>
                  ) : (
                    <>
                      <ExternalLink size={18} />
                      Complete Setup
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* No account - show connect button */
            <div className="stripe-not-connected">
              <div className="connect-prompt">
                <div className="stripe-logo">
                  <CreditCard size={48} />
                </div>
                <h3>Connect with Stripe</h3>
                <p>
                  To receive payments for completed projects, you need to connect your
                  Stripe account. This is a one-time setup that takes about 2-3 minutes.
                </p>

                <ul className="benefits-list">
                  <li><Check size={16} /> Automatic payouts when projects are confirmed</li>
                  <li><Check size={16} /> Funds deposited directly to your bank account</li>
                  <li><Check size={16} /> Track all your earnings in one place</li>
                  <li><Check size={16} /> Secure and trusted by millions worldwide</li>
                </ul>

                <button
                  className="btn btn-primary btn-connect"
                  onClick={handleConnectStripe}
                  disabled={connecting}
                >
                  {connecting ? (
                    <>
                      <Loader size={20} className="spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Connect with Stripe
                    </>
                  )}
                </button>

                <p className="stripe-note-small">
                  You'll be redirected to Stripe to complete the setup securely.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payout History Section */}
      {activeSection === 'history' && (
        <div className="history-section">
          {payouts.length === 0 ? (
            <div className="empty-state">
              <DollarSign size={48} />
              <h3>No payouts yet</h3>
              <p>When you complete projects, your payouts will appear here.</p>
            </div>
          ) : (
            <div className="payouts-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Transfer ID</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(payout => (
                    <tr key={payout.id}>
                      <td>{formatDate(payout.created_at)}</td>
                      <td>{payout.description || 'Project Payment'}</td>
                      <td className="amount">
                        <span className="gross">${payout.gross_amount?.toFixed(2)}</span>
                        <span className="net">${payout.net_amount?.toFixed(2)} net</span>
                      </td>
                      <td>{getStatusBadge(payout.status)}</td>
                      <td className="transaction-id">
                        {payout.stripe_transfer_id || payout.transaction_id || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PayoutSettings;
