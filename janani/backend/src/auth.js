import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signToken = (user) => jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
);

export const publicUser = (user) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  mobile: user.mobile || undefined,
  role: user.role,
});

export const hashPassword = (password) => bcrypt.hash(password, 12);
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);
