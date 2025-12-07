import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { useState } from 'react';
import './App.css';

function App() {
  const [fileId, setFileId] = useState("");

  const handleLogin = () => {
    window.open("http://localhost:5000/API/storage/login/testing", "_blank");
  };

  const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const n = 4; // number of RS shards
  const k = 2; // min RS shards
  const m = 4; // number of SSS shards
  const t = 2; // min SSS key shares

  const fragmentDestinations = [
    { folder_id: "1oxi5tqRC_n1n1yD3jQxqGjLu1LNF5BWk", storage_id: 8, type: "google" },
    { folder_id: "1oxi5tqRC_n1n1yD3jQxqGjLu1LNF5BWk", storage_id: 8, type: "google" },
    { folder_id: "1oxi5tqRC_n1n1yD3jQxqGjLu1LNF5BWk", storage_id: 8, type: "google" },
    { folder_id: "1koxp-bHXqTuh1_mTkUCHBGzMm-Ji9Kl5", storage_id: 8, type: "google" }
  ];

  const formData = new FormData();
  formData.append("file", file);
  formData.append("account_id", 1);
  formData.append("group_id", 1);
  formData.append("n", n);
  formData.append("k", k);
  formData.append("m", m);
  formData.append("t", t);

  // Both fragment and key destinations are the same
  formData.append("fragment_destinations", JSON.stringify(fragmentDestinations));
  formData.append("key_destinations", JSON.stringify(fragmentDestinations));

  try {
    const res = await fetch("http://localhost:5000/API/file/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);
    alert("Upload successful! Check console for shard/key info.");
  } catch (err) {
    console.error(err);
    alert("Upload failed: " + err.message);
  }
};

  const handleDownload = async () => {
    if (!fileId) {
      alert("Please enter a file ID first");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/API/file/download`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: fileId,
          storage_id: 8
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Download failed');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'decrypted_file.png';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert("Download successful!");
    } catch (error) {
      console.error(error);
      alert(`Download failed: ${error.message}`);
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={handleLogin}>Login to Google</button>
        <input type="file" onChange={handleFileUpload} />
        <input
          type="text"
          placeholder="Enter file ID to download"
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
          style={{ marginTop: '1rem', width: '100%' }}
        />
        <button onClick={handleDownload} style={{ marginTop: '0.5rem' }}>
          Download & Decrypt
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
