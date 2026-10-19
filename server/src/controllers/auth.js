import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errors.js';
import { sendPasswordResetEmail } from '../services/mailer.js';

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt });
const signToken = (user) => jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');

async function loadUserWithPassword(id) {
  const user = await User.findById(id).select('+passwordHash');
  if (!user) throw new AppError(401, 'Account no longer exists.');
  return user;
}

async function assertPassword(user, password) {
  if (!password || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(400, 'Your current password is incorrect.');
  }
}

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
  const [transactions, budgets] = await Promise.all([
    Transaction.countDocuments({ userId: user.id }),
    Budget.countDocuments({ userId: user.id }),
  ]);
  res.json({ user: publicUser(user), stats: { transactions, budgets } });
}

export async function updateProfile(req, res) {
  const { name, email, currentPassword } = req.valid.body;
  const user = await loadUserWithPassword(req.user.id);
  if (email && email !== user.email) {
    // Changing the sign-in email is sensitive, so the password must be confirmed
    await assertPassword(user, currentPassword);
    if (await User.exists({ email, _id: { $ne: user.id } })) throw new AppError(409, 'That email is already in use.');
    user.email = email;
  }
  if (name) user.name = name;
  await user.save();
  res.json({ user: publicUser(user) });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.valid.body;
  const user = await loadUserWithPassword(req.user.id);
  await assertPassword(user, currentPassword);
  if (currentPassword === newPassword) throw new AppError(400, 'Choose a password you have not used just now.');
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ message: 'Password updated.' });
}

// Always answers the same way so nobody can use this to discover which emails have accounts
export async function forgotPassword(req, res) {
  const { email } = req.valid.body;
  const user = await User.findOne({ email });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetTokenHash = hashToken(token);
    user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    try {
      await sendPasswordResetEmail(user.email, `${env.appUrl}/reset-password?token=${token}`);
    } catch (err) {
      console.error('Could not send reset email:', err.message);
    }
  }
  res.json({ message: 'If an account exists for that email, a reset link is on its way.' });
}

export async function resetPassword(req, res) {
  const { token, password } = req.valid.body;
  const user = await User.findOne({ resetTokenHash: hashToken(token), resetTokenExpires: { $gt: new Date() } }).select('+resetTokenHash +resetTokenExpires');
  if (!user) throw new AppError(400, 'This reset link is invalid or has expired.');
  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetTokenHash = undefined; // single use
  user.resetTokenExpires = undefined;
  await user.save();
  res.json({ message: 'Password updated. You can now log in.' });
}

export async function deleteAccount(req, res) {
  const user = await loadUserWithPassword(req.user.id);
  await assertPassword(user, req.valid.body.password);
  await Promise.all([Transaction.deleteMany({ userId: user.id }), Budget.deleteMany({ userId: user.id })]);
  await User.deleteOne({ _id: user.id });
  res.status(204).end();
}
