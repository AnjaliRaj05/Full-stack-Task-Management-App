const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/signup', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/logout', authMiddleware, (req, res) => {
    // No real server-side work needed for JWT logout
    // If you want, you can implement token blacklisting here
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
