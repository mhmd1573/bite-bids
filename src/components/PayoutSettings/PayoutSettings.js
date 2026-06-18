// app/src/components/PayoutSettings/PayoutSettings.js
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

  // Payoneer status
  const [payoneerStatus, setPayoneerStatus] = useState({
    payoneer_payee_id: null,
    payoneer_payee_status: null,
    payoneer_onboarding_completed: false,
    payoneer_verified: false,
    payoneer_currency: 'USD',
    total_earnings: 0
  });

  const [payouts, setPayouts] = useState([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [activeSection, setActiveSection] = useState('connect');

  // Check for Payoneer redirect params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payoneer_success') === 'true') {
      showNotification('success', 'Payoneer Connected', 'Your Payoneer account has been set up successfully!');
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchPayoneerStatus();
    } else if (urlParams.get('payoneer_refresh') === 'true') {
      showNotification('info', 'Setup Incomplete', 'Please complete your Payoneer account setup.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    fetchPayoneerStatus();
    fetchPayoutHistory();
  }, []);

  const fetchPayoneerStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/payoneer/account-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayoneerStatus(data);
      }
    } catch (error) {
      console.error('Error fetching Payoneer status:', error);
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

  const handleConnectPayoneer = async () => {
    setConnecting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/payoneer/create-payee`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.onboarding_url) {
          window.location.href = data.onboarding_url;
        } else {
          showNotification('info', 'Already Connected', data.message || 'Payoneer account already set up');
          fetchPayoneerStatus();
        }
      } else {
        const error = await response.json();
        showNotification('error', 'Error', error.detail || 'Failed to start Payoneer setup');
      }
    } catch (error) {
      console.error('Error connecting Payoneer:', error);
      showNotification('error', 'Error', 'Failed to connect with Payoneer');
    } finally {
      setConnecting(false);
    }
  };

  const checkOnboardingStatus = async () => {
    setCheckingStatus(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/payoneer/check-onboarding-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.onboarding_completed) {
          showNotification('success', 'Onboarding Complete', 'Your Payoneer account is now verified!');
          fetchPayoneerStatus();
        } else {
          showNotification('info', 'Onboarding Pending', 'Please complete your Payoneer account setup.');
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setCheckingStatus(false);
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
            <p>Receive automatic payments via Payoneer when projects are completed</p>
          </div>
        </div>

        <div className="earnings-summary">
          <div className="earnings-card">
            <span className="label">Total Earnings</span>
            <span className="value">${payoneerStatus.total_earnings?.toFixed(2) || '0.00'}</span>
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
          Payoneer Connect
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

      {/* Payoneer Connect Section */}
      {activeSection === 'connect' && (
        <div className="preferences-section">
          {payoneerStatus.payoneer_onboarding_completed ? (
            /* ✅ Connected and onboarded */
            <div className="payoneer-connected">
              <div className="connected-banner verified">
                <CheckCircle size={24} />
                <div>
                  <h3>Payoneer Connected</h3>
                  <p>Your account is set up to receive automatic payouts</p>
                </div>
              </div>

              <div className="payoneer-info-card">
                <div className="info-row">
                  <span className="label">Account Status</span>
                  <span className="value status-enabled">
                    <CheckCircle size={16} /> Active
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Verification</span>
                  <span className="value status-enabled">
                    <CheckCircle size={16} /> Verified
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Currency</span>
                  <span className="value">{payoneerStatus.payoneer_currency || 'USD'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Payee ID</span>
                  <span className="value account-id">{payoneerStatus.payoneer_payee_id}</span>
                </div>
              </div>

              <div className="payoneer-actions">
                <button className="btn btn-outline" onClick={fetchPayoneerStatus}>
                  <RefreshCw size={18} />
                  Refresh Status
                </button>
              </div>

              <div className="payoneer-note">
                <AlertCircle size={16} />
                <p>
                  When an investor confirms project completion, your payment will be automatically
                  transferred to your connected Payoneer account. Funds typically arrive within 1-2 business days.
                </p>
              </div>
            </div>
          ) : payoneerStatus.payoneer_payee_id ? (
            /* ✅ Account created but not fully set up */
            <div className="payoneer-pending">
              <div className="connected-banner unverified">
                <AlertCircle size={24} />
                <div>
                  <h3>Complete Your Setup</h3>
                  <p>Your Payoneer account needs additional KYC verification to receive payouts</p>
                </div>
              </div>

              <div className="payoneer-info-card">
                <div className="info-row">
                  <span className="label">Account Status</span>
                  <span className="value status-pending">
                    <Clock size={16} /> Pending KYC
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Verification</span>
                  <span className="value status-disabled">
                    <XCircle size={16} /> Not Verified
                  </span>
                </div>
              </div>

              <div className="payoneer-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleConnectPayoneer}
                  disabled={connecting}
                >
                  {connecting ? (
                    <>
                      <Loader size={18} className="spin" />
                      Opening Payoneer...
                    </>
                  ) : (
                    <>
                      <ExternalLink size={18} />
                      Complete KYC
                    </>
                  )}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={checkOnboardingStatus}
                  disabled={checkingStatus}
                >
                  {checkingStatus ? (
                    <Loader size={18} className="spin" />
                  ) : (
                    <RefreshCw size={18} />
                  )}
                  Check Status
                </button>
              </div>
            </div>
          ) : (
            /* ✅ No account - show connect button */
            <div className="payoneer-not-connected">
              <div className="connect-prompt">
                <div className="payoneer-logo">
                  <CreditCard size={48} />
                </div>
                <h3>Connect with Payoneer</h3>
                <p>
                  To receive payments for completed projects, you need to connect your
                  Payoneer account. This is a one-time setup that takes about 2-3 minutes.
                </p>

                <ul className="benefits-list">
                  <li><Check size={16} /> Automatic payouts when projects are confirmed</li>
                  <li><Check size={16} /> Funds deposited directly to your bank account</li>
                  <li><Check size={16} /> Track all your earnings in one place</li>
                  <li><Check size={16} /> Secure and trusted by millions worldwide</li>
                  <li><Check size={16} /> Support for 150+ currencies</li>
                </ul>

                <button
                  className="btn btn-primary btn-connect"
                  onClick={handleConnectPayoneer}
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
                      Connect with Payoneer
                    </>
                  )}
                </button>

                <p className="payoneer-note-small">
                  You'll be redirected to Payoneer to complete the setup securely.
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
                    <th>Payoneer ID</th>
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
                        {payout.payoneer_transfer_id || payout.transaction_id || '-'}
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