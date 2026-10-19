import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler as h } from '../middleware/errors.js';
import * as auth from '../controllers/auth.js';
import * as tx from '../controllers/transactions.js';
import * as budgets from '../controllers/budgets.js';
import * as dashboard from '../controllers/dashboard.js';
import * as analytics from '../controllers/analytics.js';
import * as s from '../services/schemas.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many attempts. Try again in a few minutes.' } });

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.post('/auth/register', authLimiter, validate(s.registerSchema), h(auth.register));
router.post('/auth/login', authLimiter, validate(s.loginSchema), h(auth.login));
router.post('/auth/forgot-password', authLimiter, validate(s.forgotPasswordSchema), h(auth.forgotPassword));
router.post('/auth/reset-password', authLimiter, validate(s.resetPasswordSchema), h(auth.resetPassword));
router.get('/auth/me', requireAuth, h(auth.me));

router.use(requireAuth);

router.patch('/auth/profile', authLimiter, validate(s.updateProfileSchema), h(auth.updateProfile));
router.post('/auth/change-password', authLimiter, validate(s.changePasswordSchema), h(auth.changePassword));
router.delete('/auth/account', authLimiter, validate(s.deleteAccountSchema), h(auth.deleteAccount));

router.get('/transactions/export', h(tx.exportCsv));
router.get('/transactions', validate(s.transactionQuerySchema, 'query'), h(tx.list));
router.post('/transactions', validate(s.transactionCreateSchema), h(tx.create));
router.patch('/transactions/:id', validate(s.transactionUpdateSchema), h(tx.update));
router.delete('/transactions/:id', h(tx.remove));

router.get('/budgets', validate(s.budgetQuerySchema, 'query'), h(budgets.list));
router.post('/budgets', validate(s.budgetSchema), h(budgets.upsert));
router.delete('/budgets/:id', h(budgets.remove));

router.get('/dashboard/summary', validate(s.monthQuerySchema, 'query'), h(dashboard.summary));
router.get('/analytics/monthly', validate(s.analyticsQuerySchema, 'query'), h(analytics.monthly));

export default router;
