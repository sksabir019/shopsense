import type { ErrorRequestHandler } from 'express';
import { logger } from '../utils/logger.js';
import { HttpError } from '../utils/http-error.js';

function getParserStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  if ('status' in error && typeof error.status === 'number') return error.status;
  if ('statusCode' in error && typeof error.statusCode === 'number') return error.statusCode;
  return undefined;
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const parserStatus = getParserStatus(error);
  const statusCode = error instanceof HttpError
    ? error.statusCode
    : parserStatus === 400 || parserStatus === 413 ? parserStatus : 500;
  const code = error instanceof HttpError
    ? error.code
    : statusCode === 400 ? 'INVALID_REQUEST_BODY' : statusCode === 413 ? 'PAYLOAD_TOO_LARGE' : 'INTERNAL_ERROR';
  const message = error instanceof HttpError
    ? error.message
    : statusCode === 400 ? 'The request body is invalid.'
      : statusCode === 413 ? 'The request body is too large.'
        : 'The request could not be completed. Please try again.';

  if (statusCode >= 500) {
    logger.error({
      statusCode,
      error: error instanceof HttpError
        ? {
          name: error.name,
          code: error.code,
          stack: error.stack,
          cause: error.cause instanceof Error ? { name: error.cause.name, stack: error.cause.stack } : undefined
        }
        : error instanceof Error ? { name: error.name, stack: error.stack } : { type: typeof error }
    }, 'Request failed');
  } else {
    logger.warn({ statusCode, code }, 'Request rejected');
  }

  res.status(statusCode).json({ error: { code, message } });
};
