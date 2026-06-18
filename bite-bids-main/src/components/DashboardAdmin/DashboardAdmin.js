import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, TrendingUp, Activity,
  Shield, AlertCircle, CheckCircle2, XCircle,
  Clock, Award, Briefcase, FileText,
  Settings, BarChart3, PieChart, Search,
  Filter, Eye, Trash2,
  Ban, CheckSquare, ArrowRight, Download,
  RefreshCw, Globe, Zap, Target, MapPin,
  Star, Code, X, Mail, Building2,
  Calendar, User as UserIcon,  Image as ImageIcon, Upload, Save,
  AlertTriangle  // ✅ NEW: For Disputes tab
} from 'lucide-react';

import AdminDisputes from '../AdminDisputes/AdminDisputes';  // ✅ NEW: Import AdminDisputes component

import './DashboardAdmin.css';
import '../Profile/Profile.css';

// Icon mapping for dynamic activity icons
const lucideIcons = {
  Users, DollarSign, TrendingUp, Activity,
  Shield, AlertCircle, CheckCircle2, XCircle,
  Clock, Award, Briefcase, FileText,
  Settings, BarChart3, PieChart, Search
};

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  // If already a full URL (starts with http:// or https://), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  // Otherwise, prepend backend URL for legacy local images
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  return `${BACKEND_URL}${imageUrl}`;
};

const DashboardAdmin = ({ navigateToPage }) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // ✅ Handle URL query parameter for tab selection (e.g., ?tab=disputes)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['overview', 'users', 'projects', 'disputes'].includes(tabParam)) {
      setSelectedTab(tabParam);
    }
  }, []);

  
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [showUserDeleteDialog, setShowUserDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userDeleteLoading, setUserDeleteLoading] = useState(false);
  const [showBanConfirmDialog, setShowBanConfirmDialog] = useState(false);
  const [userToBan, setUserToBan] = useState(null);
  const [quickActionModal, setQuickActionModal] = useState(null);
  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer',
    company: '',
    address: '',
  });
  const [banUserForm, setBanUserForm] = useState({ userId: '', reason: '' });
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', audience: 'all' });
  const [quickActionLoading, setQuickActionLoading] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationConfig, setNotificationConfig] = useState({
    type: 'success',
    title: '',
    message: '',
  });

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    tech_stack: [],
    requirements: '',
    budget: '',
    location: '',
    status: '',
    images: []  // ✅ NEW: For existing images
  });

    // ✅ NEW: Image upload states
  const [editImages, setEditImages] = useState([]);
  const [uploadingEditImages, setUploadingEditImages] = useState(false);


    // Multi-select dropdown states
  const [showTechDropdown, setShowTechDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

// Tech stack and location options (same as developer dashboard)
const techStackOptions = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
  'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy',
  'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
  'Git', 'CI/CD', 'GraphQL', 'REST API', 'Microservices'
];

