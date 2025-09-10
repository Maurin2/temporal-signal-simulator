import { useMemo, useState } from "react";

// Lógica del modelo temporal (params + derivados)
export default function useTimingModel(initial = {
  fGHz: 1.0, tCQ: 200, tSU: 100, tH: 50, tNext: 0,
}) {
  const [params, setParamsState] = useState(initial);
  const setParams = (patch) => setParamsState(p => ({ ...p, ...patch }));

  const Tclk_ps = useMemo(() => 1000 / Math.max(params.fGHz, 0.001), [params.fGHz]);
  const fmaxGHz = useMemo(() => (params.tCQ + params.tNext + params.tSU > 0
    ? 1000 / (params.tCQ + params.tNext + params.tSU) : Infinity),
    [params.tCQ, params.tNext, params.tSU]);
  const slack_ps = useMemo(() => Tclk_ps - (params.tCQ + params.tNext + params.tSU),
    [Tclk_ps, params.tCQ, params.tNext, params.tSU]);

  // Eventos
  const t_qL_change = params.tCQ;
  const t_dC_change = params.tCQ + params.tNext;
  const t_qC_change = Tclk_ps + params.tCQ;

  // Ventanas
  const setupStart = Tclk_ps - params.tSU;
  const setupEnd = Tclk_ps;
  const setupViolated = t_dC_change >= setupStart && t_dC_change < setupEnd;

  const holdStart = Tclk_ps;
  const holdEnd = Tclk_ps + params.tH;
  const holdViolated = (t_dC_change + Tclk_ps) > holdStart && (t_dC_change + Tclk_ps) < holdEnd;

  return {
    params,
    setParams,
    derived: {
      Tclk_ps, fmaxGHz, slack_ps,
      t_qL_change, t_dC_change, t_qC_change,
      setupStart, setupEnd, setupViolated,
      holdStart, holdEnd, holdViolated,
      timeSpan: 2 * Tclk_ps,
    },
  };
}
