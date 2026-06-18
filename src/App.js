import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

// Ensure axios is available globally for OAuth callback processing
if (typeof window !== 'undefined') {
  window.axios = axios;
}
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Progress } from './components/ui/progress';
import { Separator } from './components/ui/separator';
import { Rocket, Zap, Users, TrendingUp, Star, Clock, DollarSign, Code, Globe, Shield, Sparkles, Activity, Bot, Orbit, Layers, Target, Github, Home, ShoppingCart, Gavel, User, Settings, Plus, Eye, Hammer, CreditCard, ToggleLeft, ToggleRight, Upload, FileText, Image, Video, X, Building2, CreditCard as Bank, Apple, ChevronUp, ChevronDown, ArrowUp, ArrowDown, Filter, BarChart3, Package, Briefcase, LogOut, Menu, Check } from 'lucide-react';


import ModernHomePage from './components/ModernHomePage/ModernHomePage';
import Navbar from './components/Navbar/Navbar';
import Marketplace from './components/Marketplace/Marketplace';
import Dashboard from './components/Dashboard/Dashboard';
import DashboardAdmin from './components/DashboardAdmin/DashboardAdmin';
import Login from './components/Login/Login';
import About from './components/About/About';
import Contact from './components/Contact/Contact';
import Profile from './components/Profile/Profile'
import VerifyEmail from './components/VerifyEmail/VerifyEmail';
import ChatPage from './components/ChatPage/ChatPage';
import NotificationSystem from './components/NotificationSystem/NotificationSystem';
import ChatsListPage from './components/ChatsListPage/ChatsListPage';

import EmailChangeVerification from './components/EmailChangeVerification/EmailChangeVerification';

import AdminChatsPage from './components/AdminChatsPage/AdminChatsPage';
import AdminChatViewPage from './components/AdminChatViewPage/AdminChatViewPage';
import { useNotification } from './components/NotificationModal/NotificationModal';

import PayoutSettings from './components/PayoutSettings/PayoutSettings';
import AdminPayouts from './components/AdminPayouts/AdminPayouts';


import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;


const PLATFORM_FEE_PERCENTAGE = 6; // 6% platform fee
const PLATFORM_FIXED_FEE = 30; // $30 fixed fee
const PAYMENT_FLOW_STEPS = [
  { id: 'modal', label: 'Investor opens payment modal', description: 'Authenticated winner begins the escrow checkout.' },
  { id: 'escrow', label: 'Escrow created', description: 'Funds are reserved securely before development starts.' },
  { id: 'fees', label: 'Fees calculated', description: 'Platform and processing fees are applied to the total.' },
  { id: 'processed', label: 'Payment processed', description: 'Payment confirmation unlocks project collaboration.' }
];
const SUPPORTED_BILLING_COUNTRIES = ['US', 'CA', 'GB', 'DE', 'FR', 'AU'];

function App() {
  const { showNotification } = useNotification();

  const [user, setUser] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // Track auth initialization

  // const [authMode, setAuthMode] = useState('login');
  
  const [showEUR, setShowEUR] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Payment-related states
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    billing_address: {
      address1: '',
      city: '',
      state: '',
      zip: '',
      country: 'US'
    },
    payment_method: 'credit_card'
  });
  const [paymentSource, setPaymentSource] = useState(null);
  const [paymentSteps, setPaymentSteps] = useState({
    modal: false,
    escrow: false,
    fees: false,
    processed: false
  });

  const [selectedProject, setSelectedProject] = useState(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [pendingOAuthUser, setPendingOAuthUser] = useState(null);
  const [showSolutionDialog, setShowSolutionDialog] = useState(false);
  const [showBidDialog, setShowBidDialog] = useState(false);

  // Scroll button states
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Search functionality states - Simplified
  const [filteredAuctions, setFilteredAuctions] = useState([]);

  // Admin dashboard states
  const [adminUser, setAdminUser] = useState(null);
  const [adminDashboardData, setAdminDashboardData] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminTransactions, setAdminTransactions] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false);

  const [selectedAdminChatRoom, setSelectedAdminChatRoom] = useState(null);


useEffect(() => {
  const protectedRoutes = {
    'dashboard': 'developer',
    'payout-settings': 'developer',
    'dashboard-admin': 'admin',
    'admin-chats': 'admin',
    'admin-chat-view': 'admin',
    'admin-payouts': 'admin'
  };

  const requiredRole = protectedRoutes[currentPage];
  
  if (requiredRole) {
    // Check if user is logged in
    if (!user) {
      showNotification('error', 'Authentication Required', 'Please login to access this page.');
      setCurrentPage('login');
      window.history.pushState(null, null, '/login');
      return;
    }
    
    // Check if user has the required role
    if (user.role !== requiredRole) {
      showNotification('error', 'Access Denied', `Only ${requiredRole}s can access this page.`);
      setCurrentPage('home');
      window.history.pushState(null, null, '/');
    }
  }
}, [currentPage, user]);

// Navigate to admin chats page
const navigateToAdminChats = () => {
  setCurrentPage('admin-chats');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  window.history.pushState(null, null, '/admin/chats');
};

// Navigate to specific admin chat view
const navigateToAdminChatView = (roomId) => {
  setSelectedAdminChatRoom(roomId);
  setCurrentPage('admin-chat-view');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  window.history.pushState(null, null, `/admin/chat-view/${roomId}`);
};

// Navigate back from admin chat view to admin chats list
const navigateBackToAdminChats = () => {
  setSelectedAdminChatRoom(null);
  setCurrentPage('admin-chats');
  window.history.pushState(null, null, '/admin/chats');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};


useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  

  if (window.location.pathname === '/payment/success' && sessionId) {
  axios.get(`${BACKEND_URL}/api/payments/stripe/verify-session/${sessionId}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(async response => {
    if (response.data.success) {
      const projectId = response.data.project_id;
      showNotification('success', 'Payment Completed', 'Opening chat...');
      
      // Wait for webhook to create room
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const chatResponse = await axios.get(
          `${BACKEND_URL}/api/chat/rooms`,
          { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
        );
        
        const chatRoom = chatResponse.data.find(room => room.project_id === projectId);
        
        if (chatRoom) {
          setCurrentPage('chat');
          window.history.replaceState({}, '', `/chat/${chatRoom.id}`);
        } else {
          showNotification('info', 'Chat Room Pending', 'Chat room is being created. Check notifications.');
          setCurrentPage('dashboard');
        }
      } catch (error) {
        console.error('Error:', error);
        setCurrentPage('dashboard');
      }
    }
  });
}

  
  else if (window.location.pathname === '/payment/cancel') {
    showNotification('info', 'Payment Canceled', 'Payment was canceled.');
    setCurrentPage('dashboard');
    window.history.replaceState({}, '', '/home');
  }
}, []);


useEffect(() => {
    
    // Handle OAuth callback and dashboard routing
    const handleOAuthCallback = async () => {
      // Prevent multiple OAuth processing using sessionStorage flag
      const oauthProcessingKey = 'oauth_processing';
      if (sessionStorage.getItem(oauthProcessingKey)) {
        console.log('OAuth already processing, skipping...');
        return false;
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userParam = urlParams.get('user');
      const authStatus = urlParams.get('auth');
      const isNewUser = urlParams.get('new_user');
      
      console.log('OAuth callback check:', { 
        hasToken: !!token, 
        hasUser: !!userParam, 
        authStatus, 
        isNewUser,
        fullUrl: window.location.href
      });
      
      if (token && userParam && authStatus === 'success') {
        try {
          // Set processing flag immediately
          sessionStorage.setItem(oauthProcessingKey, 'true');
          
          // Parse user data from URL
          const userData = JSON.parse(decodeURIComponent(userParam));
          
          console.log('OAuth callback processing:', { token: token.substring(0, 20) + '...', userData, isNewUser });
          
          // CRITICAL: Store token in localStorage
          console.log('Storing token in localStorage...');
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Verify token was stored
          const storedToken = localStorage.getItem('token');
          const storedUser = localStorage.getItem('user');
          console.log('Storage verification:', { 
            tokenStored: !!storedToken,
            userStored: !!storedUser
          });
          
          // Set axios authorization header
          if (axios && axios.defaults && axios.defaults.headers) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log('Authorization header set successfully');
          }
          
          // Set user data in state
          setUser(userData);
          
          // Set current page to dashboard
          setCurrentPage('dashboard');
          
          // Show welcome message (delayed to avoid blocking)
          setTimeout(() => {
            if (isNewUser === 'true') {
              showNotification(
                'success',
                `Welcome to BiteBids, ${userData.name}`,
                'Your account is ready. Explore the marketplace and start bidding.'
              );
            } else {
              showNotification(
                'success',
                `Welcome back, ${userData.name}`,
                "You're now logged in and can access all platform features."
              );
            }
          }, 1000);
          
          // Clear OAuth parameters from URL (do this LAST)
          setTimeout(() => {
            const newUrl = window.location.pathname;
            window.history.replaceState(null, null, newUrl);
            sessionStorage.removeItem(oauthProcessingKey); // Clear processing flag
          }, 500);
          
          console.log('OAuth callback completed successfully');
          return true;
        } catch (error) {
          console.error('Failed to process OAuth callback:', error);
          sessionStorage.removeItem(oauthProcessingKey); // Clear processing flag on error
          showNotification('error', 'Login Failed', 'Please try again.');
        }
      }
      

    // ✅ NEW USER REGISTRATION - Let Login.jsx handle it
    // Just ensure we're on the login page so Login.jsx can process it
    if (authStatus === 'register') {
      console.log('New user OAuth registration detected - Login.jsx will handle it');
      setCurrentPage('login');
      return false; // Don't mark as handled - let Login.jsx process it
    }

      
      // Handle OAuth errors
      if (authStatus === 'error') {
        const message = urlParams.get('message') || 'OAuth login failed';
        showNotification('error', 'Login Error', message);
        window.history.replaceState(null, null, '/');
      }
      
      return false;
    };

    const initializeAuth = async () => {
      const oAuthHandled = await handleOAuthCallback();

        // ✅ Handle OAuth registration immediately
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('auth') === 'register') {
          setCurrentPage('login');
          return;
        }

      
      if (!oAuthHandled) {
        // Check for existing JWT token and user data
        const token = localStorage.getItem('token');
        const storedUserData = localStorage.getItem('user');
        
        if (token && storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            console.log('Restoring session from localStorage:', userData);
            
            // Set axios authorization header
            if (axios && axios.defaults && axios.defaults.headers) {
              axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            
            setUser(userData);
            
            // Try to fetch fresh profile to verify token is still valid
            await fetchUserProfile();
          } catch (error) {
            console.error('Failed to restore session:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } else if (token) {
          // Have token but no user data, fetch profile
          if (axios && axios.defaults && axios.defaults.headers) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
          await fetchUserProfile();
        }
      }
      
      // Handle routing based on current path
      const path = window.location.pathname;

      // ✅ NEW: Check for chat route FIRST (highest priority)
      if (path.startsWith('/chat/')) {
        const roomId = path.split('/chat/')[1];
        if (roomId) {
          console.log('✅ Loading chat room:', roomId);
          setCurrentPage('chat');
          return; // Exit early - don't check other routes
        }
      }
      else if (path === '/verify-email-change' || path.includes('/verify-email-change')) {
      console.log('Setting page to verify-email-change');
      setCurrentPage('verify-email-change');
      }
      // FIXED: Check for verify-email route FIRST before defaulting
      else if (path === '/verify-email' || path.includes('/verify-email')) {
        console.log('Setting page to verify-email');
        setCurrentPage('verify-email');
      } 

      else if (path === '/dashboard') {
        setCurrentPage('dashboard');
      } else if (path === '/marketplace') {
        setCurrentPage('marketplace');
      } else if (path === '/auctions') {
        setCurrentPage('auctions');
      } else if (path === '/admin/chats') {
        setCurrentPage('admin-chats');
      } else if (path.startsWith('/admin/chat-view/')) {
        const roomId = path.split('/admin/chat-view/')[1];
        if (roomId) {
          setSelectedAdminChatRoom(roomId);
          setCurrentPage('admin-chat-view');
        }
      } else if (path === '/admin') {
        setCurrentPage('admin');
      } else if (path === '/oauth-config') {
        setCurrentPage('oauth-config');
      } else if (path === '/dashboard-admin') {
        setCurrentPage('dashboard-admin');
      } else if (path === '/payout-settings') {
        setCurrentPage('payout-settings');
      } else if (path === '/admin/payouts') {
        setCurrentPage('admin-payouts');
      } else if (path === '/profile') {
        setCurrentPage('profile');
      } else if (path === '/login') {
        setCurrentPage('login');
      } else if (path === '/about') {
        setCurrentPage('about');
      } else if (path === '/contact') {
        setCurrentPage('contact');
      } else if (path === '/chats') {
        setCurrentPage('chats');
      } else {
        setCurrentPage('home');
      }
      
      // Mark auth as loaded
      setAuthLoading(false);
    };
    const handlePopState = () => {
        // const path = window.location.pathname.slice(1) || 'home'; 
        
        const path = window.location.pathname;
        console.log('🔙 Browser back/forward - path:', path);


          // ✅ NEW: Handle chat routes first
        if (path.startsWith('/chat/')) {
          const roomId = path.split('/chat/')[1];
          if (roomId) {
            console.log('✅ Navigating to chat room:', roomId);
            setCurrentPage('chat');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
        }
        
        // Remove leading slash for other routes
        const page = path.slice(1) || 'home';

        // Define all valid pages
        const validPages = [
          'home',
          'dashboard',
          'dashboard-admin',
          'marketplace',
          'auctions',
          'login',
          'about',
          'profile',
          'contact',
          'admin',
          'oauth-config',
          'profile'
        ];
        
        // Set current page if valid, otherwise default to home
        if (validPages.includes(path)) {
          setCurrentPage(path);
        } else {
          setCurrentPage('home');
        }
        
        // Scroll to top when navigating with browser buttons
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // Handle scroll events for scroll buttons
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrolledToBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
      
      // Show scroll to top button when scrolled down more than 300px
      setShowScrollToTop(scrollTop > 300);
      
      // Show scroll to bottom button when not at bottom and page is scrollable
      setShowScrollToBottom(!scrolledToBottom && scrollHeight > clientHeight + 100);
      
      // Show scroll buttons on pages with content (not login page)
      setShowScrollButtons(user && scrollHeight > clientHeight + 100);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('scroll', handleScroll);

    initializeAuth();
 
    // Cleanup event listeners
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  const fetchUserProfile = async () => {
    try {
      // Ensure axios is available and token exists
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping profile fetch');
        return;
      }
      
      // Get axios instance with fallbacks
      let axiosInstance = null;
      if (typeof axios !== 'undefined') {
        axiosInstance = axios;
      } else if (typeof window !== 'undefined' && window.axios) {
        axiosInstance = window.axios;
      }
      
      if (axiosInstance && axiosInstance.defaults && axiosInstance.defaults.headers) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // Use the axios instance or fallback to fetch
      let response;
      if (axiosInstance) {
        response = await axiosInstance.get(`${BACKEND_URL}/api/user/profile`);
      } else {
        // Fallback to fetch API if axios is not available
        console.log('Using fetch API as axios fallback');
        const fetchResponse = await fetch(`${BACKEND_URL}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!fetchResponse.ok) {
          throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
        }
        response = { data: await fetchResponse.json() };
      }
      
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data)); // Update stored user data
      console.log('User profile fetched successfully:', response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      
      // FIXED: Only clear token on authentication errors (401/403), not on network errors
      const isAuthError = 
        error.response?.status === 401 || 
        error.response?.status === 403 ||
        error.message?.includes('401') ||
        error.message?.includes('403');
      
      if (isAuthError) {
        console.log('Token invalid or expired, clearing session');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        
        // Clean up axios headers if available
        if (typeof axios !== 'undefined' && axios.defaults && axios.defaults.headers) {
          delete axios.defaults.headers.common['Authorization'];
        } else if (typeof window !== 'undefined' && window.axios && window.axios.defaults && window.axios.defaults.headers) {
          delete window.axios.defaults.headers.common['Authorization'];
        }
      } else {
        // Network error or server error - keep the user logged in with stored data
        console.log('Network/server error, keeping user session from localStorage');
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error('Failed to parse stored user data:', e);
          }
        }
      }
    }
  };

  const resetPaymentSteps = () => {
    setPaymentSteps({
      modal: false,
      escrow: false,
      fees: false,
      processed: false
    });
  };

  const markPaymentStep = (step) => {
    setPaymentSteps(prev => prev[step] ? prev : { ...prev, [step]: true });
  };

  const handlePaymentDialogChange = (isOpen) => {
    setShowPaymentDialog(isOpen);
    if (!isOpen) {
      setSelectedItem(null);
      setPaymentSource(null);
      setPaymentConfig(null);
      resetPaymentSteps();
    }
  };

  const resolvePaymentAmount = (item = {}) => {
    const rawAmount = item.amount ?? (
      item.orderType === 'auction'
        ? item.current_bid ?? item.starting_price
        : item.ai_pricing?.estimated_price ?? item.price
    );
    const parsed = parseFloat(rawAmount);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const buildPaymentPreview = (amount) => {
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    const percentageFee = safeAmount * (PLATFORM_FEE_PERCENTAGE / 100);
    const fees = Math.max(0, percentageFee + PLATFORM_FIXED_FEE);
    return {
      amount: safeAmount,
      fees,
      total: safeAmount + fees
    };
  };

  const handleNotificationPayment = async ({ 
    notification, 
    paymentData = {},    // ✅ Changed from metadata to paymentData
    metadata = {},       // ✅ Keep for backward compatibility
    amount, 
    project_id,          // ✅ Accept directly
    bid_id,              // ✅ Accept directly
    customer_email,      // ✅ Accept directly
    customer_name,       // ✅ Accept directly
    onComplete 
  }) => {
    console.log('handleNotificationPayment called:', { 
      notification, 
      paymentData, 
      metadata, 
      amount,
      project_id,
      bid_id 
    });

    if (!user) {
      showNotification('error', 'Authentication Required', 'Please login to continue with the payment.');
      return;
    }

    // ✅ FIX: Merge paymentData and metadata (paymentData takes precedence)
    const mergedData = {
      ...metadata,
      ...paymentData
    };

    // ✅ FIX: Use direct parameters first, then fall back to merged data
    const normalizedAmount = parseFloat(
      amount ?? 
      mergedData.amount ?? 
      mergedData.bid_amount ?? 
      0
    ) || 0;

    // ✅ Validate amount
    if (normalizedAmount <= 0) {
      console.error('Invalid payment amount:', normalizedAmount);
      showNotification('error', 'Payment Error', 'Unable to process payment: invalid amount. Please contact support.');
      return;
    }

    // ✅ FIX: Get project details from direct params or merged data
    const projectId = project_id || mergedData.project_id || mergedData.auction_id;
    const bidIdFinal = bid_id || mergedData.bid_id;

    console.log('Extracted payment details:', {
      projectId,
      bidIdFinal,
      normalizedAmount,
      mergedData
    });

    if (!projectId) {
      console.error('Missing project ID. Direct param:', project_id, 'Merged data:', mergedData);
      showNotification('error', 'Payment Error', 'Unable to process payment: missing project information. Please contact support.');
      return;
    }

    const paymentTitle = mergedData.project_title || 
                        mergedData.solution_title || 
                        notification?.title || 
                        'Project Payment';

    // ✅ Build payment item with all required data
    const paymentItem = {
      _id: projectId,
      title: paymentTitle,
      orderType: mergedData.payment_type === 'project_winner' ? 'auction' : 'fixed',
      amount: normalizedAmount,
      current_bid: normalizedAmount,
      starting_price: normalizedAmount,
      ai_pricing: { estimated_price: normalizedAmount }
    };

    console.log('Opening payment dialog with:', paymentItem);

    // ✅ Open payment dialog with enhanced metadata
    await openPaymentDialog(paymentItem, {
      type: 'notification',
      metadata: {
        ...mergedData,
        bid_id: bidIdFinal,
        project_id: projectId,
        amount: normalizedAmount
      },
      notificationLink: notification?.link || '',
      onComplete,
      notificationId: notification?.id,
      hasCompleted: false
    });
  };

  const notifyPaymentCompletion = () => {
    setPaymentSteps(prev => ({ ...prev, processed: true }));
    setPaymentSource(prev => {
      if (prev?.type === 'notification' && !prev?.hasCompleted) {
        if (typeof prev.onComplete === 'function') {
          try {
            const maybePromise = prev.onComplete();
            if (maybePromise && typeof maybePromise.catch === 'function') {
              maybePromise.catch(error => console.error('Failed to update notification:', error));
            }
          } catch (error) {
            console.error('Failed to update notification:', error);
          }
        }
        return { ...prev, hasCompleted: true };
      }
      return prev;
    });
  };

  const openPaymentDialog = async (item, source = null) => {
    try {
      setCheckoutLoading(true);

      const normalizedAmount = resolvePaymentAmount(item);
      const normalizedItem = { ...item, amount: normalizedAmount };

      setSelectedItem(normalizedItem);
      setPaymentSource(source);

      if (source?.type === 'notification') {
        setPaymentSteps({
          modal: true,
          escrow: false,
          fees: false,
          processed: false
        });
      } else {
        resetPaymentSteps();
      }

      // Build payment preview locally
      setPaymentConfig(buildPaymentPreview(normalizedAmount));

      setShowPaymentDialog(true);
    } catch (error) {
      console.error('Error opening payment dialog:', error);
      showNotification('error', 'Payment Error', 'Failed to load payment dialog. Please try again.');
      throw error;
    } finally {
      setCheckoutLoading(false);
    }
  };

  const processStandardPayment = async () => {
    const baseAmount = selectedItem.orderType === 'auction'
      ? selectedItem.current_bid || selectedItem.starting_price
      : selectedItem.ai_pricing?.estimated_price || selectedItem.price;

    // ✅ Get project ID from payment source metadata
    const projectId = paymentSource?.metadata?.project_id || 
                    paymentSource?.metadata?.auction_id ||
                    selectedItem._id;

    const paymentRequest = {
      order_type: selectedItem.orderType,
      item_id: selectedItem._id,
      customer_email: user.email,
      customer_name: user?.name || user?.email || 'User',
      billing_address: paymentForm.billing_address,
      payment_method: paymentForm.payment_method,
      amount: baseAmount,
      winner_bid_id: paymentSource?.metadata?.bid_id || null,
      project_id: projectId,
      notification_id: paymentSource?.notificationId || null
    };

    console.log('Processing payment request:', paymentRequest);

    // ✅ FIX: Set loading states BEFORE making payment
    if (paymentSource?.type === 'notification') {
      markPaymentStep('escrow');
      markPaymentStep('fees');
    }

    const isStripeCheckout = paymentForm.payment_method === 'credit_card';
    const endpoint = isStripeCheckout
      ? `${BACKEND_URL}/api/payments/stripe/create-checkout-session`
      : `${BACKEND_URL}/api/payments/create-checkout-session`;

    try {
      const response = await axios.post(endpoint, paymentRequest, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Payment response:', response.data);

      if (!response.data.success) {
        showNotification(
          'error',
          'Payment Error',
          'Failed to create checkout session: ' + (response.data.message || 'Unknown error')
        );
        return;
      }

      // ✅ STRIPE CHECKOUT FLOW
      if (isStripeCheckout) {
        if (!stripePromise) {
          showNotification('error', 'Payment Error', 'Stripe is not configured. Please contact support.');
          return;
        }

        const stripe = await stripePromise;
        if (!stripe) {
          showNotification('error', 'Payment Error', 'Unable to initialize Stripe. Please try again later.');
          return;
        }

        const sessionId = response.data.session_id;
        if (!sessionId) {
          showNotification('error', 'Payment Error', 'Missing Stripe checkout session information. Please contact support.');
          return;
        }

        // ✅ This will redirect to Stripe's hosted checkout page
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          throw new Error(error.message);
        }

        // User will be redirected back after payment
        return;
      }

      // ✅ OTHER PAYMENT METHODS (2Checkout, etc.)
      if (response.data.payment_url) {
        console.log('Redirecting to payment URL:', response.data.payment_url);

        const paymentType = selectedItem.orderType === 'auction' ? 'auction win' : 'marketplace purchase';
        const confirmed = window.confirm(
          `🔒 BiteBids Payment Processing\n\n` +
          `You will be redirected to secure payment page to complete your ${paymentType}.\n\n` +
          `Total Amount: $${calculateTotalPrice(paymentRequest.amount).toFixed(2)}\n` +
          `(Includes marketplace fees)\n\n` +
          `Click OK to proceed to secure payment page.`
        );

        if (confirmed) {
          window.open(response.data.payment_url, '_blank');
          notifyPaymentCompletion();
          handlePaymentDialogChange(false);

          showNotification('success', 'Payment Window Opened', 'Complete your payment in the new tab, then return here. You will be redirected after payment completion.');
        }
      } else {
        showNotification(
          'error',
          'Payment Error',
          'Payment session created successfully, but no payment URL was provided. Please contact support.'
        );
        notifyPaymentCompletion();
        handlePaymentDialogChange(false);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  };

  const calculateTotalPrice = (basePrice) => {
    const platformFee = basePrice * (PLATFORM_FEE_PERCENTAGE / 100);
    return basePrice + platformFee + PLATFORM_FIXED_FEE;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setAdminUser(null);
    setCurrentPage('home');
    // Navigate to home page
    window.history.pushState(null, null, '/');
  };

  const navigateToPage = (pageId) => {
  setCurrentPage(pageId);

  const routes = {
      home: '/',
      dashboard: '/dashboard',
      'dashboard-admin': '/dashboard-admin',
      marketplace: '/marketplace',
      auctions: '/auctions',
      login: '/login',
      about: '/about',
      contact: '/contact',
      admin: '/admin',
      'oauth-config': '/oauth-config',
      profile: '/profile',
      'verify-email': '/verify-email',
      'verify-email-change': '/verify-email-change',
      chats: '/chats',
      'admin-chats': '/admin/chats',
      'admin-chat-view': '/admin/chat-view',
      'payout-settings': '/payout-settings',
      'admin-payouts': '/admin/payouts',
  };

  const url = routes[pageId] || '/';
  window.history.pushState(null, null, url);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToChat = (roomId) => {
    setCurrentPage('chat');
    window.history.pushState(null, null, `/chat/${roomId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  // Mobile Scroll Buttons Component - Simplified and Always Visible
  const ScrollButtons = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showTop, setShowTop] = useState(false);
    const [showBottom, setShowBottom] = useState(true);

    useEffect(() => {
      
      const handleScroll = () => {
        const scrollTop = window.pageYOffset;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        const isScrollable = scrollHeight > clientHeight + 50;
        
        setIsVisible(isScrollable);
        setShowTop(scrollTop > 200);
        setShowBottom(scrollTop < scrollHeight - clientHeight - 50);
      };

      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial state
      
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isVisible || currentPage === 'login') return null;

    return (
      <div className="scroll-buttons-container fixed bottom-4 right-4 z-50 flex flex-col gap-2 md:bottom-6 md:right-6 md:gap-3">
        {showBottom && (
          <button
            onClick={scrollToBottom}
            className="w-11 h-11 md:w-12 md:h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #14b8a6 100%)',
              border: 'none',
              color: 'white'
            }}
            title="Scroll to bottom"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}
        
        {showTop && (
          <button
            onClick={scrollToTop}
            className="w-11 h-11 md:w-12 md:h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #14b8a6 100%)',
              border: 'none',
              color: 'white'
            }}
            title="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  };

  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'home':
        return <ModernHomePage navigateToPage={navigateToPage} />;
      case 'verify-email':
        return  <VerifyEmail navigateToPage={navigateToPage} />;
      case 'marketplace':
        return <Marketplace user={user}/>;
      case 'auctions':
        return <Auctions />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'profile':
        return <Profile user={user} />;
      case 'verify-email':
        return <VerifyEmail navigateToPage={navigateToPage} />;
      case 'verify-email-change':
        return <EmailChangeVerification navigateToPage={navigateToPage} />;
      case 'dashboard':
        // Protected route - only for logged in users with developer role
        if (!user) {
          setCurrentPage('login');
          return <Login onLogin={(user, nextPage) => {
            setUser(user);
            setCurrentPage(nextPage);
            window.history.pushState(null, null, `/${nextPage}`);
          }} />;
        }
        if (user.role !== 'developer') {
          showNotification('error', 'Access Denied', 'Only developers can access this page.');
          setCurrentPage('home');
          return <ModernHomePage />;
        }
        return <Dashboard user={user}  navigateToPage={navigateToPage} />;
      case 'payout-settings':
        // Protected route - only for logged in developers
        if (!user) {
          setCurrentPage('login');
          return <Login onLogin={(user, nextPage) => {
            setUser(user);
            setCurrentPage(nextPage);
            window.history.pushState(null, null, `/${nextPage}`);
          }} />;
        }
        if (user.role !== 'developer') {
          showNotification('error', 'Access Denied', 'Only developers can access payout settings.');
          setCurrentPage('home');
          return <ModernHomePage navigateToPage={navigateToPage} />;
        }
        return <PayoutSettings />;
      case 'admin-payouts':
        // Protected route - only for logged in admins
        if (!user) {
          setCurrentPage('login');
          return <Login onLogin={(user, nextPage) => {
            setUser(user);
            setCurrentPage(nextPage);
            window.history.pushState(null, null, `/${nextPage}`);
          }} />;
        }
        if (user.role !== 'admin') {
          showNotification('error', 'Access Denied', 'Only admins can access payout management.');
          setCurrentPage('home');
          return <ModernHomePage navigateToPage={navigateToPage} />;
        }
        return <AdminPayouts />;
      case 'chats':
        // Protected route - only for logged in users
        if (!user) {
          setCurrentPage('login');
          return <Login onLogin={(user, nextPage) => {
            setUser(user);
            setCurrentPage(nextPage);
            window.history.pushState(null, null, `/${nextPage}`);
          }} />;
        }
        return <ChatsListPage currentUser={user} navigateToChat={navigateToChat} />;
      case 'chat':
        // Protected route - requires login and chat room ID
        if (!user) {
          setCurrentPage('login');
          return <Login onLogin={(user, nextPage) => {
            setUser(user);
            setCurrentPage(nextPage);
            window.history.pushState(null, null, `/${nextPage}`);
          }} />;
        }
        
        const pathname = window.location.pathname;
        const chatRoomId = pathname.startsWith('/chat/') ? pathname.split('/chat/')[1] : null;
        
        console.log('📱 Chat route check:', {
          currentPage,
          pathname: window.location.pathname,
          chatRoomId,
          user: user.name
        });

        if (!chatRoomId) {
          console.error('❌ No chat room ID in URL');
          showNotification('error', 'Invalid Chat Room', 'Invalid chat room URL.');
          setCurrentPage('dashboard');
          return <Dashboard user={user} navigateToPage={navigateToPage} />;
        }
        
        console.log('✅ Rendering ChatPage with room:', chatRoomId);
        return <ChatPage currentUser={user} roomId={chatRoomId} />;
      case 'admin-chats':
      // Protected route - only for logged in users with admin role
      if (!user) {
        setCurrentPage('login');
        return <Login onLogin={(user, nextPage) => {
          setUser(user);
          setCurrentPage(nextPage);
          window.history.pushState(null, null, `/${nextPage}`);
        }} />;
      }
      if (user.role !== 'admin') {
        showNotification('error', 'Access Denied', 'Only admins can access this page.');
        setCurrentPage('home');
        return <ModernHomePage navigateToPage={navigateToPage} />;
      }
      return <AdminChatsPage navigateToAdminChat={navigateToAdminChatView} />;
      case 'admin-chat-view':
        // Protected route - only for logged in users with admin role
        if (!user) {
          setCurrentPage('login');
          return <Login onLogin={(user, nextPage) => {
            setUser(user);
            setCurrentPage(nextPage);
            window.history.pushState(null, null, `/${nextPage}`);
          }} />;
        }
        if (user.role !== 'admin') {
          showNotification('error', 'Access Denied', 'Only admins can access this page.');
          setCurrentPage('home');
          return <ModernHomePage navigateToPage={navigateToPage} />;
        }
        
        // Verify we have a selected chat room
        if (!selectedAdminChatRoom) {
          showNotification('info', 'Chat Room Required', 'No chat room selected. Redirecting to admin chats.');
          setCurrentPage('admin-chats');
          return <AdminChatsPage navigateToAdminChat={navigateToAdminChatView} />;
        }
        
        return <AdminChatViewPage 
          roomId={selectedAdminChatRoom} 
          navigateBack={navigateBackToAdminChats} 
        />;
      case 'dashboard-admin':
        // Protected route - only for logged in users with admin role
        if (!user) {
          setCurrentPage('login');
          return <Login onLogin={(user, nextPage) => {
            setUser(user);
            setCurrentPage(nextPage);
            window.history.pushState(null, null, `/${nextPage}`);
          }} />;
        }
        if (user.role !== 'admin') {
          showNotification('error', 'Access Denied', 'Only admins can access this page.');
          setCurrentPage('home');
          return <ModernHomePage />;
        }
        return <DashboardAdmin navigateToPage={navigateToPage} />;
      case 'login':
        return <Login onLogin={(user, nextPage) => {
          setUser(user);
          setCurrentPage(nextPage);
          window.history.pushState(null, null, `/${nextPage}`);
              }} />;
      default:
        return <ModernHomePage navigateToPage={navigateToPage} />;
    }
  };



const formatPaymentValue = (value) => Number(value || 0).toLocaleString();

  const normalizedPaymentAmount = Number(paymentConfig?.amount ?? selectedItem?.amount ?? 0);
  const normalizedPaymentFees = Number(
    paymentConfig?.fees ??
    (normalizedPaymentAmount > 0
      ? Math.max(0, normalizedPaymentAmount * (PLATFORM_FEE_PERCENTAGE / 100) + PLATFORM_FIXED_FEE)
      : 0)
  );
  const normalizedPaymentTotal = Number(paymentConfig?.total ?? (normalizedPaymentAmount + normalizedPaymentFees));
  const nextPaymentStep = PAYMENT_FLOW_STEPS.find(step => !paymentSteps[step.id])?.id;

  // Main Application Layout
  return (
    <div className="min-h-screen circuit-page-background">
  

      {/* Main Content */}
      {/* <main className="container mx-auto px-4 py-8">
     
 
     {currentPage !== 'login'  && ( 
     <Navbar 
        navigateToPage={navigateToPage} 
        user={user} 
        currentPage={currentPage}
        handleLogout={logout}
        handleNotificationPayment={handleNotificationPayment}
      />
        )} 

      <div className="page-content">
        {renderCurrentPage()}
      </div>

      </main> */}


            {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
     
      {/* Navbar is always visible now */}
      <Navbar 
        navigateToPage={navigateToPage} 
        user={user} 
        currentPage={currentPage}
        handleLogout={logout}
        handleNotificationPayment={handleNotificationPayment}
      />

      <div className="page-content">
        {renderCurrentPage()}
      </div>

      </main>



        {showPaymentDialog ? (
          (!selectedItem || !paymentConfig) ? (
            <div className="payment-modal-loading">
              <div className="payment-loading-card">
                <div className="payment-loading-spinner"></div>
                <div className="payment-loading-content">
                  <h3>Initializing Secure Session</h3>
                  <p>Preparing your encrypted payment portal...</p>
                  <div className="payment-loading-steps">
                    <div className="payment-loading-step active">
                      <Check size={14} />
                      <span>Verifying identity</span>
                    </div>
                    <div className="payment-loading-step">
                      <div className="payment-loading-dot"></div>
                      <span>Establishing secure connection</span>
                    </div>
                    <div className="payment-loading-step">
                      <div className="payment-loading-dot"></div>
                      <span>Loading payment details</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Dialog open={showPaymentDialog} onOpenChange={handlePaymentDialogChange}>
              <DialogContent
                className="payment-modal-redesigned"
                aria-describedby="payment-dialog-description"
              >
                {/* Hidden accessibility elements */}
                <DialogTitle className="sr-only">Complete Your Payment</DialogTitle>
                <DialogDescription id="payment-dialog-description" className="sr-only">
                  Secure payment protected by escrow until delivery confirmation
                </DialogDescription>

                {/* BODY - Two Column Layout */}
                <div className="payment-modal-body-new">
                
                  {/* LEFT SIDE - Order Summary */}
                  <div className="payment-section payment-section-summary">
                    {/* Total Amount - Moved to top of summary */}
                    <div className="payment-summary-total">
                      <div className="payment-summary-total-label">Total Amount</div>
                      <div className="payment-summary-total-value">
                        ${formatPaymentValue(normalizedPaymentTotal)}
                        <span className="payment-summary-total-currency">USD</span>
                      </div>
                    </div>

                    <div className="payment-section-header">
                      <h3>Order Summary</h3>
                      <span className="payment-order-id">#{selectedItem?._id?.slice(-8) || 'XXXXXXXX'}</span>
                    </div>

                    {/* Project Details Card */}
                    <div className="payment-project-card">
                      <div className="payment-project-icon">
                        <Briefcase size={20} />
                      </div>
                      <div className="payment-project-details">
                        <h4>{selectedItem.title}</h4>
                        <p>Software Development Project</p>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="payment-breakdown">
                      <div className="payment-breakdown-item">
                        <span className="payment-breakdown-label">
                          <Package size={16} />
                          Project Amount
                        </span>
                        <span className="payment-breakdown-value">
                          ${formatPaymentValue(normalizedPaymentAmount)}
                        </span>
                      </div>
                      
                      <div className="payment-breakdown-item">
                        <span className="payment-breakdown-label">
                          <Shield size={16} />
                          Platform & Escrow Fees
                        </span>
                        <span className="payment-breakdown-value">
                          ${formatPaymentValue(normalizedPaymentFees)}
                        </span>
                      </div>

                      <div className="payment-breakdown-divider"></div>

                      <div className="payment-breakdown-item payment-breakdown-total">
                        <span className="payment-breakdown-label">Total Due</span>
                        <span className="payment-breakdown-value-total">
                          ${formatPaymentValue(normalizedPaymentTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="payment-trust-badges">
                      <div className="payment-trust-item">
                        <Shield size={16} />
                        <span>256-bit SSL Encryption</span>
                      </div>
                      <div className="payment-trust-item">
                        <Check size={16} />
                        <span>PCI DSS Compliant</span>
                      </div>
                      <div className="payment-trust-item">
                        <Shield size={16} />
                        <span>Escrow Protected</span>
                      </div>
                    </div>

                    {/* Payment Progress */}
                    <div className="payment-progress-section">
                      <div className="payment-progress-header">
                        <span className="payment-progress-title">Transaction Progress</span>
                        <span className="payment-progress-count">
                          {Object.values(paymentSteps).filter(Boolean).length} / {PAYMENT_FLOW_STEPS.length}
                        </span>
                      </div>
                      <div className="payment-progress-bar">
                        <div 
                          className="payment-progress-fill"
                          style={{
                            width: `${(Object.values(paymentSteps).filter(Boolean).length / PAYMENT_FLOW_STEPS.length) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="payment-progress-steps">
                        {PAYMENT_FLOW_STEPS.map((step, index) => {
                          const completed = Boolean(paymentSteps[step.id]);
                          const active = !completed && step.id === nextPaymentStep;
                          return (
                            <div
                              key={step.id}
                              className={`payment-step-item${completed ? ' completed' : ''}${active ? ' active' : ''}`}
                            >
                              <div className="payment-step-indicator">
                                {completed ? <Check size={14} /> : <span>{index + 1}</span>}
                              </div>
                              <div className="payment-step-content">
                                <span className="payment-step-label">{step.label}</span>
                                <span className="payment-step-description">{step.description}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE - Stripe Information */}
                  <div className="payment-section payment-section-form">
                    <div className="payment-section-header">
                      <h3>Secure Checkout</h3>
                      <div className="payment-powered-by">
                        <span>Powered by</span>
                        <svg viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg" width="60" height="25">
                          <path fill="#635bff" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z"/>
                        </svg>
                      </div>
                    </div>

                    {/* Stripe Checkout Info */}
                    <div className="stripe-checkout-info">
                      <div className="stripe-checkout-icon">
                        <CreditCard size={48} />
                      </div>
                      <h4>Complete Payment with Stripe</h4>
                      <p>When you click "Confirm & Pay", you'll be securely redirected to Stripe's payment page where you can:</p>
                      
                      <ul className="stripe-features-list">
                        <li>
                          <Check size={16} />
                          <span>Enter your payment details securely</span>
                        </li>
                        <li>
                          <Check size={16} />
                          <span>Choose from multiple payment methods</span>
                        </li>
                        <li>
                          <Check size={16} />
                          <span>Save cards for faster checkout</span>
                        </li>
                        <li>
                          <Check size={16} />
                          <span>Complete your purchase safely</span>
                        </li>
                      </ul>

                      <div className="payment-methods-preview">
                        <h5>Accepted Payment Methods</h5>
                        <div className="payment-methods-icons">
                          <div className="payment-method-icon">
                            <svg viewBox="0 0 48 32" width="48" height="32">
                              <rect width="48" height="32" rx="4" fill="#1434CB"/>
                              <text x="50%" y="50%" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">VISA</text>
                            </svg>
                          </div>
                          <div className="payment-method-icon">
                            <svg viewBox="0 0 48 32" width="48" height="32">
                              <rect width="48" height="32" rx="4" fill="#EB001B"/>
                              <circle cx="18" cy="16" r="10" fill="#FF5F00"/>
                              <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
                            </svg>
                          </div>
                          <div className="payment-method-icon">
                            <svg viewBox="0 0 48 32" width="48" height="32">
                              <rect width="48" height="32" rx="4" fill="#016FD0"/>
                              <text x="50%" y="50%" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">AMEX</text>
                            </svg>
                          </div>
                          <div className="payment-method-icon">
                            <svg viewBox="0 0 48 32" width="48" height="32">
                              <rect width="48" height="32" rx="4" fill="#FF6000"/>
                              <text x="50%" y="50%" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">Discover</text>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="payment-security-notice">
                      <Shield size={16} />
                      <div className="payment-security-text">
                        <strong>Escrow Protection Active</strong>
                        <p>Your payment is held securely until you confirm project delivery. Full refund available if terms aren't met.</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* FOOTER - Action Buttons */}
                <div className="payment-modal-footer-new">
                  <button
                    className="payment-btn payment-btn-secondary"
                    onClick={() => handlePaymentDialogChange(false)}
                    disabled={checkoutLoading}
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    className="payment-btn payment-btn-primary"
                    // onClick={processPayment}
                    onClick={processStandardPayment}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? (
                      <>
                        <div className="payment-btn-spinner"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Shield size={18} />
                        Confirm & Pay ${formatPaymentValue(normalizedPaymentTotal)}
                      </>
                    )}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          )
        ) : null}

      
      {/* Scroll Buttons */}
      <ScrollButtons />
    </div>
  );
}

export default App;
