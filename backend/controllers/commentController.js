const commentService = require('../services/commentService');

exports.addComment = async (req, res, next) => {
  try {
    const comment = await commentService.addComment(
      req.user.id,
      req.workspace._id,
      req.params.taskId,
      req.body.content
    );
    res.status(201).json({ message: 'Comment added', comment });
  } catch (err) {
    next(err);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const comments = await commentService.getComments(req.workspace._id, req.params.taskId);
    res.status(200).json({ comments });
  } catch (err) {
    next(err);
  }
};

exports.getActivity = async (req, res, next) => {
  try {
    const activity = await commentService.getActivity(req.workspace._id, req.params.taskId);
    res.status(200).json({ activity });
  } catch (err) {
    next(err);
  }
};
