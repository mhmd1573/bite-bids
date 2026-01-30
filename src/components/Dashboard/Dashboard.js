import React, { useState, useEffect } from 'react';

import {
  TrendingUp, DollarSign, Briefcase, Clock,
  Award, Star, Users, CheckCircle2,
  AlertCircle, ArrowRight, Calendar,
  Target, Zap, MessageSquare, FileText,
  Settings, Bell, Download, Plus, Code, X, MapPin, Filter, Check, Lock, Trash2, Edit, Save,
  Upload, Image as ImageIcon, Wallet, Shield, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';


import axios from 'axios';

import './Dashboard.css';
import { useNotification } from '../NotificationModal/NotificationModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  // If already a full URL (starts with http:// or https://), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  // Otherwise, prepend backend URL for legacy local images
  return `${BACKEND_URL}${imageUrl}`;
};

const Dashboard = ({ user, navigateToPage }) => {
      const { showNotification } = useNotification();

      // Collapsible guide state
      const [showProcessGuide, setShowProcessGuide] = useState(false);

      const [activeTab, setActiveTab] = useState('overview');
      const [selectedCategory, setSelectedCategory] = useState('all');
      const [projectStatusTab, setProjectStatusTab] = useState('active'); // New: Tab for Active/Closed projects
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      const [projects, setProjects] = useState([]);
      const [userData, setUserData] = useState(null); // Add user data state

      // Edit Project states
      const [editingProject, setEditingProject] = useState(null);
      const [showEditDialog, setShowEditDialog] = useState(false);

      // Delete Project states
      const [showDeleteDialog, setShowDeleteDialog] = useState(false);
      const [projectToDelete, setProjectToDelete] = useState(null);

      // Derived lists
      const activeProjects = projects.filter( (project) => project.status === "open" || project.status === "fixed_price" || project.status === "in_progress" || project.status === "winner_selected" || project.status === "disputed" );
      const fixedPriceProjects = projects.filter( (project) => project.status === "fixed_price" );
      const auctionProjects = projects.filter( (project) => project.status === "open" );
      const closedProjects = projects.filter( (project) => project.status === "closed" );

      // Post Project states
      const [showPostDialog, setShowPostDialog] = useState(false);
      const [postLoading, setPostLoading] = useState(false);
      const [projectForm, setProjectForm] = useState({
            title: '',
            description: '',
            category: 'Machine Learning',
            tech_stack: [],
            requirements: '',
            budget: '',
            location: '',
            status: 'open',
            lowest_bid: ''
          });

      // Project Details states
      const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
      const [showProjectDetails, setShowProjectDetails] = useState(false);
      const [detailsLoading, setDetailsLoading] = useState(false);    
        
      // Multi-select dropdown states
      const [showTechDropdown, setShowTechDropdown] = useState(false);
      const [showLocationDropdown, setShowLocationDropdown] = useState(false);
          
      // Close Bidding states
      const [showCloseBiddingDialog, setShowCloseBiddingDialog] = useState(false);
      const [projectToClose, setProjectToClose] = useState(null);
      const [closeBiddingLoading, setCloseBiddingLoading] = useState(false);

      // ✅ NEW: Image upload states for new projects
      const [selectedImages, setSelectedImages] = useState([]);
      const [uploadingImages, setUploadingImages] = useState(false);

      // ✅ NEW: Payment verification state
      const [paymentVerified, setPaymentVerified] = useState(false);
      const [verifyingPayment, setVerifyingPayment] = useState(false);

      // ✅ NEW: Edit image states
      const [editImages, setEditImages] = useState([]);
      const [uploadingEditImages, setUploadingEditImages] = useState(false);


      // Notifications
      const [notifications, setNotifications] = useState([]);
      const [unreadCount, setUnreadCount] = useState(0);

      // ✅ NEW: Posting credits state
      const [postingCredits, setPostingCredits] = useState(0);
      const [checkingCredits, setCheckingCredits] = useState(false);


      // Show notification function
      const showNotificationModal = (type, title, message) => {
        showNotification(type, title, message);
      };

      const fetchNotifications = async () => {
        if (!user) return;

        try {
          const response = await fetch(`http://localhost:8001/api/notifications/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };

      useEffect(() => {
        if (user) {
          fetchNotifications();
        }
      }, [user]);


      // Fetch developer's projects
      useEffect(() => {
          if (user && user.role === 'developer') {
            fetchProjects();
            fetchCurrentUser();
            fetchPostingCredits();  // ✅ NEW: Fetch credits on load

          }
        }, [user]);

  

// ✅ NEW: Check for payment success from Stripe
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  const paymentStatus = urlParams.get('payment_status');
  
  if (sessionId && paymentStatus === 'success') {
    // Payment successful - refresh credits and show success
    fetchPostingCredits();
    showNotificationModal(
      'success', 
      'Payment Successful!', 
      'Your posting credit has been added. You can now create your project!'
    );
    
    // Open post dialog after a short delay
    setTimeout(() => {
      setShowPostDialog(true);
    }, 2000);
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);




    const notificationActivity = notifications.map((n) => ({
    message: n.message,
    time: new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    icon: Bell,       // You can improve this later per notification type
    color: n.read ? "primary" : "warning",
    amount: n.amount || null,
    rating: n.rating || null,
      }));

      const categories = [
        { id: 'all', label: 'All Projects', icon: Code },
        { id: 'Machine Learning', label: 'Machine Learning', icon: Zap },
        { id: 'Natural Language Processing', label: 'Natural Language Processing', icon: Users },
        { id: 'Computer Vision', label: 'Computer Vision', icon: Award },
        { id: 'Automation', label: 'Automation', icon: TrendingUp },
      ];



    // Dynamic stats based on user data
    const stats = userData ? {
      activeProjects: activeProjects.length,
      closedProjects: closedProjects.length,
      completedProjects: userData.projects_completed || 0,
      totalEarnings: userData.total_earnings || 0,
      pendingPayments: 12500, // You might want to calculate this from your data
      avgRating: userData.avg_rating || 0,
      totalReviews: userData.total_reviews || 0,
      responseRate: userData.response_rate || 0,
      onTimeDelivery: userData.on_time_delivery || 0,
    } : {
      activeProjects: 0,
      closedProjects: 0,
      completedProjects: 0,
      totalEarnings: 0,
      pendingPayments: 0,
      avgRating: 0,
      totalReviews: 0,
      responseRate: 0,
      onTimeDelivery: 0,
    };

// ✅ NEW: Handle image upload (for new projects)
const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files);
  
  if (selectedImages.length + files.length > 5) {
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
    setSelectedImages(prev => [...prev, ...images]);
  } catch (error) {
    showNotificationModal('error', 'Upload Failed', 'Failed to upload images. Please try again.');
  }
};

// ✅ NEW: Handle image upload for editing
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

// ✅ NEW: Remove image (for new projects)
const removeImage = (index) => {
  setSelectedImages(prev => prev.filter((_, i) => i !== index));
};

// ✅ NEW: Remove existing image (for editing)
const removeExistingImage = (index) => {
  const totalImages = (editForm.images || []).length + editImages.length;
  
  // Prevent removing the last image
  if (totalImages <= 1) {
    showNotificationModal('error', 'Cannot Remove', 'You must keep at least one image.');
    return;
  }
  
  setEditForm(prev => ({
    ...prev,
    images: prev.images.filter((_, i) => i !== index)
  }));
};

// ✅ NEW: Remove new image (for editing)
const removeEditImage = (index) => {
  const totalImages = (editForm.images || []).length + editImages.length;
  
  // Prevent removing the last image
  if (totalImages <= 1) {
    showNotificationModal('error', 'Cannot Remove', 'You must keep at least one image.');
    return;
  }
  
  setEditImages(prev => prev.filter((_, i) => i !== index));
};

// ✅ NEW: Initiate payment for posting project
const handleInitiatePostProject = async () => {
  try {
    setPostLoading(true);
    const token = localStorage.getItem('token');
    
    const response = await axios.post(
      `${BACKEND_URL}/api/payments/create-post-project-session`,
      {
        customer_email: user.email,
        customer_name: user.name
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success && response.data.checkout_url) {
      window.location.href = response.data.checkout_url;
    } else {
      showNotificationModal('error', 'Payment Error', 'Failed to create payment session.');
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    showNotificationModal('error', 'Payment Error', error.response?.data?.detail || 'Failed to initiate payment.');
  } finally {
    setPostLoading(false);
  }
};





  const fetchPostingCredits = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(  // ✅ Use axios like other functions
      `${BACKEND_URL}/api/users/me/posting-credits`,  // ✅ CORRECT: BACKEND_URL
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.data.success) {
      setPostingCredits(response.data.credits || 0);
    }
  } catch (error) {
    console.error('Error fetching posting credits:', error);
  }
};



    // Fetch projects from backend
   const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
      const response = await axios.get(`${BACKEND_URL}/api/projects/developer/${user.id}`);
      setProjects(response.data.projects || []);
      } catch (err) {
      console.error("Failed to fetch projects", err);
      setError("Failed to load projects.");
      } finally {
      setLoading(false);
      }

      };


    // Fetch current user data
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BACKEND_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUserData(response.data);
      } catch (err) {
        console.error("Failed to fetch user data", err);
        // Don't set error state here to avoid breaking the UI
      }
    };


    // Fetch project details function
    const fetchProjectDetails = async (projectId) => {
        setDetailsLoading(true);
        try {
          const response = await axios.get(`${BACKEND_URL}/api/projects/${projectId}`);
          setSelectedProjectDetails(response.data);
          setShowProjectDetails(true);
        } catch (error) {
          console.error('Failed to fetch project details:', error);
          showNotification('error', 'Load Failed', 'Failed to load project details. Please try again.');
        } finally {
          setDetailsLoading(false);
        }
      };
    
    // Handle close details
    const handleCloseDetails = () => {
        setShowProjectDetails(false);
        setSelectedProjectDetails(null);
      };
    

    // Form state for editing
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        category: 'Machine Learning',
        tech_stack: [],
        requirements: '',
        budget: '',
        location: '',
        status: 'open'
      });

   const techStackOptions = [
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
    'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy',
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
    'Git', 'CI/CD', 'GraphQL', 'REST API', 'Microservices'
    ];
  
    // Location options
    const locationOptions = [
      'Remote',
      'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy',
      'Australia', 'New Zealand', 'Japan', 'Singapore', 'India', 'China', 'Brazil',
      'New York, USA', 'San Francisco, USA', 'Los Angeles, USA', 'Austin, USA', 'Seattle, USA',
      'London, UK', 'Berlin, Germany', 'Paris, France', 'Amsterdam, Netherlands',
      'Toronto, Canada', 'Vancouver, Canada', 'Sydney, Australia', 'Melbourne, Australia',
      'Tokyo, Japan', 'Singapore', 'Dubai, UAE', 'Tel Aviv, Israel'
    ];

  
    const handlePostProject = async (e) => {
      e.preventDefault();

      // ✅ NEW: Check posting credits first
      if (postingCredits <= 0) {
        showNotificationModal(
          'error', 
          'No Posting Credits', 
          'You need to purchase a posting credit to create a project.'
        );
        return;
      }
      
      setPostLoading(true);

      try {
        const token = localStorage.getItem('token');
        
        // ✅ NEW: Upload images first
        const imageUrls = [];
        if (selectedImages.length > 0) {
          setUploadingImages(true);
          
          for (const image of selectedImages) {
            const formData = new FormData();
            formData.append('image', image.file);
            
            try {
              const uploadResponse = await axios.post(
                `${BACKEND_URL}/api/projects/upload-image`,
                formData,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                  }
                }
              );
              
              if (uploadResponse.data.success) {
                imageUrls.push(uploadResponse.data.image_url);
              }
            } catch (uploadError) {
              console.error('Image upload failed:', uploadError);
              showNotificationModal(
                'error', 
                'Image Upload Failed', 
                uploadError.response?.data?.detail || 'Failed to upload one or more images.'
              );
              setPostLoading(false);
              setUploadingImages(false);
              return;
            }
          }
          
          setUploadingImages(false);
        }
        
        const projectData = {
          title: projectForm.title,
          status: projectForm.status,
          description: projectForm.description,
          category: projectForm.category,
          tech_stack: projectForm.tech_stack,
          requirements: projectForm.requirements,
          budget: parseFloat(projectForm.budget),
          deadline: null,
          lowest_bid: parseFloat(projectForm.lowest_bid),
          location: projectForm.location || 'Remote',
          images: imageUrls  // ✅ NEW: Include images
        };
        
        const response = await axios.post(
          `${BACKEND_URL}/api/projects`,
          projectData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        showNotificationModal('success', 'Success!', 'Your project has been posted successfully and is now live on the marketplace.');
        setShowPostDialog(false);
        setPaymentVerified(false);  // ✅ NEW: Reset payment
        setSelectedImages([]);  // ✅ NEW: Clear images
        // ✅ NEW: Clear payment from localStorage after successful post
        fetchPostingCredits();  // ✅ NEW: Refresh credits after posting
        setProjectForm({
          title: '',
          status: 'open',
          description: '',
          category: 'Machine Learning',
          tech_stack: [],
          requirements: '',
          budget: '',
          location: '',
          lowest_bid: ''
        });
        fetchProjects();
        fetchCurrentUser();
      } catch (error) {
        console.error('Failed to post project:', error);
        showNotificationModal('error', 'Error', error.response?.data?.detail || 'Failed to post project. Please try again.');
      } finally {
        setPostLoading(false);
      }
    };
  
    // Handle form input changes
    const handleFormChange = (field, value) => {
      setProjectForm(prev => {
        // If changing status to fixed_price, set lowest_bid to 0
        if (field === 'status' && value === 'fixed_price') {
          return {
            ...prev,
            [field]: value,
            lowest_bid: '0'
          };
        }
        // If changing status from fixed_price to open, clear lowest_bid
        if (field === 'status' && value === 'open' && prev.status === 'fixed_price') {
          return {
            ...prev,
            [field]: value,
            lowest_bid: ''
          };
        }
        return {
          ...prev,
          [field]: value
        };
      });
    };
    
    // ✅ NEW: Form validation function
    const isFormValid = () => {
      // Check required fields
      if (!projectForm.title || !projectForm.title.trim()) return false;
      if (!projectForm.description || !projectForm.description.trim()) return false;
      if (!projectForm.category) return false;
      if (!projectForm.budget || parseFloat(projectForm.budget) <= 0) return false;
      if (projectForm.tech_stack.length === 0) return false;
      
      // ✅ Check at least one image is required
      if (selectedImages.length === 0) return false;
      
      // For auction projects, check lowest_bid
      if (projectForm.status === 'open') {
        if (!projectForm.lowest_bid || parseFloat(projectForm.lowest_bid) <= 0) return false;
        // Validate that lowest_bid is not greater than budget
        if (parseFloat(projectForm.lowest_bid) > parseFloat(projectForm.budget)) return false;
      }
      
      return true;
    };

    // ✅ NEW: Edit form validation function
    const isEditFormValid = () => {
      // Check required fields
      if (!editForm.title || !editForm.title.trim()) return false;
      if (!editForm.description || !editForm.description.trim()) return false;
      if (!editForm.category) return false;
      if (!editForm.budget || parseFloat(editForm.budget) <= 0) return false;
      if (editForm.tech_stack.length === 0) return false;
      if (!editForm.location) return false;
      
      // ✅ Check at least one image is required (existing + new)
      const totalImages = (editForm.images || []).length + editImages.length;
      if (totalImages === 0) return false;
      
      return true;
    };
    
    // Handle tech stack selection
    const toggleTechStack = (tech) => {
      setProjectForm(prev => {
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
    
    // Remove tech from selected
    const removeTech = (tech) => {
      setProjectForm(prev => ({
        ...prev,
        tech_stack: prev.tech_stack.filter(t => t !== tech)
      }));
    };

    // Enhanced navigation function that scrolls to top
    const handleNavigation = (page) => {
        navigateToPage(page);
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };


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
        setShowEditDialog(true);
      };


  const handleUpdateProject = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const token = localStorage.getItem('token');
    
    // ✅ NEW: Upload new images first
    const newImageUrls = [];
    if (editImages.length > 0) {
      setUploadingEditImages(true);
      
      for (const image of editImages) {
        const formData = new FormData();
        formData.append('image', image.file);
        
        try {
          const uploadResponse = await axios.post(
            `${BACKEND_URL}/api/projects/upload-image`,
            formData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          
          if (uploadResponse.data.success) {
            newImageUrls.push(uploadResponse.data.image_url);
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
    
    // ✅ NEW: Combine existing images with new images
    const allImages = [...(editForm.images || []), ...newImageUrls];

    const updateData = {
      title: editForm.title,
      status: editForm.status,
      description: editForm.description,
      category: editForm.category,
      tech_stack: editForm.tech_stack,
      requirements: editForm.requirements,
      budget: parseFloat(editForm.budget),
      deadline: null,
      location: editForm.location,
      status: editForm.status,
      images: allImages  // ✅ NEW: Include all images
    };

    await axios.put(
      `${BACKEND_URL}/api/projects/${editingProject.id}`,
      updateData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    showNotificationModal('success', 'Success!', 'Project updated successfully!');
    setShowEditDialog(false);
    setEditingProject(null);
    setEditImages([]);  // ✅ NEW: Clear edit images
    fetchProjects();
  } catch (error) {
    console.error('Failed to update project:', error);
    showNotificationModal('error', 'Error', error.response?.data?.detail || 'Failed to update project');
  } finally {
    setLoading(false);
  }
};


      // Handle Close Bidding
       const handleCloseBiddingClick = (project) => {
          setProjectToClose(project);
          setShowCloseBiddingDialog(true);
        };

      const handleCloseBidding = async () => {
          setCloseBiddingLoading(true);
          try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
              `${BACKEND_URL}/api/projects/${projectToClose.id}/close-bidding`,
              {},
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );

            const data = response.data;

            const highestAmount = data.amount ? `$${data.amount.toLocaleString()}` : 'N/A';
            
            // Winner name
            const winnerName = data.winner_name || "the winning investor";

            // Success message
            showNotificationModal(
              "success",
              "Bidding Closed Successfully!",
              `The highest bid of ${highestAmount} has been selected. ${winnerName} has been notified and assigned to your project. No more bids will be accepted for this project.`
            );
            
            setShowCloseBiddingDialog(false);
            setProjectToClose(null);
            fetchProjects();

          } catch (error) {
            console.error('Failed to close bidding:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to close bidding. Please try again.';
            showNotificationModal('error', 'Failed to Close Bidding', errorMessage);
          } finally {
            setCloseBiddingLoading(false);
          }
        };

      // Handle delete project
      const handleDeleteClick = (project) => {
        setProjectToDelete(project);
        setShowDeleteDialog(true);
      };
    
      const handleDeleteProject = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          await axios.delete(
            `${BACKEND_URL}/api/projects/${projectToDelete.id}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
    
          showNotificationModal('success', 'Success!', 'Your project has been deleted successfully and been removed from the marketplace.');
          setShowDeleteDialog(false);
          setProjectToDelete(null);
          fetchProjects();
        } catch (error) {
          console.error('Failed to delete project:', error);
          showNotification(
            'error',
            'Delete Failed',
            error.response?.data?.detail || 'Failed to delete project.'
          );
        } finally {
          setLoading(false);
        }
      };


  return (
    
    <div className="dashboard">
     
      {/* Header */}
      <section className="dashboard-header">
        <div className="container">
          <div className="dashboard-header-content">
            <div>
              <h1 className="dashboard-title">
                Welcome back, <span className="text-brand">{user?.name || 'Developer'}!</span>
              </h1>
              <p className="dashboard-subtitle">
                Here's what's happening with your projects today
              </p>
            </div>

            <div className="dashboard-header-actions">
              

              <button className="btn btn-outline" onClick={() => handleNavigation('profile')}>
                <Settings className="w-4 h-4" />
                Settings
              </button>
              
              <button 
                className="btn btn-primary"
                onClick={() => setShowPostDialog(true)}
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>


            </div>

          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="dashboard-content">
        <div className="container">
        
          {/* Stats Grid */}
          <div className="stats-grid">
            
            <div className="stat-card stat-card-primary">
              <div className="stat-card-icon">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Active Projects</div>
                <div className="stat-card-value">{stats.activeProjects}</div>
                {/* <div className="stat-card-change stat-card-change-up">
                  <TrendingUp className="w-3 h-3" />
                  +2 this month
                </div> */}
              </div>
            </div>

            <div className="stat-card stat-card-success">
              <div className="stat-card-icon">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Total Earnings</div>
                <div className="stat-card-value">${(stats.totalEarnings)}</div>
              </div>
            </div>

            <div className="stat-card stat-card-info">
              <div className="stat-card-icon">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Completed</div>
                <div className="stat-card-value">{stats.completedProjects}</div>
              </div>
            </div>

            {/* ✅ NEW: Posting Credits Card */}
            <div className="stat-card stat-card-warning">
              <div className="stat-card-icon">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Posting Credits</div>
                <div className="stat-card-value">{postingCredits}</div>
                <div className="stat-card-change">
                  Available to use
                </div>
              </div>
            </div>


          </div>

          {/* Main Layout */}
          <div className="dashboard-layout">
          
            {/* Left Column */}
            <div className="dashboard-main">
            
              {/* Projects Section with Tabs */}
              <div className="dashboard-section">
                
                <div className="section-header-row">
                  <div>
                    <h2 className="section-title">My Projects</h2>
                    <p className="section-subtitle">Manage your active and closed projects</p>
                  </div>
                  <button className="btn btn-ghost btn-sm">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Project Status Tabs */}
                <div className="project-tabs">
                
                  <button 
                    className={`project-tab ${projectStatusTab === 'active' ? 'project-tab-active' : ''}`}
                    onClick={() => setProjectStatusTab('active')}
                  >
                    <Briefcase className="w-4 h-4" />
                    Active Projects
                    <span className="tab-badge">{activeProjects.length}</span>
                  </button>
                
                  <button 
                    className={`project-tab ${projectStatusTab === 'fixed' ? 'project-tab-active' : ''}`}
                    onClick={() => setProjectStatusTab('fixed')}
                  >
                    <DollarSign className="w-4 h-4" />
                    Fixed Projects
                    <span className="tab-badge">{fixedPriceProjects.length}</span>
                  </button>

                  <button 
                    className={`project-tab ${projectStatusTab === 'auction' ? 'project-tab-active' : ''}`}
                    onClick={() => setProjectStatusTab('auction')}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Auctions
                    <span className="tab-badge">{auctionProjects.length}</span>
                  </button>
                
                  <button 
                    className={`project-tab ${projectStatusTab === 'closed' ? 'project-tab-active' : ''}`}
                    onClick={() => setProjectStatusTab('closed')}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Closed Projects
                    <span className="tab-badge">{closedProjects.length}</span>
                  </button>
              
                </div>

                {/* Info Note about Chat Rooms */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                  borderLeft: '4px solid #3b82f6',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start'
                }}>
                  <AlertCircle style={{
                    flexShrink: 0,
                    color: '#3b82f6',
                    marginTop: '2px',
                    width: '20px',
                    height: '20px'
                  }} />
                  <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5, color: '#1e40af' }}>
                    <strong style={{ fontWeight: 600 }}>Note:</strong> Projects with active chat rooms cannot be edited or deleted to maintain conversation history and project integrity.
                  </p>
                </div>

                <div className="projects-list-dashboard">

                  {/* Loading State */}
                  {loading && (
                    <div className="empty-state">
                      <div className="spinner" />
                      <p>Loading projects...</p>
                    </div>
                  )}

                  {/* Error State */}
                  {!loading && error && (
                    <div className="empty-state">
                      <AlertCircle className="w-16 h-16 text-error" />
                      <h3>Error Loading Projects</h3>
                      <p>{error}</p>
                      <button 
                        className="btn btn-primary"
                        onClick={fetchProjects}
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* Projects List - Conditional based on tab */}
                  {/* Active Projects Tab (open + fixed_price + in_progress + winner_selected) */}
                  {!loading && !error && projectStatusTab === 'active' && activeProjects.length > 0 && activeProjects.map((project) => (
                    <div key={project.id} className="project-card-dashboard">
                    
                      {/* Project Header */}
                      <div className="project-card-header-row">
                        <div>
                          <h3 className="project-card-title">{project.title}</h3>
                        </div>
                       
                        <div className="project-badges-container">
                        
                          {project.status && (
                                  <div
                                    className={`project-badge-status ${
                                      project.status === "closed"
                                        ? "bg-danger"
                                        : project.status === "fixed_price"
                                        ? "bg-warning"
                                        : "bg-default"
                                    }`}
                                  >
                                    {project.status}
                                  </div>
                                )}

                          {/* Hide bid badge when status = fixed_price */}
                                {project.status !== "fixed_price" && (
                                                  <div className="project-badge-bid">
                                                    <DollarSign className="w-3 h-3" />
                          
                                                    {project.status === "closed"
                                                      ? project.highest_bid != null
                                                        ? `Closed at: $${project.highest_bid.toLocaleString()}`
                                                        : "Closed"
                                                      : project.highest_bid != null && project.highest_bid > project.lowest_bid
                                                      ? `Current: $${project.highest_bid.toLocaleString()}`
                                                      : "No bids yet"}
                                                  </div>
                              )}
                          </div>

                      </div>

 
                      <div className="project-card-meta">
                      
                        <div className="project-meta-item">
                          <DollarSign className="w-4 h-4 text-success-600" />
                          <span className="project-budget">
                            ${project.budget.toLocaleString()}
                          </span>
                        </div>


                        <div className="project-meta-item">
                        <Calendar className="w-4 h-4 text-secondary" />

                        {project.status === "fixed_price" ? (
                          <span style={{color:'#1D4ED8', fontWeight: '600'}}>Fixed Price</span>
                        ) : (
                          <span>{project.bids_count} Bids</span>
                        )}
                      </div>


                        <div className="project-meta-item">
                          <Clock className="w-4 h-4 text-secondary" />
                          
                          <span>
                            {project.created_at
                              ? (() => {
                                  const now = new Date();
                                  const created = new Date(project.created_at);
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
                          </span>

                        </div>

                      </div>

                      <div className="project-item-tech-dash">
                        {project.tech_stack.slice(0, 4).map((tech, index) => (
                          <span key={index} className="tech-badge-dash">{tech}</span>
                        ))}
                        {project.tech_stack.length > 4 && (
                          <span className="tech-badge-dash">+{project.tech_stack.length - 4}</span>
                        )}
                      </div>

                      {/* Active Rooms Indicator */}
                      {project.active_rooms_count > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                          borderRadius: '0.5rem',
                          marginTop: '0.75rem',
                          fontSize: '0.8rem',
                          color: '#047857'
                        }}>
                          <Users className="w-4 h-4" />
                          <span>
                            <strong>{project.active_rooms_count}</strong> active chat room{project.active_rooms_count !== 1 ? 's' : ''} in progress
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="project-card-actions">

                        {/* View Project */}
                        <button
                         className="btn btn-primary btn-sm"
                        onClick={() => fetchProjectDetails(project.id)}
                        disabled={detailsLoading}
                         >
                          View Project
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        {/* Only show Close Bidding button for auction projects (status === 'open'), not for fixed_price */}
                        {project.status === 'open' && (
                          <button className="btn btn-warning"  onClick={() => handleCloseBiddingClick(project)} >
                            <Lock className="w-4 h-4" />
                            Close
                          </button>
                        )}

                          {/* Show Chat Now button when status is in_progress */}
                          {project.status === 'in_progress' && (
                            <button 
                              className="btn btn-success" 
                              onClick={() => handleNavigation(`chat/${project.chat_room_id}`)}
                            >
                              <MessageSquare className="w-4 h-4" />
                              Chat Now
                            </button>
                          )}

                         <button
                         className="btn btn-danger"
                         onClick={() => handleDeleteClick(project)}
                         disabled={project.status === 'in_progress' || project.has_chat_room}
                         title={project.has_chat_room ? "Cannot delete: Chat room exists for this project" : ""}
                         >
                        <Trash2 className="w-4 h-4" />
                             Delete
                         </button>

                         <button
                          className="btn btn-outline"
                          onClick={() => handleEditClick(project)}
                          disabled={project.status === 'in_progress' || project.has_chat_room}
                          title={project.has_chat_room ? "Cannot edit: Chat room exists for this project" : ""}
                          >
                           <Edit className="w-4 h-4" />
                              Edit
                          </button>
                        

                      </div>

                    </div>
                  ))}

                  {/* Empty State - Active Projects */}
                  {!loading && !error && projectStatusTab === 'active' && activeProjects.length === 0 && (
                    <div className="empty-state">
                      <Briefcase className="w-16 h-16 text-secondary" />
                      <h3>No active projects</h3>
                      <p>You don't have any active projects at the moment.</p>
                      
                    </div>
                  )}

                  {/* Fixed Price Projects List */}
                  {!loading && !error && projectStatusTab === 'fixed' && fixedPriceProjects.length > 0 && fixedPriceProjects.map((project) => (
                    <div key={project.id} className="project-card-dashboard">
                    
                      {/* Project Header */}
                      <div className="project-card-header-row">
                        <div>
                          <h3 className="project-card-title">{project.title}</h3>
                        </div>
                       
                            <span className="badge badge-info">
                              Fixed Price
                            </span>

                      </div>


                      <div className="project-card-meta">
                      
                        <div className="project-meta-item">
                          <DollarSign className="w-4 h-4 text-success-600" />
                          <span className="project-budget">
                            ${project.budget.toLocaleString()}
                          </span>
                        </div>


                      <div className="project-meta-item">
                        <Calendar className="w-4 h-4 text-secondary" />

                        {project.status === "fixed_price" ? (
                          <span style={{color:'#1D4ED8', fontWeight: '600'}}>Fixed Price</span>
                        ) : (
                          <span>{project.bids_count} Bids</span>
                        )}
                      </div>

                        <div className="project-meta-item">
                          <Clock className="w-4 h-4 text-secondary" />
                          
                          <span>
                            {project.created_at
                              ? (() => {
                                  const now = new Date();
                                  const created = new Date(project.created_at);
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
                          </span>

                        </div>

                      </div>

                      <div className="project-item-tech-dash">
                        {project.tech_stack.slice(0, 4).map((tech, index) => (
                          <span key={index} className="tech-badge-dash">{tech}</span>
                        ))}
                        {project.tech_stack.length > 4 && (
                          <span className="tech-badge-dash">+{project.tech_stack.length - 4}</span>
                        )}
                      </div>

                      {/* Active Rooms Indicator */}
                      {project.active_rooms_count > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                          borderRadius: '0.5rem',
                          marginTop: '0.75rem',
                          fontSize: '0.8rem',
                          color: '#047857'
                        }}>
                          <Users className="w-4 h-4" />
                          <span>
                            <strong>{project.active_rooms_count}</strong> active chat room{project.active_rooms_count !== 1 ? 's' : ''} in progress
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="project-card-actions">

                        <button
                         className="btn btn-primary btn-sm"
                         onClick={() => fetchProjectDetails(project.id)}
                         disabled={detailsLoading}
                         >
                          View Project
                          <ArrowRight className="w-4 h-4" />
                        </button>


                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteClick(project)}
                          disabled={project.has_chat_room}
                          title={project.has_chat_room ? "Cannot delete: Chat room exists for this project" : ""}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>

                        <button
                          className="btn btn-outline"
                          onClick={() => handleEditClick(project)}
                          disabled={project.has_chat_room}
                          title={project.has_chat_room ? "Cannot edit: Chat room exists for this project" : ""}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>

                      </div>

                    </div>
                  ))}

                  {/* Empty State - Fixed Price Projects */}
                  {!loading && !error && projectStatusTab === 'fixed' && fixedPriceProjects.length === 0 && (
                    <div className="empty-state">
                      <DollarSign className="w-16 h-16 text-secondary" />
                      <h3>No fixed price projects</h3>
                      <p>You don't have any fixed price projects at the moment.</p>
                    </div>
                  )}

                  {/* Auction Projects List */}
                  {!loading && !error && projectStatusTab === 'auction' && auctionProjects.length > 0 && auctionProjects.map((project) => (
                    <div key={project.id} className="project-card-dashboard">
                    
                      {/* Project Header */}
                      <div className="project-card-header-row">
                        <div>
                          <h3 className="project-card-title">{project.title}</h3>
                        </div>
                       
                            <span className="badge badge-warning">
                              Auction
                            </span>

                      </div>


                      <div className="project-card-meta">
                      
                        <div className="project-meta-item">
                          <DollarSign className="w-4 h-4 text-success-600" />
                          <span className="project-budget">
                            ${project.budget.toLocaleString()}
                          </span>
                        </div>

                        <div className="project-meta-item">
                          <Calendar className="w-4 h-4 text-secondary" />
                          <span>{project.bids_count} Bids</span>
                        </div>

                        <div className="project-meta-item">
                          <Clock className="w-4 h-4 text-secondary" />
                          
                          <span>
                            {project.created_at
                              ? (() => {
                                  const now = new Date();
                                  const created = new Date(project.created_at);
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
                          </span>

                        </div>

                      </div>

                      <div className="project-item-tech-dash">
                        {project.tech_stack.slice(0, 4).map((tech, index) => (
                          <span key={index} className="tech-badge-dash">{tech}</span>
                        ))}
                        {project.tech_stack.length > 4 && (
                          <span className="tech-badge-dash">+{project.tech_stack.length - 4}</span>
                        )}
                      </div>

                      {/* Active Rooms Indicator */}
                      {project.active_rooms_count > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                          borderRadius: '0.5rem',
                          marginTop: '0.75rem',
                          fontSize: '0.8rem',
                          color: '#047857'
                        }}>
                          <Users className="w-4 h-4" />
                          <span>
                            <strong>{project.active_rooms_count}</strong> active chat room{project.active_rooms_count !== 1 ? 's' : ''} in progress
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="project-card-actions">

                        <button className="btn btn-primary btn-sm"
                        onClick={() => fetchProjectDetails(project.id)}
                        disabled={detailsLoading}>
                          View Project
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <button className="btn btn-warning"  onClick={() => handleCloseBiddingClick(project)} >
                          <Lock className="w-4 h-4" />
                          Close
                        </button>

                          {/* Show Chat Now button when status is in_progress */}
                          {project.status === 'in_progress' && (
                            <button
                              className="btn btn-success"
                              onClick={() => handleNavigation(`chat/${project.chat_room_id}`)}
                            >
                              <MessageSquare className="w-4 h-4" />
                              Chat Now
                            </button>
                          )}


                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteClick(project)}
                          disabled={project.has_chat_room}
                          title={project.has_chat_room ? "Cannot delete: Chat room exists for this project" : ""}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>

                        <button
                          className="btn btn-outline"
                          onClick={() => handleEditClick(project)}
                          disabled={project.has_chat_room}
                          title={project.has_chat_room ? "Cannot edit: Chat room exists for this project" : ""}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>

                      </div>

                    </div>
                  ))}

                  {/* Empty State - Auction Projects */}
                  {!loading && !error && projectStatusTab === 'auction' && auctionProjects.length === 0 && (
                    <div className="empty-state">
                      <TrendingUp className="w-16 h-16 text-secondary" />
                      <h3>No auction projects</h3>
                      <p>You don't have any auction projects at the moment.</p>
                    </div>
                  )}

                  {/* Closed Projects List */}
                  {!loading && !error && projectStatusTab === 'closed' && closedProjects.length > 0 && closedProjects.map((project) => (
                    <div key={project.id} className="project-card-dashboard">
                    
                      {/* Project Header */}
                      <div className="project-card-header-row">
                        <div>
                          <h3 className="project-card-title">{project.title}</h3>
                        </div>
                       
                        <span className="badge badge-success">
                          Closed
                        </span>

                      </div>


                      <div className="project-card-meta">
                      
                        <div className="project-meta-item">
                          <DollarSign className="w-4 h-4 text-success-600" />
                          <span className="project-budget">
                            ${project.budget.toLocaleString()}
                          </span>
                        </div>

                        <div className="project-meta-item">
                          <Calendar className="w-4 h-4 text-secondary" />
                          <span>{project.bids_count} Bids</span>
                        </div>

                        <div className="project-meta-item">
                          <Clock className="w-4 h-4 text-secondary" />
                          
                          <span>
                            {project.created_at
                              ? (() => {
                                  const now = new Date();
                                  const created = new Date(project.created_at);
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
                          </span>

                        </div>

                      </div>

                      <div className="project-item-tech-dash">
                        {project.tech_stack.slice(0, 4).map((tech, index) => (
                          <span key={index} className="tech-badge-dash">{tech}</span>
                        ))}
                        {project.tech_stack.length > 4 && (
                          <span className="tech-badge-dash">+{project.tech_stack.length - 4}</span>
                        )}
                      </div>

                      {/* Active Rooms Indicator */}
                      {project.active_rooms_count > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                          borderRadius: '0.5rem',
                          marginTop: '0.75rem',
                          fontSize: '0.8rem',
                          color: '#047857'
                        }}>
                          <Users className="w-4 h-4" />
                          <span>
                            <strong>{project.active_rooms_count}</strong> active chat room{project.active_rooms_count !== 1 ? 's' : ''} in progress
                          </span>
                        </div>
                      )}

                      {/* Action Buttons - Limited for closed projects */}
                      <div className="project-card-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => fetchProjectDetails(project.id)}
                          disabled={detailsLoading}>
                          View Project
                          <ArrowRight className="w-4 h-4" />
                        </button>

                       {/* <button className="btn btn-outline" onClick={() => handleEditClick(project)} >
                           <Edit className="w-4 h-4" />
                              Edit
                          </button> */}

                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteClick(project)}
                          disabled={project.has_chat_room}
                          title={project.has_chat_room ? "Cannot delete: Chat room exists for this project" : ""}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>

                    </div>
                  ))}

                  {/* Empty State - Closed Projects */}
                  {!loading && !error && projectStatusTab === 'closed' && closedProjects.length === 0 && (
                    <div className="empty-state">
                      <CheckCircle2 className="w-16 h-16 text-secondary" />
                      <h3>No closed projects</h3>
                      <p>You don't have any closed projects yet.</p>
                    </div>
                  )}

                </div>

              </div>

            </div>

            {/* Right Sidebar */}
            <aside className="dashboard-sidebar">

              {/* Project Process Guide - Collapsible */}
              <div className="sidebar-card" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #0ea5e9' }}>
                <div
                  className="sidebar-card-header"
                  onClick={() => setShowProcessGuide(!showProcessGuide)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield className="w-5 h-5" style={{ color: '#0369a1' }} />
                    <h3 style={{ color: '#0369a1', margin: 0 }}>How Project Delivery Works</h3>
                  </div>
                  {showProcessGuide ? (
                    <ChevronUp className="w-5 h-5" style={{ color: '#0369a1' }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: '#0369a1' }} />
                  )}
                </div>
                {showProcessGuide && (
                  <div className="sidebar-card-body" style={{ fontSize: '0.85rem', lineHeight: '1.6', paddingTop: '0.75rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span style={{ background: '#0ea5e9', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>1</span>
                        <div>
                          <strong style={{ color: '#0369a1' }}>Submit Your Repository</strong>
                          <p style={{ margin: '0.25rem 0 0', color: '#475569' }}>Share your private repository link and access token. BiteBids displays your code in a secure tree view — investors can review but cannot copy, download, or steal your work.</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ background: '#0ea5e9', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>2</span>
                        <div>
                          <strong style={{ color: '#0369a1' }}>Get Paid Securely</strong>
                          <p style={{ margin: '0.25rem 0 0', color: '#475569' }}>Once the investor confirms the project is complete, payment is released to you automatically. Only then can they download the final project files.</p>
                        </div>
                      </div>
                    </div>
                    <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '0.5rem', padding: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <AlertTriangle className="w-4 h-4" style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ margin: 0, color: '#92400e', fontSize: '0.8rem' }}>
                        <strong>Warning:</strong> All chats are monitored in real-time. Any attempt to share contact info or conduct transactions outside BiteBids may result in account suspension and legal action.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Payout Settings Card */}
              <div className="sidebar-card payout-settings-card">
                <div className="sidebar-card-header">
                  <Wallet className="w-5 h-5 text-success-600" />
                  <h3>Payout Settings</h3>
                </div>
                <div className="sidebar-card-body">
                  <p className="sidebar-card-description">
                    Set up your payment method to receive earnings from completed projects.
                  </p>
                  <button
                    className="payout-settings-btn"
                    onClick={() => handleNavigation('payout-settings')}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Manage Payouts</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              {/* <div className="sidebar-card">
                <div className="sidebar-card-header">
                  <Zap className="w-5 h-5 text-success-600" />
                  <h3>Quick Actions</h3>
                </div>
                <div className="sidebar-card-body">
                  <div className="quick-actions">
                    <button className="quick-action-btn">
                      <Plus className="w-4 h-4" />
                      <span>Submit Milestone</span>
                    </button>
                    <button className="quick-action-btn">
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Message</span>
                    </button>
                    <button className="quick-action-btn">
                      <FileText className="w-4 h-4" />
                      <span>Create Invoice</span>
                    </button>
                    <button className="quick-action-btn">
                      <Calendar className="w-4 h-4" />
                      <span>Schedule Meeting</span>
                    </button>
                  </div>
                </div>
              </div> */}
            </aside>

          </div>

        </div>
      </section>


        


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
        
                        <div className="stat-item">
                          <Users className="stat-icon-market text-secondary" />
                          <div>
                            <div className="stat-value">{selectedProjectDetails.bids_count}</div>
                            <div className="stat-label">Bids</div>
                          </div>
                        </div>
        
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
        
                    <div className="modal-footer">
                      {user && user.role === 'investor' && selectedProjectDetails?.status === 'open' && (
                        <>
                          <button className="btn btn-outline" onClick={handleCloseDetails}>
                            Close
                          </button>
        
                          <button className="btn btn-primary" onClick={handleOpenBidModal}>
                            <DollarSign className="w-4 h-4" />
                            Place a Bid
                          </button>
                        </>
                      )}
        
                      {user && user.role === 'investor' && selectedProjectDetails?.status === 'fixed_price' && (
                        <>
                          <button className="btn btn-outline" onClick={handleCloseDetails}>
                            Cancel
                          </button>
        
                          <button className="btn btn-success" onClick={handlePayNow}>
                            <DollarSign className="w-4 h-4" />
                            Pay Now
                          </button>
                        </>
                      )}
                    </div>
        
                  </div>
                </div>
      )}

      {/* Post Project Dialog - Only for Developers */}
      {showPostDialog && user && user.role === 'developer' && (
        <div className="modal-overlay" onClick={() => setShowPostDialog(false)}>
          <div className="modal-content post-project-modal-wide" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <h2 className="modal-title">
                <Plus className="w-6 h-6" />
                Post a New Project
              </h2>
              <button className="modal-close" onClick={() => setShowPostDialog(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ✅ NEW: Credits Status Indicator */}
            <div style={{
              padding: '0.75rem 1.5rem',
              background: postingCredits > 0 
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
              borderBottom: postingCredits > 0 ? '2px solid #22c55e' : '2px solid #ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center'
            }}>
              {postingCredits > 0 ? (
                <>
                  <CheckCircle2 style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                  <span style={{ color: '#15803d', fontWeight: 600, fontSize: '0.875rem' }}>
                    You have {postingCredits} posting credit{postingCredits !== 1 ? 's' : ''} available
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                  <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.875rem' }}>
                    No posting credits - Purchase required
                  </span>
                </>
              )}
            </div>

            <form onSubmit={handlePostProject}>
               <div className="modal-body">
                            
                  {/* ✅ NEW: Show payment notice if not verified */}
                  {postingCredits <= 0 && (
                              <div style={{
                                textAlign: 'center',
                                padding: '3rem 2rem',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                                borderRadius: '12px',
                                marginBottom: '2rem'
                              }}>
                                <AlertCircle style={{ width: '48px', height: '48px', color: '#6366f1', margin: '0 auto 1rem' }} />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Payment Required</h3>
                                <p style={{ fontSize: '1.125rem', color: '#64748b', marginBottom: '1.5rem' }}>
                                  To post a project, you need to pay a one-time fee of <strong style={{ color: '#6366f1' }}>$0.99</strong>
                                </p>
                                <button 
                                  className="btn btn-primary"
                                  style={{ marginTop: '1rem' }}
                                  onClick={handleInitiatePostProject}
                                  disabled={postLoading}
                                  type="button"
                                >
                                  {postLoading ? 'Processing...' : 'Proceed to Payment'}
                                </button>
                              </div>
                  )}
            
                  {/* ✅ Only show form if payment is verified */}
                  {postingCredits > 0 && (
                              <>
                                {/* ✅ NEW: Warning Notice */}
                                <div style={{
                                  background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
                                  borderLeft: '4px solid #fbbf24',
                                  padding: '1rem',
                                  borderRadius: '8px',
                                  marginBottom: '1.5rem',
                                  display: 'flex',
                                  gap: '0.75rem',
                                  alignItems: 'flex-start'
                                }}>
                                  <AlertCircle style={{ 
                                    flexShrink: 0, 
                                    color: '#f59e0b', 
                                    marginTop: '2px',
                                    width: '20px',
                                    height: '20px'
                                  }} />
                                  <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
                                    <strong style={{ color: '#f59e0b', fontWeight: 600 }}>Important:</strong> Do not share any contact information (email, phone, social media) in your project details or images. Violations will result in post deletion and account ban.
                                  </p>
                                </div>
            
                                {/* ✅ NEW: Image Upload Section */}
                                <div style={{ marginBottom: '2rem' }}>
                                  <label style={{ 
                                    display: 'block', 
                                    fontSize: '0.875rem', 
                                    fontWeight: 600, 
                                    marginBottom: '0.5rem',
                                    color: '#1f2937'
                                  }}>
                                    Project Images (Max 5) *
                                  </label>
                                  
                                  <div style={{ position: 'relative' }}>
                                    <input
                                      type="file"
                                      id="image-upload"
                                      accept="image/jpeg,image/png"
                                      multiple
                                      onChange={handleImageUpload}
                                      disabled={selectedImages.length >= 5}
                                      style={{ display: 'none' }}
                                    />
                                    
                                    <label 
                                      htmlFor="image-upload"
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '2rem',
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '12px',
                                        cursor: selectedImages.length >= 5 ? 'not-allowed' : 'pointer',
                                        background: selectedImages.length >= 5 ? '#f8fafc' : '#ffffff',
                                        transition: 'all 0.2s',
                                        opacity: selectedImages.length >= 5 ? 0.5 : 1
                                      }}
                                      onMouseEnter={(e) => {
                                        if (selectedImages.length < 5) {
                                          e.currentTarget.style.borderColor = '#6366f1';
                                          e.currentTarget.style.background = '#f0f9ff';
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                        e.currentTarget.style.background = selectedImages.length >= 5 ? '#f8fafc' : '#ffffff';
                                      }}
                                    >
                                      <Upload style={{ width: '32px', height: '32px', color: '#6366f1', marginBottom: '0.5rem' }} />
                                      <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>
                                        Click to upload images
                                      </span>
                                      <span style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                        PNG or JPEG (Max 5MB each)
                                      </span>
                                    </label>
                                  </div>
            
                                  {/* ✅ NEW: Image Preview Grid */}
                                  {selectedImages.length > 0 && (
                                    <div style={{
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                      gap: '1rem',
                                      marginTop: '1rem'
                                    }}>
                                      {selectedImages.map((image, index) => (
                                        <div key={index} style={{
                                          position: 'relative',
                                          aspectRatio: '1',
                                          borderRadius: '8px',
                                          overflow: 'hidden',
                                          border: '2px solid #e2e8f0',
                                          transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.borderColor = '#6366f1';
                                          const btn = e.currentTarget.querySelector('button');
                                          if (btn) btn.style.opacity = 1;
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.borderColor = '#e2e8f0';
                                          const btn = e.currentTarget.querySelector('button');
                                          if (btn) btn.style.opacity = 0;
                                        }}
                                        >
                                          <img 
                                            src={image.preview} 
                                            alt={`Upload ${index + 1}`}
                                            style={{
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'cover'
                                            }}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => removeImage(index)}
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
                                              opacity: 0,
                                              transition: 'opacity 0.2s'
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
                                  )}
                                  
                                  {/* ✅ NEW: Show message if no images uploaded */}
                                  {selectedImages.length === 0 && (
                                    <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>
                                      At least one image is required
                                    </small>
                                  )}
                                  
                                </div>
            
                                {/* Professional 2-Column Grid Layout */}
                                <div className="form-grid">
                                  
                                  {/* Row 1: Project Title & Status */}
                                  <div className="form-group">
                                    <label className="form-label">Project Title *</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      placeholder="e.g., AI-Powered Customer Service Chatbot"
                                      value={projectForm.title}
                                      onChange={(e) => handleFormChange('title', e.target.value)}
                                      required
                                    />
                                  </div>
            
                                  <div className="form-group">
                                    <label className="form-label">Status *</label>
                                    <select
                                      className="form-select"
                                      value={projectForm.status}
                                      onChange={(e) => handleFormChange('status', e.target.value)}
                                      required
                                    >
                                      <option value="open">Auction</option>
                                      <option value="fixed_price">Fixed Price</option>
                                    </select>
                                  </div>
            
                                  {/* Row 2: Category & Location */}
                                  <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <select
                                      className="form-select"
                                      value={projectForm.category}
                                      onChange={(e) => handleFormChange('category', e.target.value)}
                                      required
                                    >
                                      <option value="Machine Learning">Machine Learning</option>
                                      <option value="Natural Language Processing">Natural Language Processing</option>
                                      <option value="Computer Vision">Computer Vision</option>
                                      <option value="Automation">Automation</option>
                                    </select>
                                  </div>
            
                                  <div className="form-group">
                                    <label className="form-label">Location</label>
                                    <div className="multi-select-container">
                                      <div 
                                        className="multi-select-input"
                                        onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                                      >
                                        {projectForm.location === '' ? (
                                          <span className="text-tertiary">Select location...</span>
                                        ) : (
                                          <span>{projectForm.location}</span>
                                        )}
                                        <MapPin className="w-4 h-4 text-secondary ml-auto" />
                                      </div>
                                      
                                      {showLocationDropdown && (
                                        <div className="multi-select-dropdown">
                                          {locationOptions.map((location, index) => (
                                            <div
                                              key={index}
                                              className={`multi-select-option ${projectForm.location === location ? 'selected' : ''}`}
                                              onClick={() => {
                                                handleFormChange('location', location);
                                                setShowLocationDropdown(false);
                                              }}
                                            >
                                              <MapPin className="w-4 h-4 text-secondary" />
                                              <span>{location}</span>
                                              {projectForm.location === location && (
                                                <CheckCircle2 className="w-4 h-4 text-primary-600 ml-auto" />
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
            
                                  {/* Row 3: Budget & Starting Bid */}
                                  <div className="form-group">
                                    <label className="form-label">Budget (USD) *</label>
                                    <div className="input-with-icon">
                                      <DollarSign className="input-icon" />
                                      <input
                                        type="number"
                                        className="form-input"
                                        placeholder="10000"
                                        min="0"
                                        step="1"
                                        value={projectForm.budget}
                                        onChange={(e) => handleFormChange('budget', e.target.value)}
                                        required
                                      />
                                    </div>
                                  </div>
            
                                  <div className="form-group">
                                    <label className="form-label">
                                      Starting Bid (USD) *
                                      {projectForm.status === 'fixed_price' && (
                                        <span style={{ 
                                          color: '#ef4444', 
                                          fontSize: '0.75rem', 
                                          marginLeft: '0.5rem',
                                          fontWeight: 400 
                                        }}>
                                          (No starting bid for fixed price projects)
                                        </span>
                                      )}
                                    </label>
                                    <div className="input-with-icon">
                                      <DollarSign className="input-icon" />
                                      <input
                                        type="number"
                                        className="form-input"
                                        placeholder="5000"
                                        min="0"
                                        step="1"
                                        value={projectForm.lowest_bid}
                                        onChange={(e) => handleFormChange('lowest_bid', e.target.value)}
                                        disabled={projectForm.status === 'fixed_price'}
                                        required={projectForm.status === 'open'}
                                        style={{
                                          backgroundColor: projectForm.status === 'fixed_price' ? '#f1f5f9' : 'white',
                                          cursor: projectForm.status === 'fixed_price' ? 'not-allowed' : 'text',
                                          opacity: projectForm.status === 'fixed_price' ? 0.6 : 1
                                        }}
                                      />
                                    </div>
                                    {projectForm.status === 'open' && projectForm.budget && projectForm.lowest_bid && 
                                     parseFloat(projectForm.lowest_bid) > parseFloat(projectForm.budget) && (
                                      <small style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                                        Starting bid cannot be greater than budget
                                      </small>
                                    )}
                                  </div>
            
                                  {/* Row 4: Tech Stack (Full Width) */}
                                  <div className="form-group form-group-full">
                                    <label className="form-label">Tech Stack * <span className="text-secondary text-sm">(Select multiple)</span></label>
                                    <div className="multi-select-container">
                                      <div 
                                        className="multi-select-input"
                                        onClick={() => setShowTechDropdown(!showTechDropdown)}
                                      >
                                        {projectForm.tech_stack.length === 0 ? (
                                          <span className="text-tertiary">Select technologies...</span>
                                        ) : (
                                          <div className="selected-items">
                                            {projectForm.tech_stack.map((tech, index) => (
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
                                              className={`multi-select-option ${projectForm.tech_stack.includes(tech) ? 'selected' : ''}`}
                                              onClick={() => toggleTechStack(tech)}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={projectForm.tech_stack.includes(tech)}
                                                onChange={() => {}}
                                                className="multi-select-checkbox"
                                              />
                                              <span>{tech}</span>
                                              {projectForm.tech_stack.includes(tech) && (
                                                <CheckCircle2 className="w-4 h-4 text-primary-600 ml-auto" />
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
                                      placeholder="Describe your project in detail..."
                                      rows="5"
                                      value={projectForm.description}
                                      onChange={(e) => handleFormChange('description', e.target.value)}
                                      required
                                    />
                                  </div>
            
                                  {/* Row 6: Requirements - Full Width */}
                                  <div className="form-group form-group-full">
                                    <label className="form-label">Requirements</label>
                                    <textarea
                                      className="form-textarea"
                                      placeholder="List specific requirements and deliverables..."
                                      rows="4"
                                      value={projectForm.requirements}
                                      onChange={(e) => handleFormChange('requirements', e.target.value)}
                                    />
                                  </div>
            
                                </div>
                              </>
                   )}
            
                  </div>
            
                  <div className="modal-footer">
                            <button 
                              type="button" 
                              className="btn btn-outline" 
                              onClick={() => setShowPostDialog(false)}
                              disabled={postLoading}
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                            {postingCredits > 0 && (
                              <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={postLoading || uploadingImages || !isFormValid()}
                              >
                                {postLoading || uploadingImages ? (
                                  <>
                                    <div className="spinner-small" />
                                    {uploadingImages ? 'Uploading Images...' : 'Posting...'}
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4" />
                                    Post Project
                                  </>
                                )}
                              </button>
                            )}
                  </div>
            </form>

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
                          Project Images (Max 5 total) *
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
                          <label className="form-label">
                            Budget (USD) *
                            <span style={{ 
                              color: '#64748b', 
                              fontSize: '0.75rem', 
                              marginLeft: '0.5rem',
                              fontWeight: 400 
                            }}>
                              {/* (Cannot be edited) */}
                            </span>
                          </label>
                          <input
                            type="number"
                            className="form-input"
                            min="0"
                            step="100"
                            value={editForm.budget}
                            required
                            placeholder="5000"
                            // disabled={true}
                            style={{
                              backgroundColor: '#f1f5f9',
                              cursor: 'pointer',
                              opacity: 0.7
                            }}
                          />
                        </div>
      
                        {/* Row 3: Status */}
                        <div className="form-group" style={{display:'none'}}>
                          <label className="form-label">
                            Status
                            <span style={{ 
                              color: '#64748b', 
                              fontSize: '0.75rem', 
                              marginLeft: '0.5rem',
                              fontWeight: 400 
                            }}>
                              (Cannot be edited)
                            </span>
                          </label>
                          <select
                            className="form-select"
                            value={editForm.status}
                            disabled={true}
                            style={{
                              backgroundColor: '#f1f5f9',
                              cursor: 'not-allowed',
                              opacity: 0.7
                            }}
                          >
                            <option value="open">Auction</option>
                            <option value="fixed_price">Fixed Price</option>
                            <option value="closed">Closed</option>
                            <option value="in_progress">In Progress</option>
                          </select>
                        </div>
      
                        {/* Row 4: Location & Tech Stack */}
                        <div className="form-group">
                          <label className="form-label">Location *</label>
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
                        disabled={loading || uploadingEditImages || !isEditFormValid()}
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

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && projectToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteDialog(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Project</h2>
              <button className="modal-close" onClick={() => setShowDeleteDialog(false)}>
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
                onClick={() => setShowDeleteDialog(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteProject}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Bidding Confirmation Dialog */}
       {showCloseBiddingDialog && projectToClose && (
              <div className="modal-overlay" onClick={() => setShowCloseBiddingDialog(false)}>
                <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
                
                  <div className="modal-header">
                    <h2 className="modal-title">Close Bidding</h2>
                    <button className="modal-close" onClick={() => setShowCloseBiddingDialog(false)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
      
                  <div className="modal-body">
                    <div className="close-bidding-info">
                      <Lock className="w-12 h-12 text-warning" />
                      <p>Are you sure you want to close bidding for this project?</p>
                      <p className="close-project-name">"{projectToClose.title}"</p>
                      
                      {projectToClose.highest_bid && (
                        <div className="highest-bid-info">
                          <p className="highest-bid-label">Current Highest Bid:</p>
                          <p className="highest-bid-amount">
                            ${parseFloat(projectToClose.highest_bid).toLocaleString()}
                          </p>
                        </div>
                      )}
                      
                      <div className="close-bidding-warning">
                        <p><strong>What happens next:</strong></p>
                        <ul>
                          <li>No more bids will be accepted</li>
                          <li>The highest accepted bid will be selected</li>
                          <li>The winning developer will be notified</li>
                          <li>Project status will change to "In Progress"</li>
                        </ul>
                      </div>
                    </div>
                  </div>
      
                  <div className="modal-footer">
                  
                    <button 
                      className="btn btn-outline"
                      onClick={() => setShowCloseBiddingDialog(false)}
                      disabled={closeBiddingLoading}
                    >
                      Cancel
                    </button>
                    
                    <button 
                      className="btn btn-warning"
                      onClick={handleCloseBidding}
                      disabled={closeBiddingLoading}
                    >
                      {closeBiddingLoading ? (
                        <>
                          <div className="spinner-small" />
                          Closing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Close Bidding
                        </>
                      )}
                    </button>
                  
                  </div>
                </div>
              </div>
      )}

    </div>

  );
};

export default Dashboard;
