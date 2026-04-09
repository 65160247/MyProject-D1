const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Local image pipeline without Cloudinary (relevant for XAMPP / dev).
 * Payment & email are not in this product; this suite covers file persistence instead.
 */
describe('Integration: local file storage', () => {
  const prevCloud = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].map(
    (k) => [k, process.env[k]]
  );

  afterEach(() => {
    prevCloud.forEach(([k, v]) => {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    });
  });

  beforeEach(() => {
    ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].forEach((k) => {
      delete process.env[k];
    });
    jest.resetModules();
  });

  it('uploadListingImage writes a file under server/uploads/listings and returns URL', async () => {
    const { uploadListingImage } = require('../../config/storage');
    const buf = Buffer.from('fake-image-bytes');
    const result = await uploadListingImage(buf, 'rental-system/listings');
    expect(result.secure_url).toMatch(/^\/uploads\/listings\/[a-f0-9]+\.jpg$/);

    const abs = path.join(__dirname, '../../', result.secure_url.replace(/^\//, ''));
    expect(fs.existsSync(abs)).toBe(true);
    fs.unlinkSync(abs);
  });

  it('deleteListingImage removes a local file', async () => {
    const dir = path.join(__dirname, '../../uploads/listings');
    fs.mkdirSync(dir, { recursive: true });
    const name = `test-${Date.now()}.jpg`;
    const abs = path.join(dir, name);
    fs.writeFileSync(abs, 'x');

    const { deleteListingImage } = require('../../config/storage');
    await deleteListingImage(`/uploads/listings/${name}`);
    expect(fs.existsSync(abs)).toBe(false);
  });
});
