import User from "../models/UserModel.js";
import Expense from "../models/ExpenseModel.js";
import Income from "../models/IncomeModel.js";

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  salary: user.salary,
  preferredRegime: user.preferredRegime,
  financialYear: user.financialYear,
  joinedDate: user.createdAt,
});

const sumAmount = async (Model) => {
  const [result] = await Model.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return result?.total || 0;
};

export const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, adminUsers, regularUsers, totalExpenses, totalIncome, recentUsers] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ role: "user" }),
        sumAmount(Expense),
        sumAmount(Income),
        User.find()
          .select("-password")
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        adminUsers,
        regularUsers,
        totalExpenses,
        totalIncome,
        totalTaxSaved: 0,
      },
      recentUsers: recentUsers.map(formatUser),
    });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users: users.map(formatUser),
      counts: {
        total: users.length,
        admins: users.filter((user) => user.role === "admin").length,
        regular: users.filter((user) => user.role === "user").length,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either user or admin.",
      });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "admin" && role === "user") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "At least one admin user is required.",
        });
      }
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated.",
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (String(req.user._id) === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account.",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "At least one admin user is required.",
        });
      }
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted.",
    });
  } catch (err) {
    next(err);
  }
};
