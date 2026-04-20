const userService = require('../services/userService');
const AppError = require('../utils/AppError');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { fullname, email, page = 1, limit = 10 } = req.query;

    const filters = {};
    if (fullname)
      filters.fullname = { $regex: fullname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (email)
      filters.email = { $regex: email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

    const { users, total } = await userService.getAllUsersService(filters, page, limit);

    return res.status(200).json({
      message: 'Users fetched',
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserByID = async (req, res, next) => {
  try {
    const user = await userService.getUserByIdService(req.params.id);
    if (!user) throw new AppError('User not found', 404);

    return res.status(200).json({ message: 'User fetched', user });
  } catch (err) {
    next(err);
  }
};
