jest.mock('../../config/database', () => ({
  query: jest.fn(),
  getConnection: jest.fn()
}));

const request = require('supertest');
const { createApp } = require('../../app');
const pool = require('../../config/database');

describe('Integration: public API endpoints', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    pool.query.mockReset();
  });

  it('GET /api/health returns OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.message).toBeDefined();
  });

  it('GET /api/listings returns listings array', async () => {
    pool.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const res = await request(app).get('/api/listings');
    expect(res.status).toBe(200);
    expect(res.body.listings).toEqual([]);
  });

  it('GET /api/listings/amenities/all returns amenities', async () => {
    pool.query.mockResolvedValueOnce([
      { id: 1n, name: 'WiFi', name_th: null, icon: 'wifi', listing_count: 2n }
    ]);

    const res = await request(app).get('/api/listings/amenities/all');
    expect(res.status).toBe(200);
    expect(res.body.amenities.length).toBe(1);
    expect(res.body.amenities[0].name).toBe('WiFi');
  });

  it('GET /api/listings/price-stats returns price stats', async () => {
    pool.query
      .mockResolvedValueOnce([{ min_price: 1000, max_price: 5000 }])
      .mockResolvedValueOnce([]);

    const res = await request(app).get('/api/listings/price-stats');
    expect(res.status).toBe(200);
    expect(res.body.min_price).toBe(1000);
    expect(res.body.max_price).toBe(5000);
  });
});
