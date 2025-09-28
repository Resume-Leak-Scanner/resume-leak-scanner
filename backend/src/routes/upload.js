//endpoint for files uploading
const express = require('express');
const multer = require('multer');
const { handleFileBuffer } = require('../modules/processor');
 
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Unsupported file type'), false);
    }
    cb(null, true);
  }
});
 

router.post('/', upload.single('resume'), async (req, res) => {
  console.log('req.file:', req.file); 
  console.log('req.body:', req.body); 
 
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const result = await handleFileBuffer(req.file);
    res.json(result);
  } catch (err) {
    console.error('Processing error:', err);
    res.status(500).json({ error: err.message || 'Processing error' });
  }
});
 
module.exports = router;