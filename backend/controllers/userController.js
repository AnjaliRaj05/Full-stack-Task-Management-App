const userService = require("../services/userService");

exports.getAllUsers = async (req, res) => {
  try {
    const { fullname, email, page = 1, limit = 10 } = req.query;

    const filters = {};
    if (fullname) filters.fullname = { $regex: fullname, $options: 'i' };
    if (email) filters.email = { $regex: email, $options: 'i' };

    const { users, total } = await userService.getAllUsersService(filters, page, limit);

    return res.status(200).json({
      message: "Users fetched",
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      users
    });

  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getUserByID = async (req, res) => {
  try {
    const user = await userService.getUserByIdService(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "User fetched", user });

  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
