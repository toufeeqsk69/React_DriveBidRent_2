import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockUserFindOne = jest.fn();
const mockOtpFindOne = jest.fn();
const mockOtpDeleteMany = jest.fn();
const mockOtpCreate = jest.fn();
const mockGenerateToken = jest.fn();
const mockSendOTPEmail = jest.fn();
const mockVerifyIdToken = jest.fn();

const MockUser = jest.fn(function constructor(data) {
  Object.assign(this, data);
  this.save = jest.fn().mockResolvedValue(this);
});
MockUser.findOne = mockUserFindOne;

class MockOAuth2Client {
  constructor() {
    this.verifyIdToken = mockVerifyIdToken;
  }
}

jest.unstable_mockModule('../models/User.js', () => ({
  default: MockUser,
}));

jest.unstable_mockModule('../models/OTP.js', () => ({
  default: {
    findOne: mockOtpFindOne,
    deleteMany: mockOtpDeleteMany,
    create: mockOtpCreate,
  },
}));

jest.unstable_mockModule('../utils/generateToken.js', () => ({
  default: mockGenerateToken,
}));

jest.unstable_mockModule('../utils/email.service.js', () => ({
  sendOTPEmail: mockSendOTPEmail,
}));

jest.unstable_mockModule('google-auth-library', () => ({
  OAuth2Client: MockOAuth2Client,
}));

const { default: authController } = await import('../controllers/auth.controller.js');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn();
  res.clearCookie = jest.fn();
  return res;
};

const validSignupBody = () => ({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'strongpass123',
  userType: 'buyer',
  phone: '9999999999',
  dateOfBirth: '1990-01-01',
  termsAccepted: true,
});

