import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import { AppError } from '../middleware/errors.js';
import { buildBudgetProgress, computeTotals, currentMonth, monthRange } from '../services/finance.js';

export async function list(req, res) {
  const month = req.valid.query.month || currentMonth();
  const { start, end } = monthRange(month);
  const [budgets, txs] = await Promise.all([
    Budget.find({ userId: req.user.id, month }),
    Transaction.find({ userId: req.user.id, type: 'expense', date: { $gte: start, $lt: end } }),
  ]);
  const { byCategory } = computeTotals(txs);
  res.json({ month, budgets: buildBudgetProgress(budgets, byCategory) });
}

// Setting a budget for a category/month that already has one updates it
export async function upsert(req, res) {
  const { category, month, monthlyLimit } = req.valid.body;
  const budget = await Budget.findOneAndUpdate(
    { userId: req.user.id, category, month },
    { monthlyLimit },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(budget);
}

export async function remove(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Budget not found.');
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!budget) throw new AppError(404, 'Budget not found.');
  res.status(204).end();
}
