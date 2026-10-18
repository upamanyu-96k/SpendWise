import mongoose from 'mongoose';
import { EXPENSE_CATEGORIES } from '../config/constants.js';

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, enum: EXPENSE_CATEGORIES, required: true },
    monthlyLimit: { type: Number, required: true, min: 1 },
    month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
  },
  { timestamps: true }
);

// One budget per user, category and month
budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
