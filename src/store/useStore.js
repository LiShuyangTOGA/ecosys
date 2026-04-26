import { create } from 'zustand';
import { createWorld, worldStep, resetWorld } from '../engine/world';
import defaultEnvData from '../data/defaultEnv.json';

const defaultEnv = { ...defaultEnvData.scenes['温带草原'] };

export const useStore = create((set, get) => ({
  mode: 'edit',
  currentTool: 'arrow',
  simTick: 0,

  // 模拟控制
  speedMultiplier: 1,            // 1x, 2x, 5x, 10x
  singleStepMode: false,         // 单步模式开关

  species: [],
  links: [],
  envParams: { ...defaultEnv },
  world: null,

  setMode: (mode) => set({ mode }),
  setCurrentTool: (tool) => set({ currentTool: tool }),

  // 物种
  addSpecies: (species) =>
    set((state) => ({
      species: [
        ...state.species,
        {
          ...species,
          id: crypto.randomUUID(),
          B: species.initialBiomass ?? species.B ?? 10,   // 初始生物量
          position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 50 },
        },
      ],
    })),

  removeSpecies: (id) =>
    set((state) => ({
      species: state.species.filter((s) => s.id !== id),
      links: state.links.filter((l) => l.source !== id && l.target !== id),
    })),

  updateSpecies: (id, updates) =>
    set((state) => ({
      species: state.species.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),

  // 连线
  addLink: (source, target) =>
    set((state) => {
      if (state.links.find((l) => l.source === source && l.target === target)) return state;
      const targetSp = state.species.find((s) => s.id === target);
      const h = targetSp?.h || 0.2;
      return {
        links: [
          ...state.links,
          { id: crypto.randomUUID(), source, target, a: 0.3, h },
        ],
      };
    }),

  removeLink: (id) =>
    set((state) => ({
      links: state.links.filter((l) => l.id !== id),
    })),

  updateLink: (id, updates) =>
    set((state) => ({
      links: state.links.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),

  // 环境
  setEnvParams: (params) =>
    set((state) => ({ envParams: { ...state.envParams, ...params } })),
  applyEnvScene: (sceneName) => {
    const scene = defaultEnvData.scenes[sceneName];
    if (scene) set({ envParams: { ...scene } });
  },

  // 模拟控制
  setSpeed: (multi) => set({ speedMultiplier: multi }),
  setSingleStepMode: (on) => set({ singleStepMode: on }),
  stepOnce: () => {
    const { world, stepSimulation } = get();
    if (world && world.running) {
      stepSimulation(5, 0.1);   // 单步推进 0.5 天
    }
  },

  // 启动模拟
  startSimulation: () => {
    const { species, links, envParams } = get();
    const speciesWithDiets = species.map((s) => {
      if (s.type === 'producer') return { ...s, diets: [] };
      const diets = links
        .filter((l) => l.target === s.id)
        .map((l) => ({ preyId: l.source, a: l.a }));
      const hLink = links.find((l) => l.target === s.id);
      const h = hLink ? hLink.h : s.h || 0.2;
      return { ...s, diets, h };
    });
    const world = createWorld(speciesWithDiets, envParams);
    world.running = true;
    set({ world, mode: 'run', simTick: 0 });
  },

  // 步进（由模拟循环调用）
  stepSimulation: (steps = 1, dt = 0.1) => {
    const world = get().world;
    if (!world || !world.running) return;
    for (let i = 0; i < steps; i++) {
      worldStep(world, dt);
    }
    set({ world: { ...world }, simTick: get().simTick + 1 });
  },

  // 暂停模拟（同步当前生物量回编辑器）
  pauseSimulation: () => {
    const { world, species } = get();
    if (world) {
      world.running = false;
      // 将 world 中的 B 写回编辑器物种
      const updatedSpecies = species.map((s) => {
        const ws = world.species.find((w) => w.id === s.id);
        if (ws) {
          return { ...s, B: ws.B };
        }
        return s;
      });
      // 同时更新 nutrients（如果有 N 状态要保存）
      const updatedEnv = { ...get().envParams, initialN: world.N };
      set({
        world: { ...world },
        species: updatedSpecies,
        envParams: updatedEnv,
        mode: 'edit',
      });
    } else {
      set({ mode: 'edit' });
    }
  },

  // 重置模拟（清空历史，恢复初始编辑器物种）
  resetSimulation: () => {
    const { species, envParams } = get();
    const initialSpecies = species.map((s) => ({ ...s, B: s.initialBiomass ?? s.B ?? 10 }));
    set({
      species: initialSpecies,
      envParams: { ...envParams, initialN: envParams.initialN ?? defaultEnv.initialN },
      world: null,
      simTick: 0,
      mode: 'edit',
      singleStepMode: false,
      speedMultiplier: 1,
    });
  },
}));