// Creates demo@example.com / demo12345 with ~3 months of sample data.
import bcrypt from 'bcryptjs';
import { assertEnv } from '../src/config/env.js';
import { connectDb } from '../src/config/db.js';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Transaction from '../src/models/Transaction.js';
import Budget from '../src/models/Budget.js';
import { currentMonth, shiftMonth } from '../src/services/finance.js';

assertEnv();
await connectDb();

await User.deleteOne({ email: 'demo@example.com' });
const user = await User.create({ name: 'Demo User', email: 'demo@example.com', passwordHash: await bcrypt.hash('demo12345', 12) });

const month = currentMonth();
const rows = [];
const day = (m, d) => new Date(`${m}-${String(d).padStart(2, '0')}T00:00:00.000Z`);

[-2, -1, 0].forEach((offset, i) => {
  const m = shiftMonth(month, offset);
  const bump = 1 + i * 0.12; // spending drifts up so insights have something to say
  rows.push({ type: 'income', amount: 60000, category: 'Salary', description: 'Monthly salary', paymentMethod: 'Bank Transfer', date: day(m, 1) });
  if (i === 2) rows.push({ type: 'income', amount: 8000, category: 'Freelance', description: 'Website project', paymentMethod: 'UPI', date: day(m, 12) });
  rows.push({ type: 'expense', amount: 12000, category: 'Bills', description: 'Rent share', paymentMethod: 'Bank Transfer', date: day(m, 3) });
  rows.push({ type: 'expense', amount: 1800, category: 'Bills', description: 'Electricity and internet', paymentMethod: 'UPI', date: day(m, 6) });
  for (let d = 2; d <= 26; d += 3) rows.push({ type: 'expense', amount: Math.round(220 * bump + d * 9), category: 'Food', description: d % 2 ? 'Lunch' : 'Groceries', paymentMethod: 'UPI', date: day(m, d) });
  for (let d = 5; d <= 25; d += 5) rows.push({ type: 'expense', amount: Math.round(180 * bump * (i + 1)), category: 'Travel', description: 'Auto and bus', paymentMethod: 'Cash', date: day(m, d) });
  rows.push({ type: 'expense', amount: Math.round(2500 * bump), category: 'Shopping', description: 'Clothes', paymentMethod: 'Card', date: day(m, 14) });
  rows.push({ type: 'expense', amount: 799, category: 'Entertainment', description: 'Streaming and movie', paymentMethod: 'Card', date: day(m, 18) });
});

await Transaction.insertMany(rows.map((r) => ({ ...r, userId: user._id })));
await Budget.insertMany([
  { category: 'Food', monthlyLimit: 5000 },
  { category: 'Travel', monthlyLimit: 2500 },
  { category: 'Shopping', monthlyLimit: 3000 },
  { category: 'Bills', monthlyLimit: 15000 },
].map((b) => ({ ...b, userId: user._id, month })));

console.log(`Seeded ${rows.length} transactions. Log in with demo@example.com / demo12345`);
await mongoose.disconnect();
