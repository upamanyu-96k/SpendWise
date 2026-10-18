// Money is summed in paise (integers) to avoid floating-point drift, then converted back to rupees.
const toPaise = (n) => Math.round(Number(n) * 100);
const fromPaise = (p) => p / 100;
const round1 = (n) => Math.round(n * 10) / 10;

export const inr = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export function isValidMonth(month) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

export function currentMonth(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
}

// Half-open range [start, end) in UTC so month boundaries never overlap
export function monthRange(month) {
  const [y, m] = month.split('-').map(Number);
  return { start: new Date(Date.UTC(y, m - 1, 1)), end: new Date(Date.UTC(y, m, 1)) };
}

export function computeTotals(transactions) {
  let income = 0;
  let expenses = 0;
  const byCat = new Map();
  for (const t of transactions) {
    const p = toPaise(t.amount);
    if (t.type === 'income') income += p;
    else {
      expenses += p;
      byCat.set(t.category, (byCat.get(t.category) || 0) + p);
    }
  }
  const byCategory = [...byCat.entries()]
    .map(([category, p]) => ({ category, amount: fromPaise(p) }))
    .sort((a, b) => b.amount - a.amount);
  return {
    income: fromPaise(income),
    expenses: fromPaise(expenses),
    balance: fromPaise(income - expenses),
    savingsRate: income > 0 ? round1(((income - expenses) / income) * 100) : 0,
    byCategory,
  };
}

// Utilization = category spending / monthly limit x 100
export function utilization(spent, limit) {
  if (!(limit > 0)) return 0;
  return round1((spent / limit) * 100);
}

export function budgetStatus(pct) {
  if (pct >= 100) return 'exceeded';
  if (pct >= 80) return 'warning';
  return 'ok';
}

export function buildBudgetProgress(budgets, byCategory) {
  const spentBy = new Map(byCategory.map((c) => [c.category, c.amount]));
  return budgets
    .map((b) => {
      const spent = spentBy.get(b.category) || 0;
      const pct = utilization(spent, b.monthlyLimit);
      return {
        id: String(b._id ?? b.id ?? b.category),
        category: b.category,
        monthlyLimit: b.monthlyLimit,
        spent,
        remaining: fromPaise(toPaise(b.monthlyLimit) - toPaise(spent)),
        utilization: pct,
        status: budgetStatus(pct),
      };
    })
    .sort((a, b) => b.utilization - a.utilization);
}

// Rule-based insights. No AI involved: every message is derived from the numbers.
export function buildInsights({ current, previous, budgetProgress }) {
  const insights = [];

  for (const b of budgetProgress) {
    if (b.status === 'exceeded') {
      insights.push({ type: 'warning', message: `You have exceeded your ${b.category} budget by ${inr(Math.abs(b.remaining))}.` });
    } else if (b.status === 'warning') {
      insights.push({ type: 'warning', message: `You have used ${b.utilization}% of your ${b.category} budget.` });
    }
  }

  if (current.income > 0 && current.expenses > current.income) {
    insights.push({ type: 'warning', message: 'Your expenses are higher than your income this month.' });
  }

  const prevBy = new Map(previous.byCategory.map((c) => [c.category, c.amount]));
  for (const c of current.byCategory) {
    const prev = prevBy.get(c.category);
    if (!prev) continue;
    const change = round1(((c.amount - prev) / prev) * 100);
    if (change >= 15) {
      insights.push({ type: 'info', message: `Your ${c.category} expenses increased by ${change}% compared with last month.` });
    } else if (change <= -15) {
      insights.push({ type: 'positive', message: `Your ${c.category} expenses decreased by ${Math.abs(change)}% compared with last month.` });
    }
  }

  if (current.byCategory.length && current.expenses > 0) {
    const top = current.byCategory[0];
    insights.push({ type: 'info', message: `${top.category} is your largest expense category, at ${round1((top.amount / current.expenses) * 100)}% of spending.` });
  }

  if (current.income > 0 && current.savingsRate >= 20) {
    insights.push({ type: 'positive', message: `You saved ${current.savingsRate}% of your income this month.` });
  }

  return insights;
}
