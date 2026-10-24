import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { loadEnv } from '../config/env';

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.header('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  try {
    const payload = jwt.verify(token, loadEnv(process.env).JWT_ACCESS_SECRET);
    if (typeof payload !== 'object' || !payload.sub) throw new Error('Invalid token');
    res.locals.userId = String(payload.sub);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
