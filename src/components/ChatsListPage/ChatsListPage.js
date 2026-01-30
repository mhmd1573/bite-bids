// import React, { useState, useEffect } from 'react';
// import { MessageCircle, Search, Clock, FolderOpen } from 'lucide-react';
// import './ChatsListPage.css';

// const ChatsListPage = ({ currentUser, navigateToChat }) => {
//   const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  
//   const [chatRooms, setChatRooms] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');

//   useEffect(() => {
//     fetchChatRooms();
//   }, []);

//   const fetchChatRooms = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await fetch(`${BACKEND_URL}/api/chat/rooms`, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });

//       if (response.ok) {
//         const rooms = await response.json();
        
//         // Fetch additional details for each room
//         const roomsWithDetails = await Promise.all(
//           rooms.map(async (room) => {
//             try {
//               // Fetch project details
//               const projectResponse = await fetch(`${BACKEND_URL}/api/projects/${room.project_id}`, {
//                 headers: {
//                   'Authorization': `Bearer ${localStorage.getItem('token')}`
//                 }
//               });

//               let project = null;
//               if (projectResponse.ok) {
//                 project = await projectResponse.json();
//               }

//               // Fetch unread count
//               const unreadResponse = await fetch(`${BACKEND_URL}/api/chat/rooms/${room.id}/unread-count`, {
//                 headers: {
//                   'Authorization': `Bearer ${localStorage.getItem('token')}`
//                 }
//               });

//               let unreadCount = 0;
//               if (unreadResponse.ok) {
//                 const data = await unreadResponse.json();
//                 unreadCount = data.unread_count;
//               }

//               return {
//                 ...room,
//                 project,
//                 unreadCount
//               };
//             } catch (err) {
//               console.error('Error fetching room details:', err);
//               return room;
//             }
//           })
//         );

//         setChatRooms(roomsWithDetails);
//       } else {
//         const errorData = await response.json();
//         setError(errorData.detail || 'Failed to load chat rooms');
//       }
//     } catch (err) {
//       console.error('Error fetching chat rooms:', err);
//       setError('Failed to connect to chat service');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChatClick = (roomId) => {
//     navigateToChat(roomId);
//   };

//   const formatTimestamp = (timestamp) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffInHours = (now - date) / (1000 * 60 * 60);

//     if (diffInHours < 24) {
//       return date.toLocaleTimeString('en-US', { 
//         hour: '2-digit', 
//         minute: '2-digit' 
//       });
//     } else if (diffInHours < 168) {
//       return date.toLocaleDateString('en-US', { 
//         weekday: 'short',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } else {
//       return date.toLocaleDateString('en-US', { 
//         month: 'short', 
//         day: 'numeric'
//       });
//     }
//   };

//   // Filter chat rooms based on search query
//   const filteredRooms = chatRooms.filter(room => {
//     if (!searchQuery) return true;
    
//     const searchLower = searchQuery.toLowerCase();
//     const projectTitle = room.project?.title?.toLowerCase() || '';
    
//     return projectTitle.includes(searchLower);
//   });

//   if (loading) {
//     return (
//       <div className="chats-list-container">
//         <div className="chats-list-loading">
//           <div className="loading-spinner"></div>
//           <p>Loading chats...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="chats-list-container">
//         <div className="chats-list-error">
//           <h2>⚠️ Error</h2>
//           <p>{error}</p>
//           <button className="btn btn-primary" onClick={fetchChatRooms}>
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="chats-list-container">
//       <div className="chats-list-header">
//         <h1>
//           <MessageCircle className="header-icon" />
//           Messages
//         </h1>
//         <p className="header-subtitle">
//           {chatRooms.length} conversation{chatRooms.length !== 1 ? 's' : ''}
//         </p>
//       </div>

//       {/* Search Bar */}
//       <div className="chats-search-bar">
//         <Search className="search-icon" />
//         <input
//           type="text"
//           placeholder="Search by project name..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="search-input"
//         />
//       </div>

//       {/* Chat Rooms List */}
//       <div className="chats-list">
//         {filteredRooms.length === 0 ? (
//           <div className="no-chats">
//             <MessageCircle size={48} />
//             <h3>No conversations found</h3>
//             <p>
//               {searchQuery 
//                 ? 'Try a different search term' 
//                 : 'Start a conversation by bidding on a project'}
//             </p>
//           </div>
//         ) : (
//           filteredRooms.map((room) => (
//             <div
//               key={room.id}
//               className={`chat-room-item ${room.unreadCount > 0 ? 'unread' : ''}`}
//               onClick={() => handleChatClick(room.id)}
//             >
//               {/* Project Icon */}
//               <div className="chat-room-avatar">
//                 <FolderOpen size={28} />
//                 {room.unreadCount > 0 && (
//                   <span className="chat-unread-badge">{room.unreadCount}</span>
//                 )}
//               </div>

//               <div className="chat-room-content">
//                 <div className="chat-room-header">
//                   <h3 className="chat-room-name">
//                     {room.project?.title || 'Project Chat'}
//                   </h3>
//                   <span className="chat-room-time">
//                     <Clock size={14} />
//                     {formatTimestamp(room.updated_at)}
//                   </span>
//                 </div>

//                 <div className="chat-room-project">
//                   <span className="project-label">Status:</span>
//                   <span className="project-title">
//                     {room.unreadCount > 0 
//                       ? `${room.unreadCount} unread message${room.unreadCount !== 1 ? 's' : ''}`
//                       : 'No new messages'
//                     }
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatsListPage;



