import React, { useState, useRef } from 'react';

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB — matches backend validation and UX copy
const ALLOWED = new Set(['csv', 'xlsx', 'json']); // accepted file extensions (lowercase)

/**
 * Drag-and-drop / click-to-browse file input.
 * Validates type and size on the client side; calls onFiles with valid File[]
 * and onError with a human-readable message for each rejected file.
 */
export function FileDropzone({ onFiles, onError, uploading = false }) {
  const [dragging, setDragging] = useState(false); // true while a drag is over the zone
  const inputRef = useRef(null); // hidden <input type="file"> used for click-to-browse

  function validate(files) {
    const valid = []; // files that pass all client-side checks
    for (const file of files) {
      const ext = (file.name.split('.').pop() ?? '').toLowerCase(); // extract extension
      if (!ALLOWED.has(ext)) {
        onError?.(`"${file.name}" — unsupported type (.${ext}). Use CSV, XLSX, or JSON.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        const mb = (file.size / 1_048_576).toFixed(1);
        onError?.(`"${file.name}" exceeds the 50 MB limit (${mb} MB).`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length) onFiles?.(valid); // only notify if there is at least one valid file
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (uploading) return; // ignore drops while a previous upload is still in-flight
    validate(Array.from(e.dataTransfer?.files ?? []));
  }

  function handleInputChange(e) {
    validate(Array.from(e.target.files ?? []));
    e.target.value = ''; // reset so the same file can be selected again
  }

  function handleClick() {
    if (!uploading) inputRef.current?.click(); // open OS file picker
  }

  const zoneStyle = {
    border: `2px dashed ${dragging ? '#6366f1' : '#334155'}`, // indigo highlight on hover
    borderRadius: '12px',
    padding: '32px 24px',
    textAlign: 'center',
    marginBottom: '20px',
    transition: 'border-color 0.15s, background 0.15s',
    cursor: uploading ? 'not-allowed' : 'pointer',
    background: dragging ? 'rgba(99,102,241,0.06)' : 'transparent',
    userSelect: 'none',
    outline: 'none',
  };

  return (
    <div
      style={zoneStyle}
      onDragOver={e => { e.preventDefault(); if (!uploading) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()} // keyboard accessibility
      aria-label="File drop zone — click or drag CSV, XLSX, or JSON files"
      aria-busy={uploading}
    >
      {/* Hidden file input — triggered by click on the zone */}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.json"
        multiple
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      {/* Cloud / hourglass icon toggles during upload */}
      <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>
        {uploading ? '⏳' : '☁️'}
      </span>

      {/* Primary call-to-action text */}
      <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: '#cbd5e1' }}>
        {uploading ? 'Uploading…' : 'Drop files here to ingest'}
      </p>

      {/* Accepted formats hint */}
      <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
        CSV, XLSX, JSON — max 50 MB per file
      </p>
    </div>
  );
}
