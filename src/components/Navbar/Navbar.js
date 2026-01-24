// SIMPLIFIED TEST VERSION - Replace your Navbar.js temporarily with this
// This has inline styles to force the backdrop and menu to work

import React, { useState, useEffect, useRef } from 'react';
import { Rocket, LogIn, LogOut, ChevronDown, Shield, Briefcase, User, MessageCircle, Menu, X } from 'lucide-react';
import NotificationSystem from '../NotificationSystem/NotificationSystem';
import './Navbar.css';

const Navbar = ({ navigateToPage, user, handleLogout, currentPage, handleNotificationPayment }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Don't render navbar on login page
  // if (currentPage === 'login') {
  //   return null;
  // }

  // Fetch unread chat count on visibility/focus to avoid frequent polling
  useEffect(() => {
    if (!user) return undefined;

    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadChatCount();
      }
    };

    refreshIfVisible();

    window.addEventListener('focus', refreshIfVisible);
    document.addEventListener('visibilitychange', refreshIfVisible);

    return () => {
      window.removeEventListener('focus', refreshIfVisible);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user) return undefined;

    const handleUnreadUpdate = (event) => {
      if (typeof event.detail === 'number') {
        setUnreadChatCount(event.detail || 0);
      } else if (event.detail && typeof event.detail === 'object') {
        setUnreadChatCount(event.detail.total_unread_count || 0);
      }
    };

    window.addEventListener('chat_unread_count', handleUnreadUpdate);

    return () => {
      window.removeEventListener('chat_unread_count', handleUnreadUpdate);
    };
  }, [user?.id]);

  const fetchUnreadChatCount = async () => {
    if (!user) return;
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${BACKEND_URL}/api/chat/unread-count/total`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadChatCount(data.total_unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread chat count:', error);
    }
  };

  const closeMobileMenu = () => {
    console.log('❌ Closing mobile menu');
    setMobileMenuOpen(false);
    document.body.classList.remove('mobile-menu-open');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
  };

  const openMobileMenu = () => {
    console.log('🟢 Opening mobile menu');
    setMobileMenuOpen(true);
    document.body.classList.add('mobile-menu-open');
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100vh';
  };

  const handleNavigation = (page) => {
    console.log('🔗 Navigating to:', page);
    navigateToPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMenuOpen(false);
    closeMobileMenu();
    if (page === 'chats') {
      fetchUnreadChatCount();
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        closeMobileMenu();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        closeMobileMenu();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  return (
    <nav className="navbar">
      {/* ✅ BACKDROP INSIDE NAVBAR - BEFORE NAVBAR-CONTAINER */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1045,
            backdropFilter: 'blur(4px)',
          }}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo" onClick={() => handleNavigation('home')}>
            <Rocket className="w-6 h-6 text-brand" />
            <span className="navbar-title">BiteBids</span>
          </div>

          {/* Navigation Links - WITH FORCED INLINE STYLES */}
          <div 
            ref={mobileMenuRef}
            className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}
            style={mobileMenuOpen ? {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: '#ffffff',
              background: 'white',
              zIndex: 1046,
              transform: 'translateX(0)',
              opacity: 1,
              visibility: 'visible',
              marginLeft:'-23px'
            } : {}}
          >
            {/* Mobile Menu Close Button */}
            {mobileMenuOpen && (
              <button
                className="mobile-menu-close"
                onClick={closeMobileMenu}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            )}

            <button className="nav-link" onClick={() => handleNavigation('home')}>
              Home
            </button>
            <button className="nav-link" onClick={() => handleNavigation('marketplace')}>
              Marketplace
            </button>
            <button className="nav-link" onClick={() => handleNavigation('about')}>
              About
            </button>
            <button className="nav-link" onClick={() => handleNavigation('contact')}>
              Contact
            </button>

            {/* Show Chats link only for logged-in users */}
            {user && user.role !== 'admin' && (
              <button 
                className={`nav-link nav-link-with-badge ${currentPage === 'chats' ? 'active' : ''}`}
                onClick={() => handleNavigation('chats')}
              >
                <MessageCircle className="w-4 h-4" style={{ display: 'inline', marginRight: '0.5rem' }} />
                Chats
                {unreadChatCount > 0 && (
                  <span className="nav-badge">{unreadChatCount > 99 ? '99+' : unreadChatCount}</span>
                )}
              </button>
            )}

            {/* Mobile-only actions */}
            {mobileMenuOpen && (
              <div className="mobile-menu-actions">
                {!user ? (
                  <>
                    <button className="btn btn-outline" onClick={() => handleNavigation('login')}>
                      <LogIn className="w-4 h-4" /> Login
                    </button>
                    <button className="btn btn-primary" onClick={() => handleNavigation('login')}>
                      Join Now
                    </button>
                  </>
                ) : (
                  <>
                    {user.role === 'admin' && (
                      <>
                        <button className="btn btn-outline" onClick={() => handleNavigation('dashboard-admin')}>
                          <Shield className="w-4 h-4" /> Admin Dashboard
                        </button>
                        <button className="btn btn-outline" onClick={() => handleNavigation('admin-chats')}>
                          <MessageCircle className="w-4 h-4" /> Chat Management
                        </button>
                      </>
                    )}
                    {user.role === 'investor' && (
                      <button className="btn btn-outline" onClick={() => handleNavigation('profile')}>
                        <User className="w-4 h-4" /> Profile
                      </button>
                    )}
                    {user.role === 'developer' && (
                      <button className="btn btn-outline" onClick={() => handleNavigation('dashboard')}>
                        <Briefcase className="w-4 h-4" /> Dashboard
                      </button>
                    )}
                    <button className="btn btn-primary" onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}>
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right-side actions (Desktop only) */}
          <div className="navbar-actions">
            {!user ? (
              <>
                <button className="btn btn-outline btn-sm" onClick={() => handleNavigation('login')}>
                  <LogIn className="w-4 h-4" /> Login
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => handleNavigation('login')}>
                  Join Now
                </button>
              </>
            ) : (
              <>
                <NotificationSystem 
                  currentUser={user} 
                  handleNotificationPayment={handleNotificationPayment} 
                />

                <div className="user-menu" ref={dropdownRef}>
                  <button 
                    className="user-avatar-btn"
                    onClick={() => setMenuOpen(!menuOpen)}
                  >
                    <div className="user-avatar">{user.name[0].toUpperCase()}</div>
                    <ChevronDown className="w-4 h-4 text-secondary" />
                  </button>

                  {menuOpen && (
                    <div className="user-dropdown">
                      {user.role === 'admin' && (
                        <>
                          <button onClick={() => handleNavigation('dashboard-admin')}>
                            <Shield className="w-4 h-4" /> Admin Dashboard
                          </button>
                          <button onClick={() => handleNavigation('admin-chats')}>
                            <MessageCircle className="w-4 h-4" /> Chat Management
                          </button>
                        </>
                      )}

                      {user.role === 'investor' && (
                        <button onClick={() => handleNavigation('profile')}>
                          <User className="w-4 h-4" /> Profile
                        </button>
                      )}
                      
                      {user.role === 'developer' && (
                        <button onClick={() => handleNavigation('dashboard')}>
                          <Briefcase className="w-4 h-4" /> Dashboard
                        </button>
                      )}

                      <hr />
                      
                      <button onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}>
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="navbar-toggle"
              onClick={() => {
                if (mobileMenuOpen) {
                  closeMobileMenu();
                } else {
                  openMobileMenu();
                }
              }}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>
    );
  };
  
  export default Navbar;
