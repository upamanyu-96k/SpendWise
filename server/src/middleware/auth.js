import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './errors.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new AppError(401, 'Please log in to continue.'));
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub };
    next();
  } catch {
    next(new AppError(401, 'Your session has expired. Please log in again.'));
  }
}
