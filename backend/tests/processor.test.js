// tests/processor.test.js
const { handleFileBuffer } = require('../src/modules/processor');

// Mock pdf-parse and mammoth
jest.mock('pdf-parse', () => jest.fn(async () => ({ text: 'PDF content john@example.com 0412345678' })));
jest.mock('mammoth', () => ({
  extractRawText: jest.fn(async () => ({ value: 'DOCX content jane@example.com 0498765432' }))
}));

describe('Processor Module', () => {
  test('handleFileBuffer returns detection and risk for PDF', async () => {
    const result = await handleFileBuffer({ buffer: Buffer.from('dummy'), mimetype: 'application/pdf' });
    expect(result).toHaveProperty('detections');
    expect(result).toHaveProperty('risk');
    expect(result).toHaveProperty('sampleText');
    expect(result.sampleText).toContain('PDF content');
  });

  test('handleFileBuffer returns detection and risk for DOCX', async () => {
    const result = await handleFileBuffer({
      buffer: Buffer.from('dummy'),
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    expect(result).toHaveProperty('detections');
    expect(result).toHaveProperty('risk');
    expect(result).toHaveProperty('sampleText');
    expect(result.sampleText).toContain('DOCX content');
  });

  test('handleFileBuffer throws error for unsupported type', async () => {
    await expect(handleFileBuffer({ buffer: Buffer.from(''), mimetype: 'text/plain' }))
      .rejects.toThrow('Unsupported file type');
  });
});