describe('auth.controller extensive unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.ENABLE_OTP_VERIFICATION;
    delete process.env.NODE_ENV;
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    mockUserFindOne.mockResolvedValue(null);
    mockOtpFindOne.mockResolvedValue(null);
    mockOtpDeleteMany.mockResolvedValue({ deletedCount: 1 });
    mockOtpCreate.mockResolvedValue({ _id: 'otp1' });
    mockGenerateToken.mockReturnValue('token-123');
    mockSendOTPEmail.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('signup', () => {
    it('rejects missing required fields', async () => {
      const req = { body: { email: 'x@test.com' } };
      const res = createRes();

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Missing required fields' }));
    });

    it('rejects invalid userType', async () => {
      const req = { body: { ...validSignupBody(), userType: 'x-role' } };
      const res = createRes();

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid or missing userType' }));
    });

    it('rejects invalid phone', async () => {
      const req = { body: { ...validSignupBody(), phone: '12345' } };
      const res = createRes();

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Phone number must be 10 digits' }));
    });

    it('rejects missing dob', async () => {
      const body = validSignupBody();
      delete body.dateOfBirth;
      const req = { body };
      const res = createRes();

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Date of birth is required' }));
    });

    it('rejects underage users', async () => {
      const year = new Date().getFullYear() - 10;
      const req = { body: { ...validSignupBody(), dateOfBirth: `${year}-01-01` } };
      const res = createRes();

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'You must be at least 18 years old' }));
    });

    it('rejects short password', async () => {
      const req = { body: { ...validSignupBody(), password: '123' } };
      const res = createRes();

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Password must be at least 8 characters' }));
    });

    it('rejects when terms are not accepted', async () => {
      const req = { body: { ...validSignupBody(), termsAccepted: false } };
      const res = createRes();

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'You must accept terms' }));
    });

    it('returns 409 when user already exists', async () => {
      mockUserFindOne.mockResolvedValue({ _id: 'exists' });
      const req = { body: validSignupBody() };
      const res = createRes();

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Email or phone already exists' }));
    });

    it('creates OTP flow when otp verification is enabled', async () => {
      process.env.ENABLE_OTP_VERIFICATION = 'true';
      const req = { body: validSignupBody() };
      const res = createRes();

      await authController.signup(req, res);

      expect(mockOtpDeleteMany).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(mockOtpCreate).toHaveBeenCalledTimes(1);
      expect(mockSendOTPEmail).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ otpRequired: true }));
    });

    it('returns 500 when OTP email send fails', async () => {
      process.env.ENABLE_OTP_VERIFICATION = 'true';
      mockSendOTPEmail.mockResolvedValue(false);
      const req = { body: validSignupBody() };
      const res = createRes();

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Failed to send verification email' })
      );
    });

    it('creates user directly when OTP is disabled', async () => {
      const req = { body: validSignupBody() };
      const res = createRes();

      await authController.signup(req, res);

      expect(MockUser).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          redirect: '/login',
        })
      );
    });

    it('returns mechanic review message for mechanic signup', async () => {
      const req = {
        body: {
          ...validSignupBody(),
          userType: 'mechanic',
          shopName: 'Workshop',
          repairBikes: true,
          repairCars: true,
          googleAddressLink: 'https://maps.test',
        },
      };
      const res = createRes();

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('under admin review'),
        })
      );
    });

    it('returns validation message from caught ValidationError', async () => {
      const error = {
        name: 'ValidationError',
        errors: {
          email: { message: 'Email invalid' },
          phone: { message: 'Phone invalid' },
        },
      };
      mockUserFindOne.mockRejectedValue(error);
      const req = { body: validSignupBody() };
      const res = createRes();

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Email invalid; Phone invalid' }));
    });

    it('returns 409 for duplicate key catch errors', async () => {
      mockUserFindOne.mockRejectedValue({ code: 11000 });
      const req = { body: validSignupBody() };
      const res = createRes();

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User already exists' }));
    });

    it('returns 500 for unexpected signup errors', async () => {
      mockUserFindOne.mockRejectedValue(new Error('unexpected'));
      const req = { body: validSignupBody() };
      const res = createRes();

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Signup failed' }));
    });
  });

  describe('login', () => {
    it('returns 401 when user is not found', async () => {
      mockUserFindOne.mockResolvedValue(null);
      const req = { body: { email: 'missing@test.com', password: 'x' } };
      const res = createRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid email or password' }));
    });

    it('returns 401 when password compare fails', async () => {
      mockUserFindOne.mockResolvedValue({ comparePassword: jest.fn().mockResolvedValue(false) });
      const req = { body: { email: 'x@test.com', password: 'bad' } };
      const res = createRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 403 for blocked user', async () => {
      mockUserFindOne.mockResolvedValue({
        comparePassword: jest.fn().mockResolvedValue(true),
        isBlocked: true,
      });
      const req = { body: { email: 'x@test.com', password: 'ok' } };
      const res = createRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Your account has been blocked by the admin' }));
    });

    it('logs in successfully in non-production and sets strict cookie', async () => {
      const user = {
        _id: 'u1',
        userType: 'buyer',
        firstName: 'A',
        lastName: 'B',
        email: 'buyer@test.com',
        phone: '9999999999',
        approved_status: 'No',
        notificationFlag: false,
        comparePassword: jest.fn().mockResolvedValue(true),
        isBlocked: false,
      };
      mockUserFindOne.mockResolvedValue(user);
      mockGenerateToken.mockReturnValue('token-abc');
      const req = { body: { email: 'buyer@test.com', password: 'correct' } };
      const res = createRes();

      await authController.login(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'jwt',
        'token-abc',
        expect.objectContaining({ sameSite: 'strict', secure: false })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, redirect: '/buyer', token: 'token-abc' })
      );
    });

    it('logs in successfully in production and sets secure cookie', async () => {
      process.env.NODE_ENV = 'production';
      const user = {
        _id: 'u2',
        userType: 'seller',
        firstName: 'A',
        lastName: 'B',
        email: 'seller@test.com',
        phone: '9999999999',
        approved_status: 'No',
        notificationFlag: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        isBlocked: false,
      };
      mockUserFindOne.mockResolvedValue(user);
      const req = { body: { email: 'seller@test.com', password: 'correct' } };
      const res = createRes();

      await authController.login(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'jwt',
        expect.any(String),
        expect.objectContaining({ sameSite: 'none', secure: true })
      );
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ redirect: '/seller' }));
    });

    it('uses fallback redirect for unknown userType', async () => {
      const user = {
        _id: 'u3',
        userType: 'unknown-role',
        firstName: 'X',
        lastName: 'Y',
        email: 'u@test.com',
        phone: '9999999999',
        approved_status: 'No',
        comparePassword: jest.fn().mockResolvedValue(true),
        isBlocked: false,
      };
      mockUserFindOne.mockResolvedValue(user);
      const req = { body: { email: 'u@test.com', password: 'correct' } };
      const res = createRes();

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ redirect: '/' }));
    });

    it('returns 500 when login throws', async () => {
      mockUserFindOne.mockRejectedValue(new Error('db error'));
      const req = { body: { email: 'x@test.com', password: 'x' } };
      const res = createRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Login failed' }));
    });
  });

  describe('logout', () => {
    it('clears cookie in non-production mode', () => {
      const req = {};
      const res = createRes();

      authController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith(
        'jwt',
        expect.objectContaining({ sameSite: 'strict', secure: false })
      );
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('clears cookie in production mode with secure settings', () => {
      process.env.NODE_ENV = 'production';
      const req = {};
      const res = createRes();

      authController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith(
        'jwt',
        expect.objectContaining({ sameSite: 'none', secure: true })
      );
    });
  });

  describe('googleLogin', () => {
    it('returns 400 when credential is missing', async () => {
      const req = { body: {} };
      const res = createRes();

      await authController.googleLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Google credential is required' }));
    });

    it('returns 400 when email is missing in google payload', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({ sub: 'gid-1' }),
      });
      const req = { body: { credential: 'cred' } };
      const res = createRes();

      await authController.googleLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Could not get email from Google account' })
      );
    });

    it('returns 401 when account does not exist for google email', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({ sub: 'gid-2', email: 'notfound@test.com' }),
      });
      mockUserFindOne.mockResolvedValue(null);
      const req = { body: { credential: 'cred' } };
      const res = createRes();

      await authController.googleLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'No account found for this email. Please sign up first.' })
      );
    });

    it('updates googleId for existing user without googleId', async () => {
      const save = jest.fn().mockResolvedValue(true);
      const user = {
        _id: 'u4',
        userType: 'buyer',
        firstName: 'G',
        lastName: 'U',
        email: 'found@test.com',
        phone: '',
        approved_status: 'No',
        notificationFlag: false,
        provider: null,
        googleId: null,
        save,
      };
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({ sub: 'gid-3', email: 'found@test.com' }),
      });
      mockUserFindOne.mockResolvedValue(user);
      const req = { body: { credential: 'cred' } };
      const res = createRes();

      await authController.googleLogin(req, res);

      expect(user.googleId).toBe('gid-3');
      expect(user.provider).toBe('google');
      expect(save).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('logs in existing google user without modifying googleId', async () => {
      const save = jest.fn().mockResolvedValue(true);
      const user = {
        _id: 'u5',
        userType: 'mechanic',
        firstName: 'G',
        lastName: 'U',
        email: 'google@test.com',
        phone: '',
        approved_status: 'Yes',
        notificationFlag: true,
        provider: 'google',
        googleId: 'already-set',
        save,
      };
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({ sub: 'gid-4', email: 'google@test.com' }),
      });
      mockUserFindOne.mockResolvedValue(user);
      const req = { body: { credential: 'cred' } };
      const res = createRes();

      await authController.googleLogin(req, res);

      expect(save).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ redirect: '/mechanic/dashboard' }));
    });

    it('returns 401 for expired or invalid google token error', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Token used too late'));
      const req = { body: { credential: 'cred' } };
      const res = createRes();

      await authController.googleLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Google token expired or invalid. Please try again.' })
      );
    });

    it('returns 500 for other google login errors', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('unexpected'));
      const req = { body: { credential: 'cred' } };
      const res = createRes();

      await authController.googleLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Google login failed' }));
    });
  });

  describe('verifySignupOtp', () => {
    it('returns 400 when email or otp is missing', async () => {
      const req = { body: { email: 'x@test.com' } };
      const res = createRes();

      await authController.verifySignupOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Email and OTP are required' }));
    });

    it('returns 404 when otp session is missing', async () => {
      mockOtpFindOne.mockResolvedValue(null);
      const req = { body: { email: 'x@test.com', otp: '123456' } };
      const res = createRes();

      await authController.verifySignupOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'OTP session expired or not found. Please sign up again.' })
      );
    });

    it('returns 400 when otp code is invalid', async () => {
      mockOtpFindOne.mockResolvedValue({ otp: '111111', userData: validSignupBody() });
      const req = { body: { email: 'x@test.com', otp: '222222' } };
      const res = createRes();

      await authController.verifySignupOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid OTP code' }));
    });

    it('creates user and returns success for valid OTP (normal user)', async () => {
      mockOtpFindOne.mockResolvedValue({
        otp: '123456',
        userData: { ...validSignupBody(), userType: 'buyer' },
      });
      const req = { body: { email: 'john@example.com', otp: '123456' } };
      const res = createRes();

      await authController.verifySignupOtp(req, res);

      expect(MockUser).toHaveBeenCalledTimes(1);
      expect(mockOtpDeleteMany).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('Email verified & account created successfully'),
        })
      );
    });

    it('returns mechanic-specific message for mechanic OTP verify', async () => {
      mockOtpFindOne.mockResolvedValue({
        otp: '123456',
        userData: { ...validSignupBody(), userType: 'mechanic' },
      });
      const req = { body: { email: 'mech@example.com', otp: '123456' } };
      const res = createRes();

      await authController.verifySignupOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('under admin review'),
        })
      );
    });

    it('returns 500 when verifySignupOtp throws', async () => {
      mockOtpFindOne.mockRejectedValue(new Error('db broken'));
      const req = { body: { email: 'x@test.com', otp: '123456' } };
      const res = createRes();

      await authController.verifySignupOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'OTP verification failed' }));
    });
  });
});
