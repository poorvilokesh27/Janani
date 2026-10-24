import express, { type Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { requireAuth } from '../../middleware/auth';

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function createCycleRouter(prisma: PrismaClient): Router {
  const router = express.Router();

  router.get('/', requireAuth, async (_req, res, next) => {
    try {
      const cycles = await prisma.cycleLog.findMany({
        where: { userId: res.locals.userId },
        orderBy: { cycleDate: 'desc' },
        take: 24,
      });
      res.json({ cycles: cycles.map((cycle) => ({ ...cycle, payload: JSON.parse(cycle.payload) })) });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', requireAuth, async (req, res, next) => {
    try {
      const cycleDate = parseDate(req.body.cycleDate);
      const cycleLength = Number(req.body.cycleLength);
      const notes = typeof req.body.notes === 'string' ? req.body.notes.trim().slice(0, 500) : '';
      if (!cycleDate || !Number.isInteger(cycleLength) || cycleLength < 15 || cycleLength > 60) {
        res.status(400).json({ message: 'Enter a valid period start date and a cycle length from 15 to 60 days.' });
        return;
      }
      const cycle = await prisma.cycleLog.create({
        data: {
          userId: res.locals.userId,
          cycleDate,
          payload: JSON.stringify({ cycleLength, notes }),
        },
      });
      res.status(201).json({ cycle: { ...cycle, payload: { cycleLength, notes } } });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
