import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import '../Navbar/Navbar.css';
import { useNotification } from '../NotificationModal/NotificationModal';

const NotificationSystem = ({ currentUser, handleNotificationPayment }) => {
  const { showNotification } = useNotification();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const WS_URL = BACKEND_URL.replace('http://', 'ws://').replace('https://', 'wss://');

  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [paymentActionId, setPaymentActionId] = useState(null);
  const [processingBidId, setProcessingBidId] = useState(null);
  
  const wsRef = useRef(null);
  const dropdownRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Load initial notifications
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  // WebSocket connection for live notifications
  useEffect(() => {
    if (!currentUser) return;

    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, [currentUser, WS_URL]);

  const connectWebSocket = () => {
    if (!currentUser) return;

    try {
      const ws = new WebSocket(`${WS_URL}/ws/notifications/${currentUser.id}`);

      ws.onopen = () => {
        console.log('✅ Connected to notification WebSocket');
        setIsConnected(true);
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log('📨 WebSocket message received:', data);
    
    if (data.type === 'connection') {
      console.log('✅ Notification WebSocket connected:', data);
    } 
    else if (data.type === 'chat_unread_count') {
      const payload = {
        total_unread_count: data.total_unread_count || 0,
        room_id: data.room_id,
        room_unread_count: data.room_unread_count
      };
      window.dispatchEvent(new CustomEvent('chat_unread_count', { detail: payload }));
    }
    else if (data.type === 'notification') {
      const newNotif = data.data;
      console.log('🔔 New notification received:', newNotif);
      
      // ✅ Duplicate prevention with proper state handling
      setNotifications(prev => {
        // Check if notification already exists
        const exists = prev.find(n => n.id === newNotif.id);
        
        if (exists) {
          console.log('⚠️ Duplicate notification blocked:', newNotif.id);
          return prev; // Don't add duplicate
        }
        
        console.log('✅ Adding new notification:', newNotif.id);
        
        // Only increment unread count if it's a new unread notification
        if (!newNotif.read) {
          setUnreadCount(prevCount => prevCount + 1);
        }
        
        // Show browser notification and play sound (only for new notifications)
        showBrowserNotification(newNotif);
        playNotificationSound();
        
        // Add new notification to the top
        return [newNotif, ...prev];
      });
    }
    else if (data.type === 'broadcast') {
      const broadcast = data.data;
      console.log('📢 Broadcast received:', broadcast);
      showBrowserNotification({
        title: broadcast.title || 'System Notification',
        message: broadcast.message
      });
    }
    else if (data.type === 'data_change') {
      // 📡 Live data change event - dispatch a browser event so components
      // like Marketplace and Dashboard can update their state in-place
      console.log('📡 Data change received:', data.event_type, data.project_id);
      window.dispatchEvent(new CustomEvent('data_change', {
        detail: {
          event_type: data.event_type,
          project_id: data.project_id,
          data: data.data,
          timestamp: data.timestamp
        }
      }));
    }
    else if (data.type === 'pong') {
      console.log('🏓 Pong received');
    }
  } catch (error) {
    console.error('❌ Error parsing WebSocket message:', error);
  }
      };
    
      ws.onclose = (event) => {
        console.log('🔌 Disconnected from notification WebSocket', event.code, event.reason);
        setIsConnected(false);
        
        if (currentUser && !reconnectTimeoutRef.current) {
          console.log('🔄 Scheduling reconnect in 3 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            connectWebSocket();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
      };

      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);

      wsRef.current = { ws, pingInterval };

    } catch (error) {
      console.error('❌ Error creating WebSocket:', error);
    }
  };

  const disconnectWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      const { ws, pingInterval } = wsRef.current;
      
      if (pingInterval) {
        clearInterval(pingInterval);
      }
      
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      
      wsRef.current = null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      console.log('📥 Fetching notifications for user:', currentUser.id);
      
      const response = await fetch(`${BACKEND_URL}/api/notifications/${currentUser.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Notifications fetched:', data);
        
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      } else {
        console.error('❌ Failed to fetch notifications:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    }
  };

  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: notification.id,
        requireInteraction: false,
        silent: false
      });
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZQQ4PWqzn77BdGAo+lunzxmwoRBsjdce6+owXA1iv6+vLjjcFJHO/8tqOPw==');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Could not play sound:', e));
    } catch (error) {
      console.log('Notification sound not available');
    }
  };

  const handleNotificationClick = async (notification) => {
    console.log('👆 Notification clicked:', notification);
    
    // Don't navigate if clicking action buttons
    if (notification.type === 'bid_received' && !notification.read) {
      return; // Let action buttons handle it
    }
    
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    if (notification.type === 'payment_required' && handleNotificationPayment) {
      await handlePaymentAction(notification);
      return;
    }

    if (notification.link) {
      window.location.href = notification.link;
    }

    setIsOpen(false);
  };

//   const handleAcceptBid = async (notification) => {
//   try {
//     setProcessingBidId(notification.id);

//     // ✅ FIXED: Extract bid ID from notification details only
//     const bidId = notification.details?.bid_id;
    
//     if (!bidId) {
//       showNotification('error', 'Bid Error', 'Cannot find bid information. Please refresh and try again.');
//       return;
//     }

//     console.log('🔍 Accepting bid:', bidId);

//     const response = await fetch(`${BACKEND_URL}/api/bids/${bidId}/accept`, {
//       method: 'PUT',
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     if (response.ok) {
//       console.log('✅ Bid accepted successfully');
      
//       // Mark notification as read
//       await markAsRead(notification.id);
      
//       // Refresh notifications
//       await fetchNotifications();
      
//       showNotification('success', 'Bid Accepted', 'The investor has been notified.');
//     } else {
//       const errorData = await response.json();
//       console.error('❌ Failed to accept bid:', errorData);
//       showNotification('error', 'Bid Error', `Failed to accept bid: ${errorData.detail || 'Unknown error'}`);
//     }
//   } catch (error) {
//     console.error('❌ Error accepting bid:', error);
//     showNotification('error', 'Bid Error', 'Error accepting bid. Please try again.');
//   } finally {
//     setProcessingBidId(null);
//   }
// };

//   // ✅ NEW: Handle Reject Bid
//   const handleRejectBid = async (notification, event) => {
//     event.stopPropagation();
    
//     try {
//       setProcessingBidId(notification.id);
//       console.log('❌ Rejecting bid:', notification);

//     // ✅ FIXED: Extract bid ID from notification details only
//     const bidId = notification.details?.bid_id;
    
//     if (!bidId) {
//       showNotification('error', 'Bid Error', 'Cannot find bid information. Please refresh and try again.');
//       return;
//     }

//       // Clean bid ID (remove leading slash if present)
//       const cleanBidId = bidId.toString().replace(/^\//, '');

//       const response = await fetch(`${BACKEND_URL}/api/bids/${cleanBidId}/reject`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.ok) {
//         console.log('✅ Bid rejected successfully');
        
//         // Mark notification as read
//         await markAsRead(notification.id);
        
//         // Refresh notifications
//         await fetchNotifications();
        
//         showNotification('success', 'Bid Rejected', 'The investor has been notified.');
//       } else {
//         const errorData = await response.json();
//         console.error('❌ Failed to reject bid:', errorData);
//         showNotification('error', 'Bid Error', `Failed to reject bid: ${errorData.detail || 'Unknown error'}`);
//       }
//     } catch (error) {
//       console.error('❌ Error rejecting bid:', error);
//       showNotification('error', 'Bid Error', 'Error rejecting bid. Please try again.');
//     } finally {
//       setProcessingBidId(null);
//     }
//   };



  const handleAcceptBid = async (notification) => {
    try {
      setProcessingBidId(notification.id);

      // ✅ FIX: Check both 'details' and 'metadata' fields
      const notificationData = notification.details || notification.metadata || {};
      const bidId = notificationData.bid_id;
      
      if (!bidId) {
        console.error('❌ Bid ID not found. Full notification:', notification);
        showNotification('error', 'Bid Error', 'Cannot find bid information. Please refresh and try again.');
        return;
      }

      console.log('📝 Accepting bid:', bidId);

      const response = await fetch(`${BACKEND_URL}/api/bids/${bidId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Bid accepted successfully');
        
        // Mark notification as read
        await markAsRead(notification.id);
        
        // Refresh notifications
        await fetchNotifications();
        
        showNotification('success', 'Bid Accepted', 'The investor has been notified.');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to accept bid:', errorData);
        showNotification('error', 'Bid Error', `Failed to accept bid: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error accepting bid:', error);
      showNotification('error', 'Bid Error', 'Error accepting bid. Please try again.');
    } finally {
      setProcessingBidId(null);
    }
  };

  const handleRejectBid = async (notification, event) => {
    event.stopPropagation();
    
    try {
      setProcessingBidId(notification.id);
      console.log('❌ Rejecting bid:', notification);

      // ✅ FIX: Check both 'details' and 'metadata' fields
      const notificationData = notification.details || notification.metadata || {};
      const bidId = notificationData.bid_id;
      
      if (!bidId) {
        console.error('❌ Bid ID not found. Full notification:', notification);
        showNotification('error', 'Bid Error', 'Cannot find bid information. Please refresh and try again.');
        return;
      }

      // Clean bid ID (remove leading slash if present)
      const cleanBidId = bidId.toString().replace(/^\//, '');

      const response = await fetch(`${BACKEND_URL}/api/bids/${cleanBidId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Bid rejected successfully');
        
        // Mark notification as read
        await markAsRead(notification.id);
        
        // Refresh notifications
        await fetchNotifications();
        
        showNotification('success', 'Bid Rejected', 'The investor has been notified.');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to reject bid:', errorData);
        showNotification('error', 'Bid Error', `Failed to reject bid: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error rejecting bid:', error);
      showNotification('error', 'Bid Error', 'Error rejecting bid. Please try again.');
    } finally {
      setProcessingBidId(null);
    }
  };


  const handlePaymentAction = async (notification) => {
    try {
      setPaymentActionId(notification.id);
      setIsOpen(false);

      // ✅ COMPREHENSIVE FIX: Extract payment data from all possible locations
      const details = notification.details || {};
      const metadata = notification.metadata || {};
      
      // Merge both objects, with 'details' taking precedence
      const paymentData = {
        ...metadata,
        ...details
      };
      
      console.log('💳 Payment notification DEBUG:', {
        notificationId: notification.id,
        notificationType: notification.type,
        fullNotification: notification,
        extractedDetails: details,
        extractedMetadata: metadata,
        mergedPaymentData: paymentData,
        hasAmount: !!paymentData.amount,
        hasProjectId: !!paymentData.project_id,
        hasBidId: !!paymentData.bid_id
      });

      // ✅ Validate required payment fields with detailed error messages
      if (!paymentData.amount) {
        console.error('❌ Missing amount in payment data');
        showNotification('error', 'Payment Error', 'Unable to process payment: missing payment amount. Please contact support.');
        return;
      }

      if (!paymentData.project_id) {
        console.error('❌ Missing project_id in payment data');
        showNotification('error', 'Payment Error', 'Unable to process payment: missing project information. Please contact support.');
        return;
      }

      if (!currentUser || !currentUser.email) {
        console.error('❌ Missing user email');
        showNotification('error', 'Payment Error', 'Unable to process payment: user information incomplete. Please log in again.');
        return;
      }

      // ✅ Build complete payment request data
      const paymentRequest = {
        notification,
        paymentData,
        amount: parseFloat(paymentData.amount),
        project_id: paymentData.project_id,
        bid_id: paymentData.bid_id,
        project_title: paymentData.project_title,
        customer_email: currentUser.email,
        customer_name: currentUser.name,
        onComplete: async () => {
          await markAsRead(notification.id);
          await fetchNotifications();
        }
      };

      console.log('💳 Payment request being sent:', paymentRequest);

      if (handleNotificationPayment) {
        await handleNotificationPayment(paymentRequest);
      } else {
        console.error('❌ handleNotificationPayment function not available');
        showNotification('error', 'Payment Error', 'Payment system not initialized. Please refresh the page.');
      }

    } catch (err) {
      console.error("❌ Payment action error:", err);
      showNotification('error', 'Payment Error', `Failed to open payment dialog: ${err.message}`);
    } finally {
      setPaymentActionId(null);
    }
  };

  // ✅ NEW: Handle Chat Navigation
  const handleChatNavigation = async (notification) => {
    try {
      console.log('💬 Opening chat from notification:', notification);
      
      // Mark as read
      if (!notification.read) {
        await markAsRead(notification.id);
      }
      
      // Extract room ID from notification
      const roomId = notification.details?.room_id || 
                     notification.link?.split('/chat/')[1] ||
                     notification.link;
      
      if (!roomId) {
        console.error('❌ No room ID found in notification');
        showNotification('error', 'Chat Error', 'Cannot open chat: room information missing.');
        return;
      }
      
      console.log('✅ Navigating to chat room:', roomId);
      
      // Close notification dropdown
      setIsOpen(false);
      
      // Navigate to chat page with proper URL
      window.location.href = `/chat/${roomId}`;
      
    } catch (error) {
      console.error('❌ Error navigating to chat:', error);
      showNotification('error', 'Chat Error', 'Failed to open chat. Please try again.');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      console.log('📖 Marking notification as read:', notificationId);
      
      const response = await fetch(`${BACKEND_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Notification marked as read');
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        console.error('❌ Failed to mark as read:', response.status);
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('📖 Marking all notifications as read');
      
      const response = await fetch(`${BACKEND_URL}/api/notifications/${currentUser.id}/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ All notifications marked as read');
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    
    try {
      console.log('🗑️ Deleting notification:', notificationId);
      
      const response = await fetch(`${BACKEND_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Notification deleted');
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        const deletedNotif = notifications.find(n => n.id === notificationId);
        if (deletedNotif && !deletedNotif.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'bid_accepted':
        return '🎉';
      case 'bid_rejected':
        return '❌';
      case 'bid_received':
      case 'new_bid':
        return '💰';
      case 'payment_completed':
      case 'payment_received':
        return '✅';
      case 'payment_required':
        return '💳';
      case 'chat_room_created':
        return '💬';
      case 'new_chat_message':
        return '📨';
      case 'project_completed':
        return '🏆';
      case 'broadcast':
        return '📢';
      default:
        return '🔔';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notifTime) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notifTime.toLocaleDateString();
  };

  return (
    <div className="notification-menu" ref={dropdownRef}>
      <button
        className="notification-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <span 
          className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`}
          title={isConnected ? 'Connected' : 'Reconnecting...'}
        />
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-header-actions">
              {unreadCount > 0 && (
                <button
                  className="mark-all-read-btn"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </button>
              )}
              <button
                className="refresh-btn"
                onClick={fetchNotifications}
                title="Refresh notifications"
              >
                🔄
              </button>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <Bell size={48} />
                <p>No notifications yet</p>
                {!isConnected && (
                  <small style={{color: '#f59e0b', marginTop: '8px'}}>
                    ⚠️ Reconnecting to live updates...
                  </small>
                )}
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {!notification.read && (
                    <div className="notification-dot" />
                  )}

                    <div className="notification-content">
                      <div className="notification-title">
                        <span className="notification-icon">
                          {getNotificationIcon(notification.type)}
                        </span>
                        {notification.title}
                      </div>
                      
                      <p className="notification-message" title={notification.message}>
                        {notification.message}
                      </p>
                      
                      <span className="notification-time">
                        {formatTimeAgo(notification.created_at)}
                      </span>

                    {/* ✅ BID RECEIVED - Accept/Reject Buttons */}
                    {notification.type === 'bid_received' && !notification.read && (
                      <div className="notification-actions">
                        <button
                          className="notif-btn notif-accept"
                          onClick={(e) => handleAcceptBid(notification, e)}
                          disabled={processingBidId === notification.id}
                        >
                          {processingBidId === notification.id ? '⏳' : '✅'} Accept
                        </button>
                        <button
                          className="notif-btn notif-reject"
                          onClick={(e) => handleRejectBid(notification, e)}
                          disabled={processingBidId === notification.id}
                        >
                          {processingBidId === notification.id ? '⏳' : '❌'} Reject
                        </button>
                      </div>
                    )}

                    {/* Payment Required Button */}
                    {notification.type === 'payment_required' && !notification.read && (
                      <div className="notification-actions">
                        <button
                          className="notif-btn notif-pay"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePaymentAction(notification);
                          }}
                          disabled={paymentActionId === notification.id}
                        >
                          {paymentActionId === notification.id ? 'Opening...' : '💳 Make Payment'}
                        </button>
                      </div>
                    )}

                    {/* Chat Room Created Button */}
                    {notification.type === 'chat_room_created' && (
                      <div className="notification-actions">
                        <button
                          className="notif-btn notif-accept"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChatNavigation(notification);
                          }}
                        >
                          💬 Open Chat
                        </button>
                      </div>
                    )}
                  </div>

                  {notification.read && (
                    <button
                      className="notification-delete-btn"
                      onClick={(e) => deleteNotification(notification.id, e)}
                      title="Delete notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
