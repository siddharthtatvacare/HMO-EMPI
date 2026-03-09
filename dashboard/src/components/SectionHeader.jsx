export default function SectionHeader({ label, color = 'var(--primary)', description }) {
  return (
    <div style={{
      background: color + '12',
      borderLeft: `3px solid ${color}`,
      borderRadius: 4,
      padding: '8px 14px',
      marginBottom: 14,
      marginTop: 18,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color }}>{label}</div>
      {description && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{description}</div>
      )}
    </div>
  );
}
