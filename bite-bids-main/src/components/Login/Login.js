import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Github, Check, AlertCircle, Eye, EyeOff, Mail, Lock, 
  User, Building, Briefcase, Rocket, Zap, Shield, TrendingUp, X 
} from 'lucide-react';
import './Login.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function Login({ onLogin }) {
    
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'developer',
    company: ''
  });
  const [authMode, setAuthMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isOAuthRegistration, setIsOAuthRegistration] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState(false);

  // Notification modal states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationConfig, setNotificationConfig] = useState({
    type: 'success',
    title: '',
    message: ''
  });

  // Handle OAuth redirect on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthData = urlParams.get('oauth_data');
    const authStatus = urlParams.get('auth');
    const provider = urlParams.get('provider');
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    const authError = urlParams.get('message');

    // Handle successful OAuth login (existing user)
    if (authStatus === 'success' && token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('user', JSON.stringify(parsedUser));
        
        // Clean URL before redirect
        window.history.replaceState({}, document.title, '/');
        
        // Redirect based on role
        setTimeout(() => {
          if (parsedUser.role === 'investor') {
            onLogin(parsedUser, 'home');
          } else if (parsedUser.role === 'developer') {
            onLogin(parsedUser, 'dashboard');
          } else if (parsedUser.role === 'admin') {
            onLogin(parsedUser, 'dashboard-admin');
          } else {
            onLogin(parsedUser, 'home');
          }
        }, 100);
      } catch (error) {
        console.error('Error parsing user data:', error);
        showNotificationModal('error', 'Login Error', 'Failed to process login data');
      }
      return;
    }

    // Handle OAuth registration (new user)
    if (authStatus === 'register' && oauthData && provider) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(oauthData));
        setAuthForm({
          email: parsedData.email,
          name: parsedData.name,
          password: '',
          role: 'developer',
          company: ''
        });
        setIsOAuthRegistration(true);
        setShowOAuthModal(true);
        
        // Store OAuth data for completion
        sessionStorage.setItem('oauth_pending', JSON.stringify({
          oauth_data: parsedData,
          provider: provider
        }));

        // Clean URL
        window.history.replaceState({}, document.title, '/');
      } catch (error) {
        console.error('Error parsing OAuth data:', error);
        showNotificationModal('error', 'OAuth Error', 'Failed to process OAuth data');
      }
    }

    // Handle OAuth error
    if (authStatus === 'error' && authError) {
      const decodedError = decodeURIComponent(authError);
      showNotificationModal('error', 'OAuth Error', decodedError);
      // Clean URL
      window.history.replaceState({}, document.title, '/');
    }
  }, [onLogin]);

  // Show notification function
  const showNotificationModal = (type, title, message) => {
    setNotificationConfig({ type, title, message });
    setShowNotification(true);
  };

  // Close notification function
  const closeNotification = () => {
    setShowNotification(false);
  };

