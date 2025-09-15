import { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setStatus('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setStatus('Please select a file');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setStatus('Uploading...');
      const res = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Upload failed');
      }

      const data = await res.json();
      setResult(data);
      setStatus('Analysis complete');
    } catch (err) {
      setStatus('Upload error: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', textAlign: 'center', padding: '1rem' }}>
      {}
      <img
        src="/file.png"
        alt="Resume Leak Scanner Logo"
        style={{ maxWidth: '250px', width: '80%', marginBottom: '1.5rem' }}
      />

      {}
      <h2>Resume Leak Scanner — Upload</h2>

      {}
      <form onSubmit={onSubmit} style={{ marginTop: '1rem' }}>
        <input type="file" name="resume" accept=".pdf,.docx" onChange={onFileChange} />
        <button disabled={!file} type="submit" style={{ marginLeft: '1rem' }}>Scan Resume</button>
      </form>

      {}
      <p style={{ marginTop: '1rem' }}>{status}</p>

      {}
      {result && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3>Risk: {result.risk.level} (score {result.risk.score})</h3>
          <h4>Detections</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {result.detections.map((d, i) => (
              <li key={i} style={{ marginBottom: '0.5rem' }}>
                <strong>{d.type}</strong>: {d.match} — {d.context || ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
