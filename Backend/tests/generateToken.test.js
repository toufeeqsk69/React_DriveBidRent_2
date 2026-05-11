import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockSign = jest.fn();

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: mockSign,
  },
}));

const { default: generateToken } = await import('../utils/generateToken.js');

describe('generateToken utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.JWT_SECRET;
  });

  it('uses JWT_SECRET when present', () => {
    process.env.JWT_SECRET = 'super-secret';
    mockSign.mockReturnValue('signed-token');

    const user = { _id: 'u1', userType: 'buyer', email: 'buyer@test.com' };
    const token = generateToken(user);

    expect(token).toBe('signed-token');
    expect(mockSign).toHaveBeenCalledWith(
      { id: 'u1', userType: 'buyer', email: 'buyer@test.com' },
      'super-secret',
      { expiresIn: '7d' }
    );
  });

  it('falls back to dev secret when JWT_SECRET is missing', () => {
    mockSign.mockReturnValue('fallback-token');

    generateToken({ _id: 'u2', userType: 'seller', email: 'seller@test.com' });

    expect(mockSign).toHaveBeenCalledWith(
      { id: 'u2', userType: 'seller', email: 'seller@test.com' },
      'fallback_secret_for_dev',
      { expiresIn: '7d' }
    );
  });
});
