import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockVerify = jest.fn();
const mockFindById = jest.fn();

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: mockVerify,
  },
}));

jest.unstable_mockModule('../models/User.js', () => ({
  default: {
    findById: mockFindById,
  },
}));

const { default: isAdminLoggedin } = await import('../middlewares/auth.middleware.js');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('isAdminLoggedin middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when token is missing', async () => {
    const req = { cookies: {} };
    const res = createRes();
    const next = jest.fn();

    await isAdminLoggedin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for invalid admin token payload', async () => {
    const req = { cookies: { jwt: 'token' } };
    const res = createRes();
    const next = jest.fn();

    mockVerify.mockReturnValue({ id: 'u1', userType: 'buyer', email: 'buyer@test.com' });
    mockFindById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'u1', userType: 'buyer', email: 'buyer@test.com' }),
    });

    await isAdminLoggedin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid admin token',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches user and calls next for valid admin token', async () => {
    const req = { cookies: { jwt: 'token' } };
    const res = createRes();
    const next = jest.fn();
    const user = { _id: 'u2', userType: 'admin', email: 'admin@test.com' };

    mockVerify.mockReturnValue({ id: 'u2', userType: 'admin', email: 'admin@test.com' });
    mockFindById.mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    });

    await isAdminLoggedin(req, res, next);

    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when verify throws', async () => {
    const req = { cookies: { jwt: 'broken-token' } };
    const res = createRes();
    const next = jest.fn();

    mockVerify.mockImplementation(() => {
      throw new Error('bad token');
    });

    await isAdminLoggedin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Token is not valid',
      })
    );
  });
});
