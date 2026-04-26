import { rk4Step } from './solver';

const MIN_INDIVIDUALS = 0.5;   // 个体数低于此值视为灭绝

// 对每个物种检查 B/w，将灭绝个体的 B 设为 0
function applyExtinction(species) {
  return species.map((s) => {
    if (s.w && s.B / s.w < MIN_INDIVIDUALS) {
      return { ...s, B: 0 };
    }
    return s;
  });
}

export function createWorld(species, envParams) {
  const initSpecies = applyExtinction(
    species.map((s) => ({ ...s }))
  );
  return {
    species: initSpecies,
    N: envParams.initialN || 10.0,
    env: { ...envParams },
    time: 0,
    history: [],
    running: false,
  };
}

export function worldStep(world, dt = 0.1) {
  let newState = rk4Step(
    { species: world.species, N: world.N },
    world.env,
    dt
  );
  // 应用灭绝判定
  newState.species = applyExtinction(newState.species);
  world.species = newState.species;
  world.N = newState.N;
  world.time += dt;

  if (!world._lastRecordTime || world.time - world._lastRecordTime >= 0.9) {
    world.history.push({
      time: world.time,
      species: world.species.map((s) => ({ id: s.id, B: s.B })),
      N: world.N,
    });
    world._lastRecordTime = world.time;
  }
  return world;
}

export function resetWorld(world, initialSpecies) {
  world.species = applyExtinction(
    initialSpecies.map((s) => ({ ...s }))
  );
  world.N = world.env.initialN || 10.0;
  world.time = 0;
  world.history = [];
  world.running = false;
  return world;
}