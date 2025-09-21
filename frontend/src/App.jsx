import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setStatus("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setStatus("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("Uploading...");
      const res = await fetch("http://localhost:4000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Upload failed");
      }

      const data = await res.json();
      setResult(data);
      setStatus(" ");
    } catch (err) {
      setStatus("Upload error: " + err.message);
    }
  };

  // Risk color
  const riskColor = (level) => {
    if (level === "High") return "red";
    if (level === "Medium") return "orange";
    return "green";
  };

  return (
    <div style={{ maxWidth: 720, margin: "2rem auto", textAlign: "center", padding: "1rem" }}>
      <img
        src="/file.png"
        alt="Resume Leak Scanner Logo"
        style={{ maxWidth: "200px", height: "auto", marginBottom: "1.5rem" }}
      />

      <h2>Resume Leak Scanner — Upload</h2>

      <form onSubmit={onSubmit} style={{ marginTop: "1rem" }}>
        <input type="file" name="resume" accept=".pdf,.docx" onChange={onFileChange} />
        <button disabled={!file} type="submit" style={{ marginLeft: "1rem" }}>
          Scan Resume
        </button>
      </form>

      <p style={{ marginTop: "1rem", fontSize: "1.2rem", fontWeight: "600" }}>{status}</p>

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.8rem" }}>Analysis Complete</h2>
          <h3 style={{ fontSize: "1.5rem", color: riskColor(result.risk.level) }}>
            Risk: {result.risk.level} (score {result.risk.score})
          </h3>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "1rem",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "0.8rem", border: "1px solid #ddd" }}>Type</th>
                <th style={{ padding: "0.8rem", border: "1px solid #ddd" }}>Detected Value</th>
                <th style={{ padding: "0.8rem", border: "1px solid #ddd" }}>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {result.detections.map((d, i) => (
                <tr key={i}>
                  <td style={{ padding: "0.8rem", border: "1px solid #ddd" }}>{d.type}</td>
                  <td style={{ padding: "0.8rem", border: "1px solid #ddd" }}>{d.match}</td>
                  <td style={{ padding: "0.8rem", border: "1px solid #ddd" }}>{d.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Export Button */}
          <button
            style={{
              marginTop: "1rem",
              padding: "0.6rem 1.2rem",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            onClick={async () => {
              try {
                const res = await fetch("http://localhost:4000/api/export", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(result),
                });
                if (!res.ok) throw new Error("Failed to generate report");

                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "resume_leak_report.pdf";
                link.click();
              } catch (err) {
                alert("Export failed: " + err.message);
              }
            }}
          >
            Export PDF Report
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
