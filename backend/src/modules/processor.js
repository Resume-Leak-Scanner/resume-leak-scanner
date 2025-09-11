const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { normalizeText } = require('./normalize');
const { runDetectors, scoreRisk } = require('./detectors');

async function extractFromPDF(buffer) {
  const data = await pdf(buffer);
  return data.text;
}

async function extractFromDOCX(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function handleFileBuffer(file) {
  const mimetype = file.mimetype;
  let rawText = '';

  if (mimetype === 'application/pdf') {
    rawText = await extractFromPDF(file.buffer);
  } else {
    rawText = await extractFromDOCX(file.buffer);
  }

  const normalized = normalizeText(rawText);
  const detections = runDetectors(normalized);
  const risk = scoreRisk(detections);

  return { detections, risk, sampleText: normalized.slice(0, 400) };
}

module.exports = { handleFileBuffer, extractFromPDF, extractFromDOCX };
