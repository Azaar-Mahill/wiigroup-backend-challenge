const express = require('express');
const multer = require('multer');
const router = express.Router();

const { registerValidation, verifyValidation } = require('../validators/providerValidator');
const { verifyAdmin } = require('../middleware/auth');
const providerController = require('../controllers/providerController');

// --- Multer configuration ---
// Using memory storage to store documents in PostgreSQL database instead of disk
const storage = multer.memoryStorage();

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

// GET /api/providers/:id/document - Download provider's document
router.get('/:id/document', providerController.getDocument);

// PUT /api/providers/:id/verify  (admin only)
router.put('/:id/verify', verifyAdmin, verifyValidation, providerController.verify);

module.exports = router;
