import express from 'express';
import compression from 'compression';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Enable gzip compression
app.use(compression());

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'AssignMe Web Server'
  });
});

// Serve static files from Assignme-main directory
app.use(express.static(join(__dirname, 'Assignme-main'), {
  maxAge: '1d', // Cache static assets for 1 day
  etag: true
}));

// Handle SPA routing - redirect all routes to index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'Assignme-main', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ AssignMe server is running on port ${PORT}`);
  console.log(`🌐 Access the app at: http://localhost:${PORT}`);
});
