import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errors.js';

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });
const signToken = (user) => jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export async function register(req, res) {
  const { name, email, password } = req.valid.body;
  if (await User.exists({ email })) throw new AppError(409, 'An account with this email already exists.');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.valid.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  // Same message for unknown email and wrong password so accounts can't be enumerated
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) throw new AppError(401, 'Email or password is incorrect.');
  res.json({ token: signToken(user), user: publicUser(user) });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError(401, 'Account no longer exists.');
  res.json({ user: publicUser(user) });
}
