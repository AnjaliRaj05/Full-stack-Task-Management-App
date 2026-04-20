const authService = require('../services/authService');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const COOKIE_OPTIONS = {
  httpOnly: true, // JS cannot read this cookie — prevents XSS token theft
  secure: process.env.DEV_MODE !== 'development', // HTTPS only in production
  sameSite: 'strict',
  path: '/',
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', refreshToken.token, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

exports.register = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;
    const result = await authService.registerAuthService({ fullname, email, password });

    setTokenCookies(res, result.accessToken, result.refreshToken);

    return res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginAuthService({ email, password });

    setTokenCookies(res, result.accessToken, result.refreshToken);

    return res.status(200).json({
      message: 'Login successful',
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    const result = await authService.refreshTokenService(oldRefreshToken);

    setTokenCookies(res, result.accessToken, result.refreshToken);

    return res.status(200).json({ message: 'Token refreshed' });
  } catch (err) {
    // Clear cookies on refresh failure so the user gets prompted to login
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    next(err);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) throw new AppError('User not found', 404);

    return res.status(200).json({
      message: 'User fetched',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshTokenValue = req.cookies.refreshToken;
    await authService.logoutService(refreshTokenValue);

    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};
