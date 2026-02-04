const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();

const { registerValidation, verifyValidation } = require('../validators/providerValidator');
const { verifyAdmin } = require('../middleware/auth');
const providerController = require('../controllers/providerController');

// --- Multer configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const { v4: uuidv4 } = require('uuid');
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(pdf|jpg|jpeg|png|doc|docx)$/i;
  if (allowedExtensions.test(file.originalname)) {
    return cb(null, true);
  }
  cb(new Error('Only PDF, JPG, PNG, DOC, DOCX files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// --- Routes ---

// POST /api/providers/register
router.post('/register', (req, res, next) => {
  upload.single('documents')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Bad Request', message: 'File size exceeds the 5MB limit' });
      }
      return res.status(400).json({ error: 'Bad Request', message: err.message });
    }
    next();
  });
}, registerValidation, providerController.register);

// GET /api/providers/:id
router.get('/:id', providerController.getById);

// PUT /api/providers/:id/verify  (admin only)
router.put('/:id/verify', verifyAdmin, verifyValidation, providerController.verify);

module.exports = router;
