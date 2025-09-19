// detectors.js
 
// Utility: add context around a match, stopping at line breaks
function addContext(text, match, contextLength = 30) {
  const i = text.indexOf(match);
  if (i === -1) return '';
 
  // Extract context before the match, stopping at previous newline
  const beforeRaw = text.substring(Math.max(0, i - contextLength), i);
  const prevNewline = beforeRaw.lastIndexOf('\n');
  const before = prevNewline !== -1 ? beforeRaw.substring(prevNewline + 1) : beforeRaw;
 
  // Extract context after the match, stopping at next newline
  const afterRaw = text.substring(i + match.length, i + match.length + contextLength);
  const nextNewline = afterRaw.indexOf('\n');
  const after = nextNewline !== -1 ? afterRaw.substring(0, nextNewline) : afterRaw;
 
  return before + match + after;
}
 
// Email detection
function detectEmails(text) {
  const re = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const matches = text.match(re) || [];
  return matches.map(m => ({
    type: 'email',
    match: m,
    context: addContext(text, m),
    position: text.indexOf(m),
  }));
}
 
// Phone detection (Australian)
function detectPhones(text) {
  const patterns = [
    // Australian mobiles: 04xx xxx xxx or +61 4xx xxx xxx
    /\b(?:\+?61\s?|0)4\d{2}[\s-]?\d{3}[\s-]?\d{3}\b/g,
 
    // Australian landlines: 0[2378] xxxx xxxx or +61 [2378] xxxx xxxx
    /\b(?:\+?61\s?|0)([2378])\d{1}[\s-]?\d{3}[\s-]?\d{3,4}\b/g
  ];
  const set = new Set();
  patterns.forEach(p => {
    const m = text.match(p) || [];
    m.forEach(x => set.add(x.trim()));
  });
 
  return Array.from(set).map(m => ({
    type: 'phone',
    match: m,
    context: addContext(text, m),
    position: text.indexOf(m),
  }));
}
 
// Address detection
function detectAddresses(text) {
  const streetTypes =
    '(?:Street|St\\.?|Avenue|Ave\\.?|Road|Rd\\.?|Boulevard|Blvd\\.?|Lane|Ln\\.?|Drive|Dr\\.?|Court|Ct\\.?)';
  const streetRe = new RegExp(
    '\\b\\d{1,5}\\s+[A-Z][A-Za-z0-9\\-\\s]{2,40}\\s+' + streetTypes + '\\b',
    'gi'
  );
  const postcodeRe = /\b\d{5}(?:-\d{4})?\b/g;
 
  const matches = [];
  (text.match(streetRe) || []).forEach(m =>
    matches.push({
      type: 'address',
      match: m,
      context: addContext(text, m),
      position: text.indexOf(m),
    })
  );
  (text.match(postcodeRe) || []).forEach(m =>
    matches.push({
      type: 'address',
      match: m,
      context: addContext(text, m),
      position: text.indexOf(m),
    })
  );
  return matches;
}
 
// ID detection (SSN, Aadhaar, Passport)
function detectIDs(text) {
  const results = [];
 
  // Collect phones to prevent overlap
  const phonePattern = /\b(?:\+?61\s?|0)4\d{2}[\s-]?\d{3}[\s-]?\d{3}\b|\b(?:\+?61\s?|0)([2378])\d{1}[\s-]?\d{3}[\s-]?\d{3,4}\b/g;
  const phoneNumbers = new Set(text.match(phonePattern) || []);
 
  // US SSN: allow hyphen, space, or no separator; ignore numbers starting with 0 or 4
  const ssn = text.match(/\b(?![04])\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g) || [];
  ssn.forEach(m => {
    if (!phoneNumbers.has(m))
      results.push({
        type: 'ssn',
        match: m,
        context: addContext(text, m),
        position: text.indexOf(m),
      });
  });
 
  // India Aadhaar: 12 digits, optional spaces, ignore numbers starting with 0 or 4
  const aadhaar = text.match(/\b(?![04])\d{4}\s?\d{4}\s?\d{4}\b/g) || [];
  aadhaar.forEach(m => {
    if (!phoneNumbers.has(m))
      results.push({
        type: 'aadhaar',
        match: m,
        context: addContext(text, m),
        position: text.indexOf(m),
      });
  });
 
  // Passport (generic pattern)
  const passport = text.match(/\b[A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[1-9]\b/g) || [];
  passport.forEach(m =>
    results.push({
      type: 'passport',
      match: m,
      context: addContext(text, m),
      position: text.indexOf(m),
    })
  );
 
  return results;
}
 
// Register detectors
const detectors = {
  emails: detectEmails,
  phones: detectPhones,
  addresses: detectAddresses,
  ids: detectIDs,
};
 
// Run all detectors on text
function runDetectors(text) {
  let allMatches = [];
  for (const key of Object.keys(detectors)) {
    const found = detectors[key](text);
    if (found && found.length) allMatches.push(...found);
  }
  return allMatches;
}
 
// Complex Risk Scoring
function scoreRisk(detections) {
  // Base weights
  const baseWeights = {
    ssn: 20,
    aadhaar: 20,
    passport: 15,
    email: 5,
    phone: 5,
    address: 10,
  };
 
  // Count occurrences per type
  const counts = {};
  detections.forEach(d => {
    counts[d.type] = (counts[d.type] || 0) + 1;
  });
 
  // Weighted score
  let score = 0;
  for (const [type, count] of Object.entries(counts)) {
    const base = baseWeights[type] || 1;
    score += base * Math.min(count, 5) * (1 + (count > 3 ? 0.25 : 0));
  }
 
  // Combination bonus
  const sensitiveTypes = ['ssn', 'aadhaar', 'passport'];
  const foundSensitive = sensitiveTypes.filter(t => counts[t]);
  if (foundSensitive.length >= 2) {
    score += 15;
  }
 
  // Normalise
  score = Math.min(score, 100);
 
  // Level thresholds
  let level = 'Low';
  if (score >= 70) level = 'High';
  else if (score >= 35) level = 'Medium';
 
  return { level, score, breakdown: counts };
}
 
module.exports = { runDetectors, scoreRisk };