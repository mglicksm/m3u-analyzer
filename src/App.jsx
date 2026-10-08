import { useState, useCallback } from 'react';
import './App.css';

const API_BASE = 'http://localhost:3001/api/playlist';

function App() {
  const [playlistData, setPlaylistData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  };

  const processResponse = async (response) => {
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to process playlist');
    }
    const data = await response.json();
    setPlaylistData(data);
    setError(null);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('playlist', file);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
      await processResponse(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/parse-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputText }),
      });
      await processResponse(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.m3u8') || file.name.endsWith('.m3u'))) {
      handleFileUpload(file);
    } else {
      setError('Please drop a valid .m3u8 file');
    }
  }, []);

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>M3U8 Playlist Analyzer</h1>
        <p>Upload a file or paste content to analyze your playlist</p>
      </header>

      <div className="input-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${isDragging ? '#646cff' : '#ccc'}`,
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: isDragging ? '#f0f0ff' : 'transparent',
            transition: 'all 0.3s'
          }}
        >
          <p>Drag & Drop .m3u8 file here</p>
          <input
            type="file"
            accept=".m3u8,.m3u"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            style={{ display: 'none' }}
            id="fileInput"
          />
          <button
            onClick={() => document.getElementById('fileInput').click()}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
          >
            Select File
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea
            placeholder="Paste M3U8 content here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ height: '150px', borderRadius: '8px', padding: '1rem', border: '1px solid #ccc' }}
          />
          <button
            onClick={handleTextSubmit}
            disabled={loading || !inputText.trim()}
            style={{ padding: '0.8rem' }}
          >
            {loading ? 'Processing...' : 'Parse Text'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: '#ff4444', backgroundColor: '#ffeeee', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {playlistData && (
        <div className="results">
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Tracks', value: playlistData.summary.totalTracks },
              { label: 'Unique Artists', value: playlistData.summary.uniqueArtists },
              { label: 'Total Duration', value: formatDuration(playlistData.summary.totalDuration) },
              { label: 'Duplicates', value: playlistData.summary.duplicateCount },
            ].map((card, i) => (
              <div key={i} style={{ padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', backgroundColor: '#fff', textAlign: 'center', border: '1px solid #eee' }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{card.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{card.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Top Artists Table */}
            <div>
              <h3>Top Artists</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th style={{ textAlign: 'left', padding: '0.8rem' }}>Artist</th>
                    <th style={{ textAlign: 'right', padding: '0.8rem' }}>Tracks</th>
                  </tr>
                </thead>
                <tbody>
                  {playlistData.topArtists.map((artist, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.8rem' }}>{artist.name}</td>
                      <td style={{ padding: '0.8rem', textAlign: 'right' }}>{artist.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Duplicates Table */}
            <div>
              <h3>Duplicates Found</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th style={{ textAlign: 'left', padding: '0.8rem' }}>Track</th>
                    <th style={{ textAlign: 'left', padding: '0.8rem' }}>Artist</th>
                  </tr>
                </thead>
                <tbody>
                  {playlistData.duplicates.length > 0 ? (
                    playlistData.duplicates.map((track, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.8rem' }}>{track.title}</td>
                        <td style={{ padding: '0.8rem' }}>{track.artist}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No duplicates found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
