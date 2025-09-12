import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import axios from 'axios';
 
export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
 
  const onFileChange = e => {
    setFile(e.target.files[0]);
    setResult(null);
  };
 
  const onSubmit = async e => {
    e.preventDefault();
    if (!file) return setStatus('Please select a file');
    const form = new FormData();
    form.append('resume', file);
    try {
      setStatus('Uploading...');
      const res = await axios.post('http://localhost:4000/api/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      });
      setResult(res.data);
      setStatus('Analysis complete');
    } catch (err) {
      setStatus('Upload error: ' + (err.response?.data?.error || err.message));
    }
  };
 
  return (
<div style={{ maxWidth: 720, margin: '1rem auto' }}>
<h2>Resume Leak Scanner — Upload</h2>
<form onSubmit={onSubmit}>
<input type="file" accept=".pdf,.docx" onChange={onFileChange} />
<button disabled={!file} type="submit">Scan Resume</button>
</form>
<p>{status}</p>
      {result && (
<div>
<h3>Risk: {result.risk.level} (score {result.risk.score})</h3>
<h4>Detections</h4>
<ul>
            {result.detections.map((d, i) => (
<li key={i}><strong>{d.type}</strong>: {d.match} — {d.context || ''}</li>
            ))}
</ul>
</div>
      )}
</div>
  );
}
