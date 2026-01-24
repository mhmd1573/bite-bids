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
import { MessageCircle, Search, Clock, FolderOpen, User } from 'lucide-react';
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
