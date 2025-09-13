const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { normalizeText } = require('./normalize');
const { runDetectors, scoreRisk } = require('./detectors');
 
async function extractFromPDF(buffer) {
  try {
    const data = await pdf(buffer);
    if (!data.text || data.text.trim() === '') {
      throw new Error('PDF contains no extractable text (maybe scanned or encrypted)');
    }
    return data.text;
  } catch (err) {
    console.error('PDF extraction failed:', err);
    throw new Error('PDF processing failed');
  }
}
 
async function extractFromDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    if (!result.value || result.value.trim() === '') {
      throw new Error('DOCX contains no extractable text');
    }
    return result.value;
  } catch (err) {
    console.error('DOCX extraction failed:', err);
    throw new Error('DOCX processing failed');
  }
}
 
async function handleFileBuffer(file) {
  const mimetype = file.mimetype;
  let rawText = '';
 
  if (mimetype === 'application/pdf') {
    rawText = await extractFromPDF(file.buffer);
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    rawText = await extractFromDOCX(file.buffer);
  } else {
    throw new Error('Unsupported file type');
  }
 
  const normalized = normalizeText(rawText);
  const detections = runDetectors(normalized);
  const risk = scoreRisk(detections);
 
  return {
    detections,
    risk,
    sampleText: normalized.slice(0, 400),
  };
}
 
module.exports = { handleFileBuffer, extractFromPDF, extractFromDOCX };