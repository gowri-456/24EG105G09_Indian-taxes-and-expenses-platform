import User from "../models/UserModel.js";
import generateToken from "../utils/generateToken.js";

// ─── REGISTER ─────────────────────────────────────────────────────────────────
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, salary } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, salary });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        salary: user.salary,
        preferredRegime: user.preferredRegime,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        salary: user.salary,
        preferredRegime: user.preferredRegime,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { name, salary, preferredRegime, financialYear } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, salary, preferredRegime, financialYear },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated",
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};
