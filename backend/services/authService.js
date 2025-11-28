const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerAuthService = async ({ fullname, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error('exists');

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({
    fullname,
    email,
    password: hashed,
    role: role || 'user',
  });

  await user.save();

  return {
    id: user._id,
    fullname: user.fullname,
    email: user.email,
    role: role || 'user',
  };
};

exports.loginAuthService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('notfound');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('invalid');

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );

  return {
    token,
    user: {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    },
  };
};
