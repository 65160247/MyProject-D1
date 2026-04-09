jest.mock('../../config/database', () => ({
  query: jest.fn(),
  getConnection: jest.fn()
}));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createApp } = require('../../app');
const pool = require('../../config/database');

describe('Integration: authentication flow', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    pool.query.mockReset();
    pool.getConnection.mockReset();
  });

  it('POST /api/auth/register returns 400 when validation fails', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bad', password: 'short', firstName: '', lastName: '', role: 'tenant' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/auth/register creates user and returns token', async () => {
    pool.query.mockResolvedValueOnce([]).mockResolvedValueOnce({ insertId: 100n, affectedRows: 1 });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'password12',
        firstName: 'T',
        lastName: 'U',
        role: 'tenant'
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('newuser@example.com');
    expect(res.body.user.role).toBe('tenant');
  });

  it('POST /api/auth/register returns 400 when email already exists', async () => {
    pool.query.mockResolvedValueOnce([{ id: 1 }]);

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'exists@example.com',
        password: 'password12',
        firstName: 'A',
        lastName: 'B',
        role: 'tenant'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('POST /api/auth/login returns 401 for wrong password', async () => {
    const hash = await bcrypt.hash('correctpass12', 4);
    pool.query.mockResolvedValueOnce([
      {
        id: 1,
        email: 'u@example.com',
        password: hash,
        is_banned: 0,
        role: 'tenant',
        first_name: 'F',
        last_name: 'L',
        phone: null,
        line_id: null
      }
    ]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'u@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Invalid credentials/i);
  });

  it('POST /api/auth/login returns token when credentials are valid', async () => {
    const hash = await bcrypt.hash('mypassword12', 4);
    pool.query.mockResolvedValueOnce([
      {
        id: 2,
        email: 'ok@example.com',
        password: hash,
        is_banned: 0,
        role: 'landlord',
        first_name: 'L',
        last_name: 'D',
        phone: null,
        line_id: null
      }
    ]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ok@example.com', password: 'mypassword12' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('landlord');
  });

  it('GET /api/auth/me returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me returns user when token is valid', async () => {
    const token = jwt.sign(
      { userId: 5, email: 'me@example.com', role: 'tenant' },
      process.env.JWT_SECRET
    );
    pool.query.mockResolvedValueOnce([
      {
        id: 5,
        email: 'me@example.com',
        first_name: 'Me',
        last_name: 'User',
        role: 'tenant',
        phone: null,
        line_id: null
      }
    ]);

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@example.com');
    expect(res.body.user.firstName).toBe('Me');
  });
});
