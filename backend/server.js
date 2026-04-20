const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const workspaceRoutes = require('./routes/workspaces');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// --------------- CORS (must be first — before Helmet and other middleware) ---------------

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// --------------- Security Middleware ---------------

app.use(helmet());

// Global rate limiter — 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later' },
});
app.use(globalLimiter);

// --------------- Body & Cookie Parsing ---------------

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// --------------- HTTP Request Logging ---------------

const morganStream = { write: (message) => logger.info(message.trim()) };
app.use(morgan('short', { stream: morganStream }));

// --------------- Routes ---------------

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running...' });
});

// Liveness + readiness probe for Docker/Kubernetes healthchecks
app.get('/healthz', (req, res) => {
  const dbOk = mongoose.connection.readyState === 1;
  const status = dbOk ? 200 : 503;
  res.status(status).json({
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// Swagger API docs at /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/users', userRoutes);

// --------------- Centralized Error Handler (must be last) ---------------

app.use(errorHandler);

// --------------- Start Server ---------------

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
