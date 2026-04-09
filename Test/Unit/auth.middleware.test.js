const jwt = require('jsonwebtoken');

describe('middleware/auth', () => {
  let auth;
  let requireRole;

  beforeEach(() => {
    jest.resetModules();
    process.env.JWT_SECRET = 'test-jwt-secret-for-jest';
    ({ auth, requireRole } = require('../../middleware/auth'));
  });

  it('auth: returns 401 when Authorization header is missing', () => {
    const req = { header: jest.fn().mockReturnValue(undefined) };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('auth: calls next and sets req.user for valid Bearer token', () => {
    const token = jwt.sign(
      { userId: 7, email: 'u@test.com', role: 'tenant' },
      process.env.JWT_SECRET
    );
    const req = { header: jest.fn().mockReturnValue(`Bearer ${token}`) };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();
    auth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ userId: 7, email: 'u@test.com', role: 'tenant' });
  });

  it('auth: returns 401 for expired token', () => {
    const token = jwt.sign(
      { userId: 1, exp: Math.floor(Date.now() / 1000) - 120 },
      process.env.JWT_SECRET
    );
    const req = { header: jest.fn().mockReturnValue(`Bearer ${token}`) };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token has expired' });
    expect(next).not.toHaveBeenCalled();
  });

  it('auth: returns 401 for malformed token', () => {
    const req = { header: jest.fn().mockReturnValue('Bearer not-a-jwt') };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('requireRole: allows when role matches', () => {
    const req = { user: { role: 'admin' } };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();
    const mw = requireRole('admin', 'landlord');
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('requireRole: returns 403 when role does not match', () => {
    const req = { user: { role: 'tenant' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    requireRole('admin')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Insufficient permissions' });
    expect(next).not.toHaveBeenCalled();
  });

  it('requireRole: returns 401 when req.user is missing', () => {
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    requireRole('tenant')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