const locationOptions = [
  'Remote',
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy',
  'Australia', 'New Zealand', 'Japan', 'Singapore', 'India', 'China', 'Brazil',
  'New York, USA', 'San Francisco, USA', 'Los Angeles, USA', 'Austin, USA', 'Seattle, USA',
  'London, UK', 'Berlin, Germany', 'Paris, France', 'Amsterdam, Netherlands',
  'Toronto, Canada', 'Vancouver, Canada', 'Sydney, Australia', 'Melbourne, Australia',
  'Tokyo, Japan', 'Singapore', 'Dubai, UAE', 'Tel Aviv, Israel'
];


  const [userBanLoading, setUserBanLoading] = useState(false);
  const [userBanTarget, setUserBanTarget] = useState(null);
  const normalizedBudget =
    selectedProjectDetails?.budget != null ? Number(selectedProjectDetails.budget) : null;
  const normalizedLowestBid =
    selectedProjectDetails?.lowest_bid != null ? Number(selectedProjectDetails.lowest_bid) : null;
  const normalizedHighestBid =
    selectedProjectDetails?.highest_bid != null ? Number(selectedProjectDetails.highest_bid) : null;
  const userSkills = Array.isArray(selectedUserDetails?.skills)
    ? selectedUserDetails.skills
    : [];
  const normalizedUserEarnings =
    selectedUserDetails?.total_earnings != null
      ? Number(selectedUserDetails.total_earnings)
      : null;

  const showNotificationModal = (type, title, message) => {
    setNotificationConfig({ type, title, message });
    setShowNotification(true);
  };

  const closeNotification = () => {
    setShowNotification(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (selectedTab === "overview") {
      fetchAdminData();
    } else if (selectedTab === "projects") {
      fetchProjects();
    } else if (selectedTab === "users") {
      fetchUsers();
    }
  }, [selectedTab]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      const filteredUsers = Array.isArray(data.users)
        ? data.users.filter((user) => user.role !== 'admin')
        : [];
      setUsers(filteredUsers);
    } catch (err) {
      console.error("Failed to load users", err);
      setError("Failed to fetch users data");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch projects");

      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Failed to load projects", err);
      setError("Failed to fetch projects data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const dashboardRes = await fetch(`${BACKEND_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!dashboardRes.ok) throw new Error("Dashboard fetch failed");

      const dashboardData = await dashboardRes.json();

      // Extract stats from the new API structure
      const apiStats = dashboardData.stats || {};
      setStats({
        totalUsers: apiStats.users?.total || 0,
        developers: apiStats.users?.developers || 0,
        investors: apiStats.users?.investors || 0,
        totalProjects: apiStats.projects?.total || 0,
        activeProjects: apiStats.projects?.active || 0,
        totalDisputes: apiStats.disputes?.total || 0,
        activeDisputes: apiStats.disputes?.active || 0,
        totalRevenue: apiStats.payments?.total_revenue || 0,
        pendingPayments: apiStats.payments?.pending_payments || 0,
        completedTransactions: apiStats.payments?.completed_transactions || 0,
      });

      const recentUsersData = Array.isArray(dashboardData.recent_activity?.users)
        ? dashboardData.recent_activity.users.filter((user) => user.role !== 'admin')
        : [];
      setRecentUsers(recentUsersData);
      setRecentProjects(dashboardData.recent_activity?.projects || []);
      setActivity(dashboardData.recent_activity?.activity || []);

    } catch (err) {
      console.error("Failed to load admin data", err);
      setError("Failed to fetch admin dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      pending: 'badge-warning',
      suspended: 'badge-error',
      open: 'badge-info',
      closed: 'badge-success',
      'in-progress': 'badge-primary',
      review: 'badge-warning',
      completed: 'badge-success',
      disputed: 'badge-error',
      bidding: 'badge-info',
      banned: 'badge-error',
    };
    return badges[status] || 'badge-gray';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const fetchProjectDetails = async (projectId) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch project details");

      const data = await res.json();
      setSelectedProjectDetails(data);
      setShowProjectDetails(true);
    } catch (err) {
      console.error("Failed to load project details", err);
      showNotificationModal('error', 'Project Details', 'Failed to load project details. Please try again.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setShowProjectDetails(false);
    setSelectedProjectDetails(null);
  };


// ✅ Handle edit click - opens modal with pre-filled data
const handleEditClick = (project) => {
  setEditingProject(project);
  setEditForm({
    title: project.title,
    status: project.status,
    description: project.description,
    category: project.category,
    tech_stack: project.tech_stack || [],
    requirements: project.requirements || '',
    budget: project.budget,
    location: project.location || 'Remote',
    status: project.status,
    images: project.images || []  // ✅ NEW: Include existing images
  });
  setEditImages([]);  // ✅ NEW: Reset new images
  setShowTechDropdown(false);
  setShowLocationDropdown(false);
  setShowEditDialog(true);
};

// ✅ Close edit dialog
const handleCloseEditDialog = () => {
  setShowEditDialog(false);
  setEditingProject(null);
  setEditImages([]);
  setEditForm({
    title: '',
    description: '',
    category: '',
    tech_stack: [],
    requirements: '',
    budget: '',
    location: '',
    status: '',
    images: []
  });
};

// ✅ Handle image upload for editing
const handleEditImageUpload = async (e) => {
  const files = Array.from(e.target.files);
  const currentImageCount = (editForm.images || []).length + editImages.length;
  
  if (currentImageCount + files.length > 5) {
    showNotificationModal('error', 'Too Many Images', 'You can upload a maximum of 5 images.');
    return;
  }

  for (const file of files) {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      showNotificationModal('error', 'Invalid File Type', 'Only JPEG and PNG images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotificationModal('error', 'File Too Large', 'Each image must be less than 5MB.');
      return;
    }
  }

  const imagePromises = files.map(file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({
        file: file,
        preview: e.target.result,
        name: file.name
      });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  });

  try {
    const images = await Promise.all(imagePromises);
    setEditImages(prev => [...prev, ...images]);
  } catch (error) {
    showNotificationModal('error', 'Upload Failed', 'Failed to upload images. Please try again.');
  }
};

// ✅ Remove existing image
const removeExistingImage = (index) => {
  setEditForm(prev => ({
    ...prev,
    images: prev.images.filter((_, i) => i !== index)
  }));
};

// ✅ Remove new image
const removeEditImage = (index) => {
  setEditImages(prev => prev.filter((_, i) => i !== index));
};

// ✅ Toggle tech stack
const toggleTechStack = (tech) => {
  setEditForm(prev => {
    const currentStack = prev.tech_stack;
    const isSelected = currentStack.includes(tech);
    
    return {
      ...prev,
      tech_stack: isSelected
        ? currentStack.filter(t => t !== tech)
        : [...currentStack, tech]
    };
  });
};

// ✅ Remove tech from selected
const removeTech = (tech) => {
  setEditForm(prev => ({
    ...prev,
    tech_stack: prev.tech_stack.filter(t => t !== tech)
  }));
};

// ✅ Handle update project with image upload
const handleUpdateProject = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const token = localStorage.getItem('token');
    
    // ✅ Upload new images first
    const newImageUrls = [];
    if (editImages.length > 0) {
      setUploadingEditImages(true);
      
      for (const image of editImages) {
        const formData = new FormData();
        formData.append('image', image.file);
        
        try {
          const uploadResponse = await fetch(`${BACKEND_URL}/api/projects/upload-image`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          
          const uploadData = await uploadResponse.json();
          
          if (uploadData.success) {
            newImageUrls.push(uploadData.image_url);
          }
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          showNotificationModal(
            'error', 
            'Image Upload Failed', 
            uploadError.response?.data?.detail || 'Failed to upload one or more images.'
          );
          setLoading(false);
          setUploadingEditImages(false);
          return;
        }
      }
      
      setUploadingEditImages(false);
    }
    
    // ✅ Combine existing images with new images
    const allImages = [...(editForm.images || []), ...newImageUrls];

    const updateData = {
      title: editForm.title,
      status: editForm.status,
      description: editForm.description,
      category: editForm.category,
      tech_stack: editForm.tech_stack,
      requirements: editForm.requirements,
      budget: parseFloat(editForm.budget),
      location: editForm.location,
      images: allImages  // ✅ Include all images
    };

    const response = await fetch(`${BACKEND_URL}/api/projects/${editingProject.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) throw new Error('Failed to update project');

    showNotificationModal('success', 'Project Updated', 'Project has been updated successfully!');
    handleCloseEditDialog();
    fetchProjects();
    fetchAdminData();
  } catch (error) {
    console.error('Failed to update project:', error);
    showNotificationModal('error', 'Update Failed', error.message || 'Failed to update project');
  } finally {
    setLoading(false);
  }
};


  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setShowDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setProjectToDelete(null);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete project");

      showNotificationModal('success', 'Project Deleted', 'The project has been successfully deleted from the marketplace.');
      handleCloseDeleteDialog();
      fetchAdminData();
      fetchProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
      showNotificationModal('error', 'Delete Failed', 'Failed to delete project. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    setUserDetailsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user details");

      const data = await res.json();
      setSelectedUserDetails(data);
      setShowUserDetailsModal(true);
    } catch (err) {
      console.error("Failed to load user details", err);
      showNotificationModal('error', 'User Details', 'Failed to load user details. Please try again.');
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const handleCloseUserDetails = () => {
    setShowUserDetailsModal(false);
    setSelectedUserDetails(null);
  };

  const handleUserDeleteClick = (user) => {
    setUserToDelete(user);
    setShowUserDeleteDialog(true);
  };

  const handleCloseUserDeleteDialog = () => {
    setShowUserDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setUserDeleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/admin/user/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete user");

      showNotificationModal('success', 'User Deleted', 'The user has been successfully deleted.');
      handleCloseUserDeleteDialog();
      // Refresh the page data
      fetchUsers();
      fetchAdminData();
    } catch (err) {
      console.error("Failed to delete user:", err);
      showNotificationModal('error', 'Delete Failed', 'Failed to delete user. Please try again.');
    } finally {
      setUserDeleteLoading(false);
    }
  };

  const sendBanRequest = async (userId, reason) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BACKEND_URL}/api/admin/user/${userId}/ban`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || "Failed to ban user");
    }
  };

  const sendUnbanRequest = async (userId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BACKEND_URL}/api/admin/user/${userId}/unban`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || "Failed to unban user");
    }
  };

  const executeBanAction = async (user) => {
    setUserBanLoading(true);
    setUserBanTarget(user.id);
    let success = false;
    try {
      await sendBanRequest(user.id, 'Banned via admin dashboard');
      showNotificationModal('success', 'User Banned', `${user.name || 'User'} has been banned.`);
      fetchUsers();
      fetchAdminData();
      success = true;
    } catch (err) {
      showNotificationModal('error', 'Ban Failed', err.message || 'Unable to ban user.');
    } finally {
      setUserBanLoading(false);
      setUserBanTarget(null);
    }
    return success;
  };

  const handleInlineUnban = async (user) => {
    setUserBanLoading(true);
    setUserBanTarget(user.id);
    try {
      await sendUnbanRequest(user.id);
      showNotificationModal('success', 'User Unbanned', `${user.name || 'User'} has been unbanned.`);
      fetchUsers();
      fetchAdminData();
    } catch (err) {
      showNotificationModal('error', 'Unban Failed', err.message || 'Unable to unban user.');
    } finally {
      setUserBanLoading(false);
      setUserBanTarget(null);
    }
  };

  const handleBanClick = (user) => {
    setUserToBan(user);
    setShowBanConfirmDialog(true);
  };

  const handleCloseBanDialog = () => {
    setShowBanConfirmDialog(false);
    setUserToBan(null);
  };

  const handleConfirmBan = async () => {
    if (!userToBan) return;
    const success = await executeBanAction(userToBan);
    if (success) {
      handleCloseBanDialog();
    }
  };

  const openQuickAction = (type) => {
    setQuickActionModal(type);
  };

  const closeQuickAction = () => {
    setQuickActionModal(null);
    setAddUserForm({
      name: '',
      email: '',
      password: '',
      role: 'developer',
      company: '',
      address: '',
    });
    setBanUserForm({ userId: '', reason: '' });
    setBroadcastForm({ title: '', message: '', audience: 'all' });
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setQuickActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: addUserForm.name,
        email: addUserForm.email,
        password: addUserForm.password,
        role: addUserForm.role,
        company: addUserForm.company,
        address: addUserForm.address || null,
      };

      const res = await fetch(`${BACKEND_URL}/api/admin/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create user");

      showNotificationModal('success', 'User Created', 'The new user account has been created successfully.');
      closeQuickAction();
      fetchUsers();
      fetchAdminData();
    } catch (err) {
      console.error("Failed to create user:", err);
      showNotificationModal('error', 'Creation Failed', err.message || "Failed to create user. Please check input and try again.");
    } finally {
      setQuickActionLoading(false);
    }
  };

  const handleBanUserSubmit = async (e) => {
    e.preventDefault();
    if (!banUserForm.userId.trim()) {
      showNotificationModal('info', 'Missing User', 'Please provide a user ID or email.');
      return;
    }

    setQuickActionLoading(true);
    try {
      await sendBanRequest(banUserForm.userId, banUserForm.reason || 'Policy violation');
      showNotificationModal('success', 'User Banned', 'The user has been banned successfully.');
      closeQuickAction();
      fetchUsers();
      fetchAdminData();
    } catch (err) {
      console.error("Failed to ban user:", err);
      showNotificationModal('error', 'Ban Failed', err.message || 'Failed to ban user. Please try again.');
    } finally {
      setQuickActionLoading(false);
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastForm.message.trim()) {
      showNotificationModal('info', 'Missing Message', 'Please provide a broadcast message.');
      return;
    }

    setQuickActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/admin/broadcasts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(broadcastForm),
      });

      if (!res.ok) throw new Error("Failed to send broadcast");

      showNotificationModal('success', 'Broadcast Sent', 'Your message was sent to the selected audience.');
      closeQuickAction();
    } catch (err) {
      console.error("Failed to send broadcast:", err);
      showNotificationModal('error', 'Broadcast Failed', err.message || 'Failed to send broadcast. Please try again.');
    } finally {
      setQuickActionLoading(false);
    }
  };

  const handleGenerateReport = () => {
    setReportGenerating(true);
    try {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        showNotificationModal('info', 'Unavailable', 'Report generation is only available in the browser.');
        setReportGenerating(false);
        return;
      }
      const now = new Date();
      const reportRows = [
        ['Admin Dashboard Report'],
        ['Generated At', now.toLocaleString()],
        [],
        ['Metric', 'Value'],
        ['Total Users', stats.totalUsers || users.length || 0],
        ['Developers', stats.developers || 0],
        ['Investors', stats.investors || 0],
        ['Total Projects', stats.totalProjects || projects.length || 0],
        ['Active Projects', stats.activeProjects || 0],
        ['Total Revenue', stats.totalRevenue || 0],
        [],
        ['Recent Users'],
        ['Name', 'Email', 'Role', 'Status'],
        ...recentUsers.slice(0, 10).map((user) => {
          const status = user.status || (user.verified ? 'Active' : 'Pending');
          return [
            user.name || '',
            user.email || '',
            user.role || '',
            status,
          ];
        }),
      ];

      const csvContent = reportRows
        .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admin-report-${now.toISOString()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotificationModal('success', 'Report Ready', 'The admin report has been downloaded.');
      closeQuickAction();
    } catch (err) {
      console.error("Failed to generate report:", err);
      showNotificationModal('error', 'Report Failed', 'Failed to generate report. Please try again.');
    } finally {
      setReportGenerating(false);
    }
  };

  const handleExportData = () => {
    setExportingData(true);
    try {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        showNotificationModal('info', 'Unavailable', 'Exporting data is only available in the browser.');
        setExportingData(false);
        return;
      }

      const now = new Date();
      const rows = [
        ['Admin Export'],
        ['Generated At', now.toLocaleString()],
        [],
        ['STATISTICS'],
        ['Metric', 'Value'],
        ['Total Users', stats.totalUsers || users.length || 0],
        ['Developers', stats.developers || 0],
        ['Investors', stats.investors || 0],
        ['Total Projects', stats.totalProjects || projects.length || 0],
        ['Active Projects', stats.activeProjects || 0],
        ['Total Revenue', stats.totalRevenue || 0],
        [],
        ['RECENT PROJECTS'],
        ['Title', 'Developer', 'Budget', 'Status'],
        ...recentProjects.slice(0, 10).map(project => [
          project.title || '',
          project.developer_id ? 'Assigned' : 'Unassigned',
          project.budget != null ? project.budget : '',
          project.status || '',
        ]),
        [],
        ['RECENT USERS'],
        ['Name', 'Email', 'Role', 'Status'],
        ...recentUsers.slice(0, 10).map(user => {
          const status = user.status || (user.verified ? 'Active' : 'Pending');
          return [
            user.name || '',
            user.email || '',
            user.role || '',
            status,
          ];
        }),
      ];

      const csvContent = rows
        .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admin-export-${now.toISOString()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotificationModal('success', 'Export Ready', 'Dashboard data has been exported.');
    } catch (err) {
      console.error('Failed to export data:', err);
      showNotificationModal('error', 'Export Failed', 'Could not export data. Please try again.');
    } finally {
      setExportingData(false);
    }
  };

  const handleRefresh = () => {
    if (selectedTab === 'users') {
      fetchUsers();
    } else if (selectedTab === 'projects') {
      fetchProjects();
    } else {
      fetchAdminData();
    }
  };

  const navigateToProfile = () => {
    if (navigateToPage) {
      navigateToPage('profile');
    } else {
      window.history.pushState(null, null, '/profile');
    }
  };

  // Show loading state
  if (loading && selectedTab === 'overview' && !stats.totalUsers) {
    return (
      <div className="dashboard-admin">
        <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
          <RefreshCw className="w-8 h-8 animate-spin" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: '1rem' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-admin">
      {/* Header */}
      <section className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <div>
              <h1 className="admin-title">
                Admin <span className="text-brand">Dashboard</span>
              </h1>
              <p className="admin-subtitle">
                Manage users, projects, and platform operations
              </p>
            </div>
            <div className="admin-header-actions">
              <button className="btn btn-outline" onClick={handleExportData} disabled={exportingData}>
                {exportingData ? (
                  <>
                    <div className="spinner-small" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Data
                  </>
                )}
              </button>
              <button className="btn btn-outline" onClick={navigateToProfile}>
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button className="btn btn-primary" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="admin-content">
        <div className="container">
          
          {/* Stats Grid - Only show on overview tab */}
          {selectedTab === 'overview' && (
            <div className="admin-stats-grid">
              
              <div className="admin-stat-card stat-card-primary">
                <div className="stat-icon">
                  <Users className="w-6 h-6" />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Total Users</div>
                  <div className="stat-value">{(stats.totalUsers || 0).toLocaleString()}</div>
                  <div className="stat-detail">
                    <span className="stat-highlight">{(stats.developers || 0)}</span> developers, <span className="stat-highlight">{(stats.investors || 0)}</span> investors
                  </div>
                </div>
                {/* <div className="stat-trend stat-trend-up">
                  <TrendingUp className="w-4 h-4" />
                  <span>Active</span>
                </div> */}
              </div>

              <div className="admin-stat-card stat-card-success">
                <div className="stat-icon">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value">${((stats.totalRevenue || 0) / 1000).toFixed(1)}K</div>
                  <div className="stat-detail">
                    <span className="stat-highlight">{(stats.completedTransactions || 0)}</span> transactions
                  </div>
                </div>
                {/* <div className="stat-trend stat-trend-up">
                  <TrendingUp className="w-4 h-4" />
                  <span>{stats.pendingPayments || 0} pending</span>
                </div> */}
              </div>

              <div className="admin-stat-card stat-card-warning">
                <div className="stat-icon">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Total Projects</div>
                  <div className="stat-value">{(stats.totalProjects || 0).toLocaleString()}</div>
                  <div className="stat-detail">
                    <span className="stat-highlight">{(stats.activeProjects || 0)}</span> active
                  </div>
                </div>
                {/* <div className="stat-trend stat-trend-up">
                  <TrendingUp className="w-4 h-4" />
                  <span>Growing</span>
                </div> */}
              </div>

              <div className="admin-stat-card stat-card-info">
                <div className="stat-icon">
                  <Target className="w-6 h-6" />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Disputes</div>
                  <div className="stat-value">{(stats.totalDisputes || 0)}</div>
                  <div className="stat-detail">
                    <span className="stat-highlight">{(stats.activeDisputes || 0)}</span> active
                  </div>
                </div>
                {/* <div className="stat-trend stat-trend-up">
                  <TrendingUp className="w-4 h-4" />
                  <span>Live</span>
                </div> */}
              </div>

            </div>
          )}

          {/* Tabs */}
          <div className="admin-tabs">
          
            <button
              onClick={() => setSelectedTab('overview')}
              className={`admin-tab ${selectedTab === 'overview' ? 'admin-tab-active' : ''}`}
            >
              <Activity className="w-4 h-4" />
              Overview
            </button>
          
            <button
              onClick={() => setSelectedTab('users')}
              className={`admin-tab ${selectedTab === 'users' ? 'admin-tab-active' : ''}`}
            >
              <Users className="w-4 h-4" />
              Users
            </button>
          
            <button
              onClick={() => setSelectedTab('projects')}
              className={`admin-tab ${selectedTab === 'projects' ? 'admin-tab-active' : ''}`}
            >
              <Briefcase className="w-4 h-4" />
              Projects
            </button>
          
            <button
              onClick={() => setSelectedTab('disputes')}
              className={`admin-tab ${selectedTab === 'disputes' ? 'admin-tab-active' : ''}`}
            >
              <AlertTriangle className="w-4 h-4" />
              Disputes
            </button>
        
          </div>

          {/* Error Display */}
          {error && (
            <div style={{ padding: '1rem', background: '#fee', border: '1px solid #fcc', borderRadius: '8px', marginBottom: '1rem' }}>
              <AlertCircle className="w-4 h-4" style={{ display: 'inline', marginRight: '0.5rem' }} />
              {error}
            </div>
          )}

          {/* Main Layout */}
          <div className="admin-layout">
            {/* Left Column */}
            <div className="admin-main">
              
              {/* OVERVIEW TAB */}
              {selectedTab === 'overview' && (
                <>
                  {/* Recent Projects */}
                  <div className="admin-section">
                    <div className="section-header-row">
                      <h2 className="section-title">Recent Projects</h2>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelectedTab('projects')}>
                        View All
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Project</th>
                            <th>Developer</th>
                            <th>Budget</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentProjects.slice(0, 5).map((project) => (
                            <tr key={project.id}>
                              <td>
                                <div className="table-cell-main">
                                  {project.title}
                                  {project.featured && <AlertCircle className="w-4 h-4 text-warning-600 ml-2" />}
                                </div>
                              </td>

                              <td>
                                <span className={project.developer_id ? "" : "text-secondary"}>
                                  {project.developer_id ? "Assigned" : "Unassigned"}
                                </span>
                              </td>

                              <td className="table-cell-currency">
                                ${(project.budget || 0).toLocaleString()}
                              </td>

                              <td>
                                <span className={`badge ${getStatusBadge(project.status)}`}>
                                  {project.status}
                                </span>
                              </td>

                              <td>{formatDate(project.created_at)}</td>

                              <td>
                                <div className="table-actions">
                                  <button
                                    className="action-btn"
                                    onClick={() => fetchProjectDetails(project.id)}
                                    disabled={detailsLoading}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>

                                      {/* ✅ NEW: Edit Button */}
                                    <button
                                      className="action-btn action-btn-edit"
                                      onClick={() => handleEditClick(project)}
                                      title="Edit Project"
                                    >
                                      <Settings className="w-4 h-4" />
                                    </button>


                                  <button
                                    className="action-btn action-btn-delete"
                                    onClick={() => handleDeleteClick(project)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>

                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent Users */}
                  <div className="admin-section">
                    <div className="section-header-row">
                      <h2 className="section-title">Recent Users</h2>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelectedTab('users')}>
                        View All
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="users-grid">
                      {recentUsers.slice(0, 6).map((user) => {
                        const userStatus = (user.status || (user.verified ? 'active' : 'pending')).toLowerCase();
                        const statusLabel = userStatus.charAt(0).toUpperCase() + userStatus.slice(1);
                        const isBanned = userStatus === 'banned';
                        return (
                          <div key={user.id} className="user-card-admin">

                            <div className="user-card-header">
                              <div className="user-avatar-large">
                                {user.name?.charAt(0) || '?'}
                              </div>

                              <div className="user-card-badges">
                                <span className={`badge ${getStatusBadge(userStatus)}`}>
                                  {statusLabel}
                                </span>
                              </div>
                            </div>

                            <div className="user-card-body">
                              <h3 className="user-card-name">{user.name}</h3>
                              <p className="user-card-email">{user.email}</p>

                              <div className="user-card-role">
                                <Award className="w-3 h-3" />
                                {user.role}
                              </div>

                              <div className="user-card-stats">
                                <div className="user-stat">
                                  <div className="user-stat-label">Projects</div>
                                  <div className="user-stat-value">{user.projects_completed || 0}</div>
                                </div>

                                <div className="user-stat">
                                  <div className="user-stat-label">
                                    {user.role === "developer" ? "Earned" : "Spent"}
                                  </div>
                                  <div className="user-stat-value">
                                    ${((user.total_earnings || user.total_spent || 0) / 1000).toFixed(1)}K
                                  </div>
                                </div>

                                <div className="user-stat">
                                  <div className="user-stat-label">Rating</div>
                                  <div className="user-stat-value">{(user.avg_rating || 0).toFixed(1)}★</div>
                                </div>
                              </div>
                            </div>

                            <div className="user-card-footer">
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => fetchUserDetails(user.id)}
                                disabled={userDetailsLoading}
                              >
                                <Eye className="w-3 h-3" /> View
                              </button>

                                 <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleUserDeleteClick(user)}
                                disabled={userDeleteLoading}
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>

                              <button
                                className={`btn ${isBanned ? 'btn-success' : 'btn-warning'} btn-sm`}
                                onClick={() => (isBanned ? handleInlineUnban(user) : handleBanClick(user))}
                                disabled={userBanLoading && userBanTarget === user.id}
                              >
                                {isBanned ? 'Unban' : 'Ban'}
                              </button>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* USERS TAB */}
              {selectedTab === 'users' && (
                <div className="admin-section">
                  <div className="section-header-row">
                    <h2 className="section-title">All Users ({users.length})</h2>
                    <div className="admin-search">
                      <Search className="admin-search-icon" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                      />
                    </div>
                  </div>

                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <RefreshCw className="w-6 h-6 animate-spin" style={{ margin: '0 auto' }} />
                      <p>Loading users...</p>
                    </div>
                  ) : (
                    <div className="users-grid">
                      {users
                        .filter(user => 
                          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((user) => {
                          const userStatus = (user.status || (user.verified ? 'active' : 'pending')).toLowerCase();
                          const statusLabel = userStatus.charAt(0).toUpperCase() + userStatus.slice(1);
                          const isBanned = userStatus === 'banned';
                          return (
                            <div key={user.id} className="user-card-admin">

                              <div className="user-card-header">
                                <div className="user-avatar-large">
                                  {user.name?.charAt(0) || '?'}
                                </div>

                                <div className="user-card-badges">
                                  <span className={`badge ${getStatusBadge(userStatus)}`}>
                                    {statusLabel}
                                  </span>
                                </div>
                              </div>

                              <div className="user-card-body">
                                <h3 className="user-card-name">{user.name}</h3>
                                <p className="user-card-email">{user.email}</p>

                                <div className="user-card-role">
                                  <Award className="w-3 h-3" />
                                  {user.role}
                                </div>

                                <div className="user-card-stats">
                                  <div className="user-stat">
                                    <div className="user-stat-label">Projects</div>
                                    <div className="user-stat-value">{user.projects_completed || 0}</div>
                                  </div>

                                  <div className="user-stat">
                                    <div className="user-stat-label">
                                      {user.role === "developer" ? "Earned" : "Spent"}
                                    </div>
                                    <div className="user-stat-value">
                                      ${((user.total_earnings || user.total_spent || 0) / 1000).toFixed(1)}K
                                    </div>
                                  </div>

                                  <div className="user-stat">
                                    <div className="user-stat-label">Rating</div>
                                    <div className="user-stat-value">{(user.avg_rating || 0).toFixed(1)}★</div>
                                  </div>
                                </div>
                              </div>

                              <div className="user-card-footer">
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => fetchUserDetails(user.id)}
                                  disabled={userDetailsLoading}
                                >
                                  <Eye className="w-3 h-3" /> View
                                </button>
                              
                               
                                
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleUserDeleteClick(user)}
                                  disabled={userDeleteLoading}
                                >
                                  <Trash2 className="w-3 h-3" /> Delete
                                </button>

                                 <button
                                  className={`btn ${isBanned ? 'btn-success' : 'btn-warning'} btn-sm`}
                                  onClick={() => (isBanned ? handleInlineUnban(user) : handleBanClick(user))}
                                  disabled={userBanLoading && userBanTarget === user.id}
                                >
                                  {isBanned ? 'Unban' : 'Ban'}
                                </button>

                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* PROJECTS TAB */}
              {selectedTab === 'projects' && (
                <div className="admin-section">
                  <div className="section-header-row">
                    <h2 className="section-title">All Projects ({projects.length})</h2>
                    <div className="admin-search">
                      <Search className="admin-search-icon" />
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                      />
                    </div>
                  </div>

                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <RefreshCw className="w-6 h-6 animate-spin" style={{ margin: '0 auto' }} />
                      <p>Loading projects...</p>
                    </div>
                  ) : (
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Project</th>
                            <th>Category</th>
                            <th>Budget</th>
                            <th>Status</th>
                            {/* <th>Bids</th> */}
                            <th>Created</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects
                            .filter(project => 
                              project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              project.category?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((project) => (
                            <tr key={project.id}>
                              <td>
                                <div className="table-cell-main">
                                  {project.title}
                                  {project.featured && <AlertCircle className="w-4 h-4 text-warning-600 ml-2" />}
                                </div>
                              </td>

                              <td>{project.category || 'N/A'}</td>

                              <td className="table-cell-currency">
                                ${(project.budget || 0).toLocaleString()}
                              </td>

                              <td>
                                <span className={`badge ${getStatusBadge(project.status)}`}>
                                  {project.status}
                                </span>
                              </td>

                              {/* <td>{project.bids_count || 0}</td> */}

                              <td>{formatDate(project.created_at)}</td>

                              <td>
                                <div className="table-actions">
                                  <button
                                    className="action-btn"
                                    onClick={() => fetchProjectDetails(project.id)}
                                    disabled={detailsLoading}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="action-btn action-btn-delete"
                                    onClick={() => handleDeleteClick(project)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* DISPUTES TAB - ✅ NEW */}
              {selectedTab === 'disputes' && (
                <div className="admin-section" style={{ padding: 0 }}>
                  <AdminDisputes />
                </div>
              )}

            </div>

            {/* Right Sidebar - Only show on overview */}
          
              <aside className="admin-sidebar">
              
                {/* Platform Activity */}
                {/* <div className="sidebar-card">
                  <div className="sidebar-card-header">
                    <Activity className="w-5 h-5 text-primary-600" />
                    <h3>Platform Activity</h3>
                  </div>
                  <div className="sidebar-card-body">
                    <div className="activity-list">
                      {activity.length > 0 ? (
                        activity.map((item, index) => {
                          const Icon = item.icon ? lucideIcons[item.icon] : Activity;

                          return (
                            <div key={index} className="activity-item-admin">
                              <div className={`activity-icon activity-icon-${item.color || "primary"}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="activity-content">
                                <div className="activity-message">{item.message}</div>
                                <div className="activity-time">{item.time}</div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>No recent activity</p>
                      )}
                    </div>
                  </div>
                </div> */}

                {/* System Health */}
                <div className="sidebar-card">
                  <div className="sidebar-card-header">
                    <Shield className="w-5 h-5 text-success-600" />
                    <h3>System Health</h3>
                  </div>
                  <div className="sidebar-card-body">
                    <div className="health-metrics">
                      <div className="health-metric">
                        <div className="health-metric-header">
                          <span>Server Status</span>
                          <CheckCircle2 className="w-4 h-4 text-success-600" />
                        </div>
                        <div className="health-metric-bar">
                          <div className="health-metric-fill" style={{ width: '100%' }} />
                        </div>
                        <div className="health-metric-value">100% Uptime</div>
                      </div>

                      <div className="health-metric">
                        <div className="health-metric-header">
                          <span>Database</span>
                          <CheckCircle2 className="w-4 h-4 text-success-600" />
                        </div>
                        <div className="health-metric-bar">
                          <div className="health-metric-fill" style={{ width: '98%' }} />
                        </div>
                        <div className="health-metric-value">98% Healthy</div>
                      </div>

                      <div className="health-metric">
                        <div className="health-metric-header">
                          <span>API Response</span>
                          <CheckCircle2 className="w-4 h-4 text-success-600" />
                        </div>
                        <div className="health-metric-bar">
                          <div className="health-metric-fill" style={{ width: '95%' }} />
                        </div>
                        <div className="health-metric-value">145ms Avg</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="sidebar-card">
                  <div className="sidebar-card-header">
                    <Zap className="w-5 h-5 text-warning-600" />
                    <h3>Quick Actions</h3>
                  </div>
                  <div className="sidebar-card-body">
                    <div className="quick-actions-admin">
                      <button
                        className="quick-action-btn-admin"
                        onClick={() => openQuickAction('addUser')}
                      >
                        <Users className="w-4 h-4" />
                        <span>Add User</span>
                      </button>
                      <button
                        className="quick-action-btn-admin"
                        onClick={() => openQuickAction('banUser')}
                      >
                        <Ban className="w-4 h-4" />
                        <span>Ban User</span>
                      </button>
                      <button
                        className="quick-action-btn-admin"
                        onClick={() => openQuickAction('broadcast')}
                      >
                        <Globe className="w-4 h-4" />
                        <span>System Broadcast</span>
                      </button>
                      <button
                        className="quick-action-btn-admin payout-action-btn"
                        onClick={() => navigateToPage('admin-payouts')}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Manage Payouts</span>
                      </button>
                    </div>
                  </div>
                </div>

              </aside>
            
          </div>
        </div>
      </section>

      {quickActionModal === 'addUser' && (
        <div className="modal-overlay" onClick={closeQuickAction}>
          <div className="modal-content modal-large add-user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New User</h2>
              <button className="modal-close" onClick={closeQuickAction}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUserSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addUserForm.name}
                      onChange={(e) => setAddUserForm({ ...addUserForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={addUserForm.email}
                      onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Temporary Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={addUserForm.password}
                      onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
                      placeholder="Provide an initial password"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      className="form-input"
                      value={addUserForm.role}
                      onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value })}
                    >
                      <option value="developer">Developer</option>
                      <option value="investor">Investor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addUserForm.company}
                      onChange={(e) => setAddUserForm({ ...addUserForm, company: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group form-group-full">
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-textarea"
                      rows="2"
                      value={addUserForm.address}
                      onChange={(e) => setAddUserForm({ ...addUserForm, address: e.target.value })}
                      placeholder="Optional mailing address"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeQuickAction}
                  disabled={quickActionLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={quickActionLoading}>
                  {quickActionLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {quickActionModal === 'banUser' && (
        <div className="modal-overlay" onClick={closeQuickAction}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Ban User</h2>
              <button className="modal-close" onClick={closeQuickAction}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBanUserSubmit}>
              <div className="modal-body">
              
                <div className="form-group">
                  <label className="form-label">User ID or Email</label>
                  <input
                    type="text"
                    className="form-input"
                    value={banUserForm.userId}
                    onChange={(e) => setBanUserForm({ ...banUserForm, userId: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={banUserForm.reason}
                    onChange={(e) => setBanUserForm({ ...banUserForm, reason: e.target.value })}
                    placeholder="Provide reason for ban"
                  />
                </div>

              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeQuickAction}
                  disabled={quickActionLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" disabled={quickActionLoading}>
                  {quickActionLoading ? 'Banning...' : 'Ban User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {quickActionModal === 'broadcast' && (
        <div className="modal-overlay" onClick={closeQuickAction}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">System Broadcast</h2>
              <button className="modal-close" onClick={closeQuickAction}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBroadcastSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Audience</label>
                  <select
                    className="form-input"
                    value={broadcastForm.audience}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, audience: e.target.value })}
                  >
                    <option value="all">All Users</option>
                    <option value="developers">Developers</option>
                    <option value="investors">Investors</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-textarea"
                    rows="4"
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeQuickAction}
                  disabled={quickActionLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={quickActionLoading}>
                  {quickActionLoading ? 'Sending...' : 'Send Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Project Details Modal */}
      {showProjectDetails && selectedProjectDetails && (
                      <div className="modal-overlay" onClick={handleCloseDetails}>
                        <div className="modal-content project-details-modal" onClick={(e) => e.stopPropagation()}>
                        
                          <div className="modal-header">
                            <h2 className="modal-title">{selectedProjectDetails.title}</h2>
                            <button className="modal-close" onClick={handleCloseDetails}>
                              ×
                            </button>
                          </div>
              
                          <div className="modal-body">
                          
              
              
                            {/* Project Header */}
                            <div className="project-details-header">
                              <div className="project-client-info">
                                <div className="client-avatar-large">
                                  {selectedProjectDetails.developer?.company ? selectedProjectDetails.developer.company[0] : 'N/A'}
                                </div>
                                <div>
                                  <h3 className="client-company">
                                    {selectedProjectDetails.developer?.company || 'Unknown Company'}
                                    {selectedProjectDetails.verified && (
                                      <CheckCircle2 className="w-5 h-5 text-success-600 inline ml-2" />
                                    )}
                                  </h3>
                                  <div className="client-meta">
                                    <MapPin className="w-4 h-4" />
                                    <span>{selectedProjectDetails.location}</span>
                                    <span className="separator">•</span>
                                    <Star className="w-4 h-4 fill-warning-400 text-warning-400" />
                                    <span>{selectedProjectDetails.rating} ({selectedProjectDetails.reviews_count} reviews)</span>
                                  </div>
              
                                  {selectedProjectDetails.category && (
                                    <div className="mt-2 badge-group">
                                      
                                      <span className="badge badge-primary">
                                        {selectedProjectDetails.category}
                                      </span>
              
                                      {selectedProjectDetails.status !== "fixed_price" && (
                                        <>
                                          <span className="badge badge-primary">
                                            Started Bid: ${selectedProjectDetails.lowest_bid}
                                          </span>
              
                                          <span className="badge badge-primary">
                                            Current Bid: {
                                              (selectedProjectDetails.highest_bid != null &&
                                              selectedProjectDetails.lowest_bid != null &&
                                              selectedProjectDetails.highest_bid > selectedProjectDetails.lowest_bid)
                                                ? `$${selectedProjectDetails.highest_bid.toLocaleString()}`
                                                : "No bids yet"
                                            }
                                          </span>
                                        </>
                                      )}
              
                                    </div>
                                  )}
              
                                </div>
                              </div>
              
                              {selectedProjectDetails.featured && (
                                <div className="project-badge-featured-large">
                                  <Star className="w-4 h-4 fill-current" />
                                  Featured Project
                                </div>
                              )}
                            </div>
              
                            {/* Project Stats */}
                            <div className="project-details-stats">
                              
                              <div className="stat-item">
                                <DollarSign className="stat-icon-market text-success-600" />
                                <div>
                                  <div className="stat-value">${selectedProjectDetails.budget != null ? selectedProjectDetails.budget.toLocaleString() : 'N/A'}</div>
                                  <div className="stat-label">Budget</div>
                                </div>
                              </div>
              
                              <div className="stat-item">
                                <Clock className="stat-icon-market text-secondary" />
                                <div>
                                  <div className="stat-value">
                                    {selectedProjectDetails.created_at
                                      ? (() => {
                                          const now = new Date();
                                          const created = new Date(selectedProjectDetails.created_at);
                                          const diffMs = now - created;
                                          const diffMins = Math.floor(diffMs / 60000);
                                          const diffHours = Math.floor(diffMs / 3600000);
                                          const diffDays = Math.floor(diffMs / 86400000);
                                          
                                          if (diffMins < 60) {
                                            return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
                                          } else if (diffHours < 24) {
                                            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                                          } else if (diffDays < 7) {
                                            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
                                          } else {
                                            return created.toLocaleDateString('en-US', { 
                                              month: 'short', 
                                              day: 'numeric',
                                              year: created.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
                                            });
                                          }
                                        })()
                                      : 'Recently'}
                                  </div>
                                  <div className="stat-label">Posted</div>
                                </div>
                              </div>
              
                              {selectedProjectDetails.status !== 'fixed_price' && (
                                <div className="stat-item">
                                  <Users className="stat-icon-market text-secondary" />
                                  <div>
                                    <div className="stat-value">{selectedProjectDetails.bids_count}</div>
                                    <div className="stat-label">Bids</div>
                                  </div>
                                </div>
                              )}

                            </div>

                            {/* Description */}
                            <div className="project-details-section">
                              <h3 className="section-title">Project Description</h3>
                              <p className="section-content">{selectedProjectDetails.description}</p>
                            </div>
              
                            {/* Tech Stack */}
                            {selectedProjectDetails.tech_stack && selectedProjectDetails.tech_stack.length > 0 && (
                              <div className="project-details-section">
                                <h3 className="section-title">Required Skills & Technologies</h3>
                                <div className="tech-stack-grid">
                                  {selectedProjectDetails.tech_stack.map((tech, index) => (
                                    <span key={index} className="badge badge-primary">
                                      <Code className="w-3 h-3" />
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
              
                            {/* Requirements */}
                            {selectedProjectDetails.requirements && (
                              <div className="project-details-section">
                                <h3 className="section-title">Project Requirements</h3>
                                <p className="section-content">{selectedProjectDetails.requirements}</p>
                              </div>
                            )}
              
                            {/* ✅ NEW: Project Images Gallery */}
                            {selectedProjectDetails.images && selectedProjectDetails.images.length > 0 && (
                              <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.5rem',
                                  fontSize: '1.125rem',
                                  fontWeight: 600,
                                  marginBottom: '1rem'
                                }}>
                                  <ImageIcon style={{ width: '20px', height: '20px', color: '#6366f1' }} />
                                  Project Images
                                </h3>
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                  gap: '1rem'
                                }}>
                                  {selectedProjectDetails.images.map((img, idx) => (
                                    <div key={idx} style={{
                                      aspectRatio: '1',
                                      borderRadius: '12px',
                                      overflow: 'hidden',
                                      border: '2px solid #e2e8f0',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.borderColor = '#6366f1';
                                      e.currentTarget.style.transform = 'translateY(-4px)';
                                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor = '#e2e8f0';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                      e.currentTarget.style.boxShadow = 'none';
                                    }}
                                    onClick={(e) => {
                                      // Toggle fullscreen
                                      if (e.currentTarget.classList.contains('fullscreen')) {
                                        e.currentTarget.classList.remove('fullscreen');
                                        e.currentTarget.style.position = 'relative';
                                        e.currentTarget.style.width = 'auto';
                                        e.currentTarget.style.height = 'auto';
                                        e.currentTarget.style.zIndex = 'auto';
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.padding = '0';
                                        e.currentTarget.querySelector('img').style.objectFit = 'cover';
                                      } else {
                                        e.currentTarget.classList.add('fullscreen');
                                        e.currentTarget.style.position = 'fixed';
                                        e.currentTarget.style.top = '0';
                                        e.currentTarget.style.left = '0';
                                        e.currentTarget.style.width = '100vw';
                                        e.currentTarget.style.height = '100vh';
                                        e.currentTarget.style.zIndex = '10000';
                                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.95)';
                                        e.currentTarget.style.padding = '2rem';
                                        e.currentTarget.querySelector('img').style.objectFit = 'contain';
                                      }
                                    }}
                                    >
                                      <img
                                        src={getImageUrl(img)}
                                        alt={`Project image ${idx + 1}`}
                                        style={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover',
                                          transition: 'transform 0.2s'
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
              
                          </div>
                            
                        </div>
                      </div>
       )}
      

      {/* Edit Project Modal - WITH IMAGE UPLOAD */}
      {showEditDialog && editingProject && (
                    <div className="modal-overlay" onClick={() => setShowEditDialog(false)}>
                      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="modal-header">
                          <h2 className="modal-title">Edit Project</h2>
                          <button className="modal-close" onClick={() => setShowEditDialog(false)}>
                            <X className="w-5 h-5" />
                          </button>
                        </div>
            
                        <form onSubmit={handleUpdateProject}>
                          <div className="modal-body">
                            
                            {/* ✅ NEW: Image Management Section */}
                            <div style={{ marginBottom: '2rem' }}>
                              <label style={{ 
                                display: 'block', 
                                fontSize: '0.875rem', 
                                fontWeight: 600, 
                                marginBottom: '0.5rem',
                                color: '#1f2937'
                              }}>
                                Project Images (Max 5 total)
                              </label>
      
                              {/* Existing Images */}
                              {editForm.images && editForm.images.length > 0 && (
                                <div>
                                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                    Current Images:
                                  </p>
                                  <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: '1rem',
                                    marginBottom: '1rem'
                                  }}>
                                    {editForm.images.map((img, index) => (
                                      <div key={index} style={{
                                        position: 'relative',
                                        aspectRatio: '1',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: '2px solid #e2e8f0'
                                      }}>
                                        <img
                                          src={getImageUrl(img)}
                                          alt={`Existing ${index + 1}`}
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                          }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeExistingImage(index)}
                                          style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(239, 68, 68, 0.9)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgb(220, 38, 38)';
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                                            e.currentTarget.style.transform = 'scale(1)';
                                          }}
                                        >
                                          <Trash2 style={{ width: '16px', height: '16px' }} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
      
                              {/* Add New Images */}
                              {((editForm.images || []).length + editImages.length < 5) && (
                                <>
                                  <input
                                    type="file"
                                    id="edit-image-upload"
                                    accept="image/jpeg,image/png"
                                    multiple
                                    onChange={handleEditImageUpload}
                                    style={{ display: 'none' }}
                                  />
                                  
                                  <label 
                                    htmlFor="edit-image-upload"
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: '1.5rem',
                                      border: '2px dashed #cbd5e1',
                                      borderRadius: '12px',
                                      cursor: 'pointer',
                                      background: '#ffffff',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.borderColor = '#6366f1';
                                      e.currentTarget.style.background = '#f0f9ff';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor = '#cbd5e1';
                                      e.currentTarget.style.background = '#ffffff';
                                    }}
                                  >
                                    <Upload style={{ width: '24px', height: '24px', color: '#6366f1', marginBottom: '0.5rem' }} />
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>
                                      Add more images
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                      PNG or JPEG (Max 5MB each)
                                    </span>
                                  </label>
                                </>
                              )}
      
                              {/* New Images Preview */}
                              {editImages.length > 0 && (
                                <div>
                                  <p style={{ fontSize: '0.875rem', color: '#22c55e', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    New Images (will be uploaded on save):
                                  </p>
                                  <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: '1rem'
                                  }}>
                                    {editImages.map((image, index) => (
                                      <div key={index} style={{
                                        position: 'relative',
                                        aspectRatio: '1',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: '2px solid #22c55e'
                                      }}>
                                        <img 
                                          src={image.preview} 
                                          alt={`New ${index + 1}`}
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                          }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeEditImage(index)}
                                          style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(239, 68, 68, 0.9)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgb(220, 38, 38)';
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                                            e.currentTarget.style.transform = 'scale(1)';
                                          }}
                                        >
                                          <Trash2 style={{ width: '16px', height: '16px' }} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
      
                            <div className="form-grid">
                              
                              {/* Row 1: Project Title - Full Width */}
                              <div className="form-group form-group-full">
                                <label className="form-label">Project Title *</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                  required
                                  placeholder="Enter a clear, descriptive project title"
                                />
                              </div>
      
            
                              {/* Row 2: Category & Budget */}
                              <div className="form-group">
                                <label className="form-label">Category *</label>
                                <select
                                  className="form-select"
                                  value={editForm.category}
                                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                  required
                                >
                                  <option value="ml">Machine Learning</option>
                                  <option value="nlp">NLP</option>
                                  <option value="cv">Computer Vision</option>
                                  <option value="automation">Automation</option>
                                </select>
                              </div>
            
                              <div className="form-group">
                                <label className="form-label">Budget (USD) *</label>
                                <input
                                  type="number"
                                  className="form-input"
                                  min="0"
                                  step="100"
                                  value={editForm.budget}
                                  onChange={(e) => setEditForm({...editForm, budget: e.target.value})}
                                  required
                                  placeholder="5000"
                                  disabled={editingProject.status === "open"}
                                />
                              </div>
            
                              {/* Row 3: Status */}
                              <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                  className="form-select"
                                  value={editForm.status}
                                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                  disabled={editForm.status === "open"}
                                >
                                  <option value="fixed_price">Open</option>
                                  <option value="closed">Close</option>
                                </select>
                              </div>
            
                              {/* Row 4: Location & Tech Stack */}
                              <div className="form-group">
                                <label className="form-label">Location</label>
                                <div className="multi-select-container">
                                  <div 
                                    className="multi-select-input"
                                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                                  >
                                    {editForm.location === '' ? (
                                      <span className="text-tertiary">Select location...</span>
                                    ) : (
                                      <span>{editForm.location}</span>
                                    )}
                                    <MapPin className="w-4 h-4 text-secondary ml-auto" />
                                  </div>
                                  
                                  {showLocationDropdown && (
                                    <div className="multi-select-dropdown">
                                      {locationOptions.map((location, index) => (
                                        <div
                                          key={index}
                                          className={`multi-select-option ${editForm.location === location ? 'selected' : ''}`}
                                          onClick={() => {
                                            setEditForm({...editForm, location});
                                            setShowLocationDropdown(false);
                                          }}
                                        >
                                          <MapPin className="w-4 h-4 text-secondary" />
                                          <span>{location}</span>
                                          {editForm.location === location && (
                                            <CheckCircle2 className="w-4 h-4 text-primary-600 ml-auto" />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
            
                              <div className="form-group">
                                <label className="form-label">Tech Stack * <span className="label-hint">(Select multiple)</span></label>
                                <div className="multi-select-container">
                                  <div 
                                    className="multi-select-input"
                                    onClick={() => setShowTechDropdown(!showTechDropdown)}
                                  >
                                    {editForm.tech_stack.length === 0 ? (
                                      <span className="text-tertiary">Select technologies...</span>
                                    ) : (
                                      <div className="selected-items">
                                        {editForm.tech_stack.map((tech, index) => (
                                          <span key={index} className="selected-item-tag">
                                            {tech}
                                            <X 
                                              className="w-3 h-3 ml-1 cursor-pointer" 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                removeTech(tech);
                                              }}
                                            />
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    <Filter className="w-4 h-4 text-secondary ml-auto" />
                                  </div>
                                  
                                  {showTechDropdown && (
                                    <div className="multi-select-dropdown">
                                      {techStackOptions.map((tech, index) => (
                                        <div
                                          key={index}
                                          className={`multi-select-option ${editForm.tech_stack.includes(tech) ? 'selected' : ''}`}
                                          onClick={() => toggleTechStack(tech)}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={editForm.tech_stack.includes(tech)}
                                            onChange={() => {}}
                                            className="multi-select-checkbox"
                                          />
                                          <span>{tech}</span>
                                          {editForm.tech_stack.includes(tech) && (
                                            <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <small className="form-help">Select at least one technology</small>
                              </div>
            
                              {/* Row 5: Description - Full Width */}
                              <div className="form-group form-group-full">
                                <label className="form-label">Description *</label>
                                <textarea
                                  className="form-textarea"
                                  rows="4"
                                  value={editForm.description}
                                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                  required
                                  placeholder="Provide a detailed description of your project, goals, and expectations..."
                                />
                              </div>
            
                              {/* Row 6: Requirements - Full Width */}
                              <div className="form-group form-group-full">
                                <label className="form-label">Requirements</label>
                                <textarea
                                  className="form-textarea"
                                  rows="3"
                                  value={editForm.requirements}
                                  onChange={(e) => setEditForm({...editForm, requirements: e.target.value})}
                                  placeholder="List specific requirements, skills needed, or deliverables..."
                                />
                              </div>
                            </div>
                          </div>
            
                          <div className="modal-footer">
                            <button 
                              type="button" 
                              className="btn btn-outline"
                              onClick={() => setShowEditDialog(false)}
                              disabled={loading || uploadingEditImages}
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit" 
                              className="btn btn-primary"
                              disabled={loading || uploadingEditImages}
                            >
                              {loading || uploadingEditImages ? (
                                <>
                                  <div className="spinner-small" />
                                  {uploadingEditImages ? 'Uploading Images...' : 'Saving...'}
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4" />
                                  Save Changes
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
      )}

      {showDeleteDialog && projectToDelete && (
        <div className="modal-overlay" onClick={handleCloseDeleteDialog}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Project</h2>
              <button className="modal-close" onClick={handleCloseDeleteDialog}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <AlertCircle className="w-12 h-12 text-danger" />
                <p>Are you sure you want to delete this project?</p>
                <p className="delete-project-name">"{projectToDelete.title}"</p>
                <p className="delete-warning-text">This action cannot be undone.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={handleCloseDeleteDialog}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteProject}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserDetailsModal && selectedUserDetails && (
        <div className="modal-overlay" onClick={handleCloseUserDetails}>
          <div className="modal-content modal-large profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">User Profile</h2>
              <button className="modal-close" onClick={handleCloseUserDetails}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body profile-modal-body">
              <div className="profile-header">
                <div className="profile-header-content">
                  <div className="profile-avatar-large">
                    {selectedUserDetails.avatar ? (
                      <img src={selectedUserDetails.avatar} alt={selectedUserDetails.name} />
                    ) : (
                      selectedUserDetails.name?.charAt(0)?.toUpperCase() || '?'
                    )}
                  </div>
                  <div className="profile-info">
                    <h1 className="profile-name">{selectedUserDetails.name || 'Unknown User'}</h1>
                    <div className="profile-meta">
                      <div className="profile-meta-item">
                        <Mail className="w-4 h-4" />
                        <span>{selectedUserDetails.email || 'N/A'}</span>
                      </div>
                      <div className="profile-meta-item">
                        <Briefcase className="w-4 h-4" />
                        <span className="role-badge">{selectedUserDetails.role || 'N/A'}</span>
                      </div>
                      {selectedUserDetails.company && (
                        <div className="profile-meta-item">
                          <Building2 className="w-4 h-4" />
                          <span>{selectedUserDetails.company}</span>
                        </div>
                      )}
                      {selectedUserDetails.verified && (
                        <div className="profile-meta-item">
                          <Shield className="w-4 h-4 text-success" />
                          <span className="text-success">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-stats">
                <div className="stat-card">
                  <div className="stat-icon stat-icon-primary">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{formatDate(selectedUserDetails.created_at)}</div>
                    <div className="stat-label">Member Since</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon-success">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{formatDate(selectedUserDetails.last_login)}</div>
                    <div className="stat-label">Last Login</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon-info">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{selectedUserDetails.projects_completed || 0}</div>
                    <div className="stat-label">Projects Completed</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon-warning">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {normalizedUserEarnings != null
                        ? `$${normalizedUserEarnings.toLocaleString()}`
                        : 'N/A'}
                    </div>
                    <div className="stat-label">
                      {selectedUserDetails.role === 'developer' ? 'Total Earned' : 'Total Spent'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-details-section">
                <div className="details-card">
                  <div className="section-header">
                    <div>
                      <h2 className="section-title">
                        <UserIcon className="w-5 h-5 inline mr-2" />
                        Personal Information
                      </h2>
                      <p className="section-subtitle">Overview of contact details</p>
                    </div>
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">Full Name</div>
                      <div className="info-value">{selectedUserDetails.name || 'N/A'}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Email</div>
                      <div className="info-value">{selectedUserDetails.email || 'N/A'}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Company</div>
                      <div className="info-value">{selectedUserDetails.company || 'Not provided'}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Address</div>
                      <div className="info-value">{selectedUserDetails.address || 'Not provided'}</div>
                    </div>
                    <div className="info-item info-item-full">
                      <div className="info-label">Bio</div>
                      <div className="info-value">
                        {selectedUserDetails.bio || 'No bio provided yet.'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="details-card">
                  <div className="section-header">
                    <div>
                      <h2 className="section-title">
                        <Code className="w-5 h-5 inline mr-2" />
                        Skills & Expertise
                      </h2>
                      <p className="section-subtitle">Technologies and expertise areas</p>
                    </div>
                  </div>
                  <div className="tech-stack-grid">
                    {userSkills.length > 0 ? (
                      userSkills.map((skill, index) => (
                        <span key={index} className="badge badge-primary">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-tertiary">No skills listed</span>
                    )}
                  </div>
                </div>

                <div className="details-card">
                  <div className="section-header">
                    <div>
                      <h2 className="section-title">
                        <Shield className="w-5 h-5 inline mr-2" />
                        Account & Activity
                      </h2>
                      <p className="section-subtitle">Platform metadata</p>
                    </div>
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">User ID</div>
                      <div className="info-value monospace">{selectedUserDetails.id}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Role</div>
                      <div className="info-value">
                        <span className="role-badge">{selectedUserDetails.role || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Verification</div>
                      <div className="info-value">
                        {selectedUserDetails.verified ? 'Verified' : 'Pending'}
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Created</div>
                      <div className="info-value">{formatDate(selectedUserDetails.created_at)}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Last Updated</div>
                      <div className="info-value">{formatDate(selectedUserDetails.updated_at)}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Last Login</div>
                      <div className="info-value">{formatDate(selectedUserDetails.last_login)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={handleCloseUserDetails}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserDeleteDialog && userToDelete && (
        <div className="modal-overlay" onClick={handleCloseUserDeleteDialog}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete User</h2>
              <button className="modal-close" onClick={handleCloseUserDeleteDialog}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <AlertCircle className="w-12 h-12 text-danger" />
                <p>Are you sure you want to delete this user?</p>
                <p className="delete-project-name">"{userToDelete.name}"</p>
                <p className="delete-warning-text">This action cannot be undone.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={handleCloseUserDeleteDialog}
                disabled={userDeleteLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteUser}
                disabled={userDeleteLoading}
              >
                {userDeleteLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBanConfirmDialog && userToBan && (
        <div className="modal-overlay" onClick={handleCloseBanDialog}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Ban</h2>
              <button className="modal-close" onClick={handleCloseBanDialog}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                You are about to ban{' '}
                <strong>{userToBan.name || userToBan.email}</strong>. This action will restrict the user
                from accessing their account until manually unbanned.
              </p>
              <p className="modal-description">
                Are you sure you want to continue?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={handleCloseBanDialog} disabled={userBanLoading}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmBan} disabled={userBanLoading}>
                {userBanLoading ? 'Banning...' : 'Confirm Ban'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotification && (
        <div className="modal-overlay" onClick={closeNotification}>
          <div
            className={`modal-content modal-sm notification-modal notification-${notificationConfig.type}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notification-header">
              <div className="notification-icon-wrapper">
                {notificationConfig.type === 'success' && (
                  <CheckCircle2 className="notification-icon" />
                )}
                {notificationConfig.type === 'error' && (
                  <AlertCircle className="notification-icon" />
                )}
                {notificationConfig.type === 'info' && (
                  <AlertCircle className="notification-icon" />
                )}
              </div>
              <button className="modal-close" onClick={closeNotification}>
                <X className="w-5 h-5" />
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
};

export default DashboardAdmin;