const detectors = {
  emails: detectEmails,
  phones: detectPhones,
  addresses: detectAddresses,
  ids: detectIDs
};
 
// Helper: attach context and position
function addContext(text, match) {
  const i = text.indexOf(match);
  if (i === -1) return '';
  const start = Math.max(0, i - 30);
  const end = Math.min(text.length, i + match.length + 30);
  return text.substring(start, end);
}
 
// Email detector
function detectEmails(text) {
  const re = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const matches = text.match(re) || [];
  return matches.map(m => ({
    type: 'email',
    match: m,
    context: addContext(text, m),
    position: text.indexOf(m)
  }));
}
 
// Phone detector
function detectPhones(text) {
  const patterns = [
    /\+?\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}/g,
    /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g
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
    position: text.indexOf(m)
  }));
}
 
// Address detector
function detectAddresses(text) {
  const streetTypes = '(?:Street|St\\.?|Avenue|Ave\\.?|Road|Rd\\.?|Boulevard|Blvd\\.?|Lane|Ln\\.?|Drive|Dr\\.?)';
  const streetRe = new RegExp('\\b\\d{1,5}\\s+[A-Z][A-Za-z0-9\\-\\s]{2,40}\\s+' + streetTypes + '\\b', 'gi');
  const postcodeRe = /\b\d{5}(?:-\d{4})?\b/g;
 
  const matches = [];
  (text.match(streetRe) || []).forEach(m =>
    matches.push({ type: 'address', match: m, context: addContext(text, m), position: text.indexOf(m) })
  );
  (text.match(postcodeRe) || []).forEach(m =>
    matches.push({ type: 'address', match: m, context: addContext(text, m), position: text.indexOf(m) })
  );
  return matches;
}
 
// ID detector
function detectIDs(text) {
  const results = [];
 
  // US SSN
  const ssn = text.match(/\b\d{3}-\d{2}-\d{4}\b/g) || [];
  ssn.forEach(m => results.push({ type: 'ssn', match: m, context: addContext(text, m), position: text.indexOf(m) }));
 
  // India Aadhaar
  const aadhaar = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/g) || [];
  aadhaar.forEach(m => results.push({ type: 'aadhaar', match: m, context: addContext(text, m), position: text.indexOf(m) }));
 
  // Passport-ish heuristic
  const passport = text.match(/\b[A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[1-9]\b/g) || [];
  passport.forEach(m => results.push({ type: 'passport', match: m, context: addContext(text, m), position: text.indexOf(m) }));
 
  return results;
}
 
// Run all detectors
function runDetectors(text) {
  let allMatches = [];
  for (const key of Object.keys(detectors)) {
    const found = detectors[key](text);
    if (found && found.length) allMatches.push(...found);
  }
  return allMatches;
}
 
// Risk scoring function
function scoreRisk(detections) {
  const typeWeights = { 'ssn': 5, 'aadhaar': 5, 'passport': 4, 'email': 1, 'phone': 1, 'address': 2 };
  let score = 0;
  detections.forEach(d => {
    const w = typeWeights[d.type] || 1;
    score += w;
  });
  if (score >= 8) return { level: 'High', score };
  if (score >= 4) return { level: 'Medium', score };
  return { level: 'Low', score };
}
 
module.exports = { runDetectors, scoreRisk };