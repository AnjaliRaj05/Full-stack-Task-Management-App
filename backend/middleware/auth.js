const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Read token from httpOnly cookie (primary) or Authorization header (fallback for API clients)
  const token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
