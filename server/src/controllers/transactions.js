import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import { AppError } from '../middleware/errors.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function assertId(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError(404, 'Transaction not found.');
}

export async function list(req, res) {
  const { q, type, category, paymentMethod, from, to, minAmount, maxAmount, page, limit } = req.valid.query;
  // userId always comes from the verified token, never from the request
  const filter = { userId: req.user.id };
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (q) filter.description = { $regex: escapeRegex(q), $options: 'i' };
  if (from || to) filter.date = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  if (minAmount !== undefined || maxAmount !== undefined) {
    filter.amount = { ...(minAmount !== undefined && { $gte: minAmount }), ...(maxAmount !== undefined && { $lte: maxAmount }) };
  }
  const [items, total] = await Promise.all([
    Transaction.find(filter).sort({ date: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Transaction.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
}

export async function create(req, res) {
  const tx = await Transaction.create({ ...req.valid.body, userId: req.user.id });
  res.status(201).json(tx);
}

export async function update(req, res) {
  assertId(req.params.id);
  const tx = await Transaction.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.valid.body, { new: true, runValidators: true });
  if (!tx) throw new AppError(404, 'Transaction not found.');
  res.json(tx);
}

export async function remove(req, res) {
  assertId(req.params.id);
  const tx = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!tx) throw new AppError(404, 'Transaction not found.');
  res.status(204).end();
}
