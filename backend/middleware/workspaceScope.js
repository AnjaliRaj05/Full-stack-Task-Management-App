const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const WorkspaceMember = require('../models/WorkspaceMember');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Resolves the current workspace for a request and verifies the caller is a member.
 *
 * Resolution order:
 *   1. X-Workspace-Id header (preferred)
 *   2. User's defaultWorkspace
 *
 * Sets req.workspace (the Workspace doc) and req.workspaceMember (membership doc with role).
 * Returns 400 if no workspace could be resolved, 403 if caller is not a member.
 *
 * Must run AFTER the auth middleware (requires req.user).
 */
module.exports = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw new AppError('Unauthorized', 401);
    }

    let workspaceId = req.header('x-workspace-id') || req.header('X-Workspace-Id');

    if (!workspaceId) {
      const user = await User.findById(req.user.id).select('defaultWorkspace');
      workspaceId = user?.defaultWorkspace?.toString();
    }

    if (!workspaceId || !mongoose.isValidObjectId(workspaceId)) {
      throw new AppError('No workspace selected. Pass X-Workspace-Id header.', 400);
    }

    const [workspace, membership] = await Promise.all([
      Workspace.findById(workspaceId),
      WorkspaceMember.findOne({
        workspace: workspaceId,
        user: req.user.id,
      }),
    ]);

    if (!workspace) {
      throw new AppError('Workspace not found', 404);
    }

    if (!membership) {
      throw new AppError('Forbidden: you are not a member of this workspace', 403);
    }

    req.workspace = workspace;
    req.workspaceMember = membership;
    next();
  } catch (err) {
    next(err);
  }
};
