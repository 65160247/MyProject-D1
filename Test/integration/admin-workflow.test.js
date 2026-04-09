jest.mock('../../config/database', () => ({
  query: jest.fn(),
  getConnection: jest.fn()
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../../app');
const pool = require('../../config/database');

describe('Integration: admin moderation workflow', () => {
  let app;
  const adminToken = () =>
    jwt.sign({ userId: 1, email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET);

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    pool.query.mockReset();
  });

  it('GET /api/admin/listings/pending requires admin role', async () => {
    const tenantToken = jwt.sign(
      { userId: 2, email: 't@example.com', role: 'tenant' },
      process.env.JWT_SECRET
    );
    const res = await request(app)
      .get('/api/admin/listings/pending')
      .set('Authorization', `Bearer ${tenantToken}`);
    expect(res.status).toBe(403);
  });

  it('GET /api/admin/listings/pending returns pending listings for admin', async () => {
    pool.query.mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/admin/listings/pending')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.listings).toEqual([]);
  });

  it('POST /api/admin/listings/:id/approve updates status', async () => {
    pool.query.mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app)
      .post('/api/admin/listings/12/approve')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/approved/i);
  });

  it('POST /api/admin/listings/:id/reject stores reason', async () => {
    pool.query.mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app)
      .post('/api/admin/listings/12/reject')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ reason: 'Incomplete address' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/rejected/i);
  });

  it('GET /api/admin/stats aggregates counts', async () => {
    pool.query
      .mockResolvedValueOnce([{ role: 'tenant', count: 2n }])
      .mockResolvedValueOnce([{ status: 'approved', count: 3n }])
      .mockResolvedValueOnce([{ count: 1n }])
      .mockResolvedValueOnce([{ count: 0n }])
      .mockResolvedValueOnce([{ count: 0n }])
      .mockResolvedValueOnce([{ count: 0n }])
      .mockResolvedValueOnce([{ count: 5n }])
      .mockResolvedValueOnce([{ count: 8n }]);

    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.stats.totalUsers).toBe(5);
    expect(res.body.stats.totalListings).toBe(8);
    expect(res.body.stats.pendingListings).toBe(1);
  });
});
