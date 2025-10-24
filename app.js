// app.js
// Configure and export the Express application.
// The actual server start (app.listen) and DB connection should be done in server.js

require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const apiRouter = require('./routes'); // routes/index.js (central router)

const app = express();

// --- Basic security & parsing ---
app.use(helmet()); // basic security headers
app.use(cors());   // enable CORS (adjust options in production)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Logging ---
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// --- Static (if you serve assets like generated QR images) ---
app.use('/public', express.static(path.join(__dirname, 'public')));

// --- API routes ---
app.use('/api', apiRouter);

// --- Health check ---
app.get('/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// --- 404 handler ---
app.use((req, res, next) => {
  res.status(404).json({ ok: false, message: 'Not Found' });
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error(err); // keep this server-side; consider more advanced logging in production
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Server error' : err.message;
  res.status(status).json({ ok: false, message });
});

module.exports = app;
