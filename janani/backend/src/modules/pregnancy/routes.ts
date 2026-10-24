import express, { type Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { requireAuth } from '../../middleware/auth';

export function createPregnancyRouter(prisma: PrismaClient): Router {
  const router = express.Router();

  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const pregnancy = await prisma.pregnancy.findFirst({
        where: { userId: res.locals.userId, endedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ pregnancy });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', requireAuth, async (req, res, next) => {
    try {
      const month = Number(req.body.month);
      if (!Number.isInteger(month) || month < 1 || month > 9) {
        res.status(400).json({ message: 'Pregnancy month must be between 1 and 9' });
        return;
      }
      const today = new Date();
      const lmpDate = new Date(today);
      lmpDate.setDate(lmpDate.getDate() - ((month - 1) * 30));
      const dueDate = new Date(lmpDate);
      dueDate.setDate(dueDate.getDate() + 280);
      const existing = await prisma.pregnancy.findFirst({
        where: { userId: res.locals.userId, endedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      const pregnancy = existing
        ? await prisma.pregnancy.update({ where: { id: existing.id }, data: { lmpDate, dueDate } })
        : await prisma.pregnancy.create({ data: { userId: res.locals.userId, lmpDate, dueDate } });
      res.status(existing ? 200 : 201).json({ pregnancy, month });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
