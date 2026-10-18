export const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Other'];
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Other'];
export const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];
export const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];
export const TYPES = ['income', 'expense'];
