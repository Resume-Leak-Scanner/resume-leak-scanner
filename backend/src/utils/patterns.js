// Email regex
const emailRe = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

// Phone regex patterns
const phonePatterns = [
  /\+?\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}/g,
  /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g,
];

// Address regex
const streetTypes = '(?:Street|St\\.?|Avenue|Ave\\.?|Road|Rd\\.?|Boulevard|Blvd\\.?|Lane|Ln\\.?|Drive|Dr\\.?)';
const streetRe = new RegExp(
  `\\b\\d{1,5}\\s+[A-Z][A-Za-z0-9\\-\\s]{2,40}?\\s+${streetTypes}\\b`,
  'gi'
);

// Zip/postal code
const zipRe = /\b\d{5}(?:-\d{4})?\b/g;

module.exports = {
  emailRe,
  phonePatterns,
  streetRe,
  zipRe,
};
