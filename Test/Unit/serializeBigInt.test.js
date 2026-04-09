const { serializeBigInt } = require('../../utils/serializeBigInt');

describe('serializeBigInt', () => {
  it('returns null and undefined as-is', () => {
    expect(serializeBigInt(null)).toBeNull();
    expect(serializeBigInt(undefined)).toBeUndefined();
  });

  it('converts bigint to number', () => {
    expect(serializeBigInt(10n)).toBe(10);
    expect(serializeBigInt(0n)).toBe(0);
  });

  it('converts Date to ISO string', () => {
    const d = new Date('2026-01-15T12:00:00.000Z');
    expect(serializeBigInt(d)).toBe('2026-01-15T12:00:00.000Z');
  });

  it('maps bigint inside arrays', () => {
    expect(serializeBigInt([1n, 2n, 'x'])).toEqual([1, 2, 'x']);
  });

  it('recursively converts nested objects with bigint', () => {
    const input = { id: 5n, name: 'a', nested: { c: 99n } };
    expect(serializeBigInt(input)).toEqual({ id: 5, name: 'a', nested: { c: 99 } });
  });

  it('returns primitives unchanged', () => {
    expect(serializeBigInt('hello')).toBe('hello');
    expect(serializeBigInt(42)).toBe(42);
    expect(serializeBigInt(true)).toBe(true);
  });

  it('handles empty object and empty array', () => {
    expect(serializeBigInt({})).toEqual({});
    expect(serializeBigInt([])).toEqual([]);
  });

  it('handles array of objects with bigint fields', () => {
    const rows = [{ id: 1n, count: 3n }];
    expect(serializeBigInt(rows)).toEqual([{ id: 1, count: 3 }]);
  });
});
