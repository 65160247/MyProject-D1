const { serializeBigInt } = require('../utils/serializeBigInt');

describe('serializeBigInt', () => {
  it('returns null and undefined as-is', () => {
    expect(serializeBigInt(null)).toBeNull();
    expect(serializeBigInt(undefined)).toBeUndefined();
  });

  it('converts bigint to number', () => {
    expect(serializeBigInt(BigInt(7))).toBe(7);
  });

  it('converts Date to ISO string', () => {
    const d = new Date('2024-01-15T10:00:00.000Z');
    expect(serializeBigInt(d)).toBe('2024-01-15T10:00:00.000Z');
  });

  it('maps arrays recursively', () => {
    expect(serializeBigInt([BigInt(1), BigInt(2)])).toEqual([1, 2]);
  });

  it('serializes plain objects recursively', () => {
    expect(
      serializeBigInt({
        id: BigInt(10),
        nested: { v: BigInt(2) }
      })
    ).toEqual({ id: 10, nested: { v: 2 } });
  });

  it('leaves primitives unchanged', () => {
    expect(serializeBigInt('x')).toBe('x');
    expect(serializeBigInt(42)).toBe(42);
    expect(serializeBigInt(true)).toBe(true);
  });
});
