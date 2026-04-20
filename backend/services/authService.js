const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const config = require('../config');
const workspaceService = require('./workspaceService');

const REFRESH_TOKEN_EXPIRY_DAYS = config.refreshTokenExpiryDays;
const BCRYPT_COST = 12;

// Generate a short-lived access token (lifetime configured via JWT_EXPIRES_IN)
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

// Generate a random refresh token and store it in DB
const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await RefreshToken.create({ userId, token, expiresAt });
  return { token, expiresAt };
};

exports.registerAuthService = async ({ fullname, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already exists', 400);

  const hashed = await bcrypt.hash(password, BCRYPT_COST);

  const user = new User({
    fullname,
    email,
    password: hashed,
    // role defaults to 'user' in the schema — never accept role from client input
  });

  await user.save();

  // Every new user gets a personal workspace as their default
  const workspace = await workspaceService.ensurePersonalWorkspace(user);

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);

  return {
    user: {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      defaultWorkspace: workspace._id,
    },
    workspace: {
      _id: workspace._id,
      name: workspace.name,
      slug: workspace.slug,
      plan: workspace.plan,
      role: 'owner',
    },
    accessToken,
    refreshToken,
  };
};

exports.loginAuthService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError('Invalid email or password', 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  // Self-heal: guarantee the user has a default workspace (covers pre-workspaces accounts)
  const workspace = await workspaceService.ensurePersonalWorkspace(user);

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);

  return {
    user: {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      defaultWorkspace: workspace._id,
    },
    accessToken,
    refreshToken,
  };
};

exports.refreshTokenService = async (oldToken) => {
  if (!oldToken) throw new AppError('Refresh token is required', 401);

  // Find and delete the old token (rotation: each token is single-use)
  const storedToken = await RefreshToken.findOneAndDelete({ token: oldToken });
  if (!storedToken) throw new AppError('Invalid refresh token', 401);

  if (storedToken.expiresAt < new Date()) {
    throw new AppError('Refresh token expired', 401);
  }

  const user = await User.findById(storedToken.userId);
  if (!user) throw new AppError('User not found', 401);

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);

  return { accessToken, refreshToken };
};

exports.logoutService = async (refreshTokenValue) => {
  // Delete the refresh token from DB so it can't be reused
  if (refreshTokenValue) {
    await RefreshToken.findOneAndDelete({ token: refreshTokenValue });
  }
};
