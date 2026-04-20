const workspaceService = require('../services/workspaceService');

exports.listMine = async (req, res, next) => {
  try {
    const workspaces = await workspaceService.listUserWorkspaces(req.user.id);
    res.status(200).json({ workspaces });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name } = req.body;
    const workspace = await workspaceService.createWorkspace({
      name,
      ownerId: req.user.id,
      personal: false,
    });
    res.status(201).json({ message: 'Workspace created', workspace });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const result = await workspaceService.getWorkspace(req.user.id, req.params.id);
    res.status(200).json({ workspace: result.workspace, role: result.role });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const workspace = await workspaceService.updateWorkspace(req.user.id, req.params.id, req.body);
    res.status(200).json({ message: 'Workspace updated', workspace });
  } catch (err) {
    next(err);
  }
};

exports.listMembers = async (req, res, next) => {
  try {
    const members = await workspaceService.listMembers(req.user.id, req.params.id);
    res.status(200).json({ members });
  } catch (err) {
    next(err);
  }
};
