const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { handleFileBuffer } = require("./modules/processor");
const exportRoutes = require("./routes/export");

const app = express();
app.use(cors());

// Multer for uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"), false);
    }
  },
});

// Upload route
app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Missing file" });

  try {
    const result = await handleFileBuffer(req.file);
    res.json(result);
  } catch (err) {
    console.error("Processor error:", err);
    res.status(500).json({ error: "Processing error", details: err.message });
  }
});

// Export route
app.use("/api/export", exportRoutes);

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));
