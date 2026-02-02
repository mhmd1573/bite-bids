import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Check, CheckCheck, AlertTriangle, Shield, Loader, Download, X, FolderTree, FileText, Folder, ChevronRight, ChevronDown, Wallet, CreditCard, Building2, Bitcoin, Globe, DollarSign, AlertCircle, CheckCircle2, Upload, Cloud } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import './Chat.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Maximize, Minimize } from 'lucide-react';
import { useNotification } from '../NotificationModal/NotificationModal';


const Chat = ({ roomId, currentUser, projectTitle }) => {
  const { showNotification } = useNotification();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const WS_URL = BACKEND_URL.replace('http://', 'ws://').replace('https://', 'wss://');

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [filterWarning, setFilterWarning] = useState(null);
  
  // File upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Download state
  const [downloading, setDownloading] = useState(null);
  
  // Project confirmation state for investors
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [projectData, setProjectData] = useState(null);
  
  // Dispute state for investors
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputing, setDisputing] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeNotes, setDisputeNotes] = useState('');
  
  // ✅ NEW: GitHub Repository Review States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [githubRepo, setGithubRepo] = useState(null);
  const [repoFiles, setRepoFiles] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loadingFile, setLoadingFile] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [showSubmitRepoModal, setShowSubmitRepoModal] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [submittingRepo, setSubmittingRepo] = useState(false);
  
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Add this state with your other states at the top of the Chat component:
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [isFullscreen, setIsFullscreen] = useState(false);
// ✅ NEW: Private Repository States
const [accessToken, setAccessToken] = useState('');
const [showPrivateRepoWarning, setShowPrivateRepoWarning] = useState(false);
const [isPrivateRepo, setIsPrivateRepo] = useState(false);

// ✅ NEW: Project Upload States (Direct Upload to R2)
const [uploadMethod, setUploadMethod] = useState(null); // 'github' or 'upload'
const [uploadingProject, setUploadingProject] = useState(false);
const [projectUpload, setProjectUpload] = useState(null); // Uploaded project info
const folderInputRef = useRef(null);
const zipFileInputRef = useRef(null);

// ✅ Add this new state at the top of Chat component (around line 35)
const [hasActiveDispute, setHasActiveDispute] = useState(false);

// ✅ Developer Payout States
const [pendingPayout, setPendingPayout] = useState(null);
const [showPayoutModal, setShowPayoutModal] = useState(false);
const [savingPayout, setSavingPayout] = useState(false);

// ✅ Project Download State (for investor after confirmation)
const [downloadingProject, setDownloadingProject] = useState(false);
const [downloadProgress, setDownloadProgress] = useState(0);
const [hasConfirmedProject, setHasConfirmedProject] = useState(false);


// Add this function to toggle sidebar:
const toggleSidebar = () => {
  setSidebarCollapsed(prev => !prev);
};

const toggleFullscreen = () => {
  setIsFullscreen(prev => !prev);
};

