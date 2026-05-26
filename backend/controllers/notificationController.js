const pool = require('../config/db');

exports.getUserNotifications = async (req, res) => {
  try {
    const { email } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_email = ? ORDER BY created_at DESC',
      [email]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute(
      'UPDATE notifications SET isRead = true WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