// Password strength validator
const getPasswordStrength = (password) => {
  if (!password) return '';
  
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Complexity checks
  if (/[a-z]/.test(password)) strength++; // lowercase
  if (/[A-Z]/.test(password)) strength++; // uppercase
  if (/[0-9]/.test(password)) strength++; // numbers
  if (/[^a-zA-Z0-9]/.test(password)) strength++; // special chars
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

const getPasswordStrengthText = (password) => {
  const strength = getPasswordStrength(password);
  switch (strength) {
    case 'weak':
      return 'Weak password - Add more characters and complexity';
    case 'medium':
      return 'Medium strength - Consider adding special characters';
    case 'strong':
      return 'Strong password!';
    default:
      return '';
  }
};


  // Form validation
  const validateForm = () => {
    const errors = {};

    if (authMode === 'register') {
      if (!authForm.name.trim()) {
        errors.name = 'Name is required';
      }
      
      if (!isOAuthRegistration && !authForm.password) {
        errors.password = 'Password is required';
      } else if (!isOAuthRegistration && authForm.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }

    if (!authForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(authForm.email)) {
      errors.email = 'Email is invalid';
    }

    if (authMode === 'login' && !authForm.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

// Update validateOAuthForm to include password validation:
const validateOAuthForm = () => {
  const errors = {};
  
  if (!authForm.company.trim()) {
    errors.company = 'Company is required';
  }
  
  // Password validation
  if (!authForm.password) {
    errors.password = 'Password is required';
  } else if (authForm.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/[a-z]/.test(authForm.password)) {
    errors.password = 'Password must contain lowercase letters';
  } else if (!/[A-Z]/.test(authForm.password)) {
    errors.password = 'Password must contain uppercase letters';
  } else if (!/[0-9]/.test(authForm.password)) {
    errors.password = 'Password must contain numbers';
  } else if (!/[^a-zA-Z0-9]/.test(authForm.password)) {
    errors.password = 'Password must contain special characters';
  }
  
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};


  // Handle OAuth registration completion
  const handleOAuthComplete = async () => {
    if (!validateOAuthForm()) {
      return;
    }

    setLoading(true);

    try {
      const oauthPending = sessionStorage.getItem('oauth_pending');
      if (!oauthPending) {
        throw new Error('OAuth session expired');
      }

      const { oauth_data, provider } = JSON.parse(oauthPending);
      
      const response = await axios.post(`${BACKEND_URL}/api/auth/oauth/complete`, {
        oauth_data: oauth_data,
        provider: provider,
        role: authForm.role,
        company: authForm.company,
        password: authForm.password
      });
      
      // Clear OAuth pending data
      sessionStorage.removeItem('oauth_pending');
      setIsOAuthRegistration(false);
      setShowOAuthModal(false);
      
      // Store token and user
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Clear form
      setAuthForm({
        email: '',
        password: '',
        name: '',
        role: 'developer',
        company: ''
      });
      setFormErrors({});
      
      // Redirect based on role
      const loggedInUser = response.data.user;
      if (loggedInUser.role === 'investor') {
        onLogin(loggedInUser, 'home');
      } else if (loggedInUser.role === 'developer') {
        onLogin(loggedInUser, 'dashboard');
      } else if (loggedInUser.role === 'admin') {
        onLogin(loggedInUser, 'dashboard-admin');
      } else {
        onLogin(loggedInUser, 'home');
      }
      
    } catch (error) {
      console.error('OAuth completion failed:', error);
      showNotificationModal(
        'error',
        'Registration Failed',
        error.response?.data?.detail || 'Failed to complete registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Regular registration/login flow
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        authMode === 'login'
          ? { email: authForm.email, password: authForm.password }
          : authForm;

      const response = await axios.post(`${BACKEND_URL}${endpoint}`, payload);

      // -------- REGISTER MODE --------
      if (authMode === 'register') {
        showNotificationModal(
          'info',
          'Verify Your Email',
          'Your account has been created. Please check your inbox to verify your email before logging in.'
        );

        // clear form
        setAuthForm({
          email: '',
          password: '',
          name: '',
          role: 'developer',
          company: ''
        });
        setFormErrors({});

        return;
      }

      // -------- LOGIN MODE --------
      const loggedInUser = response.data.user;

      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      // Clear form
      setAuthForm({
        email: '',
        password: '',
        name: '',
        role: 'developer',
        company: ''
      });
      setFormErrors({});

      // Redirect based on role
      if (loggedInUser.role === 'admin') {
        onLogin(loggedInUser, 'dashboard-admin');
      } else if (loggedInUser.role === 'developer') {
        onLogin(loggedInUser, 'dashboard');
      } else if (loggedInUser.role === 'investor') {
        onLogin(loggedInUser, 'home');
      } else {
        onLogin(loggedInUser, 'home');
      }

    } catch (error) {
      console.error('Auth failed:', error);

      // Special case: email not verified
      if (error.response?.data?.detail === "Please verify your email before logging in.") {
        showNotificationModal(
          'info',
          'Email Not Verified',
          'Your account is created but not verified. Please check your email inbox.'
        );
        return;
      }

      // Generic error
      showNotificationModal(
        'error',
        'Authentication Failed',
        error.response?.data?.detail || 'Authentication failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // --- OAuth login ---
  const handleOAuthLogin = (provider) => {
    try {
      const oauthUrl = `${BACKEND_URL}/api/auth/login/${provider}`;
      window.location.href = oauthUrl;
    } catch (error) {
      console.error(`OAuth ${provider} login error:`, error);
      showNotificationModal('error', 'OAuth Error', `OAuth login failed: ${error.message}`);
    }
  };

  const getOAuthIcon = (provider) => {
    switch (provider) {
      case 'google':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        );
      case 'github':
        return <Github className="w-5 h-5" />;
      default:
        return null;
    }
  };

  // Toggle auth mode
  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setFormErrors({});
    setAuthForm({
      email: '',
      password: '',
      name: '',
      role: 'developer',
      company: ''
    });
  };

  const isRegisterMode = authMode === 'register';

  return (
    <div className={`auth-container ${isRegisterMode ? 'auth-container-register' : ''}`}>
      
      {/* Left Side - Branding & Features */}
      <div className="auth-branding-side">
        <div className="auth-branding-content">
          
          {/* Features List */}
          <div className="auth-features-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon primary">
                <Zap className="w-6 h-6" />
              </div>
              <div className="auth-feature-content">
                <h3>Lightning Fast Bidding</h3>
                <p>Real-time auction system with instant notifications and updates</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon success">
                <Shield className="w-6 h-6" />
              </div>
              <div className="auth-feature-content">
                <h3>Secure Transactions</h3>
                <p>Protected payments with escrow service for peace of mind</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon warning">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="auth-feature-content">
                <h3>Market Insights</h3>
                <p>Data-driven analytics to help you make informed decisions</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon error">
                <User className="w-6 h-6" />
              </div>
              <div className="auth-feature-content">
                <h3>Vetted Professionals</h3>
                <p>Every developer is carefully screened and verified</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="auth-form-side">
        
        <div className={`auth-card ${isRegisterMode ? 'auth-card-wide' : ''}`}>
      
          <div className="card-header text-center">
            <h2 className="card-title card-title-with-icon">
              <span className="card-title-icon">
                <Rocket className="w-5 h-5" />
              </span>
              {isRegisterMode ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="card-description">
              {isRegisterMode
                ? 'Join the community of developers and investors'
                : 'Login to continue to BiteBids'}
            </p>
          </div>

          <div className="card-content">
        
            <form onSubmit={handleAuth}>
            
              {isRegisterMode ? (
                /* Registration Form - Two Column Layout */
                <div className="form-grid-register">
              
                  {/* Left Column */}
                  <div className="form-column">
                
                    {/* Name */}
                    <div className="form-group">
                      <label className="form-label">
                        <User className="w-4 h-4" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        className={`form-input ${formErrors.name ? 'error' : ''}`}
                        value={authForm.name}
                        onChange={(e) => {
                          setAuthForm({ ...authForm, name: e.target.value });
                          setFormErrors({ ...formErrors, name: '' });
                        }}
                        placeholder="John Doe"
                      />
                      {formErrors.name && (
                        <span className="form-error">{formErrors.name}</span>
                      )}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                      <label className="form-label">
                        <Mail className="w-4 h-4" />
                        Email *
                      </label>
                      <input
                        type="email"
                        className={`form-input ${formErrors.email ? 'error' : ''}`}
                        value={authForm.email}
                        onChange={(e) => {
                          setAuthForm({ ...authForm, email: e.target.value });
                          setFormErrors({ ...formErrors, email: '' });
                        }}
                        placeholder="you@example.com"
                      />
                      {formErrors.email && (
                        <span className="form-error">{formErrors.email}</span>
                      )}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                      <label className="form-label">
                        <Lock className="w-4 h-4" />
                        Password *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-input ${formErrors.password ? 'error' : ''}`}
                          value={authForm.password}
                          onChange={(e) => {
                            setAuthForm({ ...authForm, password: e.target.value });
                            setFormErrors({ ...formErrors, password: '' });
                          }}
                          placeholder="••••••••"
                          style={{ paddingRight: '3rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#9ca3af',
                            padding: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {formErrors.password && (
                        <span className="form-error">{formErrors.password}</span>
                      )}
                    </div>

                  </div>

                  {/* Right Column */}
                  <div className="form-column">
                
                    {/* Company */}
                    <div className="form-group">
                      <label className="form-label">
                        <Building className="w-4 h-4" />
                        Company *
                      </label>
                      <input
                        type="text"
                        className={`form-input ${formErrors.company ? 'error' : ''}`}
                        value={authForm.company}
                        onChange={(e) => {
                          setAuthForm({ ...authForm, company: e.target.value });
                          setFormErrors({ ...formErrors, company: '' });
                        }}
                        placeholder="Company name"
                        required
                      />
                      {formErrors.company && (
                        <span className="form-error">{formErrors.company}</span>
                      )}
                    </div>

                    {/* Role */}
                    <div className="form-group">
                      <label className="form-label">
                        <Briefcase className="w-4 h-4" />
                        Role *
                      </label>
                      <Select
                        value={authForm.role}
                        onValueChange={(value) =>
                          setAuthForm({ ...authForm, role: value })
                        }
                      >
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-black">
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="investor">Investor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                  </div>
                </div>
              ) : (
                /* Login Form - Single Column */
                <>
                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      className={`form-input ${formErrors.email ? 'error' : ''}`}
                      value={authForm.email}
                      onChange={(e) => {
                        setAuthForm({ ...authForm, email: e.target.value });
                        setFormErrors({ ...formErrors, email: '' });
                      }}
                      placeholder="you@example.com"
                    />
                    {formErrors.email && (
                      <span className="form-error">{formErrors.email}</span>
                    )}
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <label className="form-label">
                      <Lock className="w-4 h-4" />
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`form-input ${formErrors.password ? 'error' : ''}`}
                        value={authForm.password}
                        onChange={(e) => {
                          setAuthForm({ ...authForm, password: e.target.value });
                          setFormErrors({ ...formErrors, password: '' });
                        }}
                        placeholder="••••••••"
                        style={{ paddingRight: '3rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '1rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#9ca3af',
                          padding: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <span className="form-error">{formErrors.password}</span>
                    )}
                  </div>
                </>
              )}

              {/* Submit */}
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner" />
                    {authMode === 'login' ? 'Logging in...' : 'Creating account...'}
                  </>
                ) : (
                  authMode === 'login' ? 'Login' : 'Create Account'
                )}
              </button>
          
            </form>

            {/* Switch Mode */}
            <p className="text-center text-secondary switch-mode-text">
              {authMode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <span className="switch-link" onClick={toggleAuthMode}>
                    Sign up
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <span className="switch-link" onClick={toggleAuthMode}>
                    Login
                  </span>
                </>
              )}
            </p>

            {/* OAuth Buttons */}
            <div className="oauth-buttons text-center">
              <p className="oauth-divider">Or continue with</p>
              <div className="oauth-buttons-row">
                <button
                  type="button"
                  className="btn btn-outline btn-oauth"
                  onClick={() => handleOAuthLogin('google')}
                >
                  {getOAuthIcon('google')} <span>Google</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-oauth"
                  onClick={() => handleOAuthLogin('github')}
                >
                  {getOAuthIcon('github')} <span>GitHub</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* OAuth Registration Completion Modal */}
      {showOAuthModal && (
        <div className="oauth-modal-overlay">
          <div className="oauth-modal">
            <div className="oauth-modal-header">
              <h2 className="oauth-modal-title">
                <Rocket className="w-7 h-7" />
                Complete Your Registration
              </h2>
              <p className="oauth-modal-subtitle">
                Welcome, {authForm.name}! Just a couple more details to get started.
              </p>
            </div>

            <div className="oauth-modal-content">
              {/* User Info Display */}
              <div className="oauth-user-info">
                <div className="oauth-info-item">
                  <Mail className="w-4 h-4" />
                  <span>{authForm.email}</span>
                </div>
                <div className="oauth-info-item">
                  <User className="w-4 h-4" />
                  <span>{authForm.name}</span>
                </div>
              </div>

              {/* Company and Password in Same Row */}
              <div className="oauth-form-row">
              
                {/* Company Input */}
                <div className="form-group">
                  <label className="form-label">
                    <Building className="w-4 h-4" />
                    Company Name *
                  </label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.company ? 'error' : ''}`}
                    value={authForm.company}
                    onChange={(e) => {
                      setAuthForm({ ...authForm, company: e.target.value });
                      setFormErrors({ ...formErrors, company: '' });
                    }}
                    placeholder="Enter your company name"
                  />
                  {formErrors.company && (
                    <span className="form-error">{formErrors.company}</span>
                  )}
                </div>

                {/* Password Input */}
                <div className="form-group">
                  <label className="form-label">
                    <Lock className="w-4 h-4" />
                    Set Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-input ${formErrors.password ? 'error' : ''}`}
                      value={authForm.password}
                      onChange={(e) => {
                        setAuthForm({ ...authForm, password: e.target.value });
                        setFormErrors({ ...formErrors, password: '' });
                      }}
                      placeholder="Create a strong password"
                      style={{ paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9ca3af',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <span className="form-error">{formErrors.password}</span>
                  )}
                  {/* Password strength indicator */}
                  {authForm.password && (
                    <div className="password-strength-indicator">
                      <div className={`password-strength-bar ${getPasswordStrength(authForm.password)}`}></div>
                      <span className="password-strength-text">
                        {getPasswordStrengthText(authForm.password)}
                      </span>
                    </div>
                  )}
                </div>
                
              </div>

              {/* Role Selection */}
              <div className="oauth-role-selection">
                <label className="oauth-role-label">
                  <Briefcase className="w-4 h-4" />
                  Choose Your Role *
                </label>
                <div className="oauth-role-cards">
                  <div 
                    className={`oauth-role-card ${authForm.role === 'developer' ? 'active' : ''}`}
                    onClick={() => setAuthForm({ ...authForm, role: 'developer' })}
                  >
                    <div className="oauth-role-icon developer">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3>Developer</h3>
                    <p>Build and bid on projects</p>
                  </div>

                  <div 
                    className={`oauth-role-card ${authForm.role === 'investor' ? 'active' : ''}`}
                    onClick={() => setAuthForm({ ...authForm, role: 'investor' })}
                  >
                    <div className="oauth-role-icon investor">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <h3>Investor</h3>
                    <p>Find and fund projects</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="oauth-modal-actions">
              <button 
                className="btn btn-primary btn-block"
                onClick={handleOAuthComplete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner" />
                    Completing Registration...
                  </>
                ) : (
                  <>
                    Continue as {authForm.role === 'developer' ? 'Developer' : 'Investor'}
                    <Check className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotification && (
        <div className="modal-overlay" onClick={closeNotification}>
          <div 
            className={`modal-content modal-sm notification-modal notification-${notificationConfig.type}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notification-modal-header">
              <div className="notification-icon-wrapper">
                {notificationConfig.type === 'success' && (
                  <Check className="notification-icon" />
                )}
                {notificationConfig.type === 'error' && (
                  <AlertCircle className="notification-icon" />
                )}
                {notificationConfig.type === 'info' && (
                  <AlertCircle className="notification-icon" />
                )}
              </div>
              <button className="modal-close" onClick={closeNotification}>
                ×
              </button>
            </div>
            
            <div className="notification-body">
              <h3 className="notification-title">{notificationConfig.title}</h3>
              <p className="notification-message">{notificationConfig.message}</p>
            </div>

            <div className="notification-footer">
              <button 
                className={`btn ${notificationConfig.type === 'error' ? 'btn-outline' : 'btn-primary'}`}
                onClick={closeNotification}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Login;