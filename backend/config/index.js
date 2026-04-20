require('dotenv').config();

// Fail fast if required environment variables are missing
const requiredVars = ['MONGO_URL', 'JWT_SECRET'];
const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 5000,
  mongoUrl: process.env.MONGO_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiryDays: parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS) || 7,
  allowedOrigins: process.env.ALLOWED_ORIGINS || 'http://localhost:5173',
  devMode: process.env.DEV_MODE || 'production',
};
