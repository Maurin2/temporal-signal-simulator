import { useMemo, useState } from "react";

// Manejo de cursores A/B + Δt
export default function useCursors(Tclk_ps) {
  const [active, setActive] = useState("A");
  const [A, setA] = useState(null);
  const [B, setB] = useState(null);

  const place = (t) => (active === "A" ? setA(t) : setB(t));
  const clear = () => { setA(null); setB(null); };

  const dt = useMemo(() => (A != null && B != null ? Math.abs(B - A) : null), [A, B]);
  const dtT = useMemo(() => (dt != null ? dt / Tclk_ps : null), [dt, Tclk_ps]);

  return { active, setActive, A, B, place, clear, dt, dtT };
}
