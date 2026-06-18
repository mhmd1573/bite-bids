import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Building2, MapPin, Calendar, Briefcase,
  Edit, Save, X, Check, AlertCircle, Shield,
  Code, Award, Clock, Sparkles, Info
} from 'lucide-react';
import axios from 'axios';
import './Profile.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Profile = ({ user }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    company: '',
    bio: '',
    address: '',
    skills: []
  });

  // Email verification state
  const [emailVerificationPending, setEmailVerificationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);

  // Notification modal states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationConfig, setNotificationConfig] = useState({
    type: 'success',
    title: '',
    message: ''
  });

  // Tech stack multi-select state
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  
  // Available skills options
  const skillsOptions = [
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
    'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy',
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
    'Git', 'CI/CD', 'GraphQL', 'REST API', 'Microservices'
  ];

  // Show notification function
  const showNotificationModal = (type, title, message) => {
    setNotificationConfig({ type, title, message });
    setShowNotification(true);
  };

  // Close notification function
  const closeNotification = () => {
    setShowNotification(false);
  };

  // Fetch user profile data
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (!emailVerificationPending) return;
    const timeoutId = setTimeout(() => {
      setEmailVerificationPending(false);
    }, 5000);
    return () => clearTimeout(timeoutId);
  }, [emailVerificationPending]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BACKEND_URL}/api/users/me`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setProfileData(response.data);
      setEditForm({
        name: response.data.name || '',
        email: response.data.email || '',
        company: response.data.company || '',
        bio: response.data.bio || '',
        address: response.data.address || '',
        skills: response.data.skills || []
      });

      // Check if there's a pending email change
      // Only show the verification message if we haven't shown it in this session
      if (response.data.pending_email) {
        setPendingEmail(response.data.pending_email);

        // Don't automatically show the banner on page load
        // It will only be shown after the user saves their profile (see handleSaveProfile)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      showNotificationModal('error', 'Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Handle skill selection
  const toggleSkill = (skill) => {
    setEditForm(prev => {
      const currentSkills = prev.skills;
      const isSelected = currentSkills.includes(skill);
      
      return {
        ...prev,
        skills: isSelected
          ? currentSkills.filter(s => s !== skill)
          : [...currentSkills, skill]
      };
    });
  };
  
  // Remove skill from selected
  const removeSkill = (skill) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  // Handle edit mode
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to current profile data
    setEditForm({
      name: profileData.name || '',
      email: profileData.email || '',
      company: profileData.company || '',
      bio: profileData.bio || '',
      address: profileData.address || '',
      skills: profileData.skills || []
    });
    setShowSkillsDropdown(false);
  };

  // Handle save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!editForm.name || !editForm.name.trim()) {
      showNotificationModal('error', 'Validation Error', 'Name cannot be empty.');
      return;
    }
    if (!editForm.email || !editForm.email.trim()) {
      showNotificationModal('error', 'Validation Error', 'Email cannot be empty.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const updateData = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        company: editForm.company?.trim() || '',
        bio: editForm.bio?.trim() || '',
        address: editForm.address?.trim() || '',
        skills: editForm.skills
      };

      const response = await axios.put(
        `${BACKEND_URL}/api/users/me`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Check if email change requires verification
      if (editForm.email !== profileData.email) {
        showNotificationModal(
          'success', 
          'Verification Email Sent', 
          `A verification email has been sent to ${editForm.email}. Please check your inbox to confirm your new email address.`
        );
        setEmailVerificationPending(true);
        setPendingEmail(editForm.email);
      } else {
        showNotificationModal('success', 'Profile Updated!', 'Your profile has been updated successfully.');
      }
      
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to update profile. Please try again.';
      showNotificationModal('error', 'Update Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading && !profileData) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="error-message">
            <AlertCircle className="w-12 h-12 text-danger" />
            <h3>Failed to load profile</h3>
            <p>Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar-large">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt={profileData.name} />
              ) : (
                profileData.name.charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="profile-info">
              <h1 className="profile-name">{profileData.name}</h1>
              <div className="profile-meta">
                <div className="profile-meta-item">
                  <Mail className="w-4 h-4" />
                  {profileData.email}
                </div>
                <div className="profile-meta-item">
                  <Briefcase className="w-4 h-4" />
                  <span className="role-badge">{profileData.role}</span>
                </div>
                {profileData.company && (
                  <div className="profile-meta-item">
                    <Building2 className="w-4 h-4" />
                    {profileData.company}
                  </div>
                )}
                {profileData.verified && (
                  <div className="profile-meta-item text-success">
                    <Shield className="w-4 h-4" />
                    Verified
                  </div>
                )}
              </div>
            </div>

            {!isEditing && (
              <button className="btn btn-primary" onClick={handleEditClick}>
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Email Verification Alert */}
        {emailVerificationPending && (
          <div className="details-card" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '2px solid #fbbf24' , marginBottom:'5px'}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Info className="w-6 h-6" style={{ color: '#d97706' }} />
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', color: '#92400e', fontSize: '1rem', fontWeight: '600' }}>
                  Email Verification Pending
                </h3>
                <p style={{ margin: 0, color: '#78350f', fontSize: '0.875rem' }}>
                  A verification email has been sent to <strong>{pendingEmail}</strong>. 
                  Please check your inbox and click the verification link to complete the email change.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {/* <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-icon stat-icon-primary">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{profileData.projects_completed}</div>
              <div className="stat-label">Projects Completed</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-success">
              <Award className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{profileData.avg_rating.toFixed(1)} ⭐</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-info">
              <Clock className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{profileData.on_time_delivery}%</div>
              <div className="stat-label">On-Time Delivery</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-warning">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{profileData.reputation_score}</div>
              <div className="stat-label">Reputation Score</div>
            </div>
          </div>
        </div> */}

        {/* Profile Details Section */}
        <div className="profile-details-section">
          
          {/* Personal Information */}
          <div className="details-card">
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <User className="w-5 h-5 inline mr-2" />
                  Personal Information
                </h2>
                <p className="section-subtitle">Your basic profile information</p>
              </div>
            </div>

            {isEditing ? (
              <>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    placeholder="your.email@example.com"
                  />
                  <p className="form-help">
                    Changing your email will require verification before the change takes effect.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.company}
                    onChange={(e) => setEditForm({...editForm, company: e.target.value})}
                    placeholder="Your company name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.address}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    placeholder="Your address"
                  />
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-textarea"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Skills</label>
                  <div className="multi-select-wrapper">
                    <div 
                      className="multi-select-input"
                      onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
                      tabIndex={0}
                    >
                      <div className="selected-items">
                        {editForm.skills.length > 0 ? (
                          editForm.skills.map((skill) => (
                            <span key={skill} className="selected-item-tag">
                              {skill}
                              <X 
                                className="w-3 h-3 cursor-pointer" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeSkill(skill);
                                }}
                              />
                            </span>
                          ))
                        ) : (
                          <span className="text-tertiary">Select skills...</span>
                        )}
                      </div>
                      <span className="ml-auto text-secondary">▼</span>
                    </div>

                    {showSkillsDropdown && (
                      <div className="multi-select-dropdown">
                        {skillsOptions.map((skill) => (
                          <div
                            key={skill}
                            className={`multi-select-option ${editForm.skills.includes(skill) ? 'selected' : ''}`}
                            onClick={() => toggleSkill(skill)}
                          >
                            <input
                              type="checkbox"
                              className="multi-select-checkbox"
                              checked={editForm.skills.includes(skill)}
                              onChange={() => {}}
                            />
                            {skill}
                            {editForm.skills.includes(skill) && (
                              <Check className="w-4 h-4 ml-auto text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn btn-outline" onClick={handleCancelEdit} disabled={loading}>
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-small" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
              </>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <label className="info-label">Full Name</label>
                  <div className="info-value">{profileData.name}</div>
                </div>

                <div className="info-item">
                  <label className="info-label">Email Address</label>
                  <div className="info-value">{profileData.email}</div>
                </div>

                <div className="info-item">
                  <label className="info-label">Company</label>
                  <div className="info-value">{profileData.company || 'Not provided'}</div>
                </div>

                <div className="info-item">
                  <label className="info-label">Address</label>
                  <div className="info-value">{profileData.address || 'Not provided'}</div>
                </div>

                <div className="info-item info-item-full">
                  <label className="info-label">Bio</label>
                  <div className="info-value">{profileData.bio || 'No bio provided yet'}</div>
                </div>

                <div className="info-item info-item-full">
                  <label className="info-label">Skills</label>
                  <div className="skills-display">
                    {profileData.skills && profileData.skills.length > 0 ? (
                      profileData.skills.map((skill) => (
                        <span key={skill} className="skill-badge">
                          <Code className="w-3 h-3" />
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-tertiary">No skills listed</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Information */}
          <div className="details-card">
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <Sparkles className="w-5 h-5 inline mr-2" />
                  Account Information
                </h2>
                <p className="section-subtitle">Your account status and details</p>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label className="info-label">Account ID</label>
                <div className="info-value monospace">{profileData.id}</div>
              </div>

              <div className="info-item">
                <label className="info-label">Role</label>
                <div className="info-value">
                  <span className="role-badge">{profileData.role}</span>
                </div>
              </div>

              <div className="info-item">
                <label className="info-label">Verification Status</label>
                <div className="info-value">
                  {profileData.verified ? (
                    <span className="verified-badge">
                      <Shield className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="unverified-badge">Not Verified</span>
                  )}
                </div>
              </div>

              <div className="info-item">
                <label className="info-label">Account Created</label>
                <div className="info-value">{formatDate(profileData.created_at)}</div>
              </div>

              <div className="info-item">
                <label className="info-label">Last Updated</label>
                <div className="info-value">{formatDate(profileData.updated_at)}</div>
              </div>

              <div className="info-item">
                <label className="info-label">Last Login</label>
                <div className="info-value">{formatDate(profileData.last_login)}</div>
              </div>
            </div>
          </div>
        </div>
        
      </div>

      {/* Notification Modal */}
      {showNotification && (
        <div className="modal-overlay" onClick={closeNotification}>
          <div 
            className={`modal-content modal-sm notification-modal notification-${notificationConfig.type}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notification-header">
              <div className="notification-icon-wrapper">
                {notificationConfig.type === 'success' && (
                  <Check className="notification-icon" />
                )}
                {notificationConfig.type === 'error' && (
                  <AlertCircle className="notification-icon" />
                )}
              </div>
              <button className="modal-close" onClick={closeNotification}>
                ×
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

export default Profile;
