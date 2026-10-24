import express, { type Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { requireAuth } from '../../middleware/auth';

const e164 = /^\+[1-9]\d{9,14}$/;

export function createUsersRouter(prisma: PrismaClient): Router {
  const router = express.Router();

  router.put('/mobile', requireAuth, async (req, res, next) => {
    try {
      const mobile = typeof req.body.mobile === 'string'
        ? req.body.mobile.replace(/[\s()-]/g, '')
        : '';
      if (!e164.test(mobile)) {
        res.status(400).json({ message: 'Enter a valid mobile number with country code' });
        return;
      }
      await prisma.user.update({
        where: { id: res.locals.userId },
        data: { mobile },
      });
      res.json({ mobile });
    } catch (error) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
        res.status(409).json({ message: 'That mobile number is already linked to an account' });
        return;
      }
      next(error);
    }
  });

  return router;
}
