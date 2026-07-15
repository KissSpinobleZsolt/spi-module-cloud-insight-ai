import React, { useState } from 'react';

const SOURCES = [
  { id: 1, name: 'sales_q1_2025.csv',       type: 'CSV',  rows: 12_480, size: '1.2 MB', status: 'ready',      updated: '2 hours ago' },
  { id: 2, name: 'customer_export.xlsx',     type: 'XLSX', rows: 4_305,  size: '840 KB', status: 'ready',      updated: 'Yesterday'   },
  { id: 3, name: 'product_catalog.json',     type: 'JSON', rows: 892,    size: '310 KB', status: 'processing', updated: 'Just now'    },
  { id: 4, name: 'warehouse_inventory.csv',  type: 'CSV',  rows: 0,      size: '2.1 MB', status: 'error',      updated: '3 days ago'  },
];

const STATUS_COLORS = {
  ready:      { bg: '#14532d', text: '#4ade80', dot: '#22c55e' },
  processing: { bg: '#1e3a5f', text: '#60a5fa', dot: '#3b82f6' },
  error:      { bg: '#450a0a', text: '#f87171', dot: '#ef4444' },
};

function StatCard({ label, value, sub }) {
  return (
    <div style={s.statCard}>
      <p style={s.statValue}>{value}</p>
      <p style={s.statLabel}>{label}</p>
      {sub && <p style={s.statSub}>{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.ready;
  return (
    <span style={{ ...s.badge, background: c.bg, color: c.text }}>
      <span style={{ ...s.badgeDot, background: c.dot }} />
      {status}
    </span>
  );
}

export default function App({ presets }) {
  const [dragging, setDragging] = useState(false);
  const [sources, setSources] = useState(SOURCES);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer?.files ?? []);
    if (!files.length) return;
    const newRows = files.map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      type: f.name.split('.').pop().toUpperCase(),
      rows: 0,
      size: f.size > 1_048_576 ? `${(f.size / 1_048_576).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
      status: 'processing',
      updated: 'Just now',
    }));
    setSources(prev => [...newRows, ...prev]);
  }

  const totalRows = sources.reduce((sum, s) => sum + s.rows, 0);
  const readyCount = sources.filter(s => s.status === 'ready').length;

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>📥 Data Ingestion</h1>
          <p style={s.subtitle}>Upload, process, and manage structured data sources for your workspace.</p>
        </div>
        <button style={s.primaryBtn}>+ New Connection</button>
      </div>

      <div style={s.stats}>
        <StatCard label="Data Sources"   value={sources.length}                   sub={`${readyCount} ready`} />
        <StatCard label="Total Records"  value={totalRows.toLocaleString()}        sub="across all sources" />
        <StatCard label="Last Ingestion" value="2 hrs ago"                        sub="sales_q1_2025.csv" />
        <StatCard label="Storage Used"   value="4.4 MB"                           sub="of workspace quota" />
      </div>

      <div
        style={{ ...s.dropZone, ...(dragging ? s.dropZoneActive : {}) }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <span style={s.dropIcon}>☁️</span>
        <p style={s.dropText}>Drop files here to ingest</p>
        <p style={s.dropHint}>CSV, XLSX, JSON — max 50 MB per file</p>
      </div>

      <div style={s.tableWrap}>
        <div style={s.tableHeader}>
          <p style={s.tableTitle}>Data Sources</p>
          <div style={s.tableActions}>
            <button style={s.ghostBtn}>Refresh</button>
            <button style={s.ghostBtn}>Export</button>
          </div>
        </div>
        <table style={s.table}>
          <thead>
            <tr>
              {['Name', 'Type', 'Rows', 'Size', 'Status', 'Updated', ''].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sources.map(src => (
              <tr key={src.id} style={s.tr}>
                <td style={s.td}><span style={s.fileName}>{src.name}</span></td>
                <td style={s.td}><span style={s.typeTag}>{src.type}</span></td>
                <td style={{ ...s.td, color: '#94a3b8' }}>{src.rows.toLocaleString()}</td>
                <td style={{ ...s.td, color: '#94a3b8' }}>{src.size}</td>
                <td style={s.td}><StatusBadge status={src.status} /></td>
                <td style={{ ...s.td, color: '#64748b' }}>{src.updated}</td>
                <td style={s.td}>
                  <button style={s.rowBtn}>⋯</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s = {
  root: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: '#0f172a',
    color: '#e2e8f0',
    minHeight: '100%',
    padding: '28px 32px',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '24px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  title: {
    margin: '0 0 4px',
    fontSize: '22px',
    fontWeight: 700,
    color: '#f1f5f9',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#64748b',
  },
  primaryBtn: {
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  statCard: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '16px 18px',
  },
  statValue: {
    margin: '0 0 2px',
    fontSize: '22px',
    fontWeight: 700,
    color: '#f1f5f9',
    letterSpacing: '-0.02em',
  },
  statLabel: {
    margin: '0 0 2px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  statSub: {
    margin: 0,
    fontSize: '11px',
    color: '#475569',
  },
  dropZone: {
    border: '2px dashed #334155',
    borderRadius: '12px',
    padding: '28px',
    textAlign: 'center',
    marginBottom: '20px',
    transition: 'border-color 0.15s, background 0.15s',
    cursor: 'default',
  },
  dropZoneActive: {
    borderColor: '#6366f1',
    background: 'rgba(99,102,241,0.06)',
  },
  dropIcon: {
    fontSize: '28px',
    display: 'block',
    marginBottom: '8px',
  },
  dropText: {
    margin: '0 0 4px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#cbd5e1',
  },
  dropHint: {
    margin: 0,
    fontSize: '12px',
    color: '#475569',
  },
  tableWrap: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    borderBottom: '1px solid #334155',
  },
  tableTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  tableActions: {
    display: 'flex',
    gap: '8px',
  },
  ghostBtn: {
    background: 'transparent',
    color: '#64748b',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '10px 16px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    textAlign: 'left',
    borderBottom: '1px solid #1e293b',
    background: '#162032',
  },
  tr: {
    borderBottom: '1px solid #1e293b',
  },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    color: '#cbd5e1',
    verticalAlign: 'middle',
  },
  fileName: {
    fontWeight: 500,
    color: '#e2e8f0',
  },
  typeTag: {
    background: '#0f2027',
    color: '#38bdf8',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 8px',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.03em',
    textTransform: 'capitalize',
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  rowBtn: {
    background: 'transparent',
    border: 'none',
    color: '#475569',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
  },
};
