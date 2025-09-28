const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { handleFileBuffer } = require("./modules/processor");
const exportRoutes = require("./routes/export");

const app = express();
app.use(cors());
app.use(express.json());

// Multer setup
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname);
      err.customMessage = "Unsupported file type. Please upload a PDF or DOCX.";
      cb(err, false);
    }
  },
});

// Upload route
app.post("/api/upload", (req, res, next) => {
  upload.single("file")(req, res, async function (err) {
    // Multer errors
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        errorCode: "UNSUPPORTED_FILE",
        message: err.customMessage || "File upload error",
      });
    } else if (err) {
      return res.status(400).json({ errorCode: "UPLOAD_FAILED", message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ errorCode: "NO_FILE", message: "No file uploaded" });
    }

    try {
      const result = await handleFileBuffer(req.file);
      res.json(result);
    } catch (err) {
      console.error("Processor error:", err);
      res.status(500).json({
        errorCode: "SCAN_FAILED",
        message: "The file could not be scanned. Please try again or use a different file.",
        details: err.message,
      });
    }
  });
});

// Export route
app.use("/api/export", exportRoutes);

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    errorCode: "SERVER_ERROR",
    message: "An unexpected error occurred",
  });
});

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));
