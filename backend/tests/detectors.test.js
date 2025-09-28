const { runDetectors, scoreRisk, generateRedactionTips } = require('../src/modules/detectors');

describe('Detectors Module', () => {
  const sampleText = `
    Email: test@example.com
    Phone: 0412345678
    SSN: 123-45-6789
    Aadhaar: 1234 5678 9012
    Passport: N1234567
    Address: 123 Main Street
  `;

  test('runDetectors should detect all types', () => {
    const results = runDetectors(sampleText);
    expect(results.length).toBeGreaterThan(0);
    const types = results.map(r => r.type);
    expect(types).toEqual(expect.arrayContaining(['email','phone','ssn','aadhaar','passport','address']));
  });

  test('scoreRisk returns correct structure', () => {
    const detections = runDetectors(sampleText);
    const risk = scoreRisk(detections);
    expect(risk).toHaveProperty('level');
    expect(risk).toHaveProperty('score');
    expect(risk).toHaveProperty('breakdown');
  });

  test('generateRedactionTips adds recommendation field', () => {
    const detections = runDetectors(sampleText);
    const tips = generateRedactionTips(detections);
    tips.forEach(d => expect(d).toHaveProperty('recommendation'));
  });
});
