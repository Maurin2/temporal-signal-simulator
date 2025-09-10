import Card from "./Card";

export default function Metrics({ theme, derived }) {
  return (
     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 10 }}>
    <Card theme={theme} title="Período (TCLK)">{derived.Tclk_ps.toFixed(1)} ps</Card>
      <Card theme={theme} title="fMAX teórica">{derived.fmaxGHz.toFixed(2)} GHz</Card>
      <Card theme={theme} title="Setup slack">
        {derived.slack_ps.toFixed(1)} ps{" "}
        <span style={{
          padding: "2px 8px", borderRadius: 999,
          background: derived.slack_ps >= 0 ? "#DCFCE7" : "#FEE2E2",
          color: derived.slack_ps >= 0 ? "#166534" : "#991B1B", fontWeight: 700, fontSize: 12
        }}>
          {derived.slack_ps >= 0 ? "OK" : "VIOLACIÓN"}
        </span>
      </Card>
      <Card theme={theme} title="Hold check">
        <span style={{
          padding: "2px 8px", borderRadius: 999,
          background: !derived.holdViolated ? "#DCFCE7" : "#FEE2E2",
          color: !derived.holdViolated ? "#166534" : "#991B1B", fontWeight: 700, fontSize: 12
        }}>
          {!derived.holdViolated ? "OK" : "VIOLACIÓN"}
        </span>
      </Card>
    </div>
  );
}
