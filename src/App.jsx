import React, { useEffect, useMemo, useRef, useState } from "react";
import { PALETTES } from "./theme/palettes";
import { UI_THEMES } from "./theme/uiThemes";

import Param from "./components/Param";
import Metrics from "./components/Metrics";
import Toolbar from "./components/Toolbar";
import TimingDiagram from "./components/TimingDiagram";

import useTimingModel from "./hooks/useTimingModel";
import useCursors from "./hooks/useCursors";

export default function App() {
  // Modelo
  const { params, setParams, derived } = useTimingModel();
  const cursors = useCursors(derived.Tclk_ps);
  const topRef = useRef(null);
  const [diagramHeight, setDiagramHeight] = useState(null);

  // Paletas/temas
  const [paletteName, setPaletteName] = useState("Okabe-Ito");
  const [uiThemeName, setUiThemeName] = useState("Midnight");
  const C = PALETTES[paletteName];
  const T = UI_THEMES[uiThemeName];

  // Estilos globales dependientes del tema
  const styleStr = `
  /* Reset útil */
  html, body, #root { margin: 0; height: 100%; }
  body { overflow-x: hidden; }

  /* Mantener grosor de líneas al escalar el SVG */
  svg path, svg line, svg polyline { vector-effect: non-scaling-stroke; }

  /* Cosas del tema (usan T.*) */
  .chip {
    padding: 8px 12px; border-radius: 9999px;
    border: 1px solid ${T.chipBorder};
    background: ${T.chipBg}; color: ${T.text};
    cursor: pointer; font-weight: 700;
    transition: background .2s ease, border-color .2s ease, transform .05s ease;
  }
  .chip:hover { background: ${T.chipHover}; border-color: ${T.accent}; }
  .chip:active { transform: translateY(1px); }

  .select {
    padding: 8px 10px; border-radius: 10px;
    border: 1px solid ${T.border}; background: ${T.card}; color: ${T.text};
  }

  .metric-card {
    background: ${T.card};
    border: 1px solid ${T.border};
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04);
  }

  .slider {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 6px; background: ${T.track};
    border-radius: 9999px; outline: none;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 16px; height: 16px; border-radius: 50%;
    background: ${T.accent}; border: 2px solid ${T.border};
  }
  .slider::-moz-range-thumb {
    width: 16px; height: 16px; border-radius: 50%;
    background: ${T.accent}; border: 2px solid ${T.border};
  }
`;

  // Calcula alto disponible para que TODO entre en 1 pantalla (sin scroll)
  useEffect(() => {
    const recalc = () => {
      const topH = topRef.current?.getBoundingClientRect().height ?? 0;
      const pad = 16; // colchoncito
      const h = Math.max(260, window.innerHeight - topH - pad);
      setDiagramHeight(h);
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  // Export (expuesto por el diagrama via ref)
  const diagramRef = useRef(null);
  const onExportSVG = () => diagramRef.current?.exportSVG();
  const onExportPNG = () => diagramRef.current?.exportPNG(false);
  const onCopyPNG  = () => diagramRef.current?.exportPNG(true);

  return (
    <div
      style={{
        fontFamily: "Inter, ui-sans-serif, system-ui, Arial",
        background: T.bg,
        color: T.text,
        minHeight: "100dvh",
        display: "grid",
        placeItems: "start center", // centra horizontalmente
      }}
    >
      <style>{styleStr}</style>
  
       {/* Container centrado, ocupa TODA la pantalla sin overflow */}
       <div
        style={{
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          padding: "clamp(12px, 2vw, 24px)",
        }}
      >
     <div ref={topRef}>
       <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
         Simulador de Diagrama Temporal (Registro→Registro)
       </h1>
       <p style={{ marginTop: 0, marginBottom: 16, color: T.subtext }}>
         Ajustá los parámetros y mirá cómo cambian las formas de onda, el slack y las violaciones de setup/hold.
       </p>
      {/* Sliders */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 12 }}>
      <Param theme={T} label={`fCLK = ${params.fGHz.toFixed(2)} GHz`} min={0.1} max={5} step={0.05}
               value={params.fGHz} onChange={(v) => setParams({ fGHz: v })} />
        <Param theme={T} label={`tCQ = ${params.tCQ} ps`} min={0} max={600} step={10}
               value={params.tCQ} onChange={(v) => setParams({ tCQ: v })} />
        <Param theme={T} label={`tSU = ${params.tSU} ps`} min={0} max={300} step={5}
               value={params.tSU} onChange={(v) => setParams({ tSU: v })} />
        <Param theme={T} label={`tH = ${params.tH} ps`} min={0} max={300} step={5}
               value={params.tH} onChange={(v) => setParams({ tH: v })} />
        <Param theme={T} label={`tNEXT = ${params.tNext} ps`} min={0} max={700} step={10}
               value={params.tNext} onChange={(v) => setParams({ tNext: v })} />
      </div>

      {/* Toolbar (paletas, tema UI, cursores, export) */}
      <Toolbar
        theme={T}
        paletteName={paletteName} setPaletteName={setPaletteName}
        uiThemeName={uiThemeName} setUiThemeName={setUiThemeName}
        cursors={cursors}
        onExportSVG={onExportSVG} onExportPNG={onExportPNG} onCopyPNG={onCopyPNG}
      />

      {/* Métricas */}
      <Metrics theme={T} derived={derived} />
      </div>
      {/* Diagrama */}
      <TimingDiagram
        ref={diagramRef}
        params={params}
        derived={derived}
        palette={C}
        uiTheme={T}
        cursors={cursors}
        heightPx={diagramHeight}
      />

      {/* Notas */}
      <div style={{ marginTop: 14, fontSize: 13, color: T.subtext }}>
        <p style={{ margin: 0 }}>
          Condición de setup: <b>tCQ + tNEXT + tSU ≤ TCLK</b>. f<sub>MAX</sub> ≈ <b>1000 / (tCQ + tNEXT + tSU)</b> (GHz, tiempos en ps).
          Slack: <b>TCLK − tCQ − tNEXT − tSU</b>. Hold (simplificado): <b>tCQ_min + tPATH_min ≥ tH</b>.
        </p>
        </div>{/* /container */}
      </div>
      </div>
  );
}
