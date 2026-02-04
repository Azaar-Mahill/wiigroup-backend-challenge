require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');

const providerRoutes = require('./routes/providers');
const authRoutes = require('./routes/auth');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Ensure uploads directory exists at startup
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
