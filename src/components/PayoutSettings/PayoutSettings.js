// app/src/components/PayoutSettings/PayoutSettings.js
import React, { useState, useEffect } from 'react';
import {
  Wallet, CreditCard, ExternalLink,
  Check, AlertCircle, DollarSign, Clock,
  CheckCircle, XCircle, RefreshCw, Loader,
  Building2, Landmark, Globe, Shield, Pencil
} from 'lucide-react';
import './PayoutSettings.css';
import { useNotification } from '../NotificationModal/NotificationModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// ============================================
// VALIDATION HELPERS
// ============================================

const validators = {
  accountHolder: (value) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Account holder name is required';
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length < 2) return 'Enter your full name (first and last name)';
    if (!/^[a-zA-ZÀ-ÿ'\-\. ]{2,}$/.test(trimmed)) return 'Name can only contain letters, spaces, hyphens, and periods';
    if (trimmed.length < 3) return 'Name is too short';
    if (trimmed.length > 100) return 'Name is too long';
    return null;
  },

  bankName: (value) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Bank name is required';
    if (!/^[a-zA-ZÀ-ÿ0-9&\-\.\s]{2,}$/.test(trimmed)) return 'Enter a valid bank name';
    if (trimmed.length < 2) return 'Bank name is too short';
    if (trimmed.length > 100) return 'Bank name is too long';
    return null;
  },

  accountNumber: (value) => {
    const cleaned = value.replace(/\s+/g, '');
    if (!cleaned) return 'Account number is required';
    if (!/^\d{5,17}$/.test(cleaned)) return 'Account number must be 5–17 digits (no letters or special characters)';
    return null;
  },

  routingNumber: (value) => {
    const cleaned = value.replace(/\s+/g, '');
    if (!cleaned) return 'Routing number is required';
    if (!/^\d{9}$/.test(cleaned)) return 'Routing number must be exactly 9 digits';
    // Basic checksum: first 8 digits weighted sum mod 10 should equal 9th digit
    const digits = cleaned.split('').map(Number);
    const sum = 3 * (digits[0] + digits[3] + digits[6]) +
                7 * (digits[1] + digits[4] + digits[7]) +
                1 * (digits[2] + digits[5]);
    if (sum % 10 !== 0) return 'Routing number failed checksum validation';
    return null;
  },

  iban: (value) => {
    const cleaned = value.replace(/\s+/g, '').toUpperCase();
    if (!cleaned) return null; // optional
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(cleaned)) return 'IBAN must be 2 letters, 2 digits, then up to 30 alphanumeric characters';
    if (cleaned.length < 15 || cleaned.length > 34) return 'IBAN must be between 15 and 34 characters';
    return null;
  },

  swiftCode: (value) => {
    const cleaned = value.replace(/\s+/g, '').toUpperCase();
    if (!cleaned) return null; // optional
    if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleaned)) return 'SWIFT/BIC must be 8 or 11 alphanumeric characters (e.g. BOFAUS3N)';
    return null;
  }
};

