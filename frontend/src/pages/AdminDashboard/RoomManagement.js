import React, { useState } from 'react';
import './AdminDashboard.css';

const RoomManagement = () => {
    // Dummy Data for Rooms
    const [rooms] = useState([
        { id: 101, type: '4-Bed Shared', capacity: 4, occupied: 4, status: 'Full' },
        { id: 102, type: '4-Bed Shared', capacity: 4, occupied: 2, status: 'Available' },
        { id: 103, type: 'Double', capacity: 2, occupied: 1, status: 'Available' },
        { id: 104, type: 'Single', capacity: 1, occupied: 1, status: 'Full' },
        { id: 105, type: 'Single', capacity: 1, occupied: 0, status: 'Available' },
        { id: 106, type: '4-Bed Shared', capacity: 4, occupied: 3, status: 'Available' },
        { id: 107, type: 'Double', capacity: 2, occupied: 2, status: 'Full' },
        { id: 108, type: 'Single', capacity: 1, occupied: 0, status: 'Available' },
    ]);

    return (
        <div>
            <header className="main-header">
                <h2>Room Management</h2>
                <div className="user-profile">Admin User</div>
            </header>
            
            <section className="table-section" style={{ marginTop: '30px', padding: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' }}>
                    {rooms.map(room => (
                        <div key={room.id} style={{
                            background: '#ffffff', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '16px', 
                            padding: '24px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.03)', 
                            display: 'flex', 
                            flexDirection: 'column',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: '0', color: '#1e293b', fontSize: '20px', fontWeight: '800' }}>Room {room.id}</h3>
                                <span style={{ fontSize: '22px' }}>🚪</span>
                            </div>
                            
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>Type: <strong style={{ color: '#0f172a' }}>{room.type}</strong></p>
                            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b' }}>Occupancy: <strong style={{ color: '#0f172a' }}>{room.occupied}/{room.capacity}</strong></p>
                            
                            <div style={{ background: '#f1f5f9', height: '10px', borderRadius: '5px', marginBottom: '15px', overflow: 'hidden' }}>
                                <div style={{ 
                                    background: room.status === 'Full' ? '#ef4444' : '#22c55e', 
                                    height: '100%', 
                                    borderRadius: '5px',
                                    width: `${(room.occupied/room.capacity)*100}%`,
                                    transition: 'width 0.5s ease'
                                }}></div>
                            </div>
                            
                            <span style={{
                                padding: '6px 12px', 
                                borderRadius: '20px', 
                                fontSize: '12px', 
                                fontWeight: '700', 
                                alignSelf: 'flex-start',
                                background: room.status === 'Full' ? '#fee2e2' : '#dcfce7',
                                color: room.status === 'Full' ? '#991b1b' : '#166534',
                                letterSpacing: '0.3px'
                            }}>
                                {room.status}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
export default RoomManagement;
