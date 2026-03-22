jest.mock('../config/cloudinary', () => ({
  uploadToCloudinary: jest.fn().mockResolvedValue({
    secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/rental-system/listings/abc.jpg'
  }),
  deleteFromCloudinary: jest.fn().mockResolvedValue({ result: 'ok' }),
  getPublicIdFromUrl: jest.fn((url) => {
    if (!url) return null;
    const m = String(url).match(/\/rental-system\/([^.]+)/);
    return m && m[1] ? `rental-system/${m[1]}` : null;
  })
}));

jest.mock('../config/database', () => ({
  query: jest.fn(),
  getConnection: jest.fn()
}));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createApp } = require('../app');
const pool = require('../config/database');

describe('API routes', () => {
  const app = createApp();
  let passwordHash;

  const sign = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('Password123', 4);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    pool.query.mockReset();
    pool.getConnection.mockReset();
  });

  it('GET /api/health returns OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'OK', message: 'Rental System API is running' });
  });

  it('GET /api/health allows configured CORS origin', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://localhost:3000');
    expect(res.status).toBe(200);
  });

  it('GET /api/health rejects disallowed CORS origin', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://malicious.example');
    expect(res.status).toBe(500);
  });

  it('POST /api/auth/register returns 400 when validation fails', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-email',
      password: 'short',
      firstName: '',
      lastName: 'L',
      role: 'tenant'
    });
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('POST /api/auth/register returns 400 when user already exists', async () => {
    pool.query.mockResolvedValueOnce([{ id: 1 }]);
    const res = await request(app).post('/api/auth/register').send({
      email: 'dup@example.com',
      password: 'Password123',
      firstName: 'A',
      lastName: 'B',
      role: 'tenant'
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  it('POST /api/auth/register creates user and returns token', async () => {
    pool.query.mockResolvedValueOnce([]).mockResolvedValueOnce({ insertId: BigInt(101) });
    const res = await request(app).post('/api/auth/register').send({
      email: 'new@example.com',
      password: 'Password123',
      firstName: 'N',
      lastName: 'U',
      role: 'landlord'
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toMatchObject({
      id: 101,
      email: 'new@example.com',
      role: 'landlord'
    });
  });

  it('POST /api/auth/register returns 500 on unexpected database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection lost'));
    const res = await request(app).post('/api/auth/register').send({
      email: 'err@example.com',
      password: 'Password123',
      firstName: 'E',
      lastName: 'R',
      role: 'tenant'
    });
    expect(res.status).toBe(500);
  });

  it('POST /api/auth/login returns 400 for invalid body', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'x', password: '' });
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/login returns 401 when user not found', async () => {
    pool.query.mockResolvedValueOnce([]);
    const res = await request(app).post('/api/auth/login').send({
      email: 'missing@example.com',
      password: 'Password123'
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login returns 403 when user is banned', async () => {
    pool.query.mockResolvedValueOnce([
      {
        id: 1,
        email: 'b@b.com',
        password: passwordHash,
        is_banned: true,
        first_name: 'B',
        last_name: 'B',
        role: 'tenant'
      }
    ]);
    const res = await request(app).post('/api/auth/login').send({
      email: 'b@b.com',
      password: 'Password123'
    });
    expect(res.status).toBe(403);
  });

  it('POST /api/auth/login returns 401 when password does not match', async () => {
    pool.query.mockResolvedValueOnce([
      {
        id: 1,
        email: 'u@u.com',
        password: passwordHash,
        is_banned: false,
        first_name: 'U',
        last_name: 'U',
        role: 'tenant'
      }
    ]);
    const res = await request(app).post('/api/auth/login').send({
      email: 'u@u.com',
      password: 'WrongPassword1'
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login succeeds with valid credentials', async () => {
    pool.query.mockResolvedValueOnce([
      {
        id: 3,
        email: 'ok@example.com',
        password: passwordHash,
        is_banned: false,
        first_name: 'O',
        last_name: 'K',
        role: 'tenant'
      }
    ]);
    const res = await request(app).post('/api/auth/login').send({
      email: 'ok@example.com',
      password: 'Password123'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('ok@example.com');
  });

  it('GET /api/auth/me returns 404 when user row missing', async () => {
    const t = sign({ userId: 404, email: 'x@x.com', role: 'tenant' });
    pool.query.mockResolvedValueOnce([]);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(404);
  });

  it('GET /api/auth/me returns profile for valid token', async () => {
    const t = sign({ userId: 5, email: 'me@example.com', role: 'tenant' });
    pool.query.mockResolvedValueOnce([
      {
        id: 5,
        email: 'me@example.com',
        first_name: 'M',
        last_name: 'E',
        role: 'tenant',
        phone: '081',
        line_id: 'line1'
      }
    ]);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      id: 5,
      firstName: 'M',
      lineId: 'line1'
    });
  });

  it('PUT /api/auth/profile validates required names', async () => {
    const t = sign({ userId: 1, email: 'p@p.com', role: 'tenant' });
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${t}`)
      .send({ firstName: '', lastName: 'L' });
    expect(res.status).toBe(400);
  });

  it('PUT /api/auth/profile updates user', async () => {
    const t = sign({ userId: 2, email: 'p@p.com', role: 'tenant' });
    pool.query.mockResolvedValueOnce(undefined);
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${t}`)
      .send({ firstName: 'F', lastName: 'L', phone: '09', lineId: 'x' });
    expect(res.status).toBe(200);
    expect(res.body.user.firstName).toBe('F');
  });

  it('PUT /api/auth/change-password rejects wrong current password', async () => {
    const t = sign({ userId: 8, email: 'c@c.com', role: 'tenant' });
    pool.query.mockResolvedValueOnce([{ password: passwordHash }]);
    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${t}`)
      .send({ currentPassword: 'Wrongpass1', newPassword: 'Newpass123' });
    expect(res.status).toBe(400);
  });

  it('PUT /api/auth/change-password updates password', async () => {
    const t = sign({ userId: 8, email: 'c@c.com', role: 'tenant' });
    pool.query
      .mockResolvedValueOnce([{ password: passwordHash }])
      .mockResolvedValueOnce(undefined);
    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${t}`)
      .send({ currentPassword: 'Password123', newPassword: 'Newpass123' });
    expect(res.status).toBe(200);
  });

  it('GET /api/listings returns empty list', async () => {
    pool.query.mockResolvedValueOnce([]);
    const res = await request(app).get('/api/listings');
    expect(res.status).toBe(200);
    expect(res.body.listings).toEqual([]);
  });

  it('GET /api/listings loads amenities map when listings exist', async () => {
    pool.query
      .mockResolvedValueOnce([{ id: 1, title: 'Room' }])
      .mockResolvedValueOnce([
        { listing_id: 1, id: 10, name: 'WiFi', icon: 'wifi' }
      ]);
    const res = await request(app).get('/api/listings');
    expect(res.status).toBe(200);
    expect(res.body.listings[0].amenities).toHaveLength(1);
    expect(res.body.listings[0].amenities[0].name).toBe('WiFi');
  });

  it('GET /api/listings returns 500 when database fails', async () => {
    pool.query.mockRejectedValueOnce(new Error('db unavailable'));
    const res = await request(app).get('/api/listings');
    expect(res.status).toBe(500);
  });

  it('GET /api/listings applies query filters', async () => {
    pool.query.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    const res = await request(app).get('/api/listings').query({
      search: 'dorm',
      minPrice: '1000',
      maxPrice: '9000',
      roomType: 'fan',
      amenities: '1,2',
      limit: '5',
      offset: '0'
    });
    expect(res.status).toBe(200);
    expect(pool.query).toHaveBeenCalled();
  });

  it('GET /api/listings/:id returns 404 when not found', async () => {
    pool.query.mockResolvedValueOnce([]);
    const res = await request(app).get('/api/listings/999');
    expect(res.status).toBe(404);
  });

  it('GET /api/listings/:id returns listing with images and amenities', async () => {
    pool.query
      .mockResolvedValueOnce([
        {
          id: 1,
          title: 'T',
          landlord_id: 2,
          first_name: 'L',
          last_name: 'D',
          phone: null,
          line_id: null,
          landlord_email: 'l@l.com'
        }
      ])
      .mockResolvedValueOnce([{ id: 10, image_url: 'u', is_primary: 1, display_order: 0 }])
      .mockResolvedValueOnce([{ id: 3, name: 'wifi', icon: 'w' }]);
    const res = await request(app).get('/api/listings/1');
    expect(res.status).toBe(200);
    expect(res.body.listing.images).toHaveLength(1);
    expect(res.body.listing.amenities).toHaveLength(1);
  });

  it('GET /api/listings/amenities/all returns amenities', async () => {
    pool.query.mockResolvedValueOnce([{ id: 1, name: 'WiFi' }]);
    const res = await request(app).get('/api/listings/amenities/all');
    expect(res.status).toBe(200);
    expect(res.body.amenities[0].name).toBe('WiFi');
  });

  it('GET /api/listings/landlord/my-listings forbids tenant', async () => {
    const t = sign({ userId: 1, role: 'tenant' });
    const res = await request(app)
      .get('/api/listings/landlord/my-listings')
      .set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(403);
  });

  it('GET /api/listings/landlord/my-listings returns landlord listings', async () => {
    const t = sign({ userId: 2, role: 'landlord' });
    pool.query.mockResolvedValueOnce([{ id: 1, title: 'Mine', landlord_id: 2 }]);
    const res = await request(app)
      .get('/api/listings/landlord/my-listings')
      .set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);
    expect(res.body.listings).toHaveLength(1);
  });

  it('POST /api/listings validates required fields', async () => {
    const t = sign({ userId: 2, role: 'landlord' });
    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${t}`)
      .field('title', '   ')
      .field('address', 'Addr')
      .field('price', '100')
      .field('roomType', 'fan');
    expect(res.status).toBe(400);
  });

  it('POST /api/listings creates listing with transaction', async () => {
    const t = sign({ userId: 2, role: 'landlord' });
    const conn = {
      beginTransaction: jest.fn().mockResolvedValue(),
      query: jest
        .fn()
        .mockResolvedValueOnce({ insertId: 88 })
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn()
    };
    pool.getConnection.mockResolvedValueOnce(conn);
    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${t}`)
      .field('title', 'Dorm A')
      .field('address', 'Road 1')
      .field('price', '4500')
      .field('roomType', 'air_conditioned')
      .field('amenities', JSON.stringify([1, 2]));
    expect(res.status).toBe(201);
    expect(res.body.listingId).toBe(88);
    expect(conn.commit).toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
  });

  it('PATCH /api/listings/:id/toggle-availability toggles flag', async () => {
    const t = sign({ userId: 2, role: 'landlord' });
    pool.query
      .mockResolvedValueOnce([{ landlord_id: 2, is_available: 1 }])
      .mockResolvedValueOnce(undefined);
    const res = await request(app)
      .patch('/api/listings/10/toggle-availability')
      .set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);
    expect(res.body.isAvailable).toBe(false);
  });

  it('PATCH /api/listings/:id/toggle-availability returns 404 when missing', async () => {
    const t = sign({ userId: 2, role: 'landlord' });
    pool.query.mockResolvedValueOnce([]);
    const res = await request(app)
      .patch('/api/listings/404/toggle-availability')
      .set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(404);
  });

  it('PATCH /api/listings/:id/toggle-availability returns 403 for other landlord', async () => {
    const t = sign({ userId: 9, role: 'landlord' });
    pool.query.mockResolvedValueOnce([{ landlord_id: 2, is_available: 1 }]);
    const res = await request(app)
      .patch('/api/listings/10/toggle-availability')
      .set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(403);
  });

  it('DELETE /api/listings/:id removes listing for owner', async () => {
    const t = sign({ userId: 2, role: 'landlord' });
    pool.query.mockResolvedValueOnce([{ landlord_id: 2 }]).mockResolvedValueOnce(undefined);
    const res = await request(app).delete('/api/listings/10').set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /api/listings/:id returns 403 for non-owner landlord', async () => {
    const t = sign({ userId: 9, role: 'landlord' });
    pool.query.mockResolvedValueOnce([{ landlord_id: 2 }]);
    const res = await request(app).delete('/api/listings/10').set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(403);
  });

  it('PUT /api/listings/:id updates listing', async () => {
    const t = sign({ userId: 2, role: 'landlord' });
    pool.query
      .mockResolvedValueOnce([{ landlord_id: 2 }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);
    const res = await request(app)
      .put('/api/listings/5')
      .set('Authorization', `Bearer ${t}`)
      .field('title', 'Updated')
      .field('description', 'D')
      .field('address', 'A')
      .field('price', '3000')
      .field('roomType', 'fan')
      .field('amenities', JSON.stringify([1]));
    expect(res.status).toBe(200);
  });

  it('PUT /api/listings/:id returns 403 when landlord does not own listing', async () => {
    const t = sign({ userId: 9, role: 'landlord' });
    pool.query.mockResolvedValueOnce([{ landlord_id: 2 }]);
    const res = await request(app)
      .put('/api/listings/5')
      .set('Authorization', `Bearer ${t}`)
      .field('title', 'X')
      .field('description', '')
      .field('address', 'A')
      .field('price', '1')
      .field('roomType', 'fan');
    expect(res.status).toBe(403);
  });

  it('POST /api/listings rejects disallowed file type from multer', async () => {
    const t = sign({ userId: 2, role: 'landlord' });
    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${t}`)
      .attach('images', Buffer.from('not-an-image'), {
        filename: 'bad.exe',
        contentType: 'application/octet-stream'
      })
      .field('title', 'T')
      .field('address', 'Addr')
      .field('price', '100')
      .field('roomType', 'fan');
    expect([400, 500]).toContain(res.status);
  });

  it('DELETE /api/listings/:listingId/images/:imageId deletes image', async () => {
    const t = sign({ userId: 2, role: 'landlord' });
    pool.query
      .mockResolvedValueOnce([{ landlord_id: 2 }])
      .mockResolvedValueOnce([
        { image_url: 'https://res.cloudinary.com/x/rental-system/img1/upload.jpg', is_primary: 0 }
      ])
      .mockResolvedValueOnce(undefined);
    const res = await request(app)
      .delete('/api/listings/3/images/9')
      .set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /api/listings/:listingId/images/:imageId promotes another image when primary removed', async () => {
    const t = sign({ userId: 2, role: 'landlord' });
    pool.query
      .mockResolvedValueOnce([{ landlord_id: 2 }])
      .mockResolvedValueOnce([
        { image_url: 'https://res.cloudinary.com/x/rental-system/img1/upload.jpg', is_primary: 1 }
      ])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([{ id: 20 }])
      .mockResolvedValueOnce(undefined);
    const res = await request(app)
      .delete('/api/listings/3/images/9')
      .set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);
  });

  it('PATCH /api/listings/:listingId/images/:imageId/primary sets primary', async () => {
    const t = sign({ userId: 2, role: 'landlord' });
    pool.query
      .mockResolvedValueOnce([{ landlord_id: 2 }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);
    const res = await request(app)
      .patch('/api/listings/3/images/9/primary')
      .set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);
  });

  it('POST /api/favorites/:listingId adds favorite for tenant', async () => {
    const t = sign({ userId: 10, role: 'tenant' });
    pool.query.mockResolvedValueOnce([{ id: 1 }]).mockResolvedValueOnce([]).mockResolvedValueOnce(undefined);
    const res = await request(app).post('/api/favorites/1').set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);
  });

  it('POST /api/favorites/:listingId returns 400 when already favorited', async () => {
    const t = sign({ userId: 10, role: 'tenant' });
    pool.query.mockResolvedValueOnce([{ id: 1 }]).mockResolvedValueOnce([{ id: 99 }]);
    const res = await request(app).post('/api/favorites/1').set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(400);
  });

  it('GET /api/favorites returns list for tenant', async () => {
    const t = sign({ userId: 10, role: 'tenant' });
    pool.query.mockResolvedValueOnce([{ id: 1, title: 'Fav', favorited_at: new Date() }]);
    const res = await request(app).get('/api/favorites').set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);
    expect(res.body.favorites).toHaveLength(1);
  });

  it('GET /api/favorites/check/:listingId reports favorited state', async () => {
    const t = sign({ userId: 10, role: 'tenant' });
    pool.query.mockResolvedValueOnce([]);
    const res = await request(app).get('/api/favorites/check/5').set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);
    expect(res.body.isFavorited).toBe(false);
  });

  it('DELETE /api/favorites/:listingId removes favorite', async () => {
    const t = sign({ userId: 10, role: 'tenant' });
    pool.query.mockResolvedValueOnce(undefined);
    const res = await request(app).delete('/api/favorites/3').set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/removed/i);
  });

  it('DELETE /api/favorites/:listingId returns 500 when database fails', async () => {
    const t = sign({ userId: 10, role: 'tenant' });
    pool.query.mockRejectedValueOnce(new Error('db'));
    const res = await request(app).delete('/api/favorites/3').set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(500);
  });

  it('GET /api/admin/listings/pending returns pending for admin', async () => {
    const t = sign({ userId: 1, role: 'admin' });
    pool.query.mockResolvedValueOnce([{ id: 1, status: 'pending' }]);
    const res = await request(app).get('/api/admin/listings/pending').set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);
  });

  it('POST /api/admin/listings/:id/approve approves listing', async () => {
    const t = sign({ userId: 1, role: 'admin' });
    pool.query.mockResolvedValueOnce(undefined);
    const res = await request(app)
      .post('/api/admin/listings/7/approve')
      .set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);
  });

  it('POST /api/admin/listings/:id/reject stores reason', async () => {
    const t = sign({ userId: 1, role: 'admin' });
    pool.query.mockResolvedValueOnce(undefined);
    const res = await request(app)
      .post('/api/admin/listings/7/reject')
      .set('Authorization', `Bearer ${t}`)
      .send({ reason: 'Incomplete photos' });
    expect(res.status).toBe(200);
  });

  it('GET /api/admin/users returns users', async () => {
    const t = sign({ userId: 1, role: 'admin' });
    pool.query.mockResolvedValueOnce([{ id: 2, email: 'u@u.com', listing_count: 0 }]);
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(1);
  });

  it('POST /api/admin/users/:id/ban blocks self-ban', async () => {
    const t = sign({ userId: 5, role: 'admin' });
    const res = await request(app)
      .post('/api/admin/users/5/ban')
      .set('Authorization', `Bearer ${t}`)
      .send({ isBanned: true });
    expect(res.status).toBe(400);
  });

  it('POST /api/admin/users/:id/ban updates ban flag', async () => {
    const t = sign({ userId: 5, role: 'admin' });
    pool.query.mockResolvedValueOnce(undefined);
    const res = await request(app)
      .post('/api/admin/users/9/ban')
      .set('Authorization', `Bearer ${t}`)
      .send({ isBanned: true });
    expect(res.status).toBe(200);
  });

  it('GET /api/admin/stats aggregates dashboard data', async () => {
    const t = sign({ userId: 1, role: 'admin' });
    pool.query
      .mockResolvedValueOnce([{ role: 'tenant', count: 2 }, { role: 'landlord', count: 1 }])
      .mockResolvedValueOnce([{ status: 'approved', count: 4 }, { status: 'pending', count: 1 }])
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([{ count: 0 }])
      .mockResolvedValueOnce([{ count: 2 }])
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([{ count: 10 }])
      .mockResolvedValueOnce([{ count: 5 }]);
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);
    expect(res.body.stats.totalUsers).toBe(10);
    expect(res.body.stats.usersByRole.tenant).toBe(2);
    expect(res.body.stats.listingsByStatus.pending).toBe(1);
  });

  it('GET /api/admin/stats returns 500 when a query fails', async () => {
    const t = sign({ userId: 1, role: 'admin' });
    pool.query.mockRejectedValueOnce(new Error('stats query failed'));
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(500);
  });

  it('POST /api/favorites/:listingId returns 404 when listing does not exist', async () => {
    const t = sign({ userId: 10, role: 'tenant' });
    pool.query.mockResolvedValueOnce([]);
    const res = await request(app).post('/api/favorites/999').set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(404);
  });
});
