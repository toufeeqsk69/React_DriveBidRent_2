import { describe, it, expect, jest } from '@jest/globals';
import checkBlocked from '../middlewares/checkBlocked.middleware.js';

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('checkBlocked middleware', () => {
  it('blocks users flagged as blocked', () => {
    const req = { user: { isBlocked: true } };
    const res = createRes();
    const next = jest.fn();

    checkBlocked(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('allows non-blocked users', () => {
    const req = { user: { isBlocked: false } };
    const res = createRes();
    const next = jest.fn();

    checkBlocked(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('allows requests without user object', () => {
    const req = {};
    const res = createRes();
    const next = jest.fn();

    checkBlocked(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
