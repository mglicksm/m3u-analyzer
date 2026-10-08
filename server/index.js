// server/index.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { parseM3U8 } = require('./parser');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Endpoint 1: File Upload parsing
app.post('/api/playlist/upload', upload.single('playlist'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const content = req.file.buffer.toString('utf-8');
  const result = parseM3U8(content);
  res.json(result);
});

// Endpoint 2: Raw Text/Paste parsing
app.post('/api/playlist/parse-text', (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Playlist content is required.' });
  }

  const result = parseM3U8(content);
  res.json(result);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});