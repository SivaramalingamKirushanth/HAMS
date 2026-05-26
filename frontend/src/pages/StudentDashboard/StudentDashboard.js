import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import ApplicationForm from './ApplicationForm';
import API_BASE_URL from '../../config';
import './StudentDashboard.css';

const StudentHome = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [userName, setUserName] = useState('Students');

  useEffect(() => {
    fetchNotifications();
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.firstName || 'Students');
    }
  }, []);

  const fetchNotifications = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLoadingNotifs(false);
      return;
    }
    const user = JSON.parse(userStr);
    
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${user.email}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoadingNotifs(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: 1 } : n));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  return (
    <div className="home-dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="banner-content">
          <h1 className="main-welcome">
            <span className="highlight-text">✨ Welcome back, {userName}!</span>
          </h1>
          <p className="welcome-subtitle">
            Your personal Hostel Accommodation Management portal
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Quick Actions */}
        <section className="dashboard-section actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="action-cards">
            <div className="action-card highlight" onClick={() => navigate('/student/apply')}>
              <div className="action-icon icon-maroon">📝</div>
              <div className="action-text">
                <h3>Apply for Hostel</h3>
                <p>Submit your application for the upcoming academic year.</p>
              </div>
            </div>
            
            <div className="action-card" onClick={() => navigate('/student/status')}>
              <div className="action-icon icon-gold">📊</div>
              <div className="action-text">
                <h3>Check Status</h3>
                <p>View the current status of your submitted applications.</p>
              </div>
            </div>

            <div className="action-card" onClick={() => alert("Support Portal Integration Pending")}>
              <div className="action-icon icon-green">💬</div>
              <div className="action-text">
                <h3>Get Help</h3>
                <p>Contact administration or raise a maintenance request.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Info Panels */}
        <div className="info-panels-grid">
          <section className="dashboard-section info-section">
            <div className="info-header">
              <span className="info-icon">📢</span>
              <h2>Announcements</h2>
            </div>
            <div className="info-content notifications">
              {loadingNotifs ? (
                <p style={{ padding: '10px', color: '#718096' }}>Loading notifications...</p>
              ) : notifications.length === 0 ? (
                <p style={{ padding: '10px', color: '#718096' }}>No new notifications.</p>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    style={{ cursor: !notif.isRead ? 'pointer' : 'default' }}
                  >
                    {!notif.isRead && <div className="notif-pulse"></div>}
                    {notif.isRead && <div className="notif-pulse read"></div>}
                    <div className="notif-details">
                      <h4>{notif.title}</h4>
                      <p>{notif.message}</p>
                      <small>{new Date(notif.created_at).toLocaleDateString()}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="dashboard-section info-section rules-mini-card">
            <div className="info-header">
              <span className="info-icon">📖</span>
              <h2>Key Guidelines</h2>
            </div>
            <div className="info-content">
              <ul className="modern-list">
                <li><span className="list-emoji">⏰</span> Return to hostel before 10:00 PM.</li>
                <li><span className="list-emoji">👥</span> Visitors allowed strictly 4:00 PM - 6:00 PM.</li>
                <li><span className="list-emoji">🚫</span> Subletting rooms is prohibited.</li>
                <li><span className="list-emoji">🧹</span> Maintain room cleanliness.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const ApplicationStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setLoading(false);
        return;
      }

      try {
        const user = JSON.parse(userStr);
        console.log('🔍 Fetching status for:', user.email);
        const response = await fetch(`${API_BASE_URL}/applications/student/${user.email}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setStatus(data.data.status);
          setApplication(data.data);
        }
      } catch (err) {
        console.error('Error fetching status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-content">
        <h2>Current Status</h2>
        <div className="loading-spinner">Checking your application status...</div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="dashboard-content">
        <h2>Current Status</h2>
        <div className="status-card info">
          <h3>No Application Found</h3>
          <p>You haven't submitted a hostel application yet. Please use the "Apply" tab to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content status-page">
      <div className="status-header">
        <span className="status-icon">🏆</span>
        <h2>Track Your Application</h2>
      </div>
      
      <div className={`status-card-premium ${status.toLowerCase()}`}>
        <div className="status-indicator">
          <div className="pulse-dot"></div>
          <span className="status-label">{status}</span>
        </div>
        
        <div className="status-body">
          <h3>Your Current Status: <span className="status-highlight">{status}</span></h3>
          
          {status === 'Pending' && (
            <p className="status-info">
               We have received your application! Our administrative team is currently reviewing your details. 
               Please check back within 3-5 working days.
            </p>
          )}
          
          {status === 'Approved' && (
            <div className="success-details">
              <p className="success-msg">🎉 Congratulations! Your request for hostel accommodation has been approved.</p>
              <div className="allocation-info">
                  <div className="info-item">
                     <label>Allocated Room Type</label>
                     <span>{application.roomType || 'Standard University Housing'}</span>
                  </div>
                  {application.adminData && application.adminData.hostel && (
                    <div className="info-item">
                       <label>Allocated Hostel/Place</label>
                       <span>{application.adminData.hostel}</span>
                    </div>
                  )}
                  {application.adminData && application.adminData.roomNo && (
                    <div className="info-item">
                       <label>Room Number</label>
                       <span>{application.adminData.roomNo}</span>
                    </div>
                  )}
                  <div className="info-item">
                     <label>Requested No.</label>
                     <span>{application.id}</span>
                  </div>
              </div>
              <p className="next-steps">Action Required: Please visit the Provost's Office during office hours to finalize your check-in.</p>
            </div>
          )}
          
          {status === 'Rejected' && (
            <div className="error-details">
               <p>We regret to inform you that your application for the current academic session was not approved.</p>
               <p className="error-reason">Note: You may re-apply if there was a mistake in your submission.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <span className="logo-icon">🏢</span> HAMS Student
        </div>
        <ul className="nav-links">
          <li><Link to="/student/home">Home</Link></li>
          <li><Link to="/student/apply">Apply</Link></li>
          <li><Link to="/student/status">Current Status</Link></li>
        </ul>
      </nav>

      <main className="dashboard-main">
        <Routes>
          <Route index element={<StudentHome />} />
          <Route path="home" element={<StudentHome />} />
          <Route path="apply" element={<ApplicationForm />} />
          <Route path="status" element={<ApplicationStatus />} />
        </Routes>
      </main>
    </div>
  );
};

export default StudentDashboard;
