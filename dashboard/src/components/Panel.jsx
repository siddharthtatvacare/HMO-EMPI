export default function Panel({ title, tag, dotColor, children, className = '' }) {
  return (
    <div className={`panel ${className}`}>
      {title && (
        <div className="panel-title">
          {dotColor && <span className="dot" style={{ background: dotColor }} />}
          {title}
          {tag && <span className="pbi-tag">{tag}</span>}
        </div>
      )}
      {children}
    </div>
  );
}
