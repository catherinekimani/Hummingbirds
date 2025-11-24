// src/Pages/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    registrationNumber: '',
    role: 'student'
  });

  // States for backend data
  const [orgData, setOrgData] = useState({
    name: 'Organization Name',
    totalUsers: 0,
    totalTrees: 0,
    survivalRate: 0,
    activeProjects: 0
  });

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchOrgData();
    fetchUsers();
    fetchProjects();
    fetchNotifications();
    fetchActivities();
  }, []);

  const fetchOrgData = async () => {
    try {
      // TODO: Replace with your API endpoint
    } catch (error) {
      console.error('Error fetching organization data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsers([]);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      setProjects([]);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotifications([]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      setActivities([]);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      console.log('Adding user:', newUser);
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', phone: '', registrationNumber: '', role: 'student' });
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      console.log('Profile updated:', orgData);
      setShowProfileEdit(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSignOut = () => {
    // TODO: Clear authentication tokens/session
    console.log('Admin signed out');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <span className="tree-icon">🏫</span>
              <div>
                <h1>{orgData.name}</h1>
                <p className="subtitle">Organization Admin Dashboard</p>
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
                <div className="avatar">AD</div>
                <div className="user-info">
                  <p className="user-name">Admin</p>
                  <p className="user-role">Organization</p>
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
          {['overview', 'users', 'projects', 'reports', 'achievements', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card stat-blue">
                <div className="stat-header">
                  <div className="stat-icon">👥</div>
                </div>
                <p className="stat-label">Total Users</p>
                <p className="stat-value">{orgData.totalUsers}</p>
              </div>

              <div className="stat-card stat-green">
                <div className="stat-header">
                  <div className="stat-icon">🌳</div>
                </div>
                <p className="stat-label">Total Trees Planted</p>
                <p className="stat-value">{orgData.totalTrees}</p>
              </div>

              <div className="stat-card stat-emerald">
                <div className="stat-header">
                  <div className="stat-icon">📈</div>
                </div>
                <p className="stat-label">Survival Rate</p>
                <p className="stat-value">{orgData.survivalRate}%</p>
              </div>

              <div className="stat-card stat-yellow">
                <div className="stat-header">
                  <div className="stat-icon">📋</div>
                </div>
                <p className="stat-label">Active Projects</p>
                <p className="stat-value">{orgData.activeProjects}</p>
              </div>
            </div>

            <div className="main-grid">
              <div className="main-column">
                <div className="card">
                  <h2 className="card-title">Active Projects</h2>
                  {projects.filter(p => p.status === 'Active').length === 0 ? (
                    <div className="empty-state">
                      <p>No active projects yet</p>
                      <button className="btn-primary" onClick={() => setActiveTab('projects')}>
                        Create First Project
                      </button>
                    </div>
                  ) : (
                    <div className="projects-list">
                      {projects.filter(p => p.status === 'Active').map(project => (
                        <div key={project.id} className="project-card">
                          <div className="project-header">
                            <h3>{project.name}</h3>
                            <span className="status-badge status-active">
                              {project.status}
                            </span>
                          </div>
                          <div className="project-stats">
                            <span>🌳 {project.trees} trees</span>
                            <span>👥 {project.members} members</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card">
                  <h2 className="card-title">Top Contributors</h2>
                  {users.length === 0 ? (
                    <p className="empty-state-text">No users added yet</p>
                  ) : (
                    <div className="contributors-list">
                      {users.slice(0, 5).map(user => (
                        <div key={user.id} className="contributor-item">
                          <div className="contributor-info">
                            <div className="avatar-small">{user.name.charAt(0)}</div>
                            <div>
                              <p className="contributor-name">{user.name}</p>
                              <p className="contributor-reg">{user.regNo}</p>
                            </div>
                          </div>
                          <div className="contributor-trees">
                            <span className="tree-count">{user.trees || 0}</span>
                            <span className="tree-label">trees</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="side-column">
                <div className="card">
                  <h2 className="card-title">Quick Actions</h2>
                  <div className="admin-actions">
                    <button className="admin-action-btn" onClick={() => setShowAddUserModal(true)}>
                      <span>➕</span>
                      Add New User
                    </button>
                    <button className="admin-action-btn" onClick={() => setActiveTab('projects')}>
                      <span>📋</span>
                      Create Project
                    </button>
                    <button className="admin-action-btn" onClick={() => setActiveTab('reports')}>
                      <span>📊</span>
                      View Reports
                    </button>
                    <button className="admin-action-btn" onClick={() => setActiveTab('users')}>
                      <span>👥</span>
                      Manage Users
                    </button>
                  </div>
                </div>

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

        {activeTab === 'users' && (
          <div>
            <div className="users-header">
              <h2>Manage Users ({users.length})</h2>
              <button className="btn-primary" onClick={() => setShowAddUserModal(true)}>
                ➕ Add User
              </button>
            </div>

            {users.length === 0 ? (
              <div className="empty-state-card">
                <h3>No Users Yet</h3>
                <p>Start by adding your first user to the organization</p>
                <button className="btn-primary" onClick={() => setShowAddUserModal(true)}>
                  Add First User
                </button>
              </div>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Registration No.</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Trees Planted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.regNo}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.trees || 0}</td>
                        <td>
                          <button className="btn-small btn-edit">Edit</button>
                          <button className="btn-small btn-view">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            <div className="users-header">
              <h2>Tree Planting Projects</h2>
              <button className="btn-primary">➕ Create Project</button>
            </div>

            {projects.length === 0 ? (
              <div className="empty-state-card">
                <h3>No Projects Yet</h3>
                <p>Create your first tree planting project</p>
                <button className="btn-primary">Create Project</button>
              </div>
            ) : (
              <div className="projects-grid">
                {projects.map(project => (
                  <div key={project.id} className="card">
                    <div className="project-header">
                      <h3>{project.name}</h3>
                      <span className={`status-badge status-${project.status.toLowerCase()}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="project-details">
                      <div className="detail-row">
                        <span className="detail-icon">🌳</span>
                        <span>{project.trees} trees planted</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-icon">👥</span>
                        <span>{project.members} members involved</span>
                      </div>
                    </div>
                    <button className="btn-view-project">View Details</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="card">
            <h2 className="card-title">Performance Reports</h2>
            <p className="empty-state-text">Analytics and reports will be populated from backend data</p>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="card">
            <h2 className="card-title">Organization Achievements</h2>
            <p className="empty-state-text">Achievements will be displayed once milestones are reached</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card">
            <h2 className="card-title">Organization Settings</h2>
            <form className="tree-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Organization Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={orgData.name}
                  onChange={(e) => setOrgData({...orgData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Email *</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="admin@organization.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="+254712345678"
                  required
                />
              </div>
              <button type="submit" className="btn-submit">Save Changes</button>
            </form>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New User</h2>
            <form onSubmit={handleAddUser} className="tree-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Registration Number *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newUser.registrationNumber}
                  onChange={(e) => setNewUser({...newUser, registrationNumber: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  className="form-input"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="member">Member</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="modal-overlay" onClick={() => setShowProfileEdit(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Organization Profile</h2>
            <form onSubmit={handleProfileUpdate} className="tree-form">
              <div className="form-group">
                <label>Organization Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={orgData.name}
                  onChange={(e) => setOrgData({...orgData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@organization.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+254712345678"
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

export default AdminDashboard;