import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, Clock, FolderOpen, User, Shield, AlertTriangle } from 'lucide-react';
import './ChatsListPage.css';

const ChatsListPage = ({ currentUser, navigateToChat }) => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchChatRooms();
  }, []);

  useEffect(() => {
    const handleUnreadUpdate = (event) => {
      const detail = event.detail;
      if (!detail || typeof detail !== 'object') return;
      if (!detail.room_id) return;

      setChatRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === detail.room_id
            ? { ...room, unreadCount: detail.room_unread_count ?? room.unreadCount }
            : room
        )
      );
    };

    window.addEventListener('chat_unread_count', handleUnreadUpdate);
    return () => window.removeEventListener('chat_unread_count', handleUnreadUpdate);
  }, []);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/api/chat/rooms`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const rooms = await response.json();
        
        // Fetch additional details for each room
        const roomsWithDetails = await Promise.all(
          rooms.map(async (room) => {
            try {
              // Fetch project details
              const projectResponse = await fetch(`${BACKEND_URL}/api/projects/${room.project_id}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });

              let project = null;
              if (projectResponse.ok) {
                project = await projectResponse.json();
              }

              // ✅ Determine which user is the "other party" (ID only for privacy)
              const isCurrentUserDeveloper = room.developer_id === currentUser.id;
              const otherUserId = isCurrentUserDeveloper ? room.investor_id : room.developer_id;
              const otherUserRole = isCurrentUserDeveloper ? 'Investor' : 'Developer';

              // Fetch unread count
              const unreadResponse = await fetch(`${BACKEND_URL}/api/chat/rooms/${room.id}/unread-count`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });

              let unreadCount = 0;
              if (unreadResponse.ok) {
                const data = await unreadResponse.json();
                unreadCount = data.unread_count;
              }

              return {
                ...room,
                project,
                unreadCount,
                otherUserId,  // ✅ Just the ID for privacy
                otherUserRole  // ✅ Role (Investor/Developer)
              };
            } catch (err) {
              console.error('Error fetching room details:', err);
              return room;
            }
          })
        );

        setChatRooms(roomsWithDetails);
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

  const handleChatClick = (roomId) => {
    navigateToChat(roomId);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
  };

  // Filter chat rooms based on search query
  const filteredRooms = chatRooms.filter(room => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const projectTitle = room.project?.title?.toLowerCase() || '';
    
    return projectTitle.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="chats-list-container">
        <div className="chats-list-loading">
          <div className="loading-spinner"></div>
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chats-list-container">
        <div className="chats-list-error">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchChatRooms}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chats-list-container">
      <div className="chats-list-header">
        <h1>
          <MessageCircle className="header-icon" />
          Messages
        </h1>
        <p className="header-subtitle">
          {chatRooms.length} conversation{chatRooms.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search Bar */}
      <div className="chats-search-bar">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Search by project name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Project Process Info Box */}
      <div style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        border: '1px solid #0ea5e9',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Shield size={20} style={{ color: '#0369a1' }} />
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#0369a1', fontWeight: 600 }}>How Project Delivery Works</h3>
        </div>
        <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#475569' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ background: '#0ea5e9', color: 'white', borderRadius: '50%', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>1</span>
            <p style={{ margin: 0 }}><strong>Secure Code Review:</strong> The developer shares their private repository. You can review code in a protected tree view — copying, downloading, or stealing is blocked.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ background: '#0ea5e9', color: 'white', borderRadius: '50%', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>2</span>
            <p style={{ margin: 0 }}><strong>Confirm & Download:</strong> Once you verify the project is complete, click "Confirm" to release payment. A download button will appear to get the full project files.</p>
          </div>
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '0.5rem',
            padding: '0.6rem 0.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={16} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, color: '#92400e', fontSize: '0.8rem' }}>
              <strong>Warning:</strong> All chats are monitored in real-time. Attempts to share contact info or conduct transactions outside BiteBids may result in account suspension and legal action.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Rooms List */}
      <div className="chats-list">
        {filteredRooms.length === 0 ? (
          <div className="no-chats">
            <MessageCircle size={48} />
            <h3>No conversations found</h3>
            <p>
              {searchQuery 
                ? 'Try a different search term' 
                : 'Start a conversation by bidding on a project'}
            </p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div
              key={room.id}
              className={`chat-room-item ${room.unreadCount > 0 ? 'unread' : ''}`}
              onClick={() => handleChatClick(room.id)}
            >
              {/* Project Icon */}
              <div className="chat-room-avatar">
                <FolderOpen size={28} />
                {room.unreadCount > 0 && (
                  <span className="chat-unread-badge">{room.unreadCount}</span>
                )}
              </div>

              <div className="chat-room-content">
                <div className="chat-room-header">
                  <h3 className="chat-room-name">
                    {room.project?.title || 'Project Chat'}
                    {/* ✅ Display investor/developer ID (not name for privacy) */}
                    <span className="chat-other-user">
                      <User size={14} />
                      {room.otherUserRole} ({room.otherUserId?.slice(0, 8)}...)
                    </span>
                  </h3>
                  <span className="chat-room-time">
                    <Clock size={14} />
                    {formatTimestamp(room.updated_at || room.created_at)}
                  </span>
                </div>

                <div className="chat-room-project">
                  <span className="project-label">
                    {room.unreadCount > 0 
                      ? `${room.unreadCount} unread message${room.unreadCount !== 1 ? 's' : ''}`
                      : 'No new messages'
                    }
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatsListPage;
