// pages/ChatPage.js
import React, { useEffect, useState } from 'react';
import Chat from '../Chat/Chat';

function ChatPage({ currentUser, roomId }) {
  // ✅ UPDATED: Production-ready URL
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ UPDATED: Use BACKEND_URL
      const response = await fetch(`${BACKEND_URL}/api/chat/rooms/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const room = await response.json();
        
        // Fetch project details
        // ✅ UPDATED: Use BACKEND_URL
        const projectResponse = await fetch(`${BACKEND_URL}/api/projects/${room.project_id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (projectResponse.ok) {
          const project = await projectResponse.json();
          setProjectData(project);
        } else {
          console.warn('Could not fetch project details');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to load chat room');
      }
    } catch (error) {
      console.error('Error fetching room details:', error);
      setError('Failed to connect to chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="chat-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-page-error">
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button onClick={fetchRoomDetails}>Retry</button>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <Chat 
        roomId={roomId}
        currentUser={currentUser}
        projectTitle={projectData?.title}
        projectId={projectData?.id}

      />
    </div>
  );
}

export default ChatPage;