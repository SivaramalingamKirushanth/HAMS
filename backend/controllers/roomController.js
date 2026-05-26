const pool = require('../config/db');

exports.bookBed = async (req, res) => {
  try {
    const { roomId, bedId, studentId } = req.body;

    // Check if bed exists and is available
    const [beds] = await pool.query('SELECT status FROM beds WHERE roomId = ? AND bedId = ?', [roomId, bedId]);

    if (beds.length === 0) {
      // Ensure the room exists first to satisfy foreign key constraints
      await pool.execute('INSERT IGNORE INTO rooms (id, capacity) VALUES (?, 4)', [roomId]);

      // For resilience, if we haven't seeded all 40 beds but logic dictates they exist, we just insert it.
      await pool.execute('INSERT INTO beds (roomId, bedId, status, studentId) VALUES (?, ?, "booked", ?)', [roomId, bedId, studentId]);
      return res.status(200).json({ success: true, message: 'Bed successfully booked' });
    }

    if (beds[0].status === 'booked') {
      return res.status(400).json({ success: false, message: 'Bed is already booked by someone else' });
    }

    // Update bed
    await pool.execute('UPDATE beds SET status = "booked", studentId = ? WHERE roomId = ? AND bedId = ?', [studentId, roomId, bedId]);

    res.status(200).json({ success: true, message: 'Bed successfully booked' });

  } catch (error) {
    console.error('Room Booking Error:', error);
    res.status(500).json({ success: false, message: 'Server error during room booking' });
  }
};
