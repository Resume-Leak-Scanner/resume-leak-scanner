const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { handleFileBuffer } = require('./modules/processor');
 
const app = express();
 
app.use(cors());
 
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Unsupported file type'), false);
    }
    cb(null, true);
  },
});
 

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
 
  console.log('Received file:', req.file.originalname, 'Size:', req.file.size);
 
  try {
    const result = await handleFileBuffer(req.file);
    res.json(result);
  } catch (err) {
    console.error('File processing failed:', err);
    res.status(500).json({ error: err.message || 'Processing error' });
  }
});
 
const PORT = 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));