const taskService = require('../services/taskService');

exports.createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTaskService(req.user, req.workspace, req.body);
    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    next(err);
  }
};

exports.listTasks = async (req, res, next) => {
  try {
    const result = await taskService.getTasksService(
      req.user,
      req.workspace,
      req.workspaceMember,
      req.query
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await taskService.getTaskByIdService(
      req.user,
      req.workspace,
      req.workspaceMember,
      req.params.id
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const updated = await taskService.updateTaskService(
      req.user,
      req.workspace,
      req.workspaceMember,
      req.params.id,
      req.body
    );
    res.status(200).json({ message: 'Task updated', task: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const deleted = await taskService.deleteTaskService(
      req.user,
      req.workspace,
      req.workspaceMember,
      req.params.id
    );
    res.status(200).json({ message: 'Task deleted', task: deleted });
  } catch (err) {
    next(err);
  }
};
