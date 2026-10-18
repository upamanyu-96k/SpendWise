import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  budgetStatus, buildBudgetProgress, buildInsights, computeTotals,
  currentMonth, isValidMonth, monthRange, shiftMonth, utilization,
} from '../server/src/services/finance.js';

const tx = (type, amount, category = 'Food') => ({ type, amount, category });

test('computeTotals: balance = income - expenses', () => {
  const t = computeTotals([tx('income', 50000, 'Salary'), tx('expense', 500), tx('expense', 1500, 'Bills')]);
  assert.equal(t.income, 50000);
  assert.equal(t.expenses, 2000);
  assert.equal(t.balance, 48000);
  assert.equal(t.savingsRate, 96);
});

test('computeTotals: avoids floating point drift (0.1 + 0.2)', () => {
  const t = computeTotals([tx('expense', 0.1), tx('expense', 0.2)]);
  assert.equal(t.expenses, 0.3);
});

test('computeTotals: sorts categories by spend and ignores income categories', () => {
  const t = computeTotals([tx('expense', 100, 'Food'), tx('expense', 900, 'Travel'), tx('income', 5000, 'Salary')]);
  assert.deepEqual(t.byCategory.map((c) => c.category), ['Travel', 'Food']);
});

test('computeTotals: empty list is all zeros', () => {
  const t = computeTotals([]);
  assert.deepEqual([t.income, t.expenses, t.balance, t.savingsRate], [0, 0, 0, 0]);
});

test('utilization = spent / limit x 100, safe when limit is 0', () => {
  assert.equal(utilization(2500, 5000), 50);
  assert.equal(utilization(5500, 5000), 110);
  assert.equal(utilization(100, 0), 0);
});

test('budgetStatus thresholds', () => {
  assert.equal(budgetStatus(79.9), 'ok');
  assert.equal(budgetStatus(80), 'warning');
  assert.equal(budgetStatus(100), 'exceeded');
});

test('buildBudgetProgress joins budgets with spending', () => {
  const p = buildBudgetProgress([{ _id: 'b1', category: 'Food', monthlyLimit: 5000 }], [{ category: 'Food', amount: 4200 }]);
  assert.equal(p[0].utilization, 84);
  assert.equal(p[0].remaining, 800);
  assert.equal(p[0].status, 'warning');
});

test('month helpers handle year boundaries', () => {
  assert.equal(shiftMonth('2026-01', -1), '2025-12');
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
  const { start, end } = monthRange('2026-12');
  assert.equal(start.toISOString(), '2026-12-01T00:00:00.000Z');
  assert.equal(end.toISOString(), '2027-01-01T00:00:00.000Z');
  assert.ok(isValidMonth('2026-10') && !isValidMonth('2026-13'));
  assert.equal(currentMonth(new Date('2026-10-18T10:00:00Z')), '2026-10');
});

test('buildInsights: reports category increases, exceeded budgets and top category', () => {
  const current = computeTotals([tx('income', 50000, 'Salary'), tx('expense', 1180, 'Travel'), tx('expense', 6000, 'Food')]);
  const previous = computeTotals([tx('expense', 1000, 'Travel'), tx('expense', 5900, 'Food')]);
  const budgetProgress = buildBudgetProgress([{ _id: 'b', category: 'Food', monthlyLimit: 5000 }], current.byCategory);
  const messages = buildInsights({ current, previous, budgetProgress }).map((i) => i.message);
  assert.ok(messages.some((m) => m.includes('Travel expenses increased by 18%')));
  assert.ok(messages.some((m) => m.includes('exceeded your Food budget')));
  assert.ok(messages.some((m) => m.includes('Food is your largest expense category')));
  assert.ok(!messages.some((m) => m.includes('Food expenses increased')), 'a 1.7% change is not noteworthy');
});
