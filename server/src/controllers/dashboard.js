import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import { buildBudgetProgress, buildInsights, computeTotals, currentMonth, monthRange, shiftMonth } from '../services/finance.js';

export async function summary(req, res) {
  const month = req.valid.query.month || currentMonth();
  const range = monthRange(month);
  const prevRange = monthRange(shiftMonth(month, -1));
  const userId = req.user.id;

  const [txs, prevTxs, budgets, recent] = await Promise.all([
    Transaction.find({ userId, date: { $gte: range.start, $lt: range.end } }),
    Transaction.find({ userId, date: { $gte: prevRange.start, $lt: prevRange.end } }),
    Budget.find({ userId, month }),
    Transaction.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(5),
  ]);

  const current = computeTotals(txs);
  const previous = computeTotals(prevTxs);
  const budgetProgress = buildBudgetProgress(budgets, current.byCategory);

  res.json({
    month,
    ...current,
    budgets: budgetProgress,
    insights: buildInsights({ current, previous, budgetProgress }),
    recent,
  });
}
