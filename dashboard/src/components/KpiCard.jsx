export default function KpiCard({ label, value, sub, trend, trendDir, color = '', onClick }) {
  return (
    <div className={`kpi-card ${color}`} onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
      {trend && (
        <div className={`kpi-trend ${trendDir || ''}`}>{trend}</div>
      )}
    </div>
  );
}
