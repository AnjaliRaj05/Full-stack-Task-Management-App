const mongoose = require('mongoose');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const AppError = require('../utils/AppError');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const logActivity = async (workspaceId, taskId, userId, action, details = '') => {
  await Activity.create({ workspace: workspaceId, taskId, userId, action, details });
};

exports.createTaskService = async (user, workspace, data) => {
  const { title, description, status, priority, dueDate, labels, assignedTo, subtasks } = data;

  const task = new Task({
    workspace: workspace._id,
    title,
    description,
    status: status || 'pending',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    labels: labels || [],
    assignedTo: assignedTo || null,
    subtasks: subtasks || [],
    createdBy: new mongoose.Types.ObjectId(user.id),
  });

  await task.save();
  await logActivity(workspace._id, task._id, user.id, 'created', `Created task "${title}"`);

  return task;
};

exports.getTasksService = async (user, workspace, workspaceMember, query) => {
  const { page = 1, limit = 10, filter: filterStatus, search, priority, sortBy } = query;

  const filter = { workspace: workspace._id };

  if (filterStatus && filterStatus !== 'ALL') {
    filter.status = filterStatus;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (search) {
    filter.title = { $regex: escapeRegex(search), $options: 'i' };
  }

  // Viewers see every task in the workspace (read-only); regular members
  // see only what they created or are assigned. Admins and owners see all.
  const privilegedRoles = ['owner', 'admin', 'viewer'];
  if (!privilegedRoles.includes(workspaceMember.role)) {
    filter.$or = [
      { createdBy: new mongoose.Types.ObjectId(user.id) },
      { assignedTo: new mongoose.Types.ObjectId(user.id) },
    ];
  }

  const skip = (page - 1) * limit;

  let sortOption = { createdAt: -1 };
  if (sortBy === 'dueDate') sortOption = { dueDate: 1 };
  if (sortBy === 'priority') sortOption = { priority: -1 };

  const [total, tasks, totalPending, totalInProgress, totalCompleted] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'fullname email role')
      .populate('assignedTo', 'fullname email'),
    Task.countDocuments({ ...filter, status: 'pending' }),
    Task.countDocuments({ ...filter, status: 'in-progress' }),
    Task.countDocuments({ ...filter, status: 'completed' }),
  ]);

  return {
    tasks,
    total,
    totalPending,
    totalInProgress,
    totalCompleted,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  };
};

exports.getTaskByIdService = async (user, workspace, workspaceMember, taskId) => {
  const task = await Task.findOne({ _id: taskId, workspace: workspace._id })
    .populate('createdBy', 'fullname email role')
    .populate('assignedTo', 'fullname email');
  if (!task) return null;

  const privilegedRoles = ['owner', 'admin', 'viewer'];
  if (
    !privilegedRoles.includes(workspaceMember.role) &&
    task.createdBy._id.toString() !== user.id.toString() &&
    task.assignedTo?._id?.toString() !== user.id.toString()
  ) {
    throw new AppError('Forbidden: you do not have access to this task', 403);
  }

  return task;
};

exports.updateTaskService = async (user, workspace, workspaceMember, taskId, data) => {
  const task = await Task.findOne({ _id: taskId, workspace: workspace._id }).populate(
    'createdBy',
    '_id'
  );
  if (!task) throw new AppError('Task not found', 404);

  if (workspaceMember.role === 'viewer') {
    throw new AppError('Forbidden: viewers cannot modify tasks', 403);
  }

  const privilegedRoles = ['owner', 'admin'];
  if (
    !privilegedRoles.includes(workspaceMember.role) &&
    task.createdBy._id.toString() !== user.id.toString() &&
    task.assignedTo?.toString() !== user.id.toString()
  ) {
    throw new AppError('Forbidden: you do not own this task', 403);
  }

  const changes = [];

  if (data.title && data.title !== task.title) changes.push(`title changed`);
  if (data.status && data.status !== task.status) {
    changes.push(`status: ${task.status} → ${data.status}`);
    await logActivity(
      workspace._id,
      taskId,
      user.id,
      'status_changed',
      `Status: ${task.status} → ${data.status}`
    );
  }
  if (data.assignedTo && data.assignedTo !== task.assignedTo?.toString()) {
    await logActivity(workspace._id, taskId, user.id, 'assigned', `Task assigned`);
  }

  task.title = data.title ?? task.title;
  task.description = data.description ?? task.description;
  if (data.status) task.status = data.status;
  if (data.priority) task.priority = data.priority;
  if (data.dueDate !== undefined) task.dueDate = data.dueDate;
  if (data.labels) task.labels = data.labels;
  if (data.assignedTo !== undefined) task.assignedTo = data.assignedTo || null;
  if (data.subtasks) task.subtasks = data.subtasks;
  if (data.order !== undefined) task.order = data.order;

  await task.save();

  if (changes.length > 0) {
    await logActivity(workspace._id, taskId, user.id, 'updated', changes.join(', '));
  }

  return task;
};

exports.deleteTaskService = async (user, workspace, workspaceMember, taskId) => {
  const task = await Task.findOne({ _id: taskId, workspace: workspace._id }).populate(
    'createdBy',
    '_id'
  );
  if (!task) throw new AppError('Task not found', 404);

  const privilegedRoles = ['owner', 'admin'];
  if (
    !privilegedRoles.includes(workspaceMember.role) &&
    task.createdBy._id.toString() !== user.id.toString()
  ) {
    throw new AppError('Forbidden: you do not own this task', 403);
  }

  await Task.deleteOne({ _id: taskId, workspace: workspace._id });
  return task;
};
