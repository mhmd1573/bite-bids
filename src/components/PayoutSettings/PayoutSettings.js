import React, { useState, useEffect } from 'react';
import {
  Wallet, CreditCard, Building2, Bitcoin, Globe,
  Save, Check, AlertCircle, DollarSign, Clock,
  CheckCircle, XCircle, RefreshCw, ChevronDown
} from 'lucide-react';
import './PayoutSettings.css';
import { useNotification } from '../NotificationModal/NotificationModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const PayoutSettings = () => {
  const { showNotification } = useNotification();

  // Payout preferences state
  const [preferences, setPreferences] = useState({
    payout_method: '',
    payout_email: '',
    payout_details: {},
    payout_currency: 'USD',
    payout_verified: false,
    total_earnings: 0
  });

  // Payout history state
  const [payouts, setPayouts] = useState([]);
  const [pendingTotal, setPendingTotal] = useState(0);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('preferences');

  // Payment methods
  const paymentMethods = [
    { id: 'paypal', name: 'PayPal', icon: <CreditCard size={20} />, description: 'Receive payments to your PayPal account' },
    { id: 'wise', name: 'Wise (TransferWise)', icon: <Globe size={20} />, description: 'Low-fee international transfers' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: <Building2 size={20} />, description: 'Direct deposit to your bank account' },
    { id: 'crypto', name: 'Cryptocurrency', icon: <Bitcoin size={20} />, description: 'Receive payments in crypto (USDT, USDC)' },
    { id: 'other', name: 'Other', icon: <Wallet size={20} />, description: 'Specify your preferred method' }
  ];

  useEffect(() => {
    fetchPreferences();
    fetchPayoutHistory();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/me/payout-preferences`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching payout preferences:', error);
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
        setPayouts(data.payouts);
        setPendingTotal(data.pending_total);
      }
    } catch (error) {
      console.error('Error fetching payout history:', error);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences.payout_method) {
      showNotification('error', 'Required', 'Please select a payout method');
      return;
    }

    if (['paypal', 'wise'].includes(preferences.payout_method) && !preferences.payout_email) {
      showNotification('error', 'Required', 'Please enter your payment email address');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/users/me/payout-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          payout_method: preferences.payout_method,
          payout_email: preferences.payout_email,
          payout_details: preferences.payout_details,
          payout_currency: preferences.payout_currency
        })
      });

      if (response.ok) {
        showNotification('success', 'Saved', 'Payout preferences updated successfully');
        setPreferences(prev => ({ ...prev, payout_verified: false }));
      } else {
        const error = await response.json();
        showNotification('error', 'Error', error.detail || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      showNotification('error', 'Error', 'Failed to save preferences');
    } finally {
      setSaving(false);
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
            <p>Manage how you receive payments for completed projects</p>
          </div>
        </div>

        <div className="earnings-summary">
          <div className="earnings-card">
            <span className="label">Total Earnings</span>
            <span className="value">${preferences.total_earnings?.toFixed(2) || '0.00'}</span>
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
          className={`section-tab ${activeSection === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveSection('preferences')}
        >
          <CreditCard size={18} />
          Payment Method
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

      {/* Preferences Section */}
      {activeSection === 'preferences' && (
        <div className="preferences-section">
          {/* Verification Status */}
          {preferences.payout_method && (
            <div className={`verification-banner ${preferences.payout_verified ? 'verified' : 'unverified'}`}>
              {preferences.payout_verified ? (
                <>
                  <Check size={20} />
                  <span>Your payout method has been verified</span>
                </>
              ) : (
                <>
                  <AlertCircle size={20} />
                  <span>Your payout method is pending verification by admin</span>
                </>
              )}
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="form-section">
            <h3>Select Payment Method</h3>
            <div className="payment-methods">
              {paymentMethods.map(method => (
                <div
                  key={method.id}
                  className={`payment-method-card ${preferences.payout_method === method.id ? 'selected' : ''}`}
                  onClick={() => setPreferences(prev => ({ ...prev, payout_method: method.id }))}
                >
                  <div className="method-icon">{method.icon}</div>
                  <div className="method-info">
                    <span className="method-name">{method.name}</span>
                    <span className="method-desc">{method.description}</span>
                  </div>
                  {preferences.payout_method === method.id && (
                    <Check className="selected-check" size={20} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Details Form */}
          {preferences.payout_method && (
            <div className="form-section">
              <h3>Payment Details</h3>

              {/* PayPal / Wise - Email */}
              {['paypal', 'wise'].includes(preferences.payout_method) && (
                <div className="form-group">
                  <label>
                    {preferences.payout_method === 'paypal' ? 'PayPal Email' : 'Wise Email'}
                  </label>
                  <input
                    type="email"
                    value={preferences.payout_email || ''}
                    onChange={(e) => setPreferences(prev => ({ ...prev, payout_email: e.target.value }))}
                    placeholder={`Enter your ${preferences.payout_method === 'paypal' ? 'PayPal' : 'Wise'} email`}
                  />
                </div>
              )}

              {/* Bank Transfer Details */}
              {preferences.payout_method === 'bank_transfer' && (
                <>
                  <div className="form-group">
                    <label>Account Holder Name</label>
                    <input
                      type="text"
                      value={preferences.payout_details?.account_name || ''}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        payout_details: { ...prev.payout_details, account_name: e.target.value }
                      }))}
                      placeholder="Full name as on bank account"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Bank Name</label>
                      <input
                        type="text"
                        value={preferences.payout_details?.bank_name || ''}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          payout_details: { ...prev.payout_details, bank_name: e.target.value }
                        }))}
                        placeholder="Bank name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        value={preferences.payout_details?.country || ''}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          payout_details: { ...prev.payout_details, country: e.target.value }
                        }))}
                        placeholder="Country"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>IBAN / Account Number</label>
                      <input
                        type="text"
                        value={preferences.payout_details?.iban || ''}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          payout_details: { ...prev.payout_details, iban: e.target.value }
                        }))}
                        placeholder="IBAN or Account Number"
                      />
                    </div>
                    <div className="form-group">
                      <label>SWIFT / BIC Code</label>
                      <input
                        type="text"
                        value={preferences.payout_details?.swift || ''}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          payout_details: { ...prev.payout_details, swift: e.target.value }
                        }))}
                        placeholder="SWIFT/BIC code"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Crypto Details */}
              {preferences.payout_method === 'crypto' && (
                <>
                  <div className="form-group">
                    <label>Cryptocurrency</label>
                    <select
                      value={preferences.payout_details?.crypto_type || 'usdt'}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        payout_details: { ...prev.payout_details, crypto_type: e.target.value }
                      }))}
                    >
                      <option value="usdt">USDT (Tether)</option>
                      <option value="usdc">USDC</option>
                      <option value="btc">Bitcoin (BTC)</option>
                      <option value="eth">Ethereum (ETH)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Network</label>
                    <select
                      value={preferences.payout_details?.network || 'trc20'}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        payout_details: { ...prev.payout_details, network: e.target.value }
                      }))}
                    >
                      <option value="trc20">TRC20 (Tron)</option>
                      <option value="erc20">ERC20 (Ethereum)</option>
                      <option value="bep20">BEP20 (BSC)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Wallet Address</label>
                    <input
                      type="text"
                      value={preferences.payout_details?.wallet_address || ''}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        payout_details: { ...prev.payout_details, wallet_address: e.target.value }
                      }))}
                      placeholder="Your crypto wallet address"
                    />
                  </div>
                </>
              )}

              {/* Other Method */}
              {preferences.payout_method === 'other' && (
                <div className="form-group">
                  <label>Payment Instructions</label>
                  <textarea
                    value={preferences.payout_details?.instructions || ''}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      payout_details: { ...prev.payout_details, instructions: e.target.value }
                    }))}
                    placeholder="Describe your preferred payment method and provide necessary details..."
                    rows={4}
                  />
                </div>
              )}

              {/* Currency Selection */}
              <div className="form-group">
                <label>Preferred Currency</label>
                <select
                  value={preferences.payout_currency || 'USD'}
                  onChange={(e) => setPreferences(prev => ({ ...prev, payout_currency: e.target.value }))}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={handleSavePreferences}
              disabled={saving || !preferences.payout_method}
            >
              {saving ? (
                <>
                  <RefreshCw size={18} className="spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Payout Settings
                </>
              )}
            </button>
          </div>
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
                    <th>Transaction ID</th>
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
                        {payout.transaction_id || '-'}
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
