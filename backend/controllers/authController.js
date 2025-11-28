const authService = require("../services/authService");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body; 
    if (!fullname || !email || !password)
      return res.status(400).json({ message: 'Missing fields' });

    try {
      const user = await authService.registerAuthService({ fullname, email, password, role });
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
      );

      return res.status(201).json({
        message: 'User registered successfully',
        data: { user, token } 
      });
    } catch (err) {
      if (err.message === 'exists')
        return res.status(400).json({ message: 'Email already exists' });
      throw err;
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Missing fields' });

    try {
      const { token, user } = await authService.loginAuthService({ email, password });
      return res.status(200).json({ message: 'Login successful', token, user });
    } catch (err) {
      if (err.message === 'notfound')
        return res.status(404).json({ message: 'User not found' });

      if (err.message === 'invalid')
        return res.status(401).json({ message: 'Invalid credentials' });

      throw err;
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "User fetched",
      data: { user }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
