const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Student submits an application
router.post('/', protect, requireRole('student'), applicationController.submitApplication);

// Admin gets all applications
router.get('/', protect, requireRole('admin'), applicationController.getAllApplications);

// Student gets their own application status
router.get('/student/:email', protect, requireRole('student'), applicationController.getStudentApplicationStatus);

// Admin updates application status
router.put('/:id/status', protect, requireRole('admin'), applicationController.updateStatus);

module.exports = router;
