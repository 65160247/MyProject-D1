jest.mock('../../config/database', () => ({
  query: jest.fn().mockResolvedValue([]),
  getConnection: jest.fn()
}));

const request = require('supertest');

describe('createApp CORS and wiring', () => {
  const origClientUrl = process.env.CLIENT_URL;

  afterEach(() => {
    if (origClientUrl === undefined) delete process.env.CLIENT_URL;
    else process.env.CLIENT_URL = origClientUrl;
    jest.resetModules();
  });

  it('honors CLIENT_URL comma-separated origins', () => {
    process.env.CLIENT_URL = 'http://app.example.com, http://other.example.com';
    const { createApp } = require('../../app');
    const app = createApp();
    return request(app)
      .get('/api/health')
      .set('Origin', 'http://app.example.com')
      .expect(200)
      .expect((res) => {
        expect(res.headers['access-control-allow-origin']).toBe('http://app.example.com');
      });
  });

  it('allows vercel.app subdomains', () => {
    const { createApp } = require('../../app');
    const app = createApp();
    return request(app)
      .get('/api/health')
      .set('Origin', 'https://rental-ui.vercel.app')
      .expect(200);
  });

  it('allows localhost origins', () => {
    const { createApp } = require('../../app');
    const app = createApp();
    return request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173')
      .expect(200);
  });

  it('allows requests with no Origin (e.g. curl, same-origin)', () => {
    const { createApp } = require('../../app');
    const app = createApp();
    return request(app).get('/api/health').expect(200);
  });
});
