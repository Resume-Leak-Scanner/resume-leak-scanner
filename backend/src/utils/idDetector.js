const fs = require('fs');
const path = require('path');
const idsConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../config/ids.json'))
);

function detectIDs(text, country) {
  const results = [];
  if (!idsConfig[country]) return results;

  for (const key in idsConfig[country]) {
    const rule = idsConfig[country][key];
    const re = new RegExp(rule.pattern, 'g');
    const matches = text.match(re) || [];
    matches.forEach(m =>
      results.push({ type: key, match: m, country: country })
    );
  }
  return results;
}

module.exports = { detectIDs };
