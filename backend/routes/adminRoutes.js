import express from "express";
import {
  deleteUser,
  getAdminStats,
  getUsers,
  updateUserRole,
} from "../controllers/adminController.js";
import verifyToken from "../middleware/verifyToken.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

export default router;
