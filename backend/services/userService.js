const User = require('../models/User');

exports.getAllUsersService = async (filters, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const users = await User.find(filters)
    .select('-password')
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(filters);

  return { users, total };
};

exports.getUserByIdService = async (id) => {
  return await User.findById(id).select('-password');
};
