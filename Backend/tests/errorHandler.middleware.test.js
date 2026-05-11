import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  createBadRequestError,
  createNotFoundError,
  notFoundHandler,
  errorHandler,
  asyncHandler,
} from '../middlewares/errorHandler.middleware.js';

const createRes = () => {
  const res = {
    statusCode: 200,
    headersSent: false,
  };
  res.status = jest.fn().mockImplementation((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('errorHandler middleware helpers', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('creates common errors with status and operational flag', () => {
    const badRequest = createBadRequestError('Invalid payload');
    const notFound = createNotFoundError();

    expect(badRequest.statusCode).toBe(400);
    expect(badRequest.isOperational).toBe(true);
    expect(notFound.statusCode).toBe(404);
    expect(notFound.message).toBe('Resource Not Found');
  });

  it('notFoundHandler forwards a route-not-found error', () => {
    const req = { originalUrl: '/missing' };
    const res = createRes();
    const next = jest.fn();

    notFoundHandler(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(404);
    expect(next.mock.calls[0][0].message).toContain('/missing');
  });

  it('maps duplicate key errors to 409', () => {
    const req = { method: 'POST', url: '/x', ip: '127.0.0.1', get: () => 'jest' };
    const res = createRes();
    const next = jest.fn();
    const err = { code: 11000, keyPattern: { email: 1 }, message: 'dup', stack: 'stack' };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Email already exists',
      })
    );
  });

  it('maps JWT errors to 401', () => {
    const req = { method: 'GET', url: '/secure', ip: '127.0.0.1', get: () => 'jest' };
    const res = createRes();
    const err = { name: 'JsonWebTokenError', message: 'bad token', stack: 'stack' };

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid token. Please log in again',
      })
    );
  });

  it('passes through when headers are already sent', () => {
    const req = { method: 'GET', url: '/test', ip: '127.0.0.1', get: () => 'jest' };
    const res = createRes();
    res.headersSent = true;
    const next = jest.fn();
    const err = new Error('already sent');

    errorHandler(err, req, res, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('asyncHandler forwards async rejections', async () => {
    const expectedError = new Error('boom');
    const next = jest.fn();
    const wrapped = asyncHandler(async () => {
      throw expectedError;
    });

    wrapped({}, {}, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(expectedError);
  });
});
