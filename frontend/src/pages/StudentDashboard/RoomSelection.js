import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoomSelection.css';

const dummyRooms = [
  { id: 101, beds: [{id: 'A', status: 'booked'}, {id: 'B', status: 'available'}, {id: 'C', status: 'available'}, {id: 'D', status: 'booked'}] },
  { id: 102, beds: [{id: 'A', status: 'available'}, {id: 'B', status: 'available'}, {id: 'C', status: 'available'}, {id: 'D', status: 'available'}] },
  { id: 103, beds: [{id: 'A', status: 'booked'}, {id: 'B', status: 'booked'}, {id: 'C', status: 'booked'}, {id: 'D', status: 'available'}] },
  { id: 104, beds: [{id: 'A', status: 'available'}, {id: 'B', status: 'booked'}, {id: 'C', status: 'available'}, {id: 'D', status: 'available'}] },
  { id: 105, beds: [{id: 'A', status: 'available'}, {id: 'B', status: 'available'}, {id: 'C', status: 'booked'}, {id: 'D', status: 'booked'}] },
  { id: 106, beds: [{id: 'A', status: 'available'}, {id: 'B', status: 'available'}, {id: 'C', status: 'available'}, {id: 'D', status: 'available'}] },
  { id: 107, beds: [{id: 'A', status: 'booked'}, {id: 'B', status: 'booked'}, {id: 'C', status: 'booked'}, {id: 'D', status: 'booked'}] },
  { id: 108, beds: [{id: 'A', status: 'available'}, {id: 'B', status: 'available'}, {id: 'C', status: 'available'}, {id: 'D', status: 'available'}] },
  { id: 109, beds: [{id: 'A', status: 'booked'}, {id: 'B', status: 'available'}, {id: 'C', status: 'available'}, {id: 'D', status: 'booked'}] },
  { id: 110, beds: [{id: 'A', status: 'available'}, {id: 'B', status: 'available'}, {id: 'C', status: 'available'}, {id: 'D', status: 'available'}] },
];

const RoomSelection = () => {
  const navigate = useNavigate();
  const [activeRoom, setActiveRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);

  const handleRoomClick = (room) => {
    setActiveRoom(room);
  };

  const closeModal = () => {
    setActiveRoom(null);
  };

  const handleBedClick = (room, bed) => {
    if (bed.status === 'booked') return;
    
    // Toggle off if same bed selected
    if (selectedBed && selectedBed.roomId === room.id && selectedBed.bedId === bed.id) {
       setSelectedBed(null);
    } else {
       // Set new bed (enforcing limit of 1)
       setSelectedBed({ roomId: room.id, bedId: bed.id });
    }
  };

  const handleProceed = async () => {
    if (!selectedBed) return;

    // Get strictly logged-in student info, default to generic fallback for offline UX testing
    const userStr = localStorage.getItem('user');
    let studentId = 'UNKNOWN_STU';
    if (userStr) {
      try {
        studentId = JSON.parse(userStr).email; // Use email or generic ID as tracking token
      } catch (e) {}
    }

    try {
      const response = await fetch('http://localhost:5000/api/rooms/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomId: selectedBed.roomId, 
          bedId: selectedBed.bedId,
          studentId: studentId
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Success! You have officially booked Room ${selectedBed.roomId} - Bed ${selectedBed.bedId}.`);
        navigate('/student/status');
      } else {
        alert(`Booking failed: ${data.message}`);
      }
    } catch (err) {
      alert('Network issue: Ensure the backend is running on port 5000.');
    }
  };

  const getOverallRoomStatus = (room) => {
    const availableBeds = room.beds.filter(b => b.status === 'available').length;
    if (availableBeds === 0) return 'full';
    if (availableBeds < 4) return 'partial';
    return 'empty';
  };

  return (
    <div className="room-selection-container">
      <div className="selection-header">
        <h2>Hostel Room Selection</h2>
        <p>Please select your preferred room and click to choose an available bed.</p>
        
        {/* Summary display */}
        <div className={`selection-summary ${selectedBed ? 'active' : ''}`}>
          {selectedBed ? (
            <div className="summary-content">
              <span className="check-icon">✓</span>
              <span><strong>Room {selectedBed.roomId}</strong> - Bed <strong>{selectedBed.bedId}</strong> selected</span>
            </div>
          ) : (
            <div className="summary-content placeholder">
              No bed selected yet.
            </div>
          )}
        </div>
      </div>

      <div className="legend-strip">
        <div className="legend-item"><span className="legend-box available"></span> Available</div>
        <div className="legend-item"><span className="legend-box booked"></span> Booked</div>
        <div className="legend-item"><span className="legend-box selected"></span> Selected</div>
      </div>

      <div className="room-grid">
        {dummyRooms.map(room => {
          const status = getOverallRoomStatus(room);
          const isCurrentRoomSelected = selectedBed && selectedBed.roomId === room.id;
          
          return (
            <div 
              key={room.id} 
              className={`room-card status-${status} ${activeRoom?.id === room.id ? 'active' : ''} ${isCurrentRoomSelected ? 'has-selection' : ''}`}
              onClick={() => handleRoomClick(room)}
            >
              <h3>Room {room.id}</h3>
              <div className="room-mini-layout">
                {room.beds.map(bed => {
                  let bedClass = bed.status;
                  if (selectedBed && selectedBed.roomId === room.id && selectedBed.bedId === bed.id) {
                    bedClass = 'selected';
                  }
                  return <div key={bed.id} className={`mini-bed ${bedClass}`}></div>;
                })}
              </div>
              <span className="room-status-text">
                {status === 'full' ? 'Sold Out' : status === 'partial' ? 'Few Beds Left' : 'Available'}
              </span>
            </div>
          );
        })}
      </div>

      <div className="form-actions">
         <button className="submit-btn primary" disabled={!selectedBed} onClick={handleProceed}>Proceed with Selection</button>
      </div>

      {/* Bed Selection Modal */}
      {activeRoom && (
        <div className="room-modal-overlay" onClick={closeModal}>
          <div className="room-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Room {activeRoom.id} - Bed Layout</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            
            <div className="bed-layout-grid">
              {activeRoom.beds.map(bed => {
                 let bedClass = bed.status;
                 if (selectedBed && selectedBed.roomId === activeRoom.id && selectedBed.bedId === bed.id) {
                   bedClass = 'selected';
                 }
                 return (
                   <div 
                     key={bed.id} 
                     className={`bed-slot ${bedClass}`}
                     onClick={() => handleBedClick(activeRoom, bed)}
                   >
                     <div className="bed-icon">🛏️</div>
                     <span className="bed-label">Bed {bed.id}</span>
                     <span className="bed-status-label">{bedClass.charAt(0).toUpperCase() + bedClass.slice(1)}</span>
                   </div>
                 );
              })}
            </div>
            
            <div className="modal-footer">
               <button className="btn-secondary" onClick={closeModal}>Confirm & Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomSelection;
