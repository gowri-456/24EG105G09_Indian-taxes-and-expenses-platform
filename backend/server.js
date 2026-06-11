import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import mongoose from "mongoose";
// Routes
import authRoutes    from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import incomeRoutes  from "./routes/incomeRoutes.js";
import taxRoutes     from "./routes/taxRoutes.js";
import budgetRoutes  from "./routes/budgetRoutes.js";
import adminRoutes   from "./routes/adminRoutes.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];
if (process.env.CLIENT_URL) {
  const clientUrl = process.env.CLIENT_URL.trim();
  allowedOrigins.push(clientUrl);
  // Add variants with/without trailing slash to prevent mismatch errors
  if (clientUrl.endsWith("/")) {
    allowedOrigins.push(clientUrl.slice(0, -1));
  } else {
    allowedOrigins.push(`${clientUrl}/`);
  }
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/income",   incomeRoutes);
app.use("/api/tax",      taxRoutes);
app.use("/api/budget",   budgetRoutes);
app.use("/api/admin",    adminRoutes);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  const dbState = mongoose.connection ? dbStates[mongoose.connection.readyState] : "unknown";
  
  res.status(200).json({
    success: true,
    message: "Indian Tax & Expense Planner API is running ✅",
    database: dbState,
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
