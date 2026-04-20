const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const taskController = require('../controllers/tasksController');
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const workspaceScope = require('../middleware/workspaceScope');
const validate = require('../middleware/validate');

const createTaskValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate').optional({ values: 'null' }).isISO8601().withMessage('Invalid date format'),
  body('labels').optional().isArray(),
  body('assignedTo').optional({ values: 'null' }).isMongoId(),
];

const updateTaskValidation = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate').optional({ values: 'null' }).isISO8601(),
  body('labels').optional().isArray(),
  body('assignedTo').optional({ values: 'null' }).isMongoId(),
];

const taskIdValidation = [param('id').isMongoId().withMessage('Invalid task ID')];

const listTasksValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('filter').optional().isIn(['ALL', 'pending', 'in-progress', 'completed']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('search').optional().isLength({ max: 100 }),
];

const commentValidation = [
  param('taskId').isMongoId().withMessage('Invalid task ID'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be 1-2000 characters'),
];

// All task routes are workspace-scoped
router.use(auth, workspaceScope);

// Task CRUD
router.post('/', createTaskValidation, validate, taskController.createTask);
router.get('/', listTasksValidation, validate, taskController.listTasks);
router.get('/:id', taskIdValidation, validate, taskController.getTask);
router.put('/:id', updateTaskValidation, validate, taskController.updateTask);
router.delete('/:id', taskIdValidation, validate, taskController.deleteTask);

// Comments & Activity
router.post('/:taskId/comments', commentValidation, validate, commentController.addComment);
router.get('/:taskId/comments', commentController.getComments);
router.get('/:taskId/activity', commentController.getActivity);

module.exports = router;
