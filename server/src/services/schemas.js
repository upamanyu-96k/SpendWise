import { z } from 'zod';
import { ALL_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS, TYPES } from '../config/constants.js';

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must look like 2026-10');

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

const transactionBase = z.object({
  type: z.enum(TYPES),
  amount: z.coerce.number().positive('Amount must be greater than 0').max(1e9),
  category: z.enum(ALL_CATEGORIES),
  description: z.string().trim().max(200).optional().default(''),
  paymentMethod: z.enum(PAYMENT_METHODS).optional().default('UPI'),
  date: z.coerce.date(),
});

export const transactionCreateSchema = transactionBase;
export const transactionUpdateSchema = transactionBase.partial().refine((v) => Object.keys(v).length > 0, 'Nothing to update');

export const transactionQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  type: z.enum(TYPES).optional(),
  category: z.enum(ALL_CATEGORIES).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const budgetSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  monthlyLimit: z.coerce.number().positive('Limit must be greater than 0').max(1e9),
  month,
});

export const monthQuerySchema = z.object({ month: month.optional() });
export const budgetQuerySchema = z.object({ month: month.optional() });
export const analyticsQuerySchema = z.object({ months: z.coerce.number().int().min(2).max(12).default(6) });
