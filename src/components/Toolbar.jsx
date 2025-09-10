import Btn from "./Btn";

export default function Toolbar({
  theme, // UI theme object
  paletteName, setPaletteName,
  uiThemeName, setUiThemeName,
  cursors, // { active, setActive, clear }
  onExportSVG, onExportPNG, onCopyPNG,
}) {
  return (
    <div className="metric-card" style={{ padding: 10, marginBottom: 10, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ fontSize: 12, color: theme.subtext }}>Señales:</span>
      <select className="select" value={paletteName} onChange={(e) => setPaletteName(e.target.value)}>
        {["Okabe-Ito","Nord","Solarized","Mono"].map(k => <option key={k} value={k}>{k}</option>)}
      </select>

      <span style={{ fontSize: 12, color: theme.subtext, marginLeft: 12 }}>Tema UI:</span>
      <select className="select" value={uiThemeName} onChange={(e) => setUiThemeName(e.target.value)}>
        {["Midnight","Light"].map(k => <option key={k} value={k}>{k}</option>)}
      </select>

      <span style={{ fontSize: 12, color: theme.subtext, marginLeft: 12 }}>Cursor activo:</span>
      <button className="chip" onClick={() => cursors.setActive("A")} style={{ borderColor: cursors.active === "A" ? theme.accent : undefined }}>A</button>
      <button className="chip" onClick={() => cursors.setActive("B")} style={{ borderColor: cursors.active === "B" ? theme.accent : undefined }}>B</button>
      <button className="chip" onClick={cursors.clear}>Limpiar</button>

      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: theme.subtext }}>Exportar:</span>
        <Btn onClick={onExportSVG}>SVG</Btn>
        <Btn onClick={onExportPNG}>PNG</Btn>
        <Btn onClick={onCopyPNG}>Copiar PNG</Btn>
      </div>
    </div>
  );
}
