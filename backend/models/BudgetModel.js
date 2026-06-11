import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Food & Dining",
        "Travel & Transport",
        "Shopping",
        "Bills & Utilities",
        "Healthcare",
        "Education",
        "Entertainment",
        "Rent",
        "EMI",
        "Investments",
        "Other",
        "Total", // For overall monthly budget
      ],
    },
    monthlyLimit: {
      type: Number,
      required: [true, "Monthly limit is required"],
      min: [1, "Budget limit must be at least ₹1"],
    },
    month: {
      type: Number, // 1–12
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    alertThreshold: {
      type: Number,
      default: 80, // Alert when 80% of budget is used
      min: 1,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// One budget per category per month per user
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.model("Budget", budgetSchema);
export default Budget;
