import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockVerify = jest.fn();
const mockUserFindById = jest.fn();
const mockAuctionManagerFindById = jest.fn();

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: mockVerify,
  },
}));

jest.unstable_mockModule('../models/User.js', () => ({
  default: {
    findById: mockUserFindById,
  },
}));

jest.unstable_mockModule('../models/AuctionManager.js', () => ({
  default: {
    findById: mockAuctionManagerFindById,
  },
}));

const { default: adminMiddleware } = await import('../middlewares/admin.middleware.js');
const { default: buyerMiddleware } = await import('../middlewares/buyer.middleware.js');
const { default: sellerMiddleware } = await import('../middlewares/seller.middleware.js');
const { default: mechanicMiddleware } = await import('../middlewares/mechanic.middleware.js');
const { default: superadminMiddleware } = await import('../middlewares/superAdmin.middleware.js');
const { default: auctionManagerMiddleware } = await import('../middlewares/auction_manager.middleware.js');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const buildReq = ({
  cookieToken = null,
  bearerToken = null,
} = {}) => ({
  cookies: cookieToken ? { jwt: cookieToken } : {},
  headers: bearerToken ? { authorization: `Bearer ${bearerToken}` } : {},
});

const asSelectResult = (result) => ({
  select: jest.fn().mockResolvedValue(result),
});

const roleCases = [
  {
    label: 'admin middleware',
    middleware: adminMiddleware,
    findByIdMock: mockUserFindById,
    expectedType: 'admin',
    denialMessage: 'Access denied. Admin authentication required.',
  },
  {
    label: 'buyer middleware',
    middleware: buyerMiddleware,
    findByIdMock: mockUserFindById,
    expectedType: 'buyer',
    denialMessage: 'Access denied. Buyer authentication required.',
  },
  {
    label: 'seller middleware',
    middleware: sellerMiddleware,
    findByIdMock: mockUserFindById,
    expectedType: 'seller',
    denialMessage: 'Access denied. Seller authentication required.',
  },
  {
    label: 'mechanic middleware',
    middleware: mechanicMiddleware,
    findByIdMock: mockUserFindById,
    expectedType: 'mechanic',
    denialMessage: 'Access denied. Mechanic authentication required.',
  },
  {
    label: 'superadmin middleware',
    middleware: superadminMiddleware,
    findByIdMock: mockUserFindById,
    expectedType: 'superadmin',
    denialMessage: 'Access denied. Super Admin authentication required.',
  },
  {
    label: 'auction_manager middleware',
    middleware: auctionManagerMiddleware,
    findByIdMock: mockAuctionManagerFindById,
    expectedType: 'auction_manager',
    denialMessage: 'Access denied. Auction Manager authentication required.',
  },
];

describe.each(roleCases)('$label', ({ middleware, findByIdMock, expectedType, denialMessage }) => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when no token is provided', async () => {
    const req = buildReq();
    const res = createRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'No token provided. Please login.',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts valid cookie token and calls next', async () => {
    const req = buildReq({ cookieToken: 'cookie-token' });
    const res = createRes();
    const next = jest.fn();
    const user = { _id: 'u1', email: 'ok@test.com', isBlocked: false, userType: expectedType };

    mockVerify.mockReturnValue({ id: 'u1', email: 'ok@test.com', userType: expectedType });
    findByIdMock.mockReturnValue(asSelectResult(user));

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual(user);
  });

  it('accepts valid bearer token and calls next', async () => {
    const req = buildReq({ bearerToken: 'bearer-token' });
    const res = createRes();
    const next = jest.fn();
    const user = { _id: 'u2', email: 'bearer@test.com', isBlocked: false, userType: expectedType };

    mockVerify.mockReturnValue({ id: 'u2', email: 'bearer@test.com', userType: expectedType });
    findByIdMock.mockReturnValue(asSelectResult(user));

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns 401 when decoded token type mismatches', async () => {
    const req = buildReq({ cookieToken: 'token' });
    const res = createRes();
    const next = jest.fn();
    const user = { _id: 'u3', email: 'ok@test.com', isBlocked: false, userType: expectedType };

    mockVerify.mockReturnValue({ id: 'u3', email: 'ok@test.com', userType: 'wrong-role' });
    findByIdMock.mockReturnValue(asSelectResult(user));

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: denialMessage,
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when email mismatches', async () => {
    const req = buildReq({ cookieToken: 'token' });
    const res = createRes();
    const next = jest.fn();
    const user = { _id: 'u4', email: 'db@test.com', isBlocked: false, userType: expectedType };

    mockVerify.mockReturnValue({ id: 'u4', email: 'token@test.com', userType: expectedType });
    findByIdMock.mockReturnValue(asSelectResult(user));

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: denialMessage }));
  });

  it('returns 401 when user is not found', async () => {
    const req = buildReq({ cookieToken: 'token' });
    const res = createRes();
    const next = jest.fn();

    mockVerify.mockReturnValue({ id: 'u5', email: 'x@test.com', userType: expectedType });
    findByIdMock.mockReturnValue(asSelectResult(null));

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: denialMessage }));
  });

  it('returns 403 when user is blocked', async () => {
    const req = buildReq({ cookieToken: 'token' });
    const res = createRes();
    const next = jest.fn();

    mockVerify.mockReturnValue({ id: 'u6', email: 'blocked@test.com', userType: expectedType });
    findByIdMock.mockReturnValue(
      asSelectResult({ _id: 'u6', email: 'blocked@test.com', isBlocked: true, userType: expectedType })
    );

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when jwt verify throws', async () => {
    const req = buildReq({ cookieToken: 'bad-token' });
    const res = createRes();
    const next = jest.fn();

    mockVerify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid token.',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
