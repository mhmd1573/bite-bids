import React, { useState, useEffect  } from 'react';
import { 
  Search, Filter, DollarSign, Clock, Star, 
  TrendingUp, Users, Code, ArrowRight, 
  CheckCircle2, Zap, Award, MapPin, Plus, X,AlertCircle,
  Upload, Image as ImageIcon, Trash2  // ✅ ADDED: New icons for image upload
} from 'lucide-react';

import './Marketplace.css';

import axios from 'axios';
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

const Marketplace = ({ user }) => {
  const { showNotification } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedStatusTab, setSelectedStatusTab] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
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
  
  // Multi-select dropdown states
  const [showTechDropdown, setShowTechDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Bid modal states
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidLoading, setBidLoading] = useState(false);
  const [bidForm, setBidForm] = useState({
    amount: '',
  });
  
  // Payment modal states for fixed price projects
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // ✅ NEW: Image upload states
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);


    // ✅ NEW
  const [postingCredits, setPostingCredits] = useState(0);
  const [checkingCredits, setCheckingCredits] = useState(false);


  // Show notification function
  const showNotificationModal = (type, title, message) => {
    showNotification(type, title, message);
  };

  
  
  // Tech stack options
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


  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  
  useEffect(() => {
  if (user?.role === 'developer') {
    fetchPostingCredits();
  }
}, [user]);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const paymentStatus = params.get('payment_status');

  if (paymentStatus === 'success') {
    fetchPostingCredits();

    showNotificationModal(
      'success',
      'Payment Successful',
      'Posting credit added successfully'
    );

    setTimeout(() => setShowPostDialog(true), 1500);

    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);


  // Fetch projects function
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/projects`);
      
      
      const projectsData = Array.isArray(response.data) 
      ? response.data
      : (response.data.projects || []);

      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPostingCredits = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${BACKEND_URL}/api/users/me/posting-credits`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      setPostingCredits(response.data.credits || 0);
    }
  } catch (error) {
    console.error('Failed to fetch posting credits', error);
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
      showNotificationModal('error', 'Load Failed', 'Failed to load project details. Please try again.');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle close details
  const handleCloseDetails = () => {
    setShowProjectDetails(false);
    setSelectedProjectDetails(null);
  };

  // ✅ NEW: Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count
    if (selectedImages.length + files.length > 5) {
      showNotificationModal('error', 'Too Many Images', 'You can upload a maximum of 5 images.');
      return;
    }

    // Validate file types and size
    for (const file of files) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        showNotificationModal('error', 'Invalid File Type', 'Only JPEG and PNG images are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotificationModal('error', 'File Too Large', 'Each image must be less than 5MB.');
        return;
      }
    }

    // Convert to base64 for preview and storage
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

  // ✅ NEW: Remove image
  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
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
        // Redirect to Stripe Checkout
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

  // ✅ UPDATED: Handle post project (now includes image upload)
  const handlePostProject = async (e) => {
    e.preventDefault();
    setPostLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Upload images first
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
        deadline: null,  // No deadline field
        lowest_bid: parseFloat(projectForm.lowest_bid),
        location: projectForm.location || 'Remote',
        images: imageUrls  // ✅ NEW: Include uploaded image URLs
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
      
      // Success
      showNotificationModal('success', 'Success!', 'Your project has been posted successfully and is now live on the marketplace.');
      setShowPostDialog(false);
      setSelectedImages([]);  // ✅ NEW: Clear images
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



  // Handle bid form changes
  const handleBidFormChange = (field, value) => {
    setBidForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle open bid modal
  const handleOpenBidModal = () => {
    setBidForm({
      amount: '',
    });
    setShowBidModal(true);
  };

  // Handle close bid modal
  const handleCloseBidModal = () => {
    setShowBidModal(false);
    setBidForm({
      amount: '',
    });
  };

  // Handle submit bid
  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setBidLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showNotificationModal('error', 'Authentication Required', 'Please log in to place a bid.');
        setBidLoading(false);
        return;
      }

      const lowestAllowed = (selectedProjectDetails?.lowest_bid || selectedProjectDetails?.budget || 0);

      // Validation: Bid must be greater than the lowest bid
      if (parseFloat(bidForm.amount) <= lowestAllowed) {
        showNotificationModal(
          'error',
          'Bid Too Low',
          `Your bid must be higher than the current lowest bid of $${lowestAllowed.toLocaleString()}.`
        );
        setBidLoading(false);
        return;
      }

      const bidData = {
        amount: parseFloat(bidForm.amount),
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/projects/${selectedProjectDetails.id}/bids`,
        bidData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Success
      showNotificationModal('success', 'Bid Submitted!', 'Your bid has been successfully submitted. The developer will review it and get back to you.');
      handleCloseBidModal();
      handleCloseDetails();
      fetchProjects();

      // Refresh project details to show updated bid count
      if (selectedProjectDetails) {
        fetchProjectDetails(selectedProjectDetails.id);
      }
    } catch (error) {
      console.error('Failed to submit bid:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to submit bid. Please try again.';
      showNotificationModal('error', 'Bid Submission Failed', errorMessage);
    } finally {
      setBidLoading(false);
    }
  };

  // Handle Pay Now for fixed price projects
  const handlePayNow = () => {
    if (!selectedProjectDetails) {
      showNotificationModal('error', 'Error', 'No project selected');
      return;
    }

    setShowProjectDetails(false);
    setShowPaymentModal(true);
  };

  // Handle close payment modal
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  // Handle payment submission
  const handleSubmitPayment = async (billingDetails) => {
    if (!selectedProjectDetails || !user) {
      showNotificationModal('error', 'Error', 'Missing project or user information');
      return;
    }

    setPaymentLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${BACKEND_URL}/api/payments/stripe/create-checkout-session`,
        {
          order_type: 'fixed',
          item_id: selectedProjectDetails.id,
          customer_email: user.email,
          customer_name: user.name,
          billing_address: billingDetails,
          payment_method: 'card',
          amount: selectedProjectDetails.budget,
          project_id: selectedProjectDetails.id
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error) {
      console.error('Failed to initiate payment:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to initiate payment. Please try again.';
      showNotificationModal('error', 'Payment Failed', errorMessage);
      setPaymentLoading(false);
    }
  };

  
  const categories = [
    { id: 'all', label: 'All Projects', icon: Code },
    { id: 'Machine Learning', label: 'Machine Learning', icon: Zap },
    { id: 'Natural Language Processing', label: 'Natural Language Processing', icon: Users },
    { id: 'Computer Vision', label: 'Computer Vision', icon: Award },
    { id: 'Automation', label: 'Automation', icon: TrendingUp },
  ];


  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesBudget = selectedBudget === 'all' || 
                         (selectedBudget === 'low' && project.budget < 5000) ||
                         (selectedBudget === 'mid' && project.budget >= 5000 && project.budget < 10000) ||
                         (selectedBudget === 'high' && project.budget >= 10000);
    
    const matchesStatus = selectedStatusTab === 'all' || project.status === selectedStatusTab;
    
    return matchesSearch && matchesCategory && matchesBudget && matchesStatus;
  });

  const stats = {
    totalProjects: projects.length,
    openBids: projects.filter(p => p.status === 'open').length,
    avgBudget: projects.length > 0 
      ? Math.round(projects.reduce((acc, p) => acc + (p.budget || 0), 0) / projects.length) 
      : 0
  };


  return (
    <div className="marketplace">
      
      {/* Hero Section */}
      <section className="marketplace-hero">
        <div className="container">
          <div className="marketplace-hero-content">
            <h1 className="marketplace-hero-title">
              Discover Your Next
              <span className="text-brand"> AI Project</span>
            </h1>
            <p className="marketplace-hero-description">
              Browse thousands of AI development projects from top companies worldwide
            </p>

            {/* Search Bar */}
            <div className="marketplace-search">
              <div className="search-input-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search projects by title, description, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <button className="btn btn-primary">
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>

            {/* Stats */}
            <div className="marketplace-stats">
              <div className="stat">
                <div className="stat-value">1,247</div>
                <div className="stat-label">Active Projects</div>
              </div>
              <div className="stat">
                <div className="stat-value">$2.5M+</div>
                <div className="stat-label">Available Budget</div>
              </div>
              <div className="stat">
                <div className="stat-value">856</div>
                <div className="stat-label">Developers</div>
              </div>
              <div className="stat">
                <div className="stat-value">4.8★</div>
                <div className="stat-label">Avg Rating</div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Filters & Projects Section */}
      <section className="marketplace-content">
        <div className="container">
          
          <div className="marketplace-layout">
            
            {/* Sidebar Filters */}
            <aside className="marketplace-sidebar">
              <div className="filter-section">
                <div className="filter-header">
                  <Filter className="w-5 h-5" />
                  <h3>Filters</h3>
                </div>

                {/* Categories */}
                <div className="marketplace-filter-group">
                  <h4 className="marketplace-filter-group-title">Categories</h4>
                  <div className="filter-options">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`filter-option ${selectedCategory === category.id ? 'filter-option-active' : ''}`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{category.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Budget Range */}
                <div className="marketplace-filter-group">
                  <h4 className="marketplace-filter-group-title">Budget Range</h4>
                  <div className="filter-options">
                    <button
                      onClick={() => setSelectedBudget('all')}
                      className={`filter-option ${selectedBudget === 'all' ? 'filter-option-active' : ''}`}
                    >
                      <span>All Budgets</span>
                    </button>
                    <button
                      onClick={() => setSelectedBudget('low')}
                      className={`filter-option ${selectedBudget === 'low' ? 'filter-option-active' : ''}`}
                    >
                      <span>Under $5,000</span>
                    </button>
                    <button
                      onClick={() => setSelectedBudget('mid')}
                      className={`filter-option ${selectedBudget === 'mid' ? 'filter-option-active' : ''}`}
                    >
                      <span>$5,000 - $10,000</span>
                    </button>
                    <button
                      onClick={() => setSelectedBudget('high')}
                      className={`filter-option ${selectedBudget === 'high' ? 'filter-option-active' : ''}`}
                    >
                      <span>$10,000+</span>
                    </button>
                  </div>
                </div>

                {/* Clear Filters */}
                <button className="btn btn-outline btn-block">
                  Clear All Filters
                </button>
              </div>
            </aside>

            {/* Projects Grid */}
            <div className="marketplace-main">
              <div className="marketplace-header">
                <div>
                  <h2 className="marketplace-title">Available Projects</h2>
                  <p className="marketplace-subtitle">
                    Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="marketplace-header-actions">
                  <select className="sort-select">
                    <option value="recent">Most Recent</option>
                    <option value="budget-high">Budget: High to Low</option>
                    <option value="budget-low">Budget: Low to High</option>
                    <option value="deadline">Deadline</option>
                    <option value="bids">Most Bids</option>
                  </select>
                  
                  {/* ✅ UPDATED: Post Project Button */}
                  {user && user.role === 'developer' && (
                    <button
                    className="btn btn-primary post-project-btn"
                    onClick={() => setShowPostDialog(true)}
                  >
                    <Plus className="w-5 h-5" />
                    Post Project
                  </button>

                  )}

                </div>
              </div>

              {/* Status Tabs */}
              <div className="status-tabs">
                <button
                  className={`status-tab ${selectedStatusTab === 'all' ? 'status-tab-active' : ''}`}
                  onClick={() => setSelectedStatusTab('all')}
                >
                  All Projects
                  <span className="status-tab-count">{projects.length}</span>
                </button>
                <button
                  className={`status-tab ${selectedStatusTab === 'open' ? 'status-tab-active' : ''}`}
                  onClick={() => setSelectedStatusTab('open')}
                >
                  Open for Bids
                  <span className="status-tab-count">
                    {projects.filter(p => p.status === 'open').length}
                  </span>
                </button>
                <button
                  className={`status-tab ${selectedStatusTab === 'in_progress' ? 'status-tab-active' : ''}`}
                  onClick={() => setSelectedStatusTab('in_progress')}
                >
                  In Progress
                  <span className="status-tab-count">
                    {projects.filter(p => p.status === 'in_progress').length}
                  </span>
                </button>
                <button
                  className={`status-tab ${selectedStatusTab === 'fixed_price' ? 'status-tab-active' : ''}`}
                  onClick={() => setSelectedStatusTab('fixed_price')}
                >
                  Fixed Price
                  <span className="status-tab-count">
                    {projects.filter(p => p.status === 'fixed_price').length}
                  </span>
                </button>
                <button
                  className={`status-tab ${selectedStatusTab === 'closed' ? 'status-tab-active' : ''}`}
                  onClick={() => setSelectedStatusTab('closed')}
                >
                  Closed
                  <span className="status-tab-count">
                    {projects.filter(p => p.status === 'closed').length}
                  </span>
                </button>
              </div>

              {/* Projects List */}
              <div className="projects-grid">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="project-card">
      
                    <div className="project-badges-container-market">

                      {project.status && (
                        <div
                          className={`project-badge-status ${
                            project.status === "closed"
                              ? "bg-danger"
                              : project.status === "fixed_price"
                              ? "bg-warning"
                              : project.status === "in_progress"
                              ? "bg-default"
                              : "bg-default"
                          }`}
                        >
                          {project.status}
                        </div>
                      )}

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


                    <div className="project-card-header">
                      <div className="project-client">
                        <div className="client-avatar">
                           {project.developer?.company ? project.developer.company[0] : 'N/A'}
                        </div>
                        <div>

                          <div className="client-name">
                            {project.developer?.company || 'Unknown Company'}
                            {project.verified && (
                              <CheckCircle2 className="w-4 h-4 text-success-600" />
                            )}
                          </div>

                          <div className="client-location">
                            <MapPin className="w-3 h-3" />
                            {project.location}
                          </div>

                        </div>
                      </div>
                      
                    </div>

                    <div className="project-card-body">
                      <h3 className="project-title">{project.title}</h3>
                      <p className="project-description">{project.description}</p>

                      <div className="project-skills">
                        {project.tech_stack.map((skill, index) => (
                          <span key={index} className="badge badge-gray">
                            {skill}
                          </span>
                        ))}
                      </div>

                   {/* ✅ NEW: Project Images Preview */}
                    {project.images && project.images.length > 0 && (
                      <div style={{ 
                        margin: '1rem 0',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.5rem',
                        position: 'relative'
                      }}>
                        {project.images.slice(0, 3).map((img, idx) => (
                          <img
                            key={idx}
                            src={getImageUrl(img)}
                            alt={`Project ${idx + 1}`}
                            style={{
                              width: '100%',
                              aspectRatio: '1',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              cursor: 'pointer',
                              transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                          />
                        ))}
                        {project.images.length > 3 && (
                          <div style={{
                            position: 'absolute',
                            bottom: '0.5rem',
                            right: '0.5rem',
                            background: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: 600
                          }}>
                            +{project.images.length - 3}
                          </div>
                        )}
                      </div>
                    )}


                    </div>

                    <div className="project-card-footer">
                    
                      <div className="project-meta-row">
                        
                        <div className="project-meta-item">
                          <DollarSign className="w-4 h-4 text-success-600" />
                          <span className="project-budget">${project.budget != null ? project.budget.toLocaleString() : 'N/A'}</span>
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

                        <div className="project-meta-item">
                          <Users className="w-4 h-4 text-secondary" />
                          <span>{project.bids_count} bids</span>
                        </div>

                      </div>

                      <button 
                        className="btn btn-primary btn-block"
                        onClick={() => fetchProjectDetails(project.id)}
                        disabled={detailsLoading}
                      >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    
                    </div>

                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="marketplace-footer">
                <button className="btn btn-outline btn-lg">
                  Load More Projects
                </button>
              </div>

            </div>
            
          </div>

        </div>
      </section>

      {/* Post Project Dialog */}
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

                      {/* Row 4: Tech Stack & Location */}
                      <div className="form-group">
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

      {/* Bid Modal */}
      {showBidModal && (
        <div className="modal-overlay" onClick={handleCloseBidModal}>
          
          <div className="modal-content modal-md bid-modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmitBid}>
              <div className="modal-header">
                <h2 className="modal-title">Place Your Bid</h2>
                <button 
                  type="button" 
                  className="modal-close" 
                  onClick={handleCloseBidModal}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
              
                {selectedProjectDetails && (
                  <div className="bid-project-info">
                    <h4>{selectedProjectDetails.title}</h4>
                    <div className="bid-project-meta">
                      <span>Budget: ${selectedProjectDetails.budget != null ? selectedProjectDetails.budget.toLocaleString() : 'N/A'}</span>
                      <span className="separator">•</span>
                      <span>{selectedProjectDetails.bids_count} existing bids</span>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Your Bid Amount (USD) *</label>

                  <div className="input-with-icon">
                    <DollarSign className="input-icon" />
                    <input
                      type="number"
                      className="form-input"
                      placeholder={`Minimum: $${(
                        (selectedProjectDetails?.highest_bid ||
                          selectedProjectDetails?.lowest_bid ||
                          selectedProjectDetails?.budget ||
                          0) + 1
                      ).toLocaleString()}`}
                      min={
                        (selectedProjectDetails?.highest_bid ||
                          selectedProjectDetails?.lowest_bid ||
                          selectedProjectDetails?.budget ||
                          0) + 1
                      }
                      step="1"
                      value={bidForm.amount}
                      onChange={(e) => handleBidFormChange('amount', e.target.value)}
                      required
                    />
                  </div>

                  <small className="form-help">
                    Project budget: ${selectedProjectDetails?.budget != null ? selectedProjectDetails.budget.toLocaleString() : 'N/A'}
                  </small>
                </div>


              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={handleCloseBidModal}
                  disabled={bidLoading}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={bidLoading}
                >
                  {bidLoading ? (
                    <>
                      <div className="spinner-small" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      Submit Bid
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* Payment Modal for Fixed Price Projects */}
      {showPaymentModal && selectedProjectDetails && (
        <div className="modal-overlay" onClick={handleClosePaymentModal}>
          <div className="modal-content modal-lg payment-modal" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <h2 className="modal-title">
                <DollarSign className="w-6 h-6" />
                Complete Payment
              </h2>
              <button 
                type="button" 
                className="modal-close" 
                onClick={handleClosePaymentModal}
                disabled={paymentLoading}
              >
                ×
              </button>
            </div>

            <div className="modal-body payment-modal-body">
              
              <div className="payment-project-info">
                <h4>{selectedProjectDetails.title}</h4>
                <div className="payment-project-meta">
                  <span className="badge badge-info">Fixed Price</span>
                  <span className="separator">•</span>
                  <span>{selectedProjectDetails.category}</span>
                </div>
              </div>

              <div className="payment-columns">
                
                <div className="payment-left-section">
                  
                  <div className="payment-info-box">
                    <div className="info-icon">
                      <CheckCircle2 className="w-5 h-5 text-success-600" />
                    </div>
                    <div className="info-content">
                      <h4>Secure Escrow Payment</h4>
                      <p>Your payment will be held securely in escrow until project completion. The developer will be notified and a chat room will be created for collaboration.</p>
                    </div>
                  </div>

                  <div className="payment-next-steps">
                    <h4>What happens next?</h4>
                    <ul>
                      <li>
                        <CheckCircle2 className="w-4 h-4 text-success-600" />
                        <span>Payment securely held in escrow</span>
                      </li>
                      <li>
                        <CheckCircle2 className="w-4 h-4 text-success-600" />
                        <span>Developer notified and assigned to project</span>
                      </li>
                      <li>
                        <CheckCircle2 className="w-4 h-4 text-success-600" />
                        <span>Chat room created for collaboration</span>
                      </li>
                      <li>
                        <CheckCircle2 className="w-4 h-4 text-success-600" />
                        <span>Project status updated to "In Progress"</span>
                      </li>
                      <li>
                        <CheckCircle2 className="w-4 h-4 text-success-600" />
                        <span>Both parties receive email confirmations</span>
                      </li>
                    </ul>
                  </div>

                </div>

                <div className="payment-right-section">
                  
                  <div className="payment-summary">
                    <h3 className="section-title">Payment Summary</h3>
                    
                    <div className="payment-item">
                      <span>Project Budget</span>
                      <span className="payment-amount">${selectedProjectDetails.budget.toLocaleString()}</span>
                    </div>

                    <div className="payment-item">
                      <span>Platform Fee (6%)</span>
                      <span className="payment-amount">${(selectedProjectDetails.budget * 0.06).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>

                    <div className="payment-item">
                      <span>Fixed Fee</span>
                      <span className="payment-amount">$30.00</span>
                    </div>

                    <div className="payment-divider"></div>

                    <div className="payment-item payment-total">
                      <span>Total Amount</span>
                      <span className="payment-amount-total">
                        ${(selectedProjectDetails.budget + (selectedProjectDetails.budget * 0.06) + 30).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={handleClosePaymentModal}
                disabled={paymentLoading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-success"
                onClick={() => handleSubmitPayment({
                  address1: '123 Main St',
                  city: 'City',
                  state: 'State',
                  postal_code: '12345',
                  country: 'US'
                })}
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <>
                    <div className="loading-spinner" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    Proceed to Payment
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

export default Marketplace;
