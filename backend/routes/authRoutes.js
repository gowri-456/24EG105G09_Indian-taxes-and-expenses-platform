import express from "express";
import { registerUser, loginUser, getProfile, updateProfile } from "../controllers/authController.js";
import verifyToken from "../middleware/verifyToken.js";
import { validateRegister, validateLogin } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/register", validateRegister, registerUser);
router.post("/login",    validateLogin,    loginUser);
router.get("/profile",   verifyToken,      getProfile);
router.put("/profile",   verifyToken,      updateProfile);

export default router;
