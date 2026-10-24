import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  try {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const adminOnly = (req, res, next) => (
  req.user?.role === 'admin'
    ? next()
    : res.status(403).json({ message: 'Admin access required' })
);

export const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

export const page = (query) => {
  const limit = Math.min(Math.max(Number.parseInt(query.limit || '20', 10) || 20, 1), 100);
  const offset = Math.max(Number.parseInt(query.offset || '0', 10) || 0, 0);
  return { limit, offset };
};
