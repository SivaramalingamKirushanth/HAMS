import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Overview from './Overview';
import ManageApplications from './ManageApplications';
import StudentRecords from './StudentRecords';
import './AdminDashboard.css';

const AdminDashboard = () => {

  return (
    <div className="admin-layout-topnav">
      {/* Top Navigation Bar */}
      <nav className="admin-top-nav">
        <div className="nav-brand">
          <span className="logo-icon">🏢</span> 
          <h2>HAMS Admin</h2>
        </div>
        <ul className="nav-links">
          <li><NavLink to="/admin" end>Overview</NavLink></li>
          <li><NavLink to="/admin/applications">Manage Applications</NavLink></li>
          <li><NavLink to="/admin/students">Student Records</NavLink></li>
        </ul>
      </nav>

      {/* Main Content Area Routing */}
      <main className="admin-main-content">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="applications" element={<ManageApplications />} />
          <Route path="students" element={<StudentRecords />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
