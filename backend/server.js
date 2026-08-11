require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const zlib = require('zlib');
const initDb = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const jobRoleRoutes = require('./routes/jobRoleRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const ensureAdmin = require('./utils/ensureAdmin');

const app = express();

// Remove fingerprinting header
app.disable('x-powered-by');

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

// Gzip compression for JSON responses larger than 1 KB
app.use((req, res, next) => {
  const accept = req.headers['accept-encoding'] || '';
  if (!accept.includes('gzip')) return next();

  const _json = res.json.bind(res);
  res.json = function (data) {
    const body = JSON.stringify(data);
    if (body.length < 1024) return _json(data);

    zlib.gzip(Buffer.from(body, 'utf8'), (err, compressed) => {
      if (err) return _json(data);
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Vary', 'Accept-Encoding');
      res.end(compressed);
    });
  };
  next();
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());

// Prototype pollution protection
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const banned = ['__proto__', 'constructor', 'prototype'];
    banned.forEach((k) => { delete req.body[k]; });
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/job-roles', jobRoleRoutes);
app.use('/api/employees', employeeRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Kainos Portal API is running', version: '1.0.0' });
});

// Serve the built frontend (npm run build compiles ../frontend into this path)
const FRONTEND_DIST = path.join(__dirname, process.env.FRONTEND_DIST_PATH || '../frontend/dist');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : (err.message || 'Internal server error'),
  });
});

const PORT = process.env.PORT || 5000;

(async () => {
  initDb();
  await ensureAdmin();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
