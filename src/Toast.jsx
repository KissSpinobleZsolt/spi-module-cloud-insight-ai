import React, { useEffect } from 'react';

const AUTO_DISMISS_MS = 5000; // each toast disappears after 5 seconds unless manually closed

/**
 * Fixed-position stack of toast notifications rendered in the bottom-right corner.
 * Toasts are rendered in reverse order so the newest one appears on top.
 */
export function ToastStack({ toasts, onDismiss }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column-reverse', // newest toast appears at the bottom (visually on top)
        gap: '10px',
        zIndex: 9999,
        maxWidth: '400px',
        pointerEvents: 'none', // transparent to clicks in the empty area between toasts
      }}
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  // Auto-dismiss this toast after AUTO_DISMISS_MS; cancels if the toast is removed first
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const success = toast.type === 'success'; // drives color scheme
  const accentColor = success ? '#4ade80' : '#f87171'; // green for success, red for error

  return (
    <div
      style={{
        background: success ? '#14532d' : '#450a0a', // dark green / dark red background
        border: `1px solid ${success ? '#166534' : '#7f1d1d'}`,
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        pointerEvents: 'all', // re-enable clicks for the toast card itself
      }}
    >
      {/* Status icon */}
      <span style={{ color: accentColor, fontWeight: 700, fontSize: '15px', flexShrink: 0, marginTop: '1px' }}>
        {success ? '✓' : '✕'}
      </span>

      {/* Title + body text */}
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 600, color: accentColor }}>
          {toast.title}
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
          {toast.body}
        </p>
      </div>

      {/* Manual close button */}
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: '#475569',
          cursor: 'pointer',
          fontSize: '16px',
          padding: 0,
          lineHeight: 1,
          flexShrink: 0,
        }}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
