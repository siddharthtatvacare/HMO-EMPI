import { useState } from 'react';

export default function InfoButton({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 18, height: 18,
          borderRadius: '50%',
          border: '1px solid var(--border)',
          background: open ? 'var(--primary)' : 'var(--card-bg)',
          color: open ? 'white' : 'var(--text-muted)',
          fontSize: 10, fontWeight: 700,
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1,
          fontFamily: 'inherit',
        }}
        title="More info"
      >
        i
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 24, left: -8,
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 6, padding: '10px 14px',
          fontSize: 11, color: 'var(--text-secondary)',
          lineHeight: 1.5,
          width: 320, zIndex: 50,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        }}>
          {children}
        </div>
      )}
    </span>
  );
}
