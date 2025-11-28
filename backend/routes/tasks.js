const express = require('express');
const router = express.Router();
const taskController = require('../controllers/tasksController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', auth, taskController.createTask);
router.get('/', auth, taskController.listTasks);
router.get('/:id', auth, taskController.getTask);
router.put('/:id', auth, taskController.updateTask);
// Delete only admin
router.delete('/:id', auth, authorize('admin'), taskController.deleteTask);

module.exports = router;
