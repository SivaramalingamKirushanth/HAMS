import React, { useState } from 'react';
import './AdminDashboard.css';

const Overview = () => {
  // Dummy data to simulate backend response
  const [applications] = useState([
    { status: 'Pending' },
    { status: 'Approved' },
    { status: 'Pending' }
  ]);

  return (
    <div>
      <header className="main-header">
        <h2>Dashboard Overview</h2>
        <div className="user-profile">Admin User</div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue">👥</div>
          <div className="stat-details">
            <h4>Total Students</h4>
            <p>1,245</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green">🛏️</div>
          <div className="stat-details">
            <h4>Available Beds</h4>
            <p>142</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-gray">🛌</div>
          <div className="stat-details">
            <h4>Occupied Beds</h4>
            <p>958</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-orange">📄</div>
          <div className="stat-details">
            <h4>Pending Applications</h4>
            <p>{applications.filter(a => a.status === 'Pending').length + 10} /* Added +10 to look populated over dummy hooks */</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
