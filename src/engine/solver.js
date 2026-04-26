import { computeDerivatives } from './formulas';

export function rk4Step(state, env, dt = 0.1) {
  const species = state.species;
  const n = species.length;

  function pack(species, N) {
    const arr = species.map((s) => s.B);
    arr.push(N);
    return arr;
  }
  function unpack(arr) {
    const newSpecies = species.map((s, i) => ({ ...s, B: Math.max(0, arr[i]) }));
    const newN = Math.max(0, arr[n]);
    return { species: newSpecies, N: newN };
  }

  const y0 = pack(species, state.N);

  const s0 = unpack(y0);
  const d1 = computeDerivatives(s0, env);
  const k1 = [...d1.dB, d1.dN];

  const y1 = y0.map((yi, i) => yi + 0.5 * dt * k1[i]);
  const s1 = unpack(y1);
  const d2 = computeDerivatives(s1, env);
  const k2 = [...d2.dB, d2.dN];

  const y2 = y0.map((yi, i) => yi + 0.5 * dt * k2[i]);
  const s2 = unpack(y2);
  const d3 = computeDerivatives(s2, env);
  const k3 = [...d3.dB, d3.dN];

  const y3 = y0.map((yi, i) => yi + dt * k3[i]);
  const s3 = unpack(y3);
  const d4 = computeDerivatives(s3, env);
  const k4 = [...d4.dB, d4.dN];

  const yNext = y0.map(
    (yi, i) => yi + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])
  );
  return unpack(yNext);
}

export function simulate(state, env, totalTime, dt = 0.1) {
  let current = state;
  const steps = Math.ceil(totalTime / dt);
  for (let i = 0; i < steps; i++) {
    current = rk4Step(current, env, dt);
  }
  return current;
}