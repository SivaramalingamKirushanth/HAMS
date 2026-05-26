const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads/signatures');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only JPG and PNG files are allowed.'), false);
        }
    }
});

const uploadSignature = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }

        const uniqueId = `sig_${Date.now()}_${Math.round(Math.random() * 1000)}`;
        const originalFilename = `${uniqueId}_original.png`;
        const croppedFilename = `${uniqueId}_cropped.png`;
        const processedFilename = `${uniqueId}_processed.png`;

        const originalPath = path.join(uploadDir, originalFilename);
        const croppedPath = path.join(uploadDir, croppedFilename);
        const processedPath = path.join(uploadDir, processedFilename);

        // 1. Save original
        await sharp(req.file.buffer).png().toFile(originalPath);

        // 2. Crop to bounding box (trim empty space)
        await sharp(req.file.buffer)
            .png()
            .trim({ threshold: 50 })
            .toFile(croppedPath);

        // 3. Processed image (No background removal as requested)
        // Just use the cropped image as the processed image for consistency with the DB schema.
        fs.copyFileSync(croppedPath, processedPath);

        // Insert into database
        const relativeOriginal = `/uploads/signatures/${originalFilename}`;
        const relativeCropped = `/uploads/signatures/${croppedFilename}`;
        const relativeProcessed = `/uploads/signatures/${processedFilename}`;

        const [result] = await db.execute(
            `INSERT INTO signatures (original_path, cropped_path, processed_path) VALUES (?, ?, ?)`,
            [relativeOriginal, relativeCropped, relativeProcessed]
        );

        res.json({
            success: true,
            data: {
                id: result.insertId,
                original_path: relativeOriginal,
                cropped_path: relativeCropped,
                processed_path: relativeProcessed
            }
        });

    } catch (error) {
        console.error('Signature processing error:', error);
        res.status(500).json({ success: false, message: error.message || 'Processing failed' });
    }
};

const getSignature = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM signatures WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Signature not found' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    upload,
    uploadSignature,
    getSignature
};
