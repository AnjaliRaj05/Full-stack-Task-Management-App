const taskService = require('../services/taskService');

exports.createTask = async (req, res) => {
  try {
    const task = await taskService.createTaskService(req.user, req.body);
    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listTasks = async (req, res) => {
  try {
    const result = await taskService.getTasksService(req.user, req.query);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await taskService.getTaskByIdService(req.user, req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ task });
  } catch (err) {
    if (err.message === 'forbidden') return res.status(403).json({ message: 'Forbidden' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const updated = await taskService.updateTaskService(req.user, req.params.id, req.body);
    res.status(200).json({ message: 'Task updated', task: updated });
  } catch (err) {
    if (err.message === 'notfound') return res.status(404).json({ message: 'Task not found' });
    if (err.message === 'forbidden') return res.status(403).json({ message: 'Forbidden' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const deleted = await taskService.deleteTaskService(req.user, req.params.id);
    res.status(200).json({ message: 'Task deleted', task: deleted });
  } catch (err) {
    if (err.message === 'notfound') return res.status(404).json({ message: 'Task not found' });
    if (err.message === 'forbidden') return res.status(403).json({ message: 'Forbidden' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
