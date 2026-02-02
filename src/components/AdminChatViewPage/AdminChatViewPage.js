import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  User, 
  FolderOpen, 
  MessageCircle,
  Clock,
  CheckCheck,
  Paperclip,
  Download,
  Search,
  Calendar,
  Mail,
  FolderTree,
  FileText,
  Folder,
  ChevronRight,
  ChevronDown,
  Loader,
  Maximize,
  Minimize,
  Shield
} from 'lucide-react';
import './AdminChatViewPage.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useNotification } from '../NotificationModal/NotificationModal';

const AdminChatViewPage = ({ roomId, navigateBack }) => {
  const { showNotification } = useNotification();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  
  const [messages, setMessages] = useState([]);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  
  // ✅ NEW: GitHub Review States
  const [githubRepo, setGithubRepo] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [repoFiles, setRepoFiles] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loadingFile, setLoadingFile] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (roomId) {
      fetchRoomData();
      fetchMessages();
      fetchGithubRepo(); // ✅ NEW
    }
  }, [roomId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = messages.filter(msg => 
        msg.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(messages);
    }
  }, [searchQuery, messages]);

  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRoomData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/chat/rooms?skip=0&limit=100`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const room = data.rooms.find(r => r.id === roomId);
        
        if (room) {
          setRoomData(room);
          console.log('✅ Room data loaded:', room);
        } else {
          console.error('❌ Room not found:', roomId);
          setError('Chat room not found');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to load chat room');
      }
    } catch (err) {
      console.error('Error fetching room data:', err);
      setError('Failed to connect to chat service');
    }
  };

  // ✅ NEW: Fetch GitHub repository
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
        console.log('✅ GitHub repo loaded:', data);
      }
    } catch (error) {
      console.error('Error fetching GitHub repo:', error);
    }
  };

  // ✅ NEW: Load repository structure
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
        const deduplicated = deduplicateTree(data.tree);
        setRepoFiles(deduplicated);
      } else {
        showNotification('error', 'Repository Error', 'Failed to load repository structure.');
      }
    } catch (error) {
      console.error('Error loading repo structure:', error);
      showNotification('error', 'Repository Error', 'Failed to load repository structure.');
    }
  };

  // ✅ NEW: Load file content
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

  // ✅ NEW: Toggle folder
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

  // ✅ NEW: Deduplicate tree
  const deduplicateTree = (items) => {
    if (!items || !Array.isArray(items)) return [];
    
    const folderMap = new Map();
    const files = [];
    
    items.forEach(item => {
      if (item.type === 'blob') {
        files.push(item);
      } else if (item.type === 'tree') {
        const existing = folderMap.get(item.path);
        
        if (!existing) {
          folderMap.set(item.path, item);
        } else {
          if (item.children && item.children.length > 0) {
            folderMap.set(item.path, item);
          }
        }
      }
    });
    
    return [...folderMap.values(), ...files];
  };

  // ✅ NEW: Render file tree
  const renderFileTree = (items, parentPath = '') => {
    if (!items || !Array.isArray(items)) return null;

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

  // ✅ NEW: Get language for syntax highlighting
  const getLanguage = (filename) => {
    if (!filename) return 'javascript';
    
    const extension = filename.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript', 'jsx': 'jsx', 'ts': 'typescript', 'tsx': 'tsx',
      'py': 'python', 'java': 'java', 'kt': 'kotlin', 'swift': 'swift',
      'go': 'go', 'rs': 'rust', 'c': 'c', 'cpp': 'cpp', 'cs': 'csharp',
      'php': 'php', 'rb': 'ruby', 'css': 'css', 'scss': 'scss',
      'json': 'json', 'html': 'markup', 'md': 'markdown', 'yaml': 'yaml',
      'sh': 'bash', 'dart': 'dart'
    };
    
    return languageMap[extension] || 'javascript';
  };

  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);
  const toggleFullscreen = () => setIsFullscreen(prev => !prev);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/api/admin/chat/rooms/${roomId}/messages?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        console.log('✅ Messages loaded:', data.messages.length);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to load messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to connect to chat service');
    } finally {
      setLoading(false);
    }
  };

  const getFullFileUrl = (fileUrl) => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    const cleanUrl = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
    return `${BACKEND_URL}/${cleanUrl}`;
  };

  const handleFileDownload = async (fileUrl, fileName) => {
    try {
      const fullUrl = getFullFileUrl(fileUrl);
      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to download file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      showNotification('error', 'Download Failed', 'Failed to download file. Please try again.');
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const exportChat = () => {
    let content = `Chat Export - ${roomData?.project_title || 'Unknown Project'}\n`;
    content += `Generated: ${new Date().toLocaleString()}\n\n`;
    content += `Developer: ${roomData?.developer_name || 'Unknown'} (${roomData?.developer_email || 'N/A'})\n`;
    content += `Investor: ${roomData?.investor_name || 'Unknown'} (${roomData?.investor_email || 'N/A'})\n`;
    content += `Total Messages: ${messages.length}\n`;
    content += `\n${'='.repeat(80)}\n\n`;

    messages.forEach(msg => {
      content += `[${formatTimestamp(msg.created_at)}]\n`;
      content += `${msg.sender_name} (${msg.sender_role}):\n`;
      content += `${msg.message}\n`;
      if (msg.file_url) {
        content += `Attachment: ${msg.file_name}\n`;
        content += `URL: ${getFullFileUrl(msg.file_url)}\n`;
      }
      content += `\n${'-'.repeat(80)}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${roomId}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="admin-chat-view-container">
        <div className="admin-chat-view-loading">
          <div className="loading-spinner"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-chat-view-container">
        <div className="admin-chat-view-error">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => {
            fetchRoomData();
            fetchMessages();
          }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-chat-view-container">
      {/* Header */}
      <div className="admin-chat-view-header">
        <button className="back-button" onClick={navigateBack}>
          <ArrowLeft size={20} />
          Back to All Chats
        </button>
        
        <div className="header-center">
          <FolderOpen className="project-icon-header" />
          <div className="header-info">
            <h1 className="chat-title">{roomData?.project_title || 'Chat View'}</h1>
            <p className="chat-subtitle">
              Admin View • {messages.length} messages
            </p>
          </div>
        </div>

        <div className="header-actions">
          {/* ✅ NEW: Preview Project Button */}
          {githubRepo && githubRepo.repo_url && (
            <button 
              className="btn-preview-project" 
              onClick={loadRepoStructure}
              title="Preview submitted project"
            >
              <FolderTree size={18} />
              Preview Project
            </button>
          )}

          <button className="btn-export-chat" onClick={exportChat}>
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Participants Info */}
      <div className="participants-info">
        <div className="participant-card">
          <div className="participant-avatar developer">
            <User size={24} />
          </div>
          <div className="participant-details">
            <span className="participant-role">Developer</span>
            <h3 className="participant-name">{roomData?.developer_name || 'Unknown'}</h3>
            <div className="participant-contact">
              <Mail size={14} />
              <span>{roomData?.developer_email || 'N/A'}</span>
            </div>
          </div>
          <div className="participant-stats">
            <div className="stat-item">
              <span className="stat-label">Messages:</span>
              <span className="stat-value">
                {messages.filter(m => m.sender_role === 'developer').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Unread:</span>
              <span className="stat-value">{roomData?.developer_unread_count || 0}</span>
            </div>
          </div>
        </div>

        <div className="participant-card">
          <div className="participant-avatar investor">
            <User size={24} />
          </div>
          <div className="participant-details">
            <span className="participant-role">Investor</span>
            <h3 className="participant-name">{roomData?.investor_name || 'Unknown'}</h3>
            <div className="participant-contact">
              <Mail size={14} />
              <span>{roomData?.investor_email || 'N/A'}</span>
            </div>
          </div>
          <div className="participant-stats">
            <div className="stat-item">
              <span className="stat-label">Messages:</span>
              <span className="stat-value">
                {messages.filter(m => m.sender_role === 'investor').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Unread:</span>
              <span className="stat-value">{roomData?.investor_unread_count || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="chat-search-bar">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <span className="search-results-count">
            {filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Messages Container */}
      <div className="admin-messages-container">
        {filteredMessages.length === 0 ? (
          <div className="no-messages-found">
            <MessageCircle size={48} />
            <h3>No messages found</h3>
            <p>
              {searchQuery 
                ? 'Try a different search term' 
                : 'No messages in this conversation yet'}
            </p>
          </div>
        ) : (
          <>
            {filteredMessages.map((msg, index) => {
              const showDateSeparator = index === 0 || 
                formatDate(msg.created_at) !== formatDate(filteredMessages[index - 1].created_at);

              return (
                <React.Fragment key={msg.id}>
                  {showDateSeparator && (
                    <div className="date-separator">
                      <Calendar size={14} />
                      <span>{formatDate(msg.created_at)}</span>
                    </div>
                  )}
                  
                  <div
                    className={`admin-message ${
                      msg.sender_role || (msg.message_type === 'system' ? 'system' : 'unknown')
                    }`}
                  >
                    <div className="message-avatar">
                      <User size={20} />
                    </div>
                    
                    <div className="message-content-wrapper">
                      <div className="message-header-admin">
                        <span className="message-sender-name">{msg.sender_name}</span>
                        <span className={`message-sender-role ${msg.sender_role}`}>
                          {msg.sender_role}
                        </span>
                        <span className="message-timestamp">
                          <Clock size={12} />
                          {formatTimestamp(msg.created_at)}
                        </span>
                        {msg.read && (
                          <span className="message-read-status">
                            <CheckCheck size={14} />
                          </span>
                        )}
                      </div>
                      
                      <div className="message-text">
                        {msg.message}
                      </div>
                      
                      {msg.file_url && (
                        <div className="message-attachment-admin">
                          <Paperclip size={16} />
                          <span className="attachment-name">{msg.file_name}</span>
                          <button 
                            onClick={() => handleFileDownload(msg.file_url, msg.file_name)}
                            className="attachment-download"
                            title="Download file"
                          >
                            <Download size={14} />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ✅ NEW: GitHub Review Modal (Same as Chat.js) */}
      {showReviewModal && repoFiles && (
        <div className={`modal-overlay review-modal-overlay ${isFullscreen ? 'fullscreen-overlay' : ''}`}>
          <div className={`modal-content review-modal review-modal-wide ${isFullscreen ? 'fullscreen-modal' : ''}`}>
            <div className="modal-header">
              <div className="review-header-left">
                <FolderTree size={24} />
                <div>
                  <h2>Review Project Files (Admin View)</h2>
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
                <span>Admin view • Protected content • Copying and screenshots are disabled</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChatViewPage;
