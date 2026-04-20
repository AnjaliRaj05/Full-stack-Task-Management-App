const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const userController = require('../controllers/userController');

// GET all users — admin only
router.get('/all', auth, authorize('admin'), userController.getAllUsers);

// GET user by ID — any authenticated user
router.get('/:id', auth, userController.getUserByID);

module.exports = router;
