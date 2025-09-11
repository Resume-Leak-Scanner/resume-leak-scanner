function normalizeText(s) 
{
  if (!s) return '';
  let t = s.replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g, ' ');
  // Replace CRLF with LF
  t = t.replace(/\r\n?/g, '\n');
  t = t.replace(/[ \t]+/g, ' ');
  t = t.replace(/\n{3,}/g, '\n\n');
  return t.trim();
}
module.exports = { normalizeText };