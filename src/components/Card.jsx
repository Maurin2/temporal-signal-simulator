export default function Card({ theme, title, children }) {
    return (
      <div className="metric-card" style={{ padding: 12 }}>
        <div style={{ fontSize: 12, color: theme.subtext, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>{children}</div>
      </div>
    );
  }
  