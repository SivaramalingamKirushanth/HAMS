const express = require('express');
const router = express.Router();
const signatureController = require('../controllers/signatureController');

router.post('/signature', signatureController.upload.single('signature'), signatureController.uploadSignature);
router.get('/signature/:id', signatureController.getSignature);

module.exports = router;
