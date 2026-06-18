import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Search, 
  Filter, 
  Users, 
  TrendingUp, 
  Clock,
  Eye,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
  BarChart3,
  Mail,
  User,
  FolderOpen
} from 'lucide-react';
import './AdminChatsPage.css';

const AdminChatsPage = ({ navigateToAdminChat }) => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  
  const [chatRooms, setChatRooms] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [roomMessages, setRoomMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState({});
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchStatistics();
    fetchChatRooms();
  }, [currentPage, searchQuery]);

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/chat/statistics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      const skip = (currentPage - 1) * itemsPerPage;
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: itemsPerPage.toString()
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`${BACKEND_URL}/api/admin/chat/rooms?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChatRooms(data.rooms);
        setTotalRooms(data.total);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to load chat rooms');
      }
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
      setError('Failed to connect to chat service');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomMessages = async (roomId) => {
    if (roomMessages[roomId]) {
      return; // Already loaded
    }

    try {
      setLoadingMessages(prev => ({ ...prev, [roomId]: true }));

      const response = await fetch(`${BACKEND_URL}/api/admin/chat/rooms/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoomMessages(prev => ({
          ...prev,
          [roomId]: data.messages
        }));
      }
    } catch (err) {
      console.error('Error fetching room messages:', err);
    } finally {
      setLoadingMessages(prev => ({ ...prev, [roomId]: false }));
    }
  };

  const toggleRoomExpansion = (roomId) => {
    if (expandedRoom === roomId) {
      setExpandedRoom(null);
    } else {
      setExpandedRoom(roomId);
      fetchRoomMessages(roomId);
    }
  };

  const handleViewChat = (roomId) => {
    navigateToAdminChat(roomId);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const exportChatData = () => {
    // Create CSV data
    const csvHeader = 'Project,Developer,Investor,Messages,Last Activity,Unread (Dev),Unread (Inv)\n';
    const csvRows = chatRooms.map(room => {
      return `"${room.project_title}","${room.developer_name}","${room.investor_name}",${room.message_count},"${room.updated_at}",${room.developer_unread_count},${room.investor_unread_count}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-rooms-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalRooms / itemsPerPage);

  if (loading && !chatRooms.length) {
    return (
      <div className="admin-chats-container">
        <div className="admin-chats-loading">
          <div className="loading-spinner"></div>
          <p>Loading chat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-chats-container">
        <div className="admin-chats-error">
          <AlertCircle size={48} />
          <h2>Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchChatRooms}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-chats-container">
      {/* Header */}
      <div className="admin-chats-header">
        <div className="header-title">
          <MessageCircle className="header-icon" />
          <div>
            <h1>Chat Management</h1>
            <p className="header-subtitle">Monitor and manage all platform conversations</p>
          </div>
        </div>
        <button className="btn-export" onClick={exportChatData}>
          <Download size={18} />
          Export Data
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="statistics-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-primary">
              <MessageCircle size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Rooms</p>
              <p className="stat-value">{statistics.total_rooms}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-success">
              <BarChart3 size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Messages</p>
              <p className="stat-value">{statistics.total_messages}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-warning">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Active (7 days)</p>
              <p className="stat-value">{statistics.active_rooms_last_7_days}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-info">
              <Mail size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Unread Messages</p>
              <p className="stat-value">{statistics.unread_messages}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-secondary">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Today's Messages</p>
              <p className="stat-value">{statistics.messages_today}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-accent">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Avg. Messages/Room</p>
              <p className="stat-value">{statistics.avg_messages_per_room}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="admin-chats-toolbar">
        <div className="search-bar-admin">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by project name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input-admin"
          />
        </div>
      </div>

      {/* Chat Rooms List */}
      <div className="admin-chats-list">
        {chatRooms.length === 0 ? (
          <div className="no-chats-admin">
            <MessageCircle size={48} />
            <h3>No chat rooms found</h3>
            <p>
              {searchQuery 
                ? 'Try a different search term' 
                : 'No conversations have been started yet'}
            </p>
          </div>
        ) : (
          chatRooms.map((room) => (
            <div key={room.id} className="admin-chat-room-card">
              {/* Room Header */}
              <div className="admin-chat-room-header">
                <div className="room-header-left">
                  <div className="project-icon-admin">
                    <FolderOpen size={24} />
                  </div>
                  <div className="room-header-info">
                    <h3 className="room-project-title">{room.project_title}</h3>
                    <div className="room-participants">
                      <div className="participant">
                        <User size={14} />
                        <span className="participant-label">Developer:</span>
                        <span className="participant-name">{room.developer_name}</span>
                        <span className="participant-email">({room.developer_email})</span>
                      </div>
                      <div className="participant">
                        <User size={14} />
                        <span className="participant-label">Investor:</span>
                        <span className="participant-name">{room.investor_name}</span>
                        <span className="participant-email">({room.investor_email})</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="room-header-right">
                  <div className="room-stats">
                    <div className="room-stat">
                      <MessageCircle size={16} />
                      <span>{room.message_count} messages</span>
                    </div>
                    <div className="room-stat">
                      <Clock size={16} />
                      <span>{formatTimestamp(room.updated_at)}</span>
                    </div>
                  </div>
                  
                  <div className="room-unread-badges">
                    {room.developer_unread_count > 0 && (
                      <span className="unread-badge unread-badge-dev">
                        Dev: {room.developer_unread_count}
                      </span>
                    )}
                    {room.investor_unread_count > 0 && (
                      <span className="unread-badge unread-badge-inv">
                        Inv: {room.investor_unread_count}
                      </span>
                    )}
                  </div>
                  
                  <div className="room-actions">
                    <button 
                      className="btn-icon-admin"
                      onClick={() => handleViewChat(room.id)}
                      title="View full chat"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="btn-icon-admin"
                      onClick={() => toggleRoomExpansion(room.id)}
                      title={expandedRoom === room.id ? "Collapse" : "Expand"}
                    >
                      {expandedRoom === room.id ? 
                        <ChevronUp size={18} /> : 
                        <ChevronDown size={18} />
                      }
                    </button>
                  </div>
                </div>
              </div>

              {/* Last Message Preview */}
              {room.last_message && (
                <div className="last-message-preview">
                  <span className="last-message-label">Last message:</span>
                  <span className="last-message-text">
                    {room.last_message.message.substring(0, 100)}
                    {room.last_message.message.length > 100 ? '...' : ''}
                  </span>
                  <span className="last-message-time">
                    {formatTimestamp(room.last_message.created_at)}
                  </span>
                </div>
              )}

              {/* Expanded Messages */}
              {expandedRoom === room.id && (
                <div className="room-messages-expanded">
                  {loadingMessages[room.id] ? (
                    <div className="messages-loading">
                      <div className="loading-spinner-small"></div>
                      <span>Loading messages...</span>
                    </div>
                  ) : roomMessages[room.id] && roomMessages[room.id].length > 0 ? (
                    <div className="messages-list-admin">
                      {roomMessages[room.id].map((msg) => (
                        <div key={msg.id} className="message-item-admin">
                          <div className="message-sender">
                            <span className={`sender-role ${msg.sender_role}`}>
                              {msg.sender_role}
                            </span>
                            <span className="sender-name">{msg.sender_name}</span>
                            <span className="message-time-admin">
                              {formatTimestamp(msg.created_at)}
                            </span>
                          </div>
                          <div className="message-content-admin">
                            {msg.message}
                          </div>
                          {msg.file_url && (
                            <div className="message-attachment">
                              <Paperclip size={14} />
                              <span>{msg.file_name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-messages-admin">
                      <p>No messages in this room yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-admin">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="pagination-info">
            Page {currentPage} of {totalPages} ({totalRooms} total rooms)
          </div>
          
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminChatsPage;