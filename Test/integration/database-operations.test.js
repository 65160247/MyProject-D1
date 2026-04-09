jest.mock('../../config/database', () => ({
  query: jest.fn(),
  getConnection: jest.fn()
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../../app');
const pool = require('../../config/database');

describe('Integration: database-backed operations (favorites)', () => {
  let app;
  const tenantToken = () =>
    jwt.sign({ userId: 10, email: 't@example.com', role: 'tenant' }, process.env.JWT_SECRET);

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    pool.query.mockReset();
  });

  it('POST /api/favorites/:listingId inserts favorite when listing exists', async () => {
    pool.query
      .mockResolvedValueOnce([{ id: 3 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app)
      .post('/api/favorites/3')
      .set('Authorization', `Bearer ${tenantToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Added to favorites/i);
  });

  it('POST /api/favorites/:listingId returns 404 when listing missing', async () => {
    pool.query.mockResolvedValueOnce([]);

    const res = await request(app)
      .post('/api/favorites/999')
      .set('Authorization', `Bearer ${tenantToken()}`);

    expect(res.status).toBe(404);
  });

  it('GET /api/favorites returns list for tenant', async () => {
    pool.query.mockResolvedValueOnce([]);

    const res = await request(app).get('/api/favorites').set('Authorization', `Bearer ${tenantToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.favorites).toEqual([]);
  });

  it('DELETE /api/favorites/:listingId removes row', async () => {
    pool.query.mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app)
      .delete('/api/favorites/5')
      .set('Authorization', `Bearer ${tenantToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Removed/i);
  });
});
