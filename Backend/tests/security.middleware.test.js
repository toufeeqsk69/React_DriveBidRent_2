import { describe, it, expect, beforeAll, beforeEach, jest } from '@jest/globals';

const mockHelmet = jest.fn((config) => ({ _type: 'helmet', config }));
const mockRateLimit = jest.fn((config) => ({ _type: 'rateLimit', config }));

let corsOptions;
let helmetConfig;
let limiter;

describe('security.middleware', () => {
  beforeAll(async () => {
    jest.resetModules();

    jest.unstable_mockModule('helmet', () => ({
      default: mockHelmet,
    }));

    jest.unstable_mockModule('express-rate-limit', () => ({
      default: mockRateLimit,
    }));

    jest.unstable_mockModule('cors', () => ({
      default: jest.fn(),
    }));

    ({ corsOptions, helmetConfig, limiter } = await import('../middlewares/security.middleware.js'));
  });

  it('builds helmet config with expected CSP directives', () => {
    expect(mockHelmet).toHaveBeenCalledTimes(1);
    const helmetArg = mockHelmet.mock.calls[0][0];

    expect(helmetArg.crossOriginEmbedderPolicy).toBe(false);
    expect(helmetArg.contentSecurityPolicy.directives.defaultSrc).toEqual(["'self'"]);
    expect(helmetArg.contentSecurityPolicy.directives.imgSrc).toContain('https://res.cloudinary.com');
    expect(helmetConfig).toEqual(expect.objectContaining({ _type: 'helmet' }));
  });

  it('builds rate limiter with expected defaults', () => {
    expect(mockRateLimit).toHaveBeenCalledTimes(1);
    const rateLimitArg = mockRateLimit.mock.calls[0][0];

    expect(rateLimitArg.windowMs).toBe(15 * 60 * 1000);
    expect(rateLimitArg.max).toBe(500);
    expect(rateLimitArg.legacyHeaders).toBe(false);
    expect(rateLimitArg.standardHeaders).toBe(true);
    expect(limiter).toEqual(expect.objectContaining({ _type: 'rateLimit' }));
  });

  it('allows requests without origin (server-to-server)', () => {
    const cb = jest.fn();

    corsOptions.origin(undefined, cb);

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('allows whitelisted localhost origin', () => {
    const cb = jest.fn();

    corsOptions.origin('http://localhost:5173', cb);

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('allows CLIENT_URL when set in env', () => {
    process.env.CLIENT_URL = 'https://client.example.com';
    const cb = jest.fn();

    corsOptions.origin('https://client.example.com', cb);

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('rejects non-whitelisted origin', () => {
    const cb = jest.fn();

    corsOptions.origin('https://evil.example.com', cb);

    expect(cb).toHaveBeenCalledTimes(1);
    const err = cb.mock.calls[0][0];
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('CORS policy: Origin not allowed');
  });

  it('skip function skips notifications route', () => {
    const skipFn = mockRateLimit.mock.calls[0][0].skip;
    const shouldSkip = skipFn({ url: '/api/notifications' });

    expect(shouldSkip).toBe(true);
  });

  it('skip function skips buyer api route', () => {
    const skipFn = mockRateLimit.mock.calls[0][0].skip;
    const shouldSkip = skipFn({ url: '/api/buyer/auctions' });

    expect(shouldSkip).toBe(true);
  });

  it('skip function does not skip unrelated route', () => {
    const skipFn = mockRateLimit.mock.calls[0][0].skip;
    const shouldSkip = skipFn({ url: '/api/auth/login' });

    expect(shouldSkip).toBe(false);
  });
});
