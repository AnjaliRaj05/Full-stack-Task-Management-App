const mongoose = require('mongoose');
const Task = require('../models/Task');

// Create a task
exports.createTaskService = async (user, data) => {
  const { title, description, status } = data;
  if (!title) throw new Error('Title is required');

  const task = new Task({
    title,
    description,
    status: status?.toLowerCase() || 'pending',
    createdBy: new mongoose.Types.ObjectId(user.id),
  });

  await task.save();
  return task;
};

// List tasks with pagination & filtering
exports.getTasksService = async (user, query) => {
  const { page = 1, limit = 10, filter: filterStatus, search } = query;

  const filter = {};

  if (filterStatus && filterStatus !== 'ALL') {
    filter.status = filterStatus.toLowerCase();
  }

  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  if (user.role !== 'admin') {
    filter.createdBy = new mongoose.Types.ObjectId(user.id);
  }


  const skip = (page - 1) * limit;

  const [total, tasks, totalPending, totalCompleted] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'fullname email role'),
    Task.countDocuments({ ...filter, status: 'pending' }),
    Task.countDocuments({ ...filter, status: 'completed' })
  ]);

  return {
    tasks,
    total,
    totalPending,
    totalCompleted,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  };
};

// Get a single task
exports.getTaskByIdService = async (user, taskId) => {
  const task = await Task.findById(taskId).populate('createdBy', 'fullname email role');
  if (!task) return null;

  if (user.role !== 'admin' && task.createdBy._id.toString() !== user.id.toString()) {
    throw new Error('forbidden');
  }

  return task;
};

// Update a task
exports.updateTaskService = async (user, taskId, data) => {
  const task = await Task.findById(taskId).populate('createdBy', '_id');
  if (!task) throw new Error('notfound');

  if (user.role !== 'admin' && task.createdBy._id.toString() !== user.id.toString()) {
    throw new Error('forbidden');
  }

  task.title = data.title ?? task.title;
  task.description = data.description ?? task.description;
  if (data.status) task.status = data.status.toLowerCase();
  task.updatedAt = new Date();

  await task.save();
  return task;
};

// Delete a task
exports.deleteTaskService = async (user, taskId) => {
  const task = await Task.findById(taskId).populate('createdBy', '_id');
  if (!task) throw new Error('notfound');

  if (user.role !== 'admin' && task.createdBy._id.toString() !== user.id.toString()) {
    throw new Error('forbidden');
  }

  await Task.findByIdAndDelete(taskId);
  return task;
};