const getLanguage = (filename) => {
  if (!filename) return 'javascript';
  
  const extension = filename.split('.').pop().toLowerCase();
  const languageMap = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'py': 'python',
    'java': 'java',
    'kt': 'kotlin',
    'swift': 'swift',
    'go': 'go',
    'rs': 'rust',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'html': 'markup',
    'md': 'markdown',
    'yaml': 'yaml',
    'sh': 'bash',
    'dart': 'dart'
  };
  
  return languageMap[extension] || 'javascript';
};


  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Fetch room data and initial messages
  useEffect(() => {
    if (!roomId) return;

    fetchRoomData();
    fetchMessages();
    fetchProjectDetails();
    fetchGithubRepo(); // ✅ NEW: Fetch GitHub repository
    fetchProjectUpload(); // ✅ NEW: Fetch uploaded project info
    fetchPendingPayout(); // ✅ NEW: Fetch pending payout for developer
  }, [roomId]);

  // Refresh messages when component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && roomId) {
        console.log('Tab visible again, refreshing messages...');
        fetchMessages();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [roomId]);

  // WebSocket connection with auto-reconnect
  useEffect(() => {
    if (!roomId || !currentUser) return;

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connectWebSocket = () => {
      const ws = new WebSocket(
        `${WS_URL}/ws/chat/${roomId}/${currentUser.id}`
      );

      ws.onopen = () => {
        console.log('Connected to chat');
        setIsConnected(true);
        reconnectAttempts = 0;
        fetchMessages();
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        if (data.type === 'error') {
          setFilterWarning({
            message: data.detail || data.message || 'Your message was blocked',
            violations: data.violations || []
          });
          setTimeout(() => setFilterWarning(null), 10000);
          return;
        }
        
        if (data.type === 'connection') {
          console.log('Connection confirmed:', data);
        } 
        else if (data.type === 'chat_message') {
          if (data.data && data.data.message && data.data.message.trim()) {
            setMessages(prev => {
              const messageExists = prev.some(msg => 
                msg.id === data.data.id || 
                (msg.message === data.data.message && 
                 msg.sender_id === data.data.sender_id &&
                 Math.abs(new Date(msg.created_at) - new Date(data.data.created_at)) < 1000)
              );
              
              if (messageExists) {
                console.log('Duplicate message detected, skipping:', data.data);
                return prev;
              }
              
              return [...prev, data.data];
            });
          }
        } 
        else if (data.type === 'typing') {
          if (data.user_id !== currentUser.id) {
            setIsTyping(data.is_typing);
          }
        }
        else if (data.type === 'message_read') {
          setMessages(prev => prev.map(msg =>
            msg.id === data.message_id ? { ...msg, read: true } : msg
          ));
        }
        else if (data.type === 'message_flagged') {
          // Message was flagged by moderation - mark it as flagged
          console.log('🚫 Message flagged received:', data);
          console.log('Message ID:', data.message_id, 'Reason:', data.reason);
          setMessages(prev => {
            console.log('Current messages:', prev.length);
            const updated = prev.map(msg => {
              if (msg.id === data.message_id) {
                console.log('✅ Found and flagging message:', msg.id);
                return { ...msg, flagged: true, moderation_reason: data.reason };
              }
              return msg;
            });
            console.log('Updated messages:', updated.filter(m => m.flagged).length, 'flagged');
            return updated;
          });
          // Show warning to the user
          setFilterWarning({
            message: `A message was removed: ${data.reason}`,
            violations: []
          });
          setTimeout(() => setFilterWarning(null), 8000);
        }
        else if (data.type === 'user_joined') {
          console.log('User joined:', data.user_id);
          if (data.user_id !== currentUser.id) {
            fetchMessages();
          }
        }
        else if (data.type === 'user_left') {
          console.log('User left:', data.user_id);
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from chat');
        setIsConnected(false);
        
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
          console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [roomId, currentUser, WS_URL]);

  // Mark messages as read when viewing them
  useEffect(() => {
    if (!currentUser) return;
    
    const markMessagesAsRead = async () => {
      const unreadMessages = messages.filter(
        msg => !msg.read && msg.sender_id !== currentUser.id
      );

      for (const message of unreadMessages) {
        try {
          await fetch(`${BACKEND_URL}/api/chat/messages/${message.id}/read`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          setMessages(prev => prev.map(msg => 
            msg.id === message.id ? { ...msg, read: true } : msg
          ));

          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'message_read',
              message_id: message.id
            }));
          }
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }
    };

    if (messages.length > 0 && currentUser) {
      markMessagesAsRead();
    }
  }, [messages, currentUser, BACKEND_URL]);

  const fetchRoomData = async () => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/rooms/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoomData(data);
        
        // Get the other user's ID
        const otherId = data.developer_id === currentUser.id 
          ? data.investor_id 
          : data.developer_id;
        
        // Fetch the other user's details
        fetchUserDetails(otherId);
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/${userId}/public`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const user = await response.json();
        setOtherUser(user);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // const fetchMessages = async () => {
  //   try {
  //     const response = await fetch(`${BACKEND_URL}/api/chat/rooms/${roomId}/messages`, {
  //       headers: {
  //         'Authorization': `Bearer ${localStorage.getItem('token')}`
  //       }
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       setMessages(data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching messages:', error);
  //   }
  // };

  // // ✅ NEW: Fetch project details for confirmation
  // const fetchProjectDetails = async () => {
    
  //   try 
  //   {
  //     const response = await fetch(`${BACKEND_URL}/api/chat/rooms/${roomId}`, {
  //       headers: {
  //         'Authorization': `Bearer ${localStorage.getItem('token')}`
  //       }
  //     });
      
  //     if (response.ok) {
  //       const room = await response.json();
        
  //       // Fetch project details
  //       const projectResponse = await fetch(`${BACKEND_URL}/api/projects/${room.project_id}`, {
  //         headers: {
  //           'Authorization': `Bearer ${localStorage.getItem('token')}`
  //         }
  //       });
        
  //       if (projectResponse.ok) {
  //         const project = await projectResponse.json();
  //         setProjectData(project);

  //       // ✅ NEW: Check if there's an active dispute for this chat room
  //       const disputeResponse = await fetch(
  //         `${BACKEND_URL}/api/chat/rooms/${roomId}/has-active-dispute`,
  //         {
  //           headers: {
  //             'Authorization': `Bearer ${localStorage.getItem('token')}`
  //           }
  //         }
  //       );
        
  //       if (disputeResponse.ok) {
  //         const disputeData = await disputeResponse.json();
  //         setHasActiveDispute(disputeData.has_active_dispute);
  //       }

  //         console.log('✅ Project loaded:', {
  //           id: project.id,
  //           title: project.title,
  //           status: project.status,
  //           developer_id: project.developer_id
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error fetching project details:', error);
  //   }
  // };


  const fetchMessages = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/chat/rooms/${roomId}/messages`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // ✅ Double-check: Sort messages by timestamp to ensure correct chronological order
          // This handles edge cases where backend might return unsorted data
          const sortedMessages = data.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateA - dateB;  // Ascending order (oldest first)
          });
          
          console.log('📬 Messages loaded:', sortedMessages.length, 'messages');
          setMessages(sortedMessages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };


  const fetchProjectDetails = async () => {
  console.log('🔍 fetchProjectDetails called for roomId:', roomId);
  console.log('📍 Current roomId value:', roomId);
  console.log('📍 BACKEND_URL:', BACKEND_URL);
  
  try {
    // Step 1: Get room data
    console.log('📡 Step 1: Fetching room data...');
    const roomUrl = `${BACKEND_URL}/api/chat/rooms/${roomId}`;
    console.log('   URL:', roomUrl);
    
    const response = await fetch(roomUrl, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    console.log('📡 Room response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch room data:', response.status, errorText);
      return;
    }
    
    const room = await response.json();
    console.log('✅ Room data received:', {
      developer_id: room.developer_id,
      investor_id: room.investor_id,
      project_id: room.project_id,
      status: room.status
    });
    
    // Step 2: Get project details
    console.log('📡 Step 2: Fetching project data...');
    const projectUrl = `${BACKEND_URL}/api/projects/${room.project_id}`;
    console.log('   URL:', projectUrl);
    
    const projectResponse = await fetch(projectUrl, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    console.log('📡 Project response status:', projectResponse.status);
    
    if (!projectResponse.ok) {
      const errorText = await projectResponse.text();
      console.error('❌ Failed to fetch project:', projectResponse.status, errorText);
      return;
    }
    
    const project = await projectResponse.json();
    console.log('✅ Project data received:', {
      id: project.id,
      title: project.title,
      status: project.status,
      developer_id: project.developer_id
    });
    
    setProjectData(project);
    console.log('✅ projectData state updated');

    // Step 3: Check for active dispute
    console.log('📡 Step 3: Checking for active dispute...');
    const disputeUrl = `${BACKEND_URL}/api/chat/rooms/${roomId}/has-active-dispute`;
    console.log('   URL:', disputeUrl);
    
    const disputeResponse = await fetch(disputeUrl, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    console.log('📡 Dispute response status:', disputeResponse.status);
    
    if (!disputeResponse.ok) {
      const errorText = await disputeResponse.text();
      console.error('❌ Failed to check dispute status:', disputeResponse.status, errorText);
      console.log('⚠️ Setting hasActiveDispute to false (safe default)');
      setHasActiveDispute(false);
      return;
    }
    
    const disputeData = await disputeResponse.json();
    console.log('📋 Full Dispute API Response:', JSON.stringify(disputeData, null, 2));
    console.log('📋 disputeData.has_active_dispute type:', typeof disputeData.has_active_dispute);
    console.log('📋 disputeData.has_active_dispute value:', disputeData.has_active_dispute);
    
    // ✅ CRITICAL: Set the state
    const disputeActive = disputeData.has_active_dispute === true;
    console.log('⚙️ Computed disputeActive:', disputeActive);
    console.log('⚙️ Calling setHasActiveDispute with:', disputeActive);
    
    setHasActiveDispute(disputeActive);
    
    // Verify it was set
    console.log('✅ setHasActiveDispute called successfully');
    
    if (disputeActive) {
      console.log('🚨 ACTIVE DISPUTE DETECTED! 🚨');
      console.log('   - Dispute ID:', disputeData.dispute_id);
      console.log('   - Reason:', disputeData.reason);
      console.log('   - Status:', disputeData.status);
      console.log('   - 🔴 Buttons should now be DISABLED');
    } else {
      console.log('✅ No active dispute detected');
      console.log('   - 🟢 Buttons should be ENABLED');
    }
    
  } catch (error) {
    console.error('❌ EXCEPTION in fetchProjectDetails:', error);
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    console.log('⚠️ Setting hasActiveDispute to false (safe default after error)');
    setHasActiveDispute(false); // Safe default
  }
    };


  // ✅ Also add a useEffect to log when hasActiveDispute changes
useEffect(() => {
  console.log('🔄 hasActiveDispute state changed to:', hasActiveDispute);
}, [hasActiveDispute]);


  // ✅ NEW: Fetch GitHub repository link
  const fetchGithubRepo = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/rooms/${roomId}/github-repo`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGithubRepo(data);
      }
    } catch (error) {
      console.error('Error fetching GitHub repo:', error);
    }
  };

  // ✅ NEW: Fetch pending payout for developer
  const fetchPendingPayout = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/rooms/${roomId}/pending-payout`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingPayout(data);

        // ✅ If payout exists, it means investor has confirmed
        if (data?.has_pending_payout) {
          setHasConfirmedProject(true);
        }
      }
    } catch (error) {
      console.error('Error fetching pending payout:', error);
    }
  };

  // ✅ UPDATED: Confirm payout receipt (simplified - no form needed)
  const handleConfirmPayoutReceipt = async () => {
    // Check if developer has set up payout method in dashboard
    if (!pendingPayout.developer_preferences?.has_payout_method) {
      showNotification('error', 'Payout Method Required', 'Please set up your payout method in the Dashboard first.');
      setShowPayoutModal(false);
      return;
    }

    setSavingPayout(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/rooms/${roomId}/confirm-payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        showNotification(
          'success',
          'Payment Confirmed!',
          'Your payment will be transferred to your account. For any questions, contact bitebids@gmail.com'
        );
        setShowPayoutModal(false);
        fetchPendingPayout(); // Refresh payout data
      } else {
        const error = await response.json();
        showNotification('error', 'Error', error.detail || 'Failed to confirm payout');
      }
    } catch (error) {
      console.error('Error confirming payout:', error);
      showNotification('error', 'Error', 'Failed to confirm payout. Please contact bitebids@gmail.com');
    } finally {
      setSavingPayout(false);
    }
  };



  // ✅ UPDATED: Submit GitHub repository URL (now supports private repos)
