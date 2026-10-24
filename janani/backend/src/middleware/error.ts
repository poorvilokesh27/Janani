import type { ErrorRequestHandler } from 'express';
import { logger } from '../lib/logger';

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const requestId = res.locals.requestId;
  logger.error({ err: error, requestId, method: req.method, path: req.path }, 'Unhandled request error');
  const status = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : error.message,
    requestId,
  });
};
