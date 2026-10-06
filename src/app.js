const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(helmet());
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth/login', loginLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Task Management API is running',
    version: '1.0.0'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

module.exports = app;
