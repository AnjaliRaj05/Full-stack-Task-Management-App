const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const createValidation = [
  body('name').trim().isLength({ min: 1, max: 80 }).withMessage('Name must be 1-80 characters'),
];

const idValidation = [param('id').isMongoId().withMessage('Invalid workspace id')];

const updateValidation = [
  param('id').isMongoId(),
  body('name').optional().trim().isLength({ min: 1, max: 80 }),
];

router.get('/', auth, workspaceController.listMine);
router.post('/', auth, createValidation, validate, workspaceController.create);
router.get('/:id', auth, idValidation, validate, workspaceController.get);
router.patch('/:id', auth, updateValidation, validate, workspaceController.update);
router.get('/:id/members', auth, idValidation, validate, workspaceController.listMembers);

module.exports = router;
