import mongoose from 'mongoose';
import { ALL_CATEGORIES, PAYMENT_METHODS, TYPES } from '../config/constants.js';

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: TYPES, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, enum: ALL_CATEGORIES, required: true },
    description: { type: String, trim: true, maxlength: 200, default: '' },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: 'UPI' },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });

export default mongoose.model('Transaction', transactionSchema);
