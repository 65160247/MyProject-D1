const fs = require('fs');
const path = require('path');

describe('config/storage', () => {
  const saveEnv = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].map((k) => [
    k,
    process.env[k]
  ]);

  afterEach(() => {
    saveEnv.forEach(([k, v]) => {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    });
    jest.resetModules();
    jest.dontMock('../../config/cloudinary');
  });

  it('deleteListingImage returns early for null/empty', async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    jest.resetModules();
    const { deleteListingImage } = require('../../config/storage');
    await expect(deleteListingImage(null)).resolves.toBeUndefined();
    await expect(deleteListingImage('')).resolves.toBeUndefined();
  });

  it('deleteListingImage no-ops for cloudinary URL when Cloudinary is not configured', async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    jest.resetModules();
    const { deleteListingImage } = require('../../config/storage');
    await expect(
      deleteListingImage('https://res.cloudinary.com/demo/image/upload/v123/rental-system/abc.jpg')
    ).resolves.toBeUndefined();
  });

  it('uploadListingImage delegates to Cloudinary when env is set', async () => {
    jest.resetModules();
    jest.doMock('../../config/cloudinary', () => ({
      uploadToCloudinary: jest.fn().mockResolvedValue({ secure_url: 'https://res.cloudinary.com/mock/img.jpg' })
    }));
    process.env.CLOUDINARY_CLOUD_NAME = 'demo';
    process.env.CLOUDINARY_API_KEY = 'key';
    process.env.CLOUDINARY_API_SECRET = 'secret';

    const { uploadListingImage } = require('../../config/storage');
    const out = await uploadListingImage(Buffer.from('x'), 'folder');
    expect(out.secure_url).toBe('https://res.cloudinary.com/mock/img.jpg');
  });

  it('deleteListingImage removes local file when path matches /uploads/listings/', async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    jest.resetModules();
    const dir = path.join(__dirname, '../../uploads/listings');
    fs.mkdirSync(dir, { recursive: true });
    const name = `del-${Date.now()}.jpg`;
    const abs = path.join(dir, name);
    fs.writeFileSync(abs, 'z');

    const { deleteListingImage } = require('../../config/storage');
    await deleteListingImage(`http://localhost:5000/uploads/listings/${name}`);
    expect(fs.existsSync(abs)).toBe(false);
  });
});