const handleSubmitRepo = async (e) => {
  e.preventDefault();
  
  if (!repoUrl.trim()) {
    showNotification('error', 'Repository Required', 'Please enter a GitHub repository URL.');
    return;
  }

  // Validate GitHub URL
  const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
  if (!githubRegex.test(repoUrl.trim())) {
    showNotification(
      'error',
      'Invalid Repository URL',
      'Please enter a valid GitHub repository URL (e.g., https://github.com/username/repo).'
    );
    return;
  }

  setSubmittingRepo(true);

  try {
    const response = await fetch(`${BACKEND_URL}/api/chat/rooms/${roomId}/submit-github-repo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        repo_url: repoUrl.trim(),
        access_token: accessToken.trim() || null  // ✅ NEW: Include token for private repos
      })
    });

    if (response.ok) {
      const data = await response.json();
      showNotification('success', 'Repository Submitted', 'GitHub repository submitted successfully.');
      setShowSubmitRepoModal(false);
      setShowPrivateRepoWarning(false);  // ✅ NEW
      setRepoUrl('');
      setAccessToken('');  // ✅ NEW: Clear token
      setIsPrivateRepo(false);  // ✅ NEW
      fetchGithubRepo();
    } else {
      const error = await response.json();
      
      // ✅ NEW: Check if private repo needs token
      if (error.detail?.code === 'PRIVATE_REPO_TOKEN_REQUIRED') {
        setShowPrivateRepoWarning(true);
        setIsPrivateRepo(true);
      } else {
        showNotification(
          'error',
          'Repository Error',
          error.detail?.message || error.detail || 'Failed to submit repository'
        );
      }
    }
  } catch (error) {
    console.error('Error submitting repository:', error);
    showNotification('error', 'Repository Error', 'Failed to submit repository.');
  } finally {
    setSubmittingRepo(false);
  }
};

// ✅ NEW: Generate file tree structure from FileList
const generateFileTree = (files) => {
  const tree = { name: 'root', type: 'folder', children: [] };

  Array.from(files).forEach(file => {
    const pathParts = file.webkitRelativePath.split('/');
    let currentLevel = tree;

    pathParts.forEach((part, index) => {
      const isFile = index === pathParts.length - 1;
      let existing = currentLevel.children.find(child => child.name === part);

      if (!existing) {
        existing = {
          name: part,
          type: isFile ? 'file' : 'folder',
          ...(isFile ? { size: file.size } : { children: [] })
        };
        currentLevel.children.push(existing);
      }

      if (!isFile) {
        currentLevel = existing;
      }
    });
  });

  // Sort: folders first, then files, alphabetically
  const sortTree = (node) => {
    if (node.children) {
      node.children.sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortTree);
    }
  };
  sortTree(tree);

  return tree.children.length === 1 ? tree.children[0] : tree;
};

// ✅ NEW: Handle folder selection for upload
const handleFolderSelect = async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  // Generate file tree
  const fileTree = generateFileTree(files);

  // Calculate total size
  const totalSize = Array.from(files).reduce((sum, f) => sum + f.size, 0);

  // Check size limit (5GB)
  const maxSize = 5 * 1024 * 1024 * 1024;
  if (totalSize > maxSize) {
    showNotification('error', 'File Too Large', 'Total project size must be under 5GB.');
    return;
  }

  setUploadingProject(true);
  setUploadProgress(0);

  try {
    // Create a ZIP file from the selected folder
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Add all files to ZIP
    for (const file of files) {
      const content = await file.arrayBuffer();
      zip.file(file.webkitRelativePath, content);
    }

    // Generate ZIP blob
    const zipBlob = await zip.generateAsync(
      { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
      (metadata) => {
        setUploadProgress(Math.round(metadata.percent * 0.3)); // 0-30% for zipping
      }
    );

    const zipFileName = `${fileTree.name || 'project'}.zip`;

    // Get presigned upload URL
    const presignedResponse = await fetch(`${BACKEND_URL}/api/upload/presigned-url/${roomId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        file_name: zipFileName,
        file_size: zipBlob.size,
        content_type: 'application/zip'
      })
    });

    if (!presignedResponse.ok) {
      const error = await presignedResponse.json();
      throw new Error(error.detail || 'Failed to get upload URL');
    }

    const { presigned_url, file_key } = await presignedResponse.json();

    // Upload to R2 using XMLHttpRequest for progress tracking
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const uploadPercent = Math.round((event.loaded / event.total) * 70);
          setUploadProgress(30 + uploadPercent); // 30-100% for upload
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));

      xhr.open('PUT', presigned_url);
      xhr.setRequestHeader('Content-Type', 'application/zip');
      xhr.send(zipBlob);
    });

    // Complete upload by saving metadata
    const completeResponse = await fetch(`${BACKEND_URL}/api/upload/complete/${roomId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        file_key: file_key,
        file_name: zipFileName,
        file_size: zipBlob.size,
        file_tree: fileTree
      })
    });

    if (!completeResponse.ok) {
      throw new Error('Failed to complete upload');
    }

    setUploadProgress(100);
    showNotification('success', 'Upload Complete', 'Project uploaded successfully!');
    setShowSubmitRepoModal(false);
    setUploadMethod(null);

    // Refresh to show the uploaded project
    fetchProjectUpload();

  } catch (error) {
    console.error('Upload error:', error);
    showNotification('error', 'Upload Failed', error.message || 'Failed to upload project.');
  } finally {
    setUploadingProject(false);
    setUploadProgress(0);
    if (folderInputRef.current) {
      folderInputRef.current.value = '';
    }
  }
};

// ✅ NEW: Handle ZIP file upload (existing ZIP file)
const handleZipFileSelect = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate it's a ZIP file
  if (!file.name.toLowerCase().endsWith('.zip')) {
    showNotification('error', 'Invalid File', 'Please select a ZIP file.');
    return;
  }

  // Check size limit (5GB)
  const maxSize = 5 * 1024 * 1024 * 1024;
  if (file.size > maxSize) {
    showNotification('error', 'File Too Large', 'File size must be under 5GB.');
    return;
  }

  setUploadingProject(true);
  setUploadProgress(0);

  try {
    // Read ZIP file to extract file tree
    const JSZip = (await import('jszip')).default;
    const zipContent = await JSZip.loadAsync(file);

    // Generate file tree from ZIP contents
    const fileTree = { name: file.name.replace('.zip', ''), type: 'folder', children: [] };
    const pathMap = new Map();
    pathMap.set('', fileTree);

    // Sort entries to process directories first
    const entries = Object.keys(zipContent.files).sort();

    for (const path of entries) {
      const zipEntry = zipContent.files[path];
      const parts = path.split('/').filter(p => p);

      if (parts.length === 0) continue;

      let currentPath = '';
      let parent = fileTree;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        const newPath = currentPath ? `${currentPath}/${part}` : part;

        if (!pathMap.has(newPath)) {
          const node = {
            name: part,
            type: (isLast && !zipEntry.dir) ? 'file' : 'folder',
            ...(isLast && !zipEntry.dir ? { size: zipEntry._data?.uncompressedSize || 0 } : { children: [] })
          };
          parent.children.push(node);
          pathMap.set(newPath, node);
        }

        parent = pathMap.get(newPath);
        currentPath = newPath;
      }
    }

    // Sort tree
    const sortTree = (node) => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.type === 'folder' && b.type !== 'folder') return -1;
          if (a.type !== 'folder' && b.type === 'folder') return 1;
          return a.name.localeCompare(b.name);
        });
        node.children.forEach(sortTree);
      }
    };
    sortTree(fileTree);

    setUploadProgress(10);

    // Get presigned upload URL
    const presignedResponse = await fetch(`${BACKEND_URL}/api/upload/presigned-url/${roomId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        file_name: file.name,
        file_size: file.size,
        content_type: 'application/zip'
      })
    });

    if (!presignedResponse.ok) {
      const error = await presignedResponse.json();
      throw new Error(error.detail || 'Failed to get upload URL');
    }

    const { presigned_url, file_key } = await presignedResponse.json();

    // Upload to R2 using XMLHttpRequest for progress tracking
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const uploadPercent = Math.round((event.loaded / event.total) * 85);
          setUploadProgress(10 + uploadPercent); // 10-95% for upload
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));

      xhr.open('PUT', presigned_url);
      xhr.setRequestHeader('Content-Type', 'application/zip');
      xhr.send(file);
    });

    // Complete upload by saving metadata
    const completeResponse = await fetch(`${BACKEND_URL}/api/upload/complete/${roomId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        file_key: file_key,
        file_name: file.name,
        file_size: file.size,
        file_tree: fileTree
      })
    });

    if (!completeResponse.ok) {
      throw new Error('Failed to complete upload');
    }

    setUploadProgress(100);
    showNotification('success', 'Upload Complete', 'Project uploaded successfully!');
    setShowSubmitRepoModal(false);
    setUploadMethod(null);

    // Refresh to show the uploaded project
    fetchProjectUpload();

  } catch (error) {
    console.error('Upload error:', error);
    showNotification('error', 'Upload Failed', error.message || 'Failed to upload project.');
  } finally {
    setUploadingProject(false);
    setUploadProgress(0);
    if (zipFileInputRef.current) {
      zipFileInputRef.current.value = '';
    }
  }
};

// ✅ NEW: Fetch project upload info
const fetchProjectUpload = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/upload/info/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      setProjectUpload(data.upload);
    }
  } catch (error) {
    console.error('Error fetching upload info:', error);
  }
};

// ✅ NEW: Download uploaded project from R2
const handleDownloadUploadedProject = async () => {
  setDownloadingProject(true);
  setDownloadProgress(0);

  try {
    // Get presigned download URL
    const response = await fetch(`${BACKEND_URL}/api/upload/download-url/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get download URL');
    }

    const { download_url, file_name } = await response.json();

    // Download using XMLHttpRequest for progress
    const xhr = new XMLHttpRequest();
    xhr.open('GET', download_url, true);
    xhr.responseType = 'blob';

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setDownloadProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showNotification('success', 'Download Complete', 'Project downloaded successfully!');
      } else {
        throw new Error('Download failed');
      }
      setDownloadingProject(false);
      setDownloadProgress(0);
    };

    xhr.onerror = () => {
      showNotification('error', 'Download Failed', 'Failed to download project.');
      setDownloadingProject(false);
      setDownloadProgress(0);
    };

    xhr.send();

  } catch (error) {
    console.error('Download error:', error);
    showNotification('error', 'Download Failed', error.message || 'Failed to download project.');
    setDownloadingProject(false);
    setDownloadProgress(0);
  }
};

  // ✅ NEW: Load file content from GitHub
  const loadFileContent = async (filePath) => {
    setLoadingFile(true);
    setSelectedFile(filePath);

    try {
      const response = await fetch(`${BACKEND_URL}/api/github/file-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          repo_url: githubRepo.repo_url,
          file_path: filePath 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFileContent(data.content);
      } else {
        setFileContent('Error loading file content');
      }
    } catch (error) {
      console.error('Error loading file:', error);
      setFileContent('Error loading file content');
    } finally {
      setLoadingFile(false);
    }
  };

  // ✅ NEW: Toggle folder expansion
  const toggleFolder = (path) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };


  const deduplicateTree = (items) => {
  if (!items || !Array.isArray(items)) return [];
  
  // Create a map to track folders by path
  const folderMap = new Map();
  const files = [];
  
  items.forEach(item => {
    if (item.type === 'blob') {
      // It's a file - add directly
      files.push(item);
    } else if (item.type === 'tree') {
      // It's a folder
      const existing = folderMap.get(item.path);
      
      if (!existing) {
        // First time seeing this folder
        folderMap.set(item.path, item);
      } else {
        // Folder already exists - merge children
        if (item.children && item.children.length > 0) {
          // This one has children, prefer it
          folderMap.set(item.path, item);
        }
        // Otherwise keep the existing one
      }
    }
  });
  
  // Combine folders and files
  return [...folderMap.values(), ...files];
};

// Then update loadRepoStructure:
const loadRepoStructure = async () => {
  if (!githubRepo || !githubRepo.repo_url) {
    showNotification('error', 'Repository Missing', 'No GitHub repository available.');
    return;
  }

  setShowReviewModal(true);

  try {
    const response = await fetch(`${BACKEND_URL}/api/github/repo-structure`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ repo_url: githubRepo.repo_url })
    });

    if (response.ok) {
      const data = await response.json();

      // ✅ Deduplicate the tree before setting state
      const deduplicated = deduplicateTree(data.tree);
      console.log('✅ Deduplicated tree:', deduplicated);

      setRepoFiles(deduplicated);
    } else {
      showNotification('error', 'Repository Error', 'Failed to load repository structure.');
    }
  } catch (error) {
    console.error('Error loading repo structure:', error);
    showNotification('error', 'Repository Error', 'Failed to load repository structure.');
  }
};

// ✅ NEW: Convert uploaded project tree to display format
const convertUploadTreeToDisplayFormat = (node) => {
  if (!node) return [];

  const convert = (item) => {
    if (item.type === 'file') {
      return {
        path: item.name,
        type: 'blob',
        size: item.size || 0
      };
    } else if (item.type === 'folder' && item.children) {
      return {
        path: item.name,
        type: 'tree',
        children: item.children.map(convert)
      };
    }
    return null;
  };

  // If the root has children directly, convert them
  if (node.children) {
    return node.children.map(convert).filter(Boolean);
  }

  return [convert(node)].filter(Boolean);
};

// ✅ NEW: Load uploaded project structure for review
const loadUploadedProjectStructure = () => {
  if (!projectUpload || !projectUpload.file_tree) {
    showNotification('error', 'Project Missing', 'No uploaded project available.');
    return;
  }

  // Convert the upload tree format to the display format used by renderFileTree
  const displayTree = convertUploadTreeToDisplayFormat(projectUpload.file_tree);

  setRepoFiles(displayTree);
  setShowReviewModal(true);
};

// ✅ NEW: Handle review button click - decides between GitHub and Upload
const handleReviewProject = () => {
  if (hasGithubRepo) {
    loadRepoStructure();
  } else if (hasUploadedProject) {
    loadUploadedProjectStructure();
  }
};

const renderFileTree = (items, parentPath = '') => {
  if (!items || !Array.isArray(items)) return null;

  // ✅ Deduplicate items at each level
  const deduplicated = deduplicateTree(items);

  return deduplicated.map((item, index) => {
    const uniqueKey = `${parentPath || 'root'}-${item.path}-${index}`;
    const itemPath = parentPath ? `${parentPath}/${item.path}` : item.path;
    
    if (item.type === 'blob') {
      return (
        <div
          key={uniqueKey}
          className={`file-tree-item file ${selectedFile === item.path ? 'selected' : ''}`}
          onClick={() => loadFileContent(item.path)}
        >
          <FileText size={16} />
          <span>{item.path.split('/').pop()}</span>
        </div>
      );
    }

    if (item.type === 'tree') {
      const isExpanded = expandedFolders.has(itemPath);
      return (
        <div key={uniqueKey} className="file-tree-folder">
          <div
            className="file-tree-item folder"
            onClick={() => toggleFolder(itemPath)}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Folder size={16} />
            <span>{item.path.split('/').pop()}</span>
          </div>
          {isExpanded && item.children && (
            <div className="file-tree-children">
              {renderFileTree(item.children, itemPath)}
            </div>
          )}
        </div>
      );
    }

    return null;
  });
};

  // ✅ NEW: Prevent screenshots and copying
  useEffect(() => {
    if (showReviewModal) {
      // Disable right-click
      const disableRightClick = (e) => {
        e.preventDefault();
        return false;
      };

      // Disable common screenshot shortcuts
      const disableScreenshot = (e) => {
        // Print Screen, Cmd+Shift+3, Cmd+Shift+4, etc.
        if (
          e.key === 'PrintScreen' ||
          (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) ||
          (e.ctrlKey && e.shiftKey && e.key === 'S')
        ) {
          e.preventDefault();
          showNotification('info', 'Screenshots Disabled', 'Screenshots are disabled for project review.');
          return false;
        }
      };

      // Disable text selection
      const disableSelection = () => {
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
      };

      // Disable copy
      const disableCopy = (e) => {
        e.preventDefault();
        showNotification('info', 'Copy Disabled', 'Copying is disabled for project review.');
        return false;
      };

      document.addEventListener('contextmenu', disableRightClick);
      document.addEventListener('keydown', disableScreenshot);
      document.addEventListener('copy', disableCopy);
      disableSelection();

      return () => {
        document.removeEventListener('contextmenu', disableRightClick);
        document.removeEventListener('keydown', disableScreenshot);
        document.removeEventListener('copy', disableCopy);
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
      };
    }
  }, [showReviewModal]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected) {
      console.log('❌ Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        isConnected 
      });
      return;
    }
    
    const messageToSend = newMessage.trim();
    console.log('📤 Sending message:', messageToSend);
    setNewMessage('');
    setFilterWarning(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: messageToSend,
          message_type: 'text'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Message send failed:', error);
        
        // Check if it's a content filtering error
        if (error.detail && typeof error.detail === 'object') {
          // New backend structure
          if (error.detail.code === 'CONTENT_FILTERED' && error.detail.violations) {
            const violations = error.detail.violations;
            let warningMessage = '⚠️ ' + (error.detail.message || 'Your message was blocked');
            
            setFilterWarning({
              message: warningMessage,
              violations: violations.map(v => v.type)
            });
            
            setNewMessage(messageToSend);
            setTimeout(() => setFilterWarning(null), 10000);
            return;
          }
          // Old backend structure (fallback)
          else if (error.detail.violations) {
            const violationTypes = error.detail.violations;
            let warningMessage = '⚠️ Your message was blocked because it contains: ';
            
            const violations = [];
            if (violationTypes.includes('phone')) violations.push('phone number');
            if (violationTypes.includes('email')) violations.push('email address');
            if (violationTypes.includes('social')) violations.push('social media link');
            if (violationTypes.includes('bypass_attempt')) violations.push('attempt to bypass platform');
            if (violationTypes.includes('url')) violations.push('external URL');
            if (violationTypes.includes('crypto')) violations.push('cryptocurrency wallet');
            
            warningMessage += violations.join(', ');
            warningMessage += '. All communication must happen through BiteBids for your protection.';
            
            setFilterWarning({
              message: warningMessage,
              violations: violationTypes
            });
            
            setNewMessage(messageToSend);
            setTimeout(() => setFilterWarning(null), 10000);
            return;
          }
        }
        
        // Generic error
        setFilterWarning({
          message: error.detail?.message || error.detail || 'Failed to send message',
          violations: []
        });
        setNewMessage(messageToSend);
        setTimeout(() => setFilterWarning(null), 5000);
      } else {
        console.log('✅ Message sent successfully');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setFilterWarning({
        message: '⚠️ Failed to send message. Please try again.',
        violations: []
      });
      setNewMessage(messageToSend);
      setTimeout(() => setFilterWarning(null), 5000);
    }
  };

  const handleTyping = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        is_typing: true
      }));

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'typing',
            is_typing: false
          }));
        }
      }, 1000);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('error', 'Invalid File Type', 'Only PNG and JPEG images are allowed.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showNotification('error', 'File Too Large', 'File size must be less than 5MB.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          console.log('File uploaded successfully:', response);
          fetchMessages();
        } else {
          const error = JSON.parse(xhr.responseText);
          showNotification('error', 'Upload Failed', error.detail || 'Failed to upload file.');
        }
        setUploading(false);
        setUploadProgress(0);
      });

      xhr.addEventListener('error', () => {
        showNotification('error', 'Upload Failed', 'Failed to upload file.');
        setUploading(false);
        setUploadProgress(0);
      });

      xhr.open('POST', `${BACKEND_URL}/api/chat/rooms/${roomId}/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification('error', 'Upload Failed', 'Failed to upload file.');
      setUploading(false);
      setUploadProgress(0);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (fileUrl, fileName) => {
    setDownloading(fileName);

    try {
      const response = await fetch(`${BACKEND_URL}${fileUrl}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        showNotification('error', 'Download Failed', 'Failed to download file.');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      showNotification('error', 'Download Failed', 'Failed to download file.');
    } finally {
      setDownloading(null);
    }
  };

  // ✅ NEW: Download Project as ZIP (for investor after confirmation) with progress tracking
  const handleDownloadProject = () => {
    if (!roomId) return;

    setDownloadingProject(true);
    setDownloadProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${BACKEND_URL}/api/github/download-repo/${roomId}`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
    xhr.responseType = 'blob';

    // Track download progress
    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setDownloadProgress(percentComplete);
      } else {
        // If total size is unknown, show indeterminate progress
        setDownloadProgress(-1);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        // Get filename from Content-Disposition header or use default
        const contentDisposition = xhr.getResponseHeader('Content-Disposition');
        let filename = 'project.zip';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        const blob = xhr.response;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showNotification('success', 'Download Complete', 'Project has been downloaded successfully.');
      } else {
        showNotification('error', 'Download Failed', 'Failed to download project. Please confirm the project first.');
      }
      setDownloadingProject(false);
      setDownloadProgress(0);
    };

    xhr.onerror = () => {
      console.error('Error downloading project');
      showNotification('error', 'Download Failed', 'Failed to download project.');
      setDownloadingProject(false);
      setDownloadProgress(0);
    };

    xhr.send();
  };

  const handleConfirmProject = async () => {
    if (!projectData) return;

    setConfirming(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/projects/${projectData.id}/simple-approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification(
          'success',
          'Project Confirmed',
          'Payment has been released to the developer. You can now download the project.'
        );
        setShowConfirmModal(false);
        setHasConfirmedProject(true); // ✅ Enable download button
        fetchProjectDetails();
      } else {
        const error = await response.json();
        showNotification('error', 'Confirmation Failed', error.detail || 'Failed to confirm project.');
      }
    } catch (error) {
      console.error('Error confirming project:', error);
      showNotification('error', 'Confirmation Failed', 'Failed to confirm project.');
    } finally {
      setConfirming(false);
    }
  };

  const handleOpenDispute = async (e) => {
    e.preventDefault();
    if (!projectData || !disputeReason) return;

    setDisputing(true);

    try {
      // ✅ Build request body with investor_id from current chat room
      const requestBody = {
        reason: disputeReason,
        notes: disputeNotes
      };

      // ✅ CRITICAL: Always include investor_id from roomData
      // This tells the backend which investor this dispute is for
      if (roomData?.investor_id) {
        requestBody.investor_id = roomData.investor_id;
        console.log('🔍 Opening dispute for investor:', roomData.investor_id);
      } else {
        console.warn('⚠️ No investor_id in roomData - backend will auto-detect if possible');
      }

      console.log('📤 Sending dispute request:', requestBody);

      const response = await fetch(`${BACKEND_URL}/api/projects/${projectData.id}/dispute/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        showNotification('success', 'Dispute Opened', 'An admin will review your case.');
        setShowDisputeModal(false);
        setDisputeReason('');
        setDisputeNotes('');
        setHasActiveDispute(true);
        fetchProjectDetails();
      } else {
        const error = await response.json();
        
        // ✅ Handle special case: multiple investors (shouldn't happen with investor_id)
        if (error.detail?.code === 'INVESTOR_ID_REQUIRED') {
          console.error('❌ Backend still needs investor_id despite sending it:', error.detail);
          showNotification(
            'info',
            'Multiple Investors Detected',
            `You are currently in the chat room with ${otherUser?.name || 'the investor'}. The dispute will be opened for this investor only.`
          );
        } else {
          showNotification(
            'error',
            'Dispute Error',
            error.detail?.message || error.detail || 'Failed to open dispute.'
          );
        }
      }
    } catch (error) {
      console.error('Error opening dispute:', error);
      showNotification('error', 'Dispute Error', 'Failed to open dispute.');
    } finally {
      setDisputing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if required data is loaded - return null to avoid duplicate spinner
  // (ChatPage.js already shows a loading spinner)
  if (!roomData || !currentUser) {
    return null;
  }

  const isDeveloper = roomData.developer_id === currentUser.id;
  const canConfirmOrDispute = !isDeveloper && projectData && (
    projectData.status === 'in_progress' || 
    projectData.status === 'fixed_price' ||
    projectData.status === 'disputed'
  );

  // Both developer and investor can open disputes
  const canOpenDispute = projectData && (
  projectData.status === 'in_progress' || 
  projectData.status === 'fixed_price'
) && !hasActiveDispute;  // ✅ NEW: Disable if active dispute exists


  // Check which type of project delivery is available
  const hasGithubRepo = githubRepo && githubRepo.repo_url;
  const hasUploadedProject = !!projectUpload;

  // Developer can submit if they haven't completed BOTH steps (GitHub + Upload required)
  const canSubmitRepo = isDeveloper && (!hasGithubRepo || !hasUploadedProject);
  // Project can be reviewed only when BOTH GitHub repo AND upload exist
  const canReviewProject = hasGithubRepo && hasUploadedProject;
  // Download button visibility:
  // - Developer: can download when upload exists
  // - Investor: can only download AFTER confirming the project
  const canDownloadProject = hasUploadedProject && (isDeveloper || hasConfirmedProject);
  // Both steps completed - project delivery is ready
  const projectDeliveryComplete = hasGithubRepo && hasUploadedProject;

  // Debug logging
  console.log('🔍 Button Visibility Debug:', {
    currentUserId: currentUser?.id,
    developerIdFromRoom: roomData?.developer_id,
    isDeveloper,
    projectStatus: projectData?.status,
    canConfirmOrDispute,
    canOpenDispute,
    canSubmitRepo,
    canReviewProject,
    canDownloadProject,
    hasGithubRepo,
    hasUploadedProject,
    projectDeliveryComplete
  });

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-user">
          <div className="chat-avatar">
            {otherUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="chat-user-info">
            <h3>{otherUser?.name}</h3>
            <span className="chat-user-role">
              {isDeveloper ? 'Investor' : 'Developer'}
            </span>
          </div>
        </div>
        
        <div className="chat-header-actions">
          {/* ✅ NEW: Developer Receive Payment Button */}
          {isDeveloper && pendingPayout?.has_pending_payout && (
            <button
              className="chat-action-btn receive-payment-btn"
              onClick={() => setShowPayoutModal(true)}
              title="Set up payout method to receive payment"
            >
              <DollarSign size={18} />
              <span>
                {pendingPayout.developer_preferences?.has_payout_method
                  ? `Receive $${pendingPayout.payout?.net_amount?.toFixed(2)}`
                  : 'Set Up Payout'}
              </span>
            </button>
          )}

          {/* ✅ NEW: Developer Submit Project Button (Both GitHub + Upload required) */}
          {canSubmitRepo && (
            <button
              className="chat-action-btn upload-project-btn"
              onClick={() => setShowSubmitRepoModal(true)}
              title={!hasGithubRepo ? "Submit GitHub repository" : "Upload project files"}
            >
              <FolderTree size={18} />
              <span>
                {!hasGithubRepo && !hasUploadedProject
                  ? 'Deliver Project'
                  : !hasGithubRepo
                    ? 'Add GitHub Repo'
                    : 'Upload Project'}
              </span>
            </button>
          )}

          {/* Show delivery status badge when partially complete */}
          {isDeveloper && (hasGithubRepo || hasUploadedProject) && !projectDeliveryComplete && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              background: '#fef3c7',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#92400e'
            }}>
              <AlertCircle size={14} />
              <span>
                {hasGithubRepo ? 'Upload pending' : 'GitHub repo pending'}
              </span>
            </div>
          )}

          {/* Show completion badge when both steps done */}
          {isDeveloper && projectDeliveryComplete && (
            <div className="project-delivered-badge">
              <CheckCircle2 size={14} />
              <span>Project delivered</span>
            </div>
          )}

          {/* ✅ NEW: Review Project Button */}
          {canReviewProject && (
            <button
              className="chat-action-btn review-project-btn"
              onClick={handleReviewProject}
              title="Review project code on GitHub"
            >
              <FolderTree size={18} />
              <span>Review Code</span>
            </button>
          )}

          {/* ✅ Download Project Button - Downloads from R2 Cloud */}
          {canDownloadProject && (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                className="chat-action-btn download-project-btn"
                onClick={handleDownloadUploadedProject}
                disabled={downloadingProject}
                title="Download project from cloud"
                style={{ minWidth: '180px', position: 'relative', overflow: 'hidden' }}
              >
                {downloadingProject ? (
                  <>
                    <Loader size={18} className="spinning" />
                    <span style={{ fontWeight: 600 }}>
                      {downloadProgress > 0 ? `Downloading ${downloadProgress}%` : 'Preparing...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Download Project</span>
                  </>
                )}
                {/* Progress Bar inside button */}
                {downloadingProject && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '5px',
                    width: downloadProgress > 0 ? `${downloadProgress}%` : '100%',
                    background: downloadProgress > 0
                      ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1)',
                    backgroundSize: downloadProgress > 0 ? '100% 100%' : '200% 100%',
                    animation: downloadProgress > 0 ? 'none' : 'shimmer 1.5s infinite',
                    transition: 'width 0.3s ease'
                  }} />
                )}
              </button>
              {/* External Progress Bar for better visibility */}
              {downloadingProject && (
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: downloadProgress > 0 ? `${downloadProgress}%` : '30%',
                    background: downloadProgress > 0
                      ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1)',
                    backgroundSize: downloadProgress > 0 ? '100% 100%' : '200% 100%',
                    animation: downloadProgress > 0 ? 'none' : 'shimmer 1.5s infinite',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              )}
            </div>
          )}

          {/* Investor Action Buttons */}
          {canConfirmOrDispute && (
            <button
              className="chat-action-btn confirm-btn"
              onClick={() => setShowConfirmModal(true)}
            >
              <Check size={18} />
              <span>Confirm</span>
            </button>
          )}

          {/* Dispute Button - Available for Both Developer and Investor */}
            <button
              className={`chat-action-btn dispute-btn ${hasActiveDispute ? 'disabled' : ''}`}
              onClick={() => !hasActiveDispute && setShowDisputeModal(true)}
              disabled={hasActiveDispute}
              title={hasActiveDispute ? "An active dispute is already open for this project" : "Open dispute"}
            >
              <AlertTriangle size={18} />
              <span>{hasActiveDispute ? 'Dispute Already Opened' : 'Open Dispute'}</span>
            </button>


          <button className="chat-more-btn">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      {filterWarning && (
        <div className="chat-warning-banner">
          <Shield size={20} />
          <div className="warning-content">
            <p>{filterWarning.message}</p>
            {filterWarning.violations.length > 0 && (
              <ul className="violations-list">
                {filterWarning.violations.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            )}
          </div>
          <button onClick={() => setFilterWarning(null)}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Messages Container */}
      <div className="chat-messages">
        {messages.map((message, index) => {
          const isOwnMessage = message.sender_id === currentUser.id;
          const isSystemMessage =
            message.message_type === 'system' ||
            message.sender_type === 'system' ||
            message.sender_id == null;
          const isAdminMessage =
            !isSystemMessage && (message.sender_role === 'admin' || message.is_admin);
          const showAvatar =
            !isSystemMessage &&
            !isAdminMessage &&
            (index === 0 || messages[index - 1].sender_id !== message.sender_id);

          return (
            <div
              key={message.id}
              className={`chat-message ${
                isSystemMessage ? 'system' : isAdminMessage ? 'admin' : isOwnMessage ? 'own' : 'other'
              }`}
            >
              {!isOwnMessage && showAvatar && (
                <div className="message-avatar">
                  {otherUser?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="message-content">
                {message.flagged ? (
                  <div className="message-text" style={{
                    opacity: 0.5,
                    fontStyle: 'italic',
                    color: '#999',
                    textDecoration: 'line-through'
                  }}>
                    [Message removed: {message.moderation_reason || 'Policy violation'}]
                  </div>
                ) : message.message_type === 'file' ? (
                  <div className="message-file">
                    <div className="file-info">
                      <Paperclip size={16} />
                      <span className="file-name">{message.file_name}</span>
                      <span className="file-size">
                        {(message.file_size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <button
                      className="file-download-btn"
                      onClick={() => handleDownload(message.file_url, message.file_name)}
                      disabled={downloading === message.file_name}
                    >
                      {downloading === message.file_name ? (
                        <Loader size={16} className="spinning" />
                      ) : (
                        <Download size={16} />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="message-text">{message.message}</div>
                )}

                <div className="message-meta">
                  <span className="message-time">{formatDate(message.created_at)}</span>
                  {isOwnMessage && !message.flagged && (
                    <span className="message-status">
                      {message.read ? <CheckCheck size={14} /> : <Check size={14} />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="chat-message other">
            <div className="message-avatar">
              {otherUser?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
          </div>
          <span>{Math.round(uploadProgress)}%</span>
        </div>
      )}

      {/* Chat Input */}
      <form className="chat-input-container" onSubmit={handleSendMessage}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/png,image/jpeg,image/jpg"
          style={{ display: 'none' }}
        />
        
        <button
          type="button"
          className="chat-input-btn"
          onClick={() => fileInputRef.current.click()}
          title="Attach image"
          disabled={uploading}
        >
          <Paperclip size={20} />
        </button>
        
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          disabled={uploading}
        />
        
        <div className="emoji-picker-wrapper" ref={emojiPickerRef}>
          <button
            type="button"
            className={`chat-input-btn ${showEmojiPicker ? 'active' : ''}`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Add emoji"
            disabled={uploading}
          >
            <Smile size={20} />
          </button>
          
          {showEmojiPicker && (
            <div className="emoji-picker-container">
              <EmojiPicker 
                onEmojiClick={handleEmojiClick}
                width={320}
                height={400}
                searchDisabled={false}
                skinTonesDisabled={false}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!newMessage.trim() || !isConnected || uploading}
        >
          <Send size={20} />
        </button>
      </form>

      {/* Connection Status */}
      {!isConnected && (
        <div className="chat-connection-banner">
          Reconnecting to chat...
        </div>
      )}

      {/* Project Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => !confirming && setShowConfirmModal(false)}>
          <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✓ Confirm Project Completion</h2>
              <button 
                className="modal-close"
                onClick={() => setShowConfirmModal(false)}
                disabled={confirming}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="confirmation-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="38" stroke="#10b981" strokeWidth="4" fill="#d1fae5"/>
                  <path d="M25 40L35 50L55 30" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <p className="confirmation-message">
                Are you sure you want to confirm that the project <strong>"{projectData?.title}"</strong> has been completed successfully?
              </p>
              
              <div className="confirmation-details">
                <div className="detail-item">
                  <span className="detail-label">Action:</span>
                  <span className="detail-value">Payment will be released to developer</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">Project will be marked as completed</span>
                </div>
              </div>
              
              <div className="confirmation-warning">
                <AlertTriangle size={20} />
                <span>This action cannot be undone. Make sure all project files and deliverables meet your requirements.</span>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={confirming}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleConfirmProject}
                disabled={confirming}
              >
                {confirming ? (
                  <>
                    <Loader size={18} className="spinning" />
                    Confirming...
                  </>
                ) : (
                  <>
                    ✓ Confirm & Release Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="modal-overlay" onClick={() => !disputing && setShowDisputeModal(false)}>
          <div className="modal-content dispute-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠ Open Dispute</h2>
              <button 
                className="modal-close"
                onClick={() => setShowDisputeModal(false)}
                disabled={disputing}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleOpenDispute} className="modal-body">
              <div className="dispute-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="38" stroke="#f59e0b" strokeWidth="4" fill="#fef3c7"/>
                  <path d="M40 25 L40 45 M40 55 L40 60" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </div>
              
              <p className="dispute-message">
                Open a dispute for project <strong>"{projectData?.title}"</strong> if you're not satisfied with the deliverables or if there are issues that need admin review.
              </p>
              
              <div className="form-group">
                <label htmlFor="dispute-reason">Dispute Reason *</label>
                <select
                  id="dispute-reason"
                  className="form-select"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  required
                >
                  <option value="">Select a reason...</option>
                  <option value="incomplete_work">Incomplete Work</option>
                  <option value="poor_quality">Poor Quality</option>
                  <option value="missed_deadline">Missed Deadline</option>
                  <option value="not_as_described">Not As Described</option>
                  <option value="no_communication">No Communication from Developer</option>
                  <option value="other">Other Issue</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="dispute-notes">Additional Details (Optional)</label>
                <textarea
                  id="dispute-notes"
                  className="form-textarea"
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  placeholder="Provide any additional details about the issue..."
                  rows={4}
                />
                <span className="form-hint">
                  An admin will review this dispute and make a fair decision.
                </span>
              </div>
              
              <div className="dispute-warning">
                <AlertTriangle size={20} />
                <span>
                  <strong>Important:</strong> Opening a dispute will notify the developer and an admin will review the case. 
                  Please provide as much detail as possible to help resolve this fairly.
                </span>
              </div>
            </form>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowDisputeModal(false);
                  setDisputeReason('');
                  setDisputeNotes('');
                }}
                disabled={disputing}
              >
                Cancel
              </button>
              <button 
                className="btn-dispute"
                onClick={handleOpenDispute}
                disabled={disputing || !disputeReason}
              >
                {disputing ? (
                  <>
                    <Loader size={18} className="spinning" />
                    Opening Dispute...
                  </>
                ) : (
                  <>
                    ⚠ Open Dispute
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Project Delivery Modal - Both GitHub + Upload Required */}
      {showSubmitRepoModal && (
        <div className="modal-overlay" onClick={() => !submittingRepo && !uploadingProject && setShowSubmitRepoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h2>📁 Deliver Your Project</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowSubmitRepoModal(false);
                  setRepoUrl('');
                }}
                disabled={submittingRepo || uploadingProject}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Progress Steps */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '12px'
              }}>
                {/* Step 1: GitHub */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: hasGithubRepo ? '#d1fae5' : '#fef3c7',
                  color: hasGithubRepo ? '#065f46' : '#92400e'
                }}>
                  {hasGithubRepo ? <CheckCircle2 size={18} /> : <span style={{ fontWeight: 600 }}>1</span>}
                  <span style={{ fontWeight: 500 }}>GitHub Repo</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', color: '#ccc' }}>→</div>

                {/* Step 2: Upload */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: hasUploadedProject ? '#d1fae5' : (hasGithubRepo ? '#fef3c7' : '#f1f5f9'),
                  color: hasUploadedProject ? '#065f46' : (hasGithubRepo ? '#92400e' : '#94a3b8')
                }}>
                  {hasUploadedProject ? <CheckCircle2 size={18} /> : <span style={{ fontWeight: 600 }}>2</span>}
                  <span style={{ fontWeight: 500 }}>Upload Files</span>
                </div>
              </div>

              {/* Step 1: GitHub Repository Form */}
              {!hasGithubRepo && (
                <div>
                  {/* Private Repo Warning Banner */}
                  {showPrivateRepoWarning && (
                    <div className="private-repo-warning" style={{
                      background: '#fef3c7',
                      border: '1px solid #f59e0b',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      gap: '0.75rem'
                    }}>
                      <Shield size={20} style={{ color: '#d97706', flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: '#92400e' }}>Private Repository Detected</strong>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#a16207' }}>
                          This repository is private. Please provide a GitHub Personal Access Token to grant read access.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="github-info-banner">
                    <Shield size={20} />
                    <div>
                      <strong>Step 1:</strong> Link your GitHub repository for code review.
                      The investor will be able to preview your code securely.
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label htmlFor="repo-url">Repository URL *</label>
                    <input
                      id="repo-url"
                      type="url"
                      className="form-select"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/username/repository"
                      required
                    />
                    <span className="form-hint">
                      Example: https://github.com/facebook/react
                    </span>
                  </div>

                  {/* Access Token Input for Private Repos */}
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label htmlFor="access-token" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      GitHub Personal Access Token
                      {!isPrivateRepo && (
                        <span style={{
                          fontSize: '0.75rem',
                          background: '#e5e7eb',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          color: '#6b7280'
                        }}>Optional - For Private Repos</span>
                      )}
                      {isPrivateRepo && (
                        <span style={{
                          fontSize: '0.75rem',
                          background: '#fef3c7',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          color: '#92400e'
                        }}>Required for Private Repo</span>
                      )}
                    </label>
                    <input
                      id="access-token"
                      type="password"
                      className="form-select"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="ghp_..."
                      required={isPrivateRepo}
                    />
                    <span className="form-hint">
                      {isPrivateRepo ? (
                        <>
                          Your repository is private.
                          <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" style={{marginLeft: '4px', color: '#2563eb'}}>
                            Create a token
                          </a> with <code style={{ background: '#f3f4f6', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>repo</code> scope.
                        </>
                      ) : (
                        <>
                          Only needed for private repositories.
                          <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" style={{marginLeft: '4px', color: '#2563eb'}}>
                            Create a token
                          </a> if needed.
                        </>
                      )}
                    </span>
                  </div>

                  {/* Token Security Notice */}
                  {(accessToken || isPrivateRepo) && (
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #10b981',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginTop: '1rem',
                      display: 'flex',
                      gap: '0.75rem'
                    }}>
                      <Shield size={18} style={{ color: '#059669', flexShrink: 0 }} />
                      <div style={{ fontSize: '0.85rem' }}>
                        <strong style={{ color: '#065f46' }}>🔒 Security Notice:</strong>
                        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', color: '#047857' }}>
                          <li>Token is encrypted and stored securely</li>
                          <li>Only used to fetch code for review</li>
                          <li>You can revoke it anytime from GitHub</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Upload Project Form (only shown after GitHub is done) */}
              {hasGithubRepo && !hasUploadedProject && (
                <div>
                  <div className="github-info-banner" style={{ background: '#f0fdf4', borderColor: '#10b981' }}>
                    <Shield size={20} style={{ color: '#10b981' }} />
                    <div>
                      <strong>Step 2:</strong> Upload your project files for fast delivery.
                      This ensures the investor can download quickly from our cloud.
                    </div>
                  </div>

                  {/* Hidden file inputs */}
                  <input
                    type="file"
                    ref={folderInputRef}
                    onChange={handleFolderSelect}
                    webkitdirectory=""
                    directory=""
                    multiple
                    style={{ display: 'none' }}
                  />
                  <input
                    type="file"
                    ref={zipFileInputRef}
                    onChange={handleZipFileSelect}
                    accept=".zip"
                    style={{ display: 'none' }}
                  />

                  {!uploadingProject ? (
                    <div style={{ marginTop: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 500 }}>
                        Choose upload method:
                      </label>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {/* Option 1: Select Folder */}
                        <button
                          type="button"
                          onClick={() => folderInputRef.current?.click()}
                          className="btn-secondary"
                          style={{
                            flex: 1,
                            minWidth: '180px',
                            padding: '1.5rem',
                            border: '2px dashed #10b981',
                            borderRadius: '12px',
                            background: '#f0fdf4',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <Folder size={28} style={{ color: '#10b981' }} />
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Select Folder</span>
                          <span style={{ fontSize: '0.8rem', color: '#888' }}>
                            Auto-compress to ZIP
                          </span>
                        </button>

                        {/* Option 2: Upload ZIP */}
                        <button
                          type="button"
                          onClick={() => zipFileInputRef.current?.click()}
                          className="btn-secondary"
                          style={{
                            flex: 1,
                            minWidth: '180px',
                            padding: '1.5rem',
                            border: '2px dashed #2563eb',
                            borderRadius: '12px',
                            background: '#eff6ff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <FileText size={28} style={{ color: '#2563eb' }} />
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Upload ZIP File</span>
                          <span style={{ fontSize: '0.8rem', color: '#888' }}>
                            Already compressed
                          </span>
                        </button>
                      </div>
                      <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#888', textAlign: 'center' }}>
                        Maximum size: 5GB
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      padding: '2rem',
                      border: '2px solid #10b981',
                      borderRadius: '12px',
                      background: '#f0fdf4',
                      textAlign: 'center',
                      marginTop: '1.5rem'
                    }}>
                      <Loader size={32} className="spinning" style={{ color: '#10b981', marginBottom: '1rem' }} />
                      <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                        {uploadProgress < 10 ? 'Preparing files...' : 'Uploading to cloud...'}
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#e0e0e0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginTop: '1rem'
                      }}>
                        <div style={{
                          width: `${uploadProgress}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #10b981, #059669)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <div style={{ marginTop: '0.5rem', color: '#666' }}>{uploadProgress}%</div>
                    </div>
                  )}
                </div>
              )}

              {/* Completion Message */}
              {hasGithubRepo && hasUploadedProject && (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  background: '#d1fae5',
                  borderRadius: '12px'
                }}>
                  <CheckCircle2 size={48} style={{ color: '#065f46', marginBottom: '1rem' }} />
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#065f46' }}>Project Delivered!</h3>
                  <p style={{ margin: 0, color: '#047857' }}>
                    Your project is ready for the investor to review and download.
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowSubmitRepoModal(false)}
                disabled={submittingRepo || uploadingProject}
              >
                {projectDeliveryComplete ? 'Close' : 'Cancel'}
              </button>

              {/* Submit GitHub button */}
              {!hasGithubRepo && (
                <button
                  className="btn-primary"
                  onClick={handleSubmitRepo}
                  disabled={submittingRepo || !repoUrl.trim() || (isPrivateRepo && !accessToken.trim())}
                >
                  {submittingRepo ? (
                    <>
                      <Loader size={18} className="spinning" />
                      Submitting...
                    </>
                  ) : (
                    'Submit & Continue →'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showReviewModal && repoFiles && (
      <div className={`modal-overlay review-modal-overlay ${isFullscreen ? 'fullscreen-overlay' : ''}`}>
        <div className={`modal-content review-modal review-modal-wide ${isFullscreen ? 'fullscreen-modal' : ''}`}>
          <div className="modal-header">
            <div className="review-header-left">
              <FolderTree size={24} />
              <div>
                <h2>Review Project Files</h2>
                <span className="review-subtitle">Read-only access • Secure viewing</span>
              </div>
            </div>
            <div className="review-header-right">
              <button 
                className="modal-close"
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedFile(null);
                  setFileContent('');
                  setRepoFiles(null);
                  setSidebarCollapsed(false);
                  setIsFullscreen(false);
                }}
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="review-modal-body">
            {/* Collapsible File Tree Panel */}
            <div className={`file-tree-panel ${sidebarCollapsed || isFullscreen ? 'collapsed' : ''}`}>
              <div className="file-tree-header">
                <Folder size={18} />
                <span>Project Files</span>
                <button 
                  className="collapse-btn"
                  onClick={toggleSidebar}
                  title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
              {!sidebarCollapsed && !isFullscreen && (
                <div className="file-tree-content">
                  {renderFileTree(repoFiles)}
                </div>
              )}
            </div>
            
            {/* Toggle Button When Collapsed */}
            {(sidebarCollapsed || isFullscreen) && !isFullscreen && (
              <button 
                className="sidebar-toggle-btn"
                onClick={toggleSidebar}
                title="Show file tree"
              >
                <ChevronRight size={20} />
              </button>
            )}
            
            <div className="file-viewer-panel">
              {loadingFile ? (
                <div className="file-viewer-loading">
                  <Loader size={32} className="spinning" />
                  <p>Loading file...</p>
                </div>
              ) : selectedFile ? (
                <>
                  <div className="file-viewer-header">
                    <FileText size={18} />
                    <span>{selectedFile}</span>
                    <div className="file-viewer-actions">
                      {!isFullscreen && (
                        <button 
                          className="viewer-action-btn"
                          onClick={toggleSidebar}
                          title={sidebarCollapsed ? "Show file tree" : "Hide file tree"}
                        >
                          {sidebarCollapsed ? "Show Files" : "Hide Files"}
                        </button>
                      )}
                      <button 
                        className="viewer-action-btn fullscreen-btn"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                      >
                        {isFullscreen ? (
                          <>
                            <Minimize size={14} />
                            Exit Fullscreen
                          </>
                        ) : (
                          <>
                            <Maximize size={14} />
                            Fullscreen
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* ✅ COLORFUL SYNTAX HIGHLIGHTING */}
                  <SyntaxHighlighter
                    language={getLanguage(selectedFile)}
                    style={vscDarkPlus}
                    showLineNumbers={true}
                    wrapLines={true}
                    lineNumberStyle={{
                      color: '#858585',
                      paddingRight: '1em',
                      userSelect: 'none'
                    }}
                    customStyle={{
                      margin: 0,
                      padding: '2rem',
                      background: '#1e1e1e',
                      fontSize: isFullscreen ? '1rem' : '0.9375rem',
                      lineHeight: '1.8',
                      height: '100%',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                    codeTagProps={{
                      style: {
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        fontFamily: "'Fira Code', 'Monaco', 'Courier New', monospace"
                      }
                    }}
                  >
                    {fileContent}
                  </SyntaxHighlighter>
                </>
              ) : (
                <div className="file-viewer-empty">
                  <FolderTree size={48} />
                  <p>Select a file to view its contents</p>
                  <span className="file-viewer-hint">
                    Click on any file from the tree to review its code
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="review-modal-footer">
            <div className="review-warning">
              <Shield size={18} />
              <span>Protected content • Copying and screenshots are disabled</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ✅ UPDATED: Simplified Payout Confirmation Modal */}
      {showPayoutModal && pendingPayout && (
        <div className="modal-overlay" onClick={() => !savingPayout && setShowPayoutModal(false)}>
          <div className="modal-content payout-confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💰 Confirm Payment Receipt</h2>
              <button
                className="modal-close"
                onClick={() => setShowPayoutModal(false)}
                disabled={savingPayout}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Check if payout method is configured */}
              {!pendingPayout.developer_preferences?.has_payout_method ? (
                <div className="payout-warning-banner">
                  <AlertCircle size={48} />
                  <h3>Payout Method Not Configured</h3>
                  <p>Please set up your payout method in your Dashboard before receiving payment.</p>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setShowPayoutModal(false);
                      // Navigate to dashboard payout settings
                      window.location.href = '/dashboard?tab=payout-settings';
                    }}
                  >
                    <Wallet size={18} />
                    Go to Payout Settings
                  </button>
                </div>
              ) : (
                <>
                  {/* Payment Summary */}
                  <div className="payout-summary">
                    <div className="payout-summary-icon">
                      <DollarSign size={40} />
                    </div>
                    <div className="payout-summary-details">
                      <div className="payout-amount-row">
                        <span className="payout-label">Gross Amount:</span>
                        <span className="payout-value">${pendingPayout.payout?.gross_amount?.toFixed(2)}</span>
                      </div>
                      <div className="payout-amount-row fee">
                        <span className="payout-label">Platform Fee (6%):</span>
                        <span className="payout-value">-${pendingPayout.payout?.platform_fee?.toFixed(2)}</span>
                      </div>
                      <div className="payout-divider"></div>
                      <div className="payout-amount-row total">
                        <span className="payout-label">You Receive:</span>
                        <span className="payout-value highlight">${pendingPayout.payout?.net_amount?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Display */}
                  <div className="payout-method-display">
                    <h3>Payment Method</h3>
                    <div className="selected-payment-method">
                      <div className="method-icon-display">
                        {pendingPayout.developer_preferences.payout_method === 'paypal' && <CreditCard size={24} />}
                        {pendingPayout.developer_preferences.payout_method === 'wise' && <Globe size={24} />}
                        {pendingPayout.developer_preferences.payout_method === 'bank_transfer' && <Building2 size={24} />}
                        {pendingPayout.developer_preferences.payout_method === 'crypto' && <Bitcoin size={24} />}
                        {pendingPayout.developer_preferences.payout_method === 'other' && <Wallet size={24} />}
                      </div>
                      <div className="method-details">
                        <span className="method-name-display">
                          {pendingPayout.developer_preferences.payout_method === 'paypal' && 'PayPal'}
                          {pendingPayout.developer_preferences.payout_method === 'wise' && 'Wise (TransferWise)'}
                          {pendingPayout.developer_preferences.payout_method === 'bank_transfer' && 'Bank Transfer'}
                          {pendingPayout.developer_preferences.payout_method === 'crypto' && 'Cryptocurrency'}
                          {pendingPayout.developer_preferences.payout_method === 'other' && 'Other Method'}
                        </span>
                        {pendingPayout.developer_preferences.payout_email && (
                          <span className="method-email-display">
                            {pendingPayout.developer_preferences.payout_email}
                          </span>
                        )}
                      </div>
                      <CheckCircle2 className="verified-icon" size={20} />
                    </div>
                  </div>

                  {/* Info Banner */}
                  <div className="payout-info-banner success">
                    <Shield size={20} />
                    <div>
                      <strong>Payment will be transferred to your account</strong>
                      <p>Your payment will be processed within 1-3 business days. For any questions or support, contact <strong>bitebids@gmail.com</strong></p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {pendingPayout.developer_preferences?.has_payout_method && (
              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setShowPayoutModal(false)}
                  disabled={savingPayout}
                >
                  Cancel
                </button>
                <button
                  className="btn-success"
                  onClick={handleConfirmPayoutReceipt}
                  disabled={savingPayout}
                >
                  {savingPayout ? (
                    <>
                      <Loader size={18} className="spinning" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign size={18} />
                      Confirm & Receive Payment
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Chat;
