const express = require("express");
const PDFDocument = require("pdfkit");

const router = express.Router();

router.post("/", express.json(), (req, res) => {
  try {
    const { risk, detections } = req.body;

    if (!risk || !detections) {
      return res.status(400).json({ error: "Missing risk or detections data" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    // Title
    doc.fontSize(20).text("Resume Leak Scanner Report", { align: "center" });
    doc.moveDown(1.5);

    // Risk summary
    doc.fontSize(14).text(`Risk Level: ${risk.level} (Score: ${risk.score})`);
    doc.moveDown();

    // Table headers
    const tableTop = doc.y;
    const colWidths = { type: 100, value: 200, rec: 200 };

    doc.fontSize(12).text("Type", 40, tableTop, { width: colWidths.type, bold: true });
    doc.text("Detected Value", 150, tableTop, { width: colWidths.value });
    doc.text("Recommendation", 360, tableTop, { width: colWidths.rec });
    doc.moveDown();

    // Divider
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Rows
    detections.forEach((d, i) => {
      const y = doc.y;
      doc.fontSize(11).fillColor("black").text(d.type, 40, y, { width: colWidths.type });
      doc.text(d.match, 150, y, { width: colWidths.value });
      doc.text(d.recommendation, 360, y, { width: colWidths.rec });
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ error: "Error generating PDF" });
  }
});

module.exports = router;
