import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    source: {
      type: String,
      required: [true, "Income source is required"],
      enum: [
        "Salary",
        "Freelancing",
        "Business",
        "Rental Income",
        "Investments",
        "Interest",
        "Dividends",
        "Capital Gains",
        "Gift",
        "Other",
      ],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    financialYear: {
      type: String,
      default: "2024-25",
    },
  },
  {
    timestamps: true,
  }
);

incomeSchema.index({ userId: 1, date: -1 });

const Income = mongoose.model("Income", incomeSchema);
export default Income;