const PayoutSettings = () => {
  const { showNotification } = useNotification();

  // Bank account status
  const [bankStatus, setBankStatus] = useState({
    has_bank_account: false,
    bank_account_holder: '',
    bank_name: '',
    bank_account_number: '',
    bank_routing_number: '',
    bank_iban: '',
    bank_swift_code: '',
    bank_currency: 'USD',
    total_earnings: 0
  });

  // Bank form fields
  const [bankForm, setBankForm] = useState({
    bank_account_holder: '',
    bank_name: '',
    bank_account_number: '',
    bank_routing_number: '',
    bank_iban: '',
    bank_swift_code: '',
    bank_currency: 'USD'
  });

  const [payouts, setPayouts] = useState([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('connect');
  const [formErrors, setFormErrors] = useState({});
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    fetchBankStatus();
    fetchPayoutHistory();
  }, []);

  const fetchBankStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/bank-account/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBankStatus(data);
        if (data.has_bank_account) {
          setBankForm({
            bank_account_holder: data.bank_account_holder || '',
            bank_name: data.bank_name || '',
            bank_account_number: '',
            bank_routing_number: data.bank_routing_number || '',
            bank_iban: data.bank_iban || '',
            bank_swift_code: data.bank_swift_code || '',
            bank_currency: data.bank_currency || 'USD'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching bank status:', error);
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

  const validateField = (field, value) => {
    switch (field) {
      case 'bank_account_holder': return validators.accountHolder(value);
      case 'bank_name': return validators.bankName(value);
      case 'bank_account_number': return validators.accountNumber(value);
      case 'bank_routing_number': return validators.routingNumber(value);
      case 'bank_iban': return validators.iban(value);
      case 'bank_swift_code': return validators.swiftCode(value);
      default: return null;
    }
  };

  const validateForm = () => {
    const errors = {};
    const fields = ['bank_account_holder', 'bank_name', 'bank_account_number', 'bank_routing_number', 'bank_iban', 'bank_swift_code'];
    
    let hasError = false;
    fields.forEach(field => {
      const error = validateField(field, bankForm[field] || '');
      if (error) {
        errors[field] = error;
        hasError = true;
      }
    });
    
    setFormErrors(errors);
    return !hasError;
  };

  const handleSaveBank = async () => {
    // Touch all fields to show validation
    const allFields = ['bank_account_holder', 'bank_name', 'bank_account_number', 'bank_routing_number', 'bank_iban', 'bank_swift_code'];
    const touched = {};
    allFields.forEach(f => { touched[f] = true; });
    setTouchedFields(touched);

    if (!validateForm()) {
      showNotification('error', 'Validation Error', 'Please fix the highlighted fields before saving.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/bank-account/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bankForm)
      });

      if (response.ok) {
        showNotification('success', 'Bank Details Saved', 'Your bank account details have been saved successfully.');
        setShowUpdateForm(false);
        setTouchedFields({});
        fetchBankStatus();
      } else {
        const error = await response.json();
        showNotification('error', 'Error', error.detail || 'Failed to save bank details');
      }
    } catch (error) {
      console.error('Error saving bank details:', error);
      showNotification('error', 'Error', 'Failed to save bank details');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBankForm(prev => ({ ...prev, [field]: value }));
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    // Validate on change if field was already touched
    if (touchedFields[field]) {
      const error = validateField(field, value);
      setFormErrors(prev => {
        const updated = { ...prev };
        if (error) {
          updated[field] = error;
        } else {
          delete updated[field];
        }
        return updated;
      });
    }
  };

  const handleBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, bankForm[field] || '');
    setFormErrors(prev => {
      const updated = { ...prev };
      if (error) {
        updated[field] = error;
      } else {
        delete updated[field];
      }
      return updated;
    });
  };

  const getFieldError = (field) => {
    return touchedFields[field] ? formErrors[field] : null;
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

  const renderBankForm = () => (
    <div className="bank-form-section">
      <div className="connect-prompt">
        <div className="bank-logo">
          <Landmark size={48} />
        </div>
        <h3>{bankStatus.has_bank_account ? 'Update Bank Account' : 'Add Your Bank Account'}</h3>
        <p>
          {bankStatus.has_bank_account
            ? 'Update your bank account details below. All fields will be re-verified.'
            : 'To receive payments for completed projects, please provide your bank account details below. Your information is stored securely.'
          }
        </p>
      </div>

      <div className="bank-form">
        <div className="form-group">
          <label>Account Holder Name *</label>
          <input
            type="text"
            value={bankForm.bank_account_holder}
            onChange={(e) => handleInputChange('bank_account_holder', e.target.value)}
            onBlur={() => handleBlur('bank_account_holder')}
            placeholder="John A. Doe"
            className={getFieldError('bank_account_holder') ? 'error' : ''}
          />
          {getFieldError('bank_account_holder') && (
            <span className="error-text">{getFieldError('bank_account_holder')}</span>
          )}
          <span className="hint">Enter your full name as it appears on your bank account</span>
        </div>

        <div className="form-group">
          <label>Bank Name *</label>
          <input
            type="text"
            value={bankForm.bank_name}
            onChange={(e) => handleInputChange('bank_name', e.target.value)}
            onBlur={() => handleBlur('bank_name')}
            placeholder="e.g. JPMorgan Chase, Bank of America, HSBC"
            className={getFieldError('bank_name') ? 'error' : ''}
          />
          {getFieldError('bank_name') && (
            <span className="error-text">{getFieldError('bank_name')}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Account Number *</label>
            <input
              type="text"
              value={bankForm.bank_account_number}
              onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
              onBlur={() => handleBlur('bank_account_number')}
              placeholder="5–17 digit account number"
              className={getFieldError('bank_account_number') ? 'error' : ''}
              autoComplete="off"
            />
            {getFieldError('bank_account_number') && (
              <span className="error-text">{getFieldError('bank_account_number')}</span>
            )}
            <span className="hint">Numbers only, 5 to 17 digits</span>
          </div>

          <div className="form-group">
            <label>Routing Number *</label>
            <input
              type="text"
              value={bankForm.bank_routing_number}
              onChange={(e) => {
                // Only allow digits, max 9
                const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                handleInputChange('bank_routing_number', val);
              }}
              onBlur={() => handleBlur('bank_routing_number')}
              placeholder="9-digit ABA routing number"
              className={getFieldError('bank_routing_number') ? 'error' : ''}
              autoComplete="off"
            />
            {getFieldError('bank_routing_number') && (
              <span className="error-text">{getFieldError('bank_routing_number')}</span>
            )}
            <span className="hint">9-digit ABA routing number with valid checksum</span>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>IBAN (Optional)</label>
            <input
              type="text"
              value={bankForm.bank_iban}
              onChange={(e) => handleInputChange('bank_iban', e.target.value.toUpperCase())}
              onBlur={() => handleBlur('bank_iban')}
              placeholder="GB29 NWBK 6016 1331 9268 19"
              className={getFieldError('bank_iban') ? 'error' : ''}
            />
            {getFieldError('bank_iban') && (
              <span className="error-text">{getFieldError('bank_iban')}</span>
            )}
            <span className="hint">Required for international transfers outside the US</span>
          </div>

          <div className="form-group">
            <label>SWIFT/BIC Code (Optional)</label>
            <input
              type="text"
              value={bankForm.bank_swift_code}
              onChange={(e) => handleInputChange('bank_swift_code', e.target.value.toUpperCase())}
              onBlur={() => handleBlur('bank_swift_code')}
              placeholder="BOFAUS3N"
              className={getFieldError('bank_swift_code') ? 'error' : ''}
            />
            {getFieldError('bank_swift_code') && (
              <span className="error-text">{getFieldError('bank_swift_code')}</span>
            )}
            <span className="hint">8 or 11 characters (e.g. BOFAUS3N or BOFAUS3NXXX)</span>
          </div>
        </div>

        <div className="form-group">
          <label>Payout Currency</label>
          <select
            value={bankForm.bank_currency}
            onChange={(e) => handleInputChange('bank_currency', e.target.value)}
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            className="btn btn-primary btn-save"
            onClick={handleSaveBank}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader size={20} className="spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={20} />
                {bankStatus.has_bank_account ? 'Update Bank Details' : 'Save Bank Details'}
              </>
            )}
          </button>
          {bankStatus.has_bank_account && (
            <button
              className="btn btn-outline"
              onClick={() => {
                setShowUpdateForm(false);
                setFormErrors({});
                setTouchedFields({});
                // Reset form to saved values
                setBankForm({
                  bank_account_holder: bankStatus.bank_account_holder || '',
                  bank_name: bankStatus.bank_name || '',
                  bank_account_number: '',
                  bank_routing_number: bankStatus.bank_routing_number || '',
                  bank_iban: bankStatus.bank_iban || '',
                  bank_swift_code: bankStatus.bank_swift_code || '',
                  bank_currency: bankStatus.bank_currency || 'USD'
                });
              }}
            >
              Cancel
            </button>
          )}
        </div>

        <div className="bank-security-note">
          <Shield size={16} />
          <p>Your bank details are encrypted and stored securely. We never share your financial information.</p>
        </div>
      </div>
    </div>
  );

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
            <p>Manage your bank account details to receive payments for completed projects</p>
          </div>
        </div>

        <div className="earnings-summary">
          <div className="earnings-card">
            <span className="label">Total Earnings</span>
            <span className="value">${bankStatus.total_earnings?.toFixed(2) || '0.00'}</span>
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
          <Landmark size={18} />
          Bank Account
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

      {/* Bank Account Section */}
      {activeSection === 'connect' && (
        <div className="preferences-section">
          {bankStatus.has_bank_account && !showUpdateForm ? (
            /* ✅ Bank details saved - show read-only info + update button */
            <div className="bank-connected">
              <div className="connected-banner verified">
                <CheckCircle size={24} />
                <div>
                  <h3>Bank Account Connected</h3>
                  <p>Your bank account is set up to receive payouts</p>
                </div>
              </div>

              <div className="bank-info-card">
                <div className="info-row">
                  <span className="label">Account Holder</span>
                  <span className="value">{bankStatus.bank_account_holder}</span>
                </div>
                <div className="info-row">
                  <span className="label">Bank Name</span>
                  <span className="value">{bankStatus.bank_name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Account Number</span>
                  <span className="value account-masked">{bankStatus.bank_account_number || '****'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Routing Number</span>
                  <span className="value">{bankStatus.bank_routing_number}</span>
                </div>
                {bankStatus.bank_iban && (
                  <div className="info-row">
                    <span className="label">IBAN</span>
                    <span className="value">{bankStatus.bank_iban}</span>
                  </div>
                )}
                {bankStatus.bank_swift_code && (
                  <div className="info-row">
                    <span className="label">SWIFT Code</span>
                    <span className="value">{bankStatus.bank_swift_code}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="label">Currency</span>
                  <span className="value">{bankStatus.bank_currency || 'USD'}</span>
                </div>
              </div>

              <div className="bank-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowUpdateForm(true);
                    setBankForm({
                      bank_account_holder: bankStatus.bank_account_holder || '',
                      bank_name: bankStatus.bank_name || '',
                      bank_account_number: '',
                      bank_routing_number: bankStatus.bank_routing_number || '',
                      bank_iban: bankStatus.bank_iban || '',
                      bank_swift_code: bankStatus.bank_swift_code || '',
                      bank_currency: bankStatus.bank_currency || 'USD'
                    });
                    setFormErrors({});
                    setTouchedFields({});
                  }}
                >
                  <Pencil size={18} />
                  Update Bank Details
                </button>
              </div>

              <div className="bank-note">
                <AlertCircle size={16} />
                <p>
                  When an investor confirms project completion, your payment will be marked as pending.
                  An admin will process the bank transfer to your account. You will be notified once the transfer is complete.
                </p>
              </div>
            </div>
          ) : (
            /* ✅ Show the bank form (for both new accounts and updates) */
            renderBankForm()
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
                    <th>Reference</th>
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
                        {payout.bank_transfer_reference || payout.transaction_id || '-'}
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