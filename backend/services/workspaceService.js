const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const WorkspaceMember = require('../models/WorkspaceMember');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { generateSlug } = require('../utils/slug');

/**
 * Create a workspace and make the given user its owner.
 * Runs without a transaction (standalone MongoDB compatibility) but does
 * best-effort cleanup if member creation fails.
 */
exports.createWorkspace = async ({ name, ownerId, personal = false }) => {
  if (!name || typeof name !== 'string') {
    throw new AppError('Workspace name is required', 400);
  }

  let workspace;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      workspace = await Workspace.create({
        name: name.trim(),
        slug: generateSlug(name),
        owner: ownerId,
        personal,
      });
      break;
    } catch (err) {
      if (err?.code === 11000 && attempt < 2) continue; // slug collision — retry
      throw err;
    }
  }

  try {
    await WorkspaceMember.create({
      workspace: workspace._id,
      user: ownerId,
      role: 'owner',
    });
  } catch (err) {
    await Workspace.deleteOne({ _id: workspace._id });
    throw err;
  }

  return workspace;
};

exports.listUserWorkspaces = async (userId) => {
  const memberships = await WorkspaceMember.find({ user: userId })
    .populate('workspace')
    .sort({ createdAt: 1 });

  return memberships
    .filter((m) => m.workspace)
    .map((m) => ({
      _id: m.workspace._id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      plan: m.workspace.plan,
      personal: m.workspace.personal,
      role: m.role,
      createdAt: m.workspace.createdAt,
    }));
};

exports.getWorkspace = async (userId, workspaceId) => {
  if (!mongoose.isValidObjectId(workspaceId)) {
    throw new AppError('Invalid workspace id', 400);
  }

  const membership = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId,
  }).populate('workspace');

  if (!membership || !membership.workspace) {
    throw new AppError('Workspace not found', 404);
  }

  return { workspace: membership.workspace, role: membership.role };
};

exports.updateWorkspace = async (userId, workspaceId, updates) => {
  const membership = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId,
  });
  if (!membership) throw new AppError('Workspace not found', 404);
  if (!['owner', 'admin'].includes(membership.role)) {
    throw new AppError('Forbidden: only owners and admins can update the workspace', 403);
  }

  const allowed = {};
  if (typeof updates.name === 'string') allowed.name = updates.name.trim();

  const workspace = await Workspace.findByIdAndUpdate(workspaceId, allowed, { new: true });
  if (!workspace) throw new AppError('Workspace not found', 404);
  return workspace;
};

exports.listMembers = async (userId, workspaceId) => {
  const caller = await WorkspaceMember.findOne({ workspace: workspaceId, user: userId });
  if (!caller) throw new AppError('Workspace not found', 404);

  const members = await WorkspaceMember.find({ workspace: workspaceId })
    .populate('user', 'fullname email')
    .sort({ createdAt: 1 });

  return members.map((m) => ({
    _id: m._id,
    user: m.user,
    role: m.role,
    createdAt: m.createdAt,
  }));
};

exports.ensurePersonalWorkspace = async (user) => {
  const existing = await WorkspaceMember.findOne({ user: user._id }).populate('workspace');
  if (existing?.workspace) {
    if (!user.defaultWorkspace) {
      await User.findByIdAndUpdate(user._id, { defaultWorkspace: existing.workspace._id });
    }
    return existing.workspace;
  }

  const workspace = await exports.createWorkspace({
    name: `${user.fullname}'s Workspace`,
    ownerId: user._id,
    personal: true,
  });
  await User.findByIdAndUpdate(user._id, { defaultWorkspace: workspace._id });
  return workspace;
};
