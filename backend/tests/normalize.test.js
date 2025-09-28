const { normalizeText } = require('../src/modules/normalize');

describe('Normalize Module', () => {
  test('should remove extra spaces and line breaks', () => {
    const input = "Hello   world\n\n\nThis is   test\r\nText";
    const normalized = normalizeText(input);
    expect(normalized).toBe("Hello world\n\nThis is test\nText");
  });

  test('should return empty string for null or undefined', () => {
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(undefined)).toBe('');
  });
});
