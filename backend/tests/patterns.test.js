// patterns.test.js
const { emailRe, phonePatterns, streetRe, zipRe } = require('../src/utils/patterns');
const { detectIDs } = require('../src/utils/idDetector');

test('Email regex matches valid emails', () => {
  const emails = 'test@example.com, hello@world.org';
  const matches = emails.match(emailRe);
  expect(matches).toEqual(['test@example.com', 'hello@world.org']);
});
test('Phone regex matches valid numbers', () => {
  const text = '+1 (555) 555-5555 555-555-5555 +44 20 7946 0958';
  let matches = [];
  phonePatterns.forEach(re => {
    const m = text.match(re) || [];
    matches = matches.concat(m);
  });
  expect(matches.length).toBeGreaterThan(0);
});

test('Street regex matches addresses', () => {
  const text = '123 Main Street 456 Elm Rd.';
  const matches = text.match(streetRe);
  expect(matches).toContain('123 Main Street');
});

test('Detect IDs from config', () => {
  const text = 'SSN 123-45-6789 Aadhaar 1234 5678 9012 Passport N1234567 TFN 123456789';
  const usIDs = detectIDs(text, 'US');
  const indiaIDs = detectIDs(text, 'India');
  const ausIDs = detectIDs(text, 'Australia');
  expect(usIDs.length).toBeGreaterThan(0);
  expect(indiaIDs.length).toBeGreaterThan(0);
  expect(ausIDs.length).toBeGreaterThan(0);
});

