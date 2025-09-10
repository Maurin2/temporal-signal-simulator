export default function Legend({ theme, color, text }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 26, height: 4, background: color, display: "inline-block" }} />
        <span style={{ fontSize: 13, color: theme.subtext }}>{text}</span>
      </div>
    );
  }
  