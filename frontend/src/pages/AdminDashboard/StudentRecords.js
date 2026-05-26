import React, { useState } from 'react';
import './AdminDashboard.css';

const StudentRecords = () => {
  const [students] = useState([
    { id: '2021asp01', name: 'Nisal Fonseka', room: '101', bed: 'A', joined: '2022-01-10', contact: '0712345678', gender: 'Male' },
    { id: '2021asp02', name: 'Kasun Silva', room: '101', bed: 'B', joined: '2022-01-12', contact: '0776543210', gender: 'Male' },
    { id: '2021vaw05', name: 'Hasini Perera', room: '205', bed: 'A', joined: '2022-01-14', contact: '0789876543', gender: 'Female' },
    { id: '2021vaw08', name: 'John Doe', room: '104', bed: 'A', joined: '2023-10-18', contact: '0799876543', gender: 'Male' },
  ]);

  return (
    <div>
      <header className="main-header">
        <h2>Student Records</h2>
        <div className="user-profile">Admin User</div>
      </header>
      
      <section className="table-section" style={{ marginTop: '30px' }}>
        <div className="section-header">
          <h3>Registered Hostel Residents</h3>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Registration No</th>
                <th>Student Name</th>
                <th>Gender</th>
                <th>Allocation (Room/Bed)</th>
                <th>Contact Number</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {students.map(std => (
                <tr key={std.id} className="table-row-interactive">
                  <td><span className="mono-text">{std.id}</span></td>
                  <td>
                    <div className="student-name-cell">
                      <div className="avatar-placeholder" style={{ background: std.gender === 'Female' ? 'linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 100%)' : undefined, color: std.gender === 'Female' ? '#be185d' : undefined }}>
                        {std.name.charAt(0)}
                      </div>
                      <span>{std.name}</span>
                    </div>
                  </td>
                  <td>{std.gender}</td>
                  <td><strong>Room {std.room}</strong> - Bed {std.bed}</td>
                  <td>{std.contact}</td>
                  <td>{std.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
export default StudentRecords;
