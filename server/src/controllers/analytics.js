import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import { currentMonth, monthRange, shiftMonth } from '../services/finance.js';

export async function monthly(req, res) {
  const { months } = req.valid.query;
  const last = currentMonth();
  const first = shiftMonth(last, -(months - 1));
  const match = {
    userId: new mongoose.Types.ObjectId(req.user.id),
    date: { $gte: monthRange(first).start, $lt: monthRange(last).end },
  };
  const monthKey = { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'UTC' } };

  const [totals, categories] = await Promise.all([
    Transaction.aggregate([{ $match: match }, { $group: { _id: { month: monthKey, type: '$type' }, total: { $sum: '$amount' } } }]),
    Transaction.aggregate([
      { $match: { ...match, type: 'expense' } },
      { $group: { _id: { month: monthKey, category: '$category' }, total: { $sum: '$amount' } } },
    ]),
  ]);

  // Fill months with no activity so charts have a continuous axis
  const series = Array.from({ length: months }, (_, i) => ({ month: shiftMonth(first, i), income: 0, expenses: 0 }));
  const idx = new Map(series.map((s) => [s.month, s]));
  for (const t of totals) {
    const row = idx.get(t._id.month);
    if (row) row[t._id.type === 'income' ? 'income' : 'expenses'] = Math.round(t.total * 100) / 100;
  }

  res.json({
    series,
    categories: categories.map((c) => ({ month: c._id.month, category: c._id.category, amount: Math.round(c.total * 100) / 100 })),
  });
}
