const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/book', protect, requireRole('admin'), roomController.bookBed);

module.exports = router;
