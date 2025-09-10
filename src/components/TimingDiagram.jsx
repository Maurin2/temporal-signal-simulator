import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import Legend from "./Legend";
import { stepPath } from "../utils/stepPath";

const W = 980, H = 540;
const left = 70, right = 20, top = 40, bottom = 40;
const rowH = 70, amp = 28;

const CURSOR_A = "#10b981";
const CURSOR_B = "#ef4444";

function useMapping(Tclk_ps) {
  const timeSpan = 2 * Tclk_ps;
  const innerW = W - left - right;
  const x = (t) => left + Math.max(0, Math.min(innerW, (t * innerW) / Math.max(timeSpan, 1)));
  const tFromX = (px) => Math.max(0, Math.min(timeSpan, ((px - left) / innerW) * timeSpan));
  return { timeSpan, innerW, x, tFromX };
}

function baseY(row) { return top + row * rowH + 20; }

const TimingDiagram = forwardRef(function TimingDiagram({
  params, derived, palette, uiTheme, cursors, heightPx // { active, A, B, place }
}, ref) {
  const { Tclk_ps } = derived;
  const { timeSpan, innerW, x, tFromX } = useMapping(Tclk_ps);
  const svgRef = useRef(null);
  const [hoverPx, setHoverPx] = useState(null);
  const [inside, setInside] = useState(false);
  const tHover = inside && hoverPx != null ? tFromX(hoverPx) : null;

  // Señales
  const clkSteps = useMemo(() => ([
    { t: 0, v: 0, row: 0 }, { t: 0, v: 1, row: 0 },
    { t: Tclk_ps / 2, v: 1, row: 0 }, { t: Tclk_ps / 2, v: 0, row: 0 },
    { t: Tclk_ps, v: 0, row: 0 }, { t: Tclk_ps, v: 1, row: 0 },
    { t: (3 * Tclk_ps) / 2, v: 1, row: 0 }, { t: (3 * Tclk_ps) / 2, v: 0, row: 0 },
  ]), [Tclk_ps]);

  const dLSteps = useMemo(() => ([
    { t: 0, v: 1, row: 1 },
    { t: 1.5 * Tclk_ps, v: 1, row: 1 },
    { t: 1.5 * Tclk_ps, v: 0, row: 1 },
  ]), [Tclk_ps]);

  const qLSteps = [{ t: 0, v: 0, row: 2 }, { t: derived.t_qL_change, v: 0, row: 2 }, { t: derived.t_qL_change, v: 1, row: 2 }];
  const dCSteps = [{ t: 0, v: 0, row: 3 }, { t: derived.t_dC_change, v: 0, row: 3 }, { t: derived.t_dC_change, v: 1, row: 3 }];
  const qCSteps = [{ t: 0, v: 0, row: 4 }, { t: derived.t_qC_change, v: 0, row: 4 }, { t: derived.t_qC_change, v: 1, row: 4 }];

  // Export
  const serializeSVG = () => {
    const svgEl = svgRef.current;
    const clone = svgEl.cloneNode(true);
    const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bgRect.setAttribute("x", "0"); bgRect.setAttribute("y", "0");
    bgRect.setAttribute("width", String(W)); bgRect.setAttribute("height", String(H));
    bgRect.setAttribute("fill", "#ffffff");
    clone.insertBefore(bgRect, clone.firstChild);
    const s = new XMLSerializer().serializeToString(clone);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${s}`;
  };
  const download = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };
  const exportSVG = () => {
    const svg = serializeSVG();
    download(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), "timing-diagram.svg");
  };
  const exportPNG = async (copy = false) => {
    const svg = serializeSVG();
    const img = new Image();
    const scale = 2;
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const canvas = document.createElement("canvas");
    canvas.width = W * scale; canvas.height = H * scale;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    await new Promise((res) => canvas.toBlob(async (blob) => {
      if (!blob) return res();
      if (copy && navigator.clipboard && window.ClipboardItem) {
        try {
          await navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })]);
          res(); return;
        } catch (_) {}
      }
      download(blob, "timing-diagram.png"); res();
    }, "image/png"));
  };
  useImperativeHandle(ref, () => ({ exportSVG, exportPNG }), [derived, params]);

  const vlines = [0, Tclk_ps, 2 * Tclk_ps];

    return (
       <div
         style={{
           border: `1px solid ${uiTheme.border}`,
           borderRadius: 16,
           overflow: "hidden",
           background: uiTheme.card,
           width: "100%",
           height: heightPx ? `${heightPx}px` : "auto",   // ocupa el espacio disponible
           display: "grid",
         }}
       >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%", display: "block" }} // se ajusta al contenedor
        onMouseEnter={() => setInside(true)}
        onMouseLeave={() => { setInside(false); setHoverPx(null); }}
        onMouseMove={(e) => {
          const rect = svgRef.current.getBoundingClientRect();
          const scaleX = rect.width / W;             // compensa el escalado del viewBox
          const px = (e.clientX - rect.left) / scaleX;
          setHoverPx(px);                            // coords en el sistema base (W)
        }}
        onClick={() => { if (tHover != null) cursors.place(tHover); }}
      >
        <rect x={0} y={0} width={W} height={H} fill="#ffffff" />
        {[{ name: "clk", row: 0 },{ name: "dL", row: 1 },{ name: "qL", row: 2 },{ name: "dC", row: 3 },{ name: "qC", row: 4 },]
          .map((s) => (
          <text key={s.name} x={12} y={baseY(s.row) - 8} fontSize={14} fontWeight={700} fill="#0f172a">{s.name}</text>
        ))}

        {vlines.map((t, i) => (
          <g key={i}>
            <line x1={x(t)} x2={x(t)} y1={top - 10} y2={H - bottom + 10} stroke="#e2e8f0" strokeDasharray="6 6" />
            <text x={x(t)} y={top - 14} textAnchor="middle" fontSize={12} fill="#64748b">{i}T</text>
          </g>
        ))}

        {/* Ventanas */}
        <rect x={x(derived.setupStart)} y={baseY(3) - amp - 20}
          width={Math.max(0, x(derived.setupEnd) - x(derived.setupStart))}
          height={amp * 2 + 40} fill={derived.setupViolated ? palette.violBG : palette.setupBG} opacity={0.7} />
        <text x={x(derived.setupStart) + 6} y={baseY(3) - amp - 26} fontSize={12} fill="#64748b">Setup window</text>

        <rect x={x(derived.holdStart)} y={baseY(3) - amp - 20}
          width={Math.max(0, x(derived.holdEnd) - x(derived.holdStart))}
          height={amp * 2 + 40} fill={derived.holdViolated ? palette.violBG : palette.holdBG} opacity={0.6} />
        <text x={x(derived.holdStart) + 6} y={baseY(3) + amp + 36} fontSize={12} fill="#64748b">Hold window</text>

        {/* Señales */}
        <path d={stepPath(clkSteps, x, timeSpan, (r)=>baseY(0), amp)} fill="none" stroke={palette.clk} strokeWidth={2} />
        <path d={stepPath(dLSteps,  x, timeSpan, (r)=>baseY(1), amp)} fill="none" stroke={palette.dL}  strokeWidth={2} />
        <path d={stepPath(qLSteps,  x, timeSpan, (r)=>baseY(2), amp)} fill="none" stroke={palette.qL}  strokeWidth={2} />
        <path d={stepPath(dCSteps,  x, timeSpan, (r)=>baseY(3), amp)} fill="none" stroke={palette.dC}  strokeWidth={2} />
        <path d={stepPath(qCSteps,  x, timeSpan, (r)=>baseY(4), amp)} fill="none" stroke={palette.qC}  strokeWidth={2} />

        {/* Eje tiempo */}
        <line x1={left} x2={left + innerW} y1={H - bottom} y2={H - bottom} stroke="#cbd5e1" />
        {[0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((k) => (
          <g key={k}>
            <line x1={x(k * Tclk_ps)} x2={x(k * Tclk_ps)} y1={H - bottom} y2={H - bottom + 6} stroke="#94a3b8" />
            <text x={x(k * Tclk_ps)} y={H - bottom + 18} fontSize={11} textAnchor="middle" fill="#64748b">
              {k.toFixed(2)}T
            </text>
          </g>
        ))}

        {/* Cursores A/B */}
        {cursors.A != null && (
          <g>
            <line x1={x(cursors.A)} x2={x(cursors.A)} y1={top - 6} y2={H - bottom + 6} stroke={CURSOR_A} strokeWidth={2} strokeDasharray="4 2" />
            <polygon points={`${x(cursors.A)-6},${top-6} ${x(cursors.A)+6},${top-6} ${x(cursors.A)},${top-16}`} fill={CURSOR_A} />
            <text x={x(cursors.A)} y={top - 20} textAnchor="middle" fontSize={12} fill={CURSOR_A}>A</text>
          </g>
        )}
        {cursors.B != null && (
          <g>
            <line x1={x(cursors.B)} x2={x(cursors.B)} y1={top - 6} y2={H - bottom + 6} stroke={CURSOR_B} strokeWidth={2} strokeDasharray="4 2" />
            <polygon points={`${x(cursors.B)-6},${top-6} ${x(cursors.B)+6},${top-6} ${x(cursors.B)},${top-16}`} fill={CURSOR_B} />
            <text x={x(cursors.B)} y={top - 20} textAnchor="middle" fontSize={12} fill={CURSOR_B}>B</text>
          </g>
        )}

        {/* Regla live */}
        {inside && tHover != null && (
          <g>
            <line x1={x(tHover)} x2={x(tHover)} y1={top - 10} y2={H - bottom + 10} stroke="#0ea5e9" strokeWidth={1} strokeDasharray="2 2" />
            <rect x={Math.min(x(tHover)+8, W-160)} y={top-34} width={150} height={20} rx={6} fill="#0ea5e9" opacity={0.1} />
            <text x={Math.min(x(tHover)+16, W-152)} y={top - 20} fontSize={12} fill="#0ea5e9">
              t = {tHover.toFixed(1)} ps ({(tHover / Tclk_ps).toFixed(3)}T)
            </text>
          </g>
        )}
      </svg>

      {/* Leyenda */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10, color: uiTheme.subtext, padding: 12 }}>
        <Legend theme={uiTheme} color={palette.clk} text="clk" />
        <Legend theme={uiTheme} color={palette.dL} text="dL" />
        <Legend theme={uiTheme} color={palette.qL} text="qL" />
        <Legend theme={uiTheme} color={palette.dC} text="dC = qL ⊕ tNEXT" />
        <Legend theme={uiTheme} color={palette.qC} text="qC" />
        <Legend theme={uiTheme} color={CURSOR_A} text="Cursor A" />
        <Legend theme={uiTheme} color={CURSOR_B} text="Cursor B" />
      </div>
    </div>
  );
});

export default TimingDiagram;
