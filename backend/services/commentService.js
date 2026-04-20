const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const Task = require('../models/Task');
const AppError = require('../utils/AppError');

exports.addComment = async (userId, workspaceId, taskId, content) => {
  const task = await Task.findOne({ _id: taskId, workspace: workspaceId });
  if (!task) throw new AppError('Task not found', 404);

  const comment = await Comment.create({ workspace: workspaceId, taskId, userId, content });
  await Activity.create({
    workspace: workspaceId,
    taskId,
    userId,
    action: 'commented',
    details: content.substring(0, 100),
  });

  return comment.populate('userId', 'fullname email');
};

exports.getComments = async (workspaceId, taskId) => {
  const task = await Task.findOne({ _id: taskId, workspace: workspaceId }).select('_id');
  if (!task) throw new AppError('Task not found', 404);

  return Comment.find({ workspace: workspaceId, taskId })
    .sort({ createdAt: -1 })
    .populate('userId', 'fullname email');
};

exports.getActivity = async (workspaceId, taskId) => {
  const task = await Task.findOne({ _id: taskId, workspace: workspaceId }).select('_id');
  if (!task) throw new AppError('Task not found', 404);

  return Activity.find({ workspace: workspaceId, taskId })
    .sort({ createdAt: -1 })
    .populate('userId', 'fullname email');
};
