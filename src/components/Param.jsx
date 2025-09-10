export default function Param({ theme, label, value, onChange, min, max, step }) {
    return (
      <div className="metric-card" style={{ padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: theme.subtext }}>{label}</div>
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider"
        />
      </div>
    );
  }
  