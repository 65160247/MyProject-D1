const jwt = require('jsonwebtoken');
const { auth, requireRole } = require('../middleware/auth');

describe('middleware auth', () => {
  const secret = process.env.JWT_SECRET;

  it('returns 401 when Authorization header is missing', () => {
    const req = { header: jest.fn().mockReturnValue(undefined) };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for invalid token', () => {
    const req = { header: jest.fn().mockReturnValue('Bearer not-a-jwt') };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is expired', () => {
    const token = jwt.sign({ userId: 1, role: 'tenant' }, secret, { expiresIn: '-5s' });
    const req = { header: jest.fn().mockReturnValue(`Bearer ${token}`) };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token has expired' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next and attaches user for valid token', () => {
    const token = jwt.sign({ userId: 9, email: 'u@u.com', role: 'landlord' }, secret, {
      expiresIn: '1h'
    });
    const req = { header: jest.fn().mockReturnValue(`Bearer ${token}`) };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ userId: 9, email: 'u@u.com', role: 'landlord' });
  });

  it('requireRole returns 401 when user is missing', () => {
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('requireRole returns 403 when role does not match', () => {
    const req = { user: { role: 'tenant' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Insufficient permissions' });
    expect(next).not.toHaveBeenCalled();
  });

  it('requireRole calls next when role matches any allowed role', () => {
    const req = { user: { role: 'landlord' } };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    requireRole('landlord', 'admin')(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
