import express, { type Router } from 'express';
import type { PrismaClient, Language } from '@prisma/client';
import { requireAuth } from '../../middleware/auth';

const categories = new Set(['health-hygiene', 'articles', 'yoga', 'exercise']);
const languages = new Set<Language>(['en', 'kn', 'hi']);

export function createWellnessRouter(prisma: PrismaClient): Router {
  const router = express.Router();

  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const language = typeof req.query.language === 'string' ? req.query.language : 'en';
      if (category && !categories.has(category)) {
        res.status(400).json({ message: 'Unsupported wellness category' });
        return;
      }
      if (!languages.has(language as Language)) {
        res.status(400).json({ message: 'Unsupported language' });
        return;
      }

      const items = await prisma.wellnessContent.findMany({
        where: { active: true, category, language: language as Language },
        orderBy: [{ category: 'asc' }, { title: 'asc' }],
        select: {
          id: true,
          slug: true,
          category: true,
          title: true,
          summary: true,
          content: true,
          safetyNote: true,
          language: true,
        },
      });
      res.json({ items, categories: [...categories] });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:slug', requireAuth, async (req, res, next) => {
    try {
      const language = typeof req.query.language === 'string' ? req.query.language : 'en';
      if (!languages.has(language as Language)) {
        res.status(400).json({ message: 'Unsupported language' });
        return;
      }
      const item = await prisma.wellnessContent.findFirst({
        where: { slug: req.params.slug, active: true, language: language as Language },
        select: {
          id: true,
          slug: true,
          category: true,
          title: true,
          summary: true,
          content: true,
          safetyNote: true,
          language: true,
        },
      });
      if (!item) {
        res.status(404).json({ message: 'Wellness content not found' });
        return;
      }
      res.json({ item });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
