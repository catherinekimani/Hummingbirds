// src/Pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // States for backend data
  const [userData, setUserData] = useState(null);
  const [myTrees, setMyTrees] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalTrees: 0,
    survivalRate: 0,
    badges: 0,
    rank: 0
  });

  // Fetch data from backend when component mounts
  useEffect(() => {
    fetchUserData();
    fetchTrees();
    fetchActivities();
    fetchNotifications();
    fetchStats();
  }, []);

  const fetchUserData = async () => {
    try {
      // TODO: Replace with your API endpoint
      // const response = await fetch('YOUR_API/user/profile');
      // const data = await response.json();
      // setUserData(data);
      
      // Placeholder - will be replaced by API
      setUserData({
        name: 'User Name',
        initials: 'UN',
        role: 'Student'
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchTrees = async () => {
    try {
      setMyTrees([]);
    } catch (error) {
      console.error('Error fetching trees:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      setActivities([]);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotifications([]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchStats = async () => {
    try {
      setStats({
        totalTrees: 0,
        survivalRate: 0,
        badges: 0,
        rank: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with your API endpoint
      console.log('Profile updated:', userData);
      setShowProfileEdit(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSignOut = () => {
    // TODO: Clear authentication tokens/session
    // localStorage.removeItem('authToken');
    // sessionStorage.clear();
    
    console.log('User signed out');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <span className="tree-icon">🌳</span>
              <div>
                <h1>EcoTrack Kenya</h1>
                <p className="subtitle">15 Billion Tree Programme</p>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <Link to="/">
              <button className="home-button">
                🏠 Home
              </button>
            </Link>
            
            <div className="notification-wrapper">
              <div 
                className="notification-bell" 
                onClick={() => setShowNotifications(!showNotifications)}
              >
                🔔
                {notifications.length > 0 && (
                  <span className="notification-badge">{notifications.length}</span>
                )}
              </div>
              
              {showNotifications && (
                <div className="notification-dropdown">
                  <h3>Notifications</h3>
                  {notifications.length === 0 ? (
                    <p className="no-notifications">No new notifications</p>
                  ) : (
                    <div className="notification-list">
                      {notifications.map((notif, idx) => (
                        <div key={idx} className={`notification-item ${notif.urgent ? 'urgent' : ''}`}>
                          <p>{notif.message}</p>
                          <span className="notification-time">{notif.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="user-dropdown-wrapper">
              <div 
                className="user-profile" 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                <div className="avatar">{userData?.initials || 'U'}</div>
                <div className="user-info">
                  <p className="user-name">{userData?.name || 'User'}</p>
                  <p className="user-role">{userData?.role || 'Student'}</p>
                </div>
                <span className="dropdown-arrow">▼</span>
              </div>
              
              {showUserDropdown && (
                <div className="user-dropdown-menu">
                  <button 
                    className="dropdown-menu-item"
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowProfileEdit(true);
                    }}
                  >
                    <span className="menu-icon">👤</span>
                    User Profile
                  </button>
                  <button 
                    className="dropdown-menu-item signout-item"
                    onClick={handleSignOut}
                  >
                    <span className="menu-icon">🚪</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          {['overview', 'my-trees', 'register', 'forest-activities', 'reports', 'achievements'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
            >
              {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card stat-green">
                <div className="stat-header">
                  <div className="stat-icon">🌳</div>
                  <span className="stat-trend">+{stats.monthlyIncrease || 0} this month</span>
                </div>
                <p className="stat-label">Total Trees Planted</p>
                <p className="stat-value">{stats.totalTrees}</p>
              </div>

              <div className="stat-card stat-emerald">
                <div className="stat-header">
                  <div className="stat-icon">📈</div>
                </div>
                <p className="stat-label">Survival Rate</p>
                <p className="stat-value">{stats.survivalRate}%</p>
              </div>

              <div className="stat-card stat-yellow">
                <div className="stat-header">
                  <div className="stat-icon">🏆</div>
                </div>
                <p className="stat-label">Badges Earned</p>
                <p className="stat-value">{stats.badges}</p>
              </div>

              <div className="stat-card stat-blue">
                <div className="stat-header">
                  <div className="stat-icon">👥</div>
                </div>
                <p className="stat-label">Community Rank</p>
                <p className="stat-value">#{stats.rank || '-'}</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="main-grid">
              <div className="main-column">
                <div className="card">
                  <h2 className="card-title">My Recent Trees</h2>
                  {myTrees.length === 0 ? (
                    <div className="empty-state">
                      <p>No trees registered yet</p>
                      <button 
                        className="btn-primary" 
                        onClick={() => setActiveTab('register')}
                      >
                        Register Your First Tree
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="trees-grid">
                        {myTrees.slice(0, 2).map((tree) => (
                          <div key={tree.id} className="tree-passport">
                            <div className="passport-header">
                              <div>
                                <p className="tree-id-label">Tree ID</p>
                                <p className="tree-id">{tree.id}</p>
                              </div>
                              <span className={`status-badge status-${tree.status.toLowerCase()}`}>
                                {tree.status}
                              </span>
                            </div>
                            
                            <img src={tree.image} alt={tree.species} className="tree-image" />
                            
                            <div className="tree-details">
                              <div className="detail-row">
                                <span className="detail-icon">🌳</span>
                                <span className="detail-text">{tree.species}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-icon">📍</span>
                                <span className="detail-text">{tree.location}</span>
                              </div>
                              <p className="planted-date">Planted: {tree.datePlanted}</p>
                            </div>
                            
                            <button className="btn-passport">View Full Passport</button>
                          </div>
                        ))}
                      </div>
                      <button className="btn-view-all" onClick={() => setActiveTab('my-trees')}>
                        View All My Trees ({myTrees.length})
                      </button>
                    </>
                  )}
                </div>

                <div className="card">
                  <h2 className="card-title">Quick Actions</h2>
                  <div className="quick-actions">
                    <button className="action-btn action-green" onClick={() => setActiveTab('register')}>
                      <span className="action-icon">➕</span>
                      <span>Register Tree</span>
                    </button>
                    <button className="action-btn action-blue">
                      <span className="action-icon">📷</span>
                      <span>Update Tree</span>
                    </button>
                    <button className="action-btn action-purple">
                      <span className="action-icon">🗺️</span>
                      <span>View Map</span>
                    </button>
                    <button className="action-btn action-orange" onClick={() => setActiveTab('reports')}>
                      <span className="action-icon">🔔</span>
                      <span>Report Issue</span>
                    </button>
                  </div>
                </div>

                <div className="card">
                  <h2 className="card-title">Progress Towards 15 Billion</h2>
                  <div className="progress-section">
                    <div className="progress-item">
                      <div className="progress-header">
                        <span>National Progress</span>
                        <span className="progress-value">Loading...</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="side-column">
                <div className="card">
                  <h2 className="card-title">Recent Activity</h2>
                  {activities.length === 0 ? (
                    <p className="empty-state-text">No recent activity</p>
                  ) : (
                    <div className="activities">
                      {activities.map((activity, idx) => (
                        <div key={idx} className="activity-item">
                          <div className="activity-icon">✓</div>
                          <div className="activity-content">
                            <p className="activity-action">{activity.action}</p>
                            {activity.tree && (
                              <p className="activity-tree">{activity.tree}</p>
                            )}
                            <p className="activity-time">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'my-trees' && (
          <div>
            <div className="search-section">
              <input
                type="text"
                placeholder="Search by Tree ID, species, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button className="btn-filter">Filter</button>
            </div>

            {myTrees.length === 0 ? (
              <div className="empty-state-card">
                <h3>No Trees Yet</h3>
                <p>Start your journey by registering your first tree!</p>
                <button 
                  className="btn-primary" 
                  onClick={() => setActiveTab('register')}
                >
                  Register Tree
                </button>
              </div>
            ) : (
              <div className="trees-grid-full">
                {myTrees.map((tree) => (
                  <div key={tree.id} className="tree-passport">
                    {/* Tree passport content */}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'register' && (
          <div className="register-form-container">
            <div className="card card-form">
              <h2 className="card-title">Register New Tree</h2>
              <form className="tree-form" onSubmit={(e) => {
                e.preventDefault();
              }}>
                <div className="form-group">
                  <label>Tree Species *</label>
                  <select className="form-input" required>
                    <option value="">Select indigenous species...</option>
                    <option>Melia volkensii (Mukau)</option>
                    <option>Croton megalocarpus (Mukinduri)</option>
                    <option>Grevillea robusta (Silky Oak)</option>
                    <option>Acacia species</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location / Zone *</label>
                  <input
                    type="text"
                    placeholder="e.g., Nairobi County, Karura Forest"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>GPS Latitude (Optional)</label>
                    <input type="text" placeholder="Latitude" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>GPS Longitude (Optional)</label>
                    <input type="text" placeholder="Longitude" className="form-input" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Upload Photo *</label>
                  <input type="file" accept="image/*" className="form-input" required />
                </div>

                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <textarea
                    rows="3"
                    placeholder="Add any additional information..."
                    className="form-input"
                  ></textarea>
                </div>

                <button type="submit" className="btn-submit">
                  Register Tree & Generate Passport
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="card">
            <h2 className="card-title">Achievements & Badges</h2>
            <p className="empty-state-text">Complete activities to earn badges and achievements!</p>
          </div>
        )}

        {activeTab === 'forest-activities' && (
          <div className="card">
            <h2 className="card-title">Forest Conservation Activities</h2>
            <p>Collaborate with NGOs and Kenya Forest Service rangers on conservation projects.</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="register-form-container">
            <div className="card card-form">
              <h2 className="card-title">Report Forest Issue</h2>
              <form className="tree-form" onSubmit={(e) => {
                e.preventDefault();
              }}>
                <div className="form-group">
                  <label>Issue Type *</label>
                  <select className="form-input" required>
                    <option value="">Select issue type...</option>
                    <option>Illegal Logging</option>
                    <option>Forest Fire</option>
                    <option>Tree Disease</option>
                    <option>Encroachment</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    placeholder="e.g., Karura Forest, Section B"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    rows="4"
                    placeholder="Describe the issue in detail..."
                    className="form-input"
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Upload Photo (Optional)</label>
                  <input type="file" accept="image/*" className="form-input" />
                </div>

                <button type="submit" className="btn-submit">
                  Submit Report to KFS
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="modal-overlay" onClick={() => setShowProfileEdit(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Profile</h2>
            <form onSubmit={handleProfileUpdate} className="tree-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={userData?.name || ''}
                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={userData?.email || ''}
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={userData?.phone || ''}
                  onChange={(e) => setUserData({...userData, phone: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowProfileEdit(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;