const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET all users
router.get('/all', userController.getAllUsers);

// GET user by ID
router.get('/:id', userController.getUserByID);

module.exports = router;
