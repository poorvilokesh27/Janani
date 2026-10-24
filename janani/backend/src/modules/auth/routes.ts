import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import type { Router } from 'express';
import express from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';
import { loadEnv } from '../../config/env';
import { ConsoleSmsProvider } from '../../providers/sms/console';
import type { SmsProvider } from '../../providers/sms/interface';

const mobilePattern = /^\+[1-9]\d{9,14}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const otpPattern = /^\d{6}$/;
const otpTtlMs = 5 * 60 * 1000;
const maxAttempts = 5;

function hashOtp(identifier: string, code: string, secret: string): string {
  return createHmac('sha256', secret).update(`${identifier}:${code}`).digest('hex');
}

function hashesMatch(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected, 'hex');
  const actualBuffer = Buffer.from(actual, 'hex');
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

function issueToken(userId: string, role: string, secret: string): string {
  return jwt.sign({ sub: userId, role }, secret, { expiresIn: '15m' });
}

function getIdentity(body: Record<string, unknown>): { method: 'mobile' | 'email'; identifier: string } {
  if (body.method === 'mobile' || (!body.method && typeof body.mobile === 'string')) {
    if (typeof body.mobile !== 'string') throw Object.assign(new Error('Enter a valid mobile number with country code'), { statusCode: 400 });
    const mobile = body.mobile.replace(/[\s()-]/g, '');
    if (!mobilePattern.test(mobile)) throw Object.assign(new Error('Enter a valid mobile number with country code'), { statusCode: 400 });
    return { method: 'mobile', identifier: mobile };
  }
  const email = String(body.email ?? '').trim().toLowerCase();
  if (!emailPattern.test(email)) throw Object.assign(new Error('Enter a valid email address'), { statusCode: 400 });
  return { method: 'email', identifier: email };
}

export function createAuthRouter(prisma: PrismaClient, sms: SmsProvider = new ConsoleSmsProvider()): Router {
  const router = express.Router();
  const env = loadEnv(process.env);
  const otpLimiter = rateLimit({
    windowMs: 60_000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many OTP requests. Try again in a minute.' },
  });

  const issueChallenge = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      if (req.body.method === 'email' && req.body.intent === 'signin') {
        res.status(400).json({ message: 'Email sign-in does not use OTP. Enter your password.' });
        return;
      }
      if (req.body.method === 'email' && req.body.intent === 'signup') {
        const contact = typeof req.body.mobile === 'string' ? req.body.mobile.replace(/[\s()-]/g, '') : '';
        if (!mobilePattern.test(contact)) {
          res.status(400).json({ message: 'Enter a valid mobile number with country code' });
          return;
        }
      }
      const { method, identifier } = getIdentity(req.body);
      const code = String(randomInt(100000, 1000000));
      const expiresAt = new Date(Date.now() + otpTtlMs);
      await prisma.otpChallenge.deleteMany({
        where: method === 'mobile' ? { mobile: identifier, consumedAt: null } : { email: identifier, consumedAt: null },
      });
      await prisma.otpChallenge.create({
        data: {
          id: randomUUID(),
          mobile: method === 'mobile' ? identifier : null,
          email: method === 'email' ? identifier : null,
          codeHash: hashOtp(identifier, code, env.OTP_HMAC_SECRET),
          expiresAt,
        },
      });
      await sms.sendOtp(identifier, code);
      res.status(202).json({ message: 'OTP sent successfully', expiresInSeconds: otpTtlMs / 1000 });
    } catch (error) {
      next(error);
    }
  };

  router.post('/otp/request', otpLimiter, issueChallenge);
  router.post('/otp/resend', otpLimiter, issueChallenge);
  router.post('/password/signin', async (req, res, next) => {
    try {
      const { identifier } = getIdentity(req.body);
      if (!req.body.password || typeof req.body.password !== 'string') {
        res.status(400).json({ message: 'Enter your password' });
        return;
      }
      const user = await prisma.user.findUnique({ where: { email: identifier } });
      if (!user?.passwordHash || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
        res.status(401).json({ message: 'Email or password is incorrect' });
        return;
      }
      res.json({
        token: issueToken(user.id, user.role, env.JWT_ACCESS_SECRET),
        user: { id: user.id, mobile: user.mobile, email: user.email, name: user.name, role: user.role },
      });
    } catch (error) {
      next(error);
    }
  });
  router.post('/otp/verify', async (req, res, next) => {
    try {
      const { method, identifier } = getIdentity(req.body);
      const code = String(req.body.code ?? '');
      if (!otpPattern.test(code)) {
        res.status(400).json({ message: 'OTP must be exactly 6 digits' });
        return;
      }
      const challenge = await prisma.otpChallenge.findFirst({
        where: method === 'mobile' ? { mobile: identifier, consumedAt: null } : { email: identifier, consumedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      if (!challenge || challenge.expiresAt.getTime() < Date.now()) {
        res.status(400).json({ message: 'OTP expired or not found. Request a new OTP.' });
        return;
      }
      if (challenge.attempts >= maxAttempts) {
        res.status(429).json({ message: 'Too many incorrect attempts. Request a new OTP.' });
        return;
      }
      if (!hashesMatch(hashOtp(identifier, code, env.OTP_HMAC_SECRET), challenge.codeHash)) {
        await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
        res.status(401).json({ message: 'Incorrect OTP' });
        return;
      }
      const name = typeof req.body.name === 'string' ? req.body.name.trim().slice(0, 120) : undefined;
      const passwordHash = method === 'email' && typeof req.body.password === 'string'
        ? await bcrypt.hash(req.body.password, 12)
        : undefined;
      const contactMobile = method === 'email' && typeof req.body.mobile === 'string'
        ? req.body.mobile.replace(/[\s()-]/g, '')
        : undefined;
      if (method === 'email' && !mobilePattern.test(contactMobile ?? '')) {
        res.status(400).json({ message: 'Enter a valid mobile number with country code' });
        return;
      }
      const user = method === 'mobile'
        ? await prisma.user.upsert({
          where: { mobile: identifier },
          create: { mobile: identifier, name },
          update: { deletedAt: null, ...(name ? { name } : {}) },
        })
        : await prisma.user.upsert({
          where: { email: identifier },
          create: { email: identifier, name, passwordHash, mobile: contactMobile },
          update: { deletedAt: null, ...(name ? { name } : {}), ...(passwordHash ? { passwordHash } : {}), ...(contactMobile ? { mobile: contactMobile } : {}) },
        });
      await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } });
      res.json({
        token: issueToken(user.id, user.role, env.JWT_ACCESS_SECRET),
        user: { id: user.id, mobile: user.mobile, email: user.email, name: user.name, role: user.role },
      });
    } catch (error) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
        res.status(409).json({ message: 'That mobile number or email is already linked to an account' });
        return;
      }
      next(error);
    }
  });

  return router;
}
