// Construye el path SVG para señales digitales (steps)
export function stepPath(steps, x, timeSpan, baseY, amp) {
    if (!steps.length) return "";
    const startY = baseY(steps[0].row);
    const y0 = startY - amp * steps[0].v;
    let d = `M ${x(steps[0].t).toFixed(2)} ${y0.toFixed(2)}`;
    for (let i = 1; i < steps.length; i++) {
      const prev = steps[i - 1];
      const cur = steps[i];
      const yPrev = startY - amp * prev.v;
      const yCur = startY - amp * cur.v;
      d += ` L ${x(cur.t).toFixed(2)} ${yPrev.toFixed(2)}`;
      d += ` L ${x(cur.t).toFixed(2)} ${yCur.toFixed(2)}`;
    }
    const last = steps[steps.length - 1];
    const yLast = startY - amp * last.v;
    d += ` L ${x(timeSpan).toFixed(2)} ${yLast.toFixed(2)}`;
    return d;
  }
  