/**
 * 生态系统模拟器 - 核心方程
 * 所有函数均为纯函数，不产生副作用
 */

// ==================== 基本功能反应 ====================

/**
 * 多猎物 II 型功能反应的分母
 * @param {number} h - 捕食者的处理时间
 * @param {Array<{a: number, B: number}>} preys - 各猎物的攻击率和当前生物量
 * @returns {number} 分母值
 */
export function functionalResponseDenom(h, preys) {
  let sum = 1.0;
  for (const prey of preys) {
    sum += prey.a * h * prey.B;
  }
  return sum;
}

/**
 * 单条捕食链路的摄入率（生物量/天）
 */
export function ingestionRate(a, B_prey, B_pred, denom) {
  return (a * B_prey * B_pred) / denom;
}

// ==================== 生长项 ====================

/**
 * 生产者生长率 (Monod 营养摄取)
 */
export function producerGrowth(B, r, N, KN) {
  return r * B * (N / (KN + N));
}

/**
 * 消费者净增长率（原有，新逻辑中已内联到 computeDerivatives，保留备用）
 */
export function consumerGrowth(B, e, totalIntakeBiomass, d) {
  return B * (e * totalIntakeBiomass - d);
}

// ==================== 导数计算 ====================

/**
 * 计算整个系统的导数
 * @param {Object} state - 当前状态 { species: Array, N: number }
 * @param {Object} env - 环境参数 { I, epsilon, KN }
 * @returns {{ dB: number[], dN: number }}
 */
export function computeDerivatives(state, env) {
  const { species, N } = state;
  const { I, epsilon, KN } = env;
  const n = species.length;

  const dB = new Array(n).fill(0);
  let dN = I; // 外源输入

  // 预计算每个物种的被捕食损失和摄入收益
  // 先构建邻接表：每个捕食者的猎物列表
  const predatorPreys = new Map(); // key: 捕食者 index, value: [{ preyIdx, a }]
  for (let i = 0; i < n; i++) {
    const sp = species[i];
    if (sp.type === 'consumer' && sp.diets) {
      for (const diet of sp.diets) {
        const preyIdx = species.findIndex((s) => s.id === diet.preyId);
        if (preyIdx === -1) continue;
        if (!predatorPreys.has(i)) predatorPreys.set(i, []);
        predatorPreys.get(i).push({ preyIdx, a: diet.a });
      }
    }
  }

  // 计算每个捕食者的功能反应分母和摄入率
  const predDenoms = new Map();
  const predTotalIntake = new Map();

  for (const [predIdx, preys] of predatorPreys.entries()) {
    const h = species[predIdx].h;
    const preyData = preys.map((p) => ({ a: p.a, B: species[p.preyIdx].B }));
    const denom = functionalResponseDenom(h, preyData);
    predDenoms.set(predIdx, denom);

    let total = 0;
    for (const p of preys) {
      const intake = ingestionRate(p.a, species[p.preyIdx].B, species[predIdx].B, denom);
      total += intake;
    }
    predTotalIntake.set(predIdx, total);
  }

  // 计算每个物种的 dB/dt
  for (let i = 0; i < n; i++) {
    const sp = species[i];

    if (sp.type === 'producer') {
      // 生长项
      const growth = producerGrowth(sp.B, sp.r, N, KN);
      dB[i] += growth;
      // 营养吸收（从 N 中扣除）
      dN -= growth;
    }

    // 被捕食损失：找到所有以 i 为猎物的捕食者
    for (const [predIdx, preys] of predatorPreys.entries()) {
      const preyEntry = preys.find((p) => p.preyIdx === i);
      if (preyEntry) {
        const denom = predDenoms.get(predIdx);
        const loss = ingestionRate(preyEntry.a, sp.B, species[predIdx].B, denom);
        dB[i] -= loss;
      }
    }

    if (sp.type === 'consumer') {
      // 获取总摄入
      const totalIntake = predTotalIntake.get(i) || 0;
      // 摄入转化为自身增长：e * totalIntake
      const growthFromIntake = sp.e * totalIntake;
      // 自然死亡项：d * B
      const naturalDeath = sp.d * sp.B;
      // 密度制约项：c * B^2（如果未定义 c 则默认为 0）
      const densityDependent = (sp.c || 0) * sp.B * sp.B;
      
      dB[i] += growthFromIntake - naturalDeath - densityDependent;

      // 未同化部分返回营养池
      const unassimilated = totalIntake * (1 - sp.e);
      dN += unassimilated;
    }

    // 自然死亡返还营养（所有物种）
    dN += epsilon * sp.d * sp.B;
  }

  return { dB, dN };
}

// ==================== 异速生长自动参数 ====================

/**
 * 根据体重估算内禀增长率 (仅生产者)
 * @param {number} w - 成年个体体重 (kg)
 * @param {number} r0 - 参考常数 (默认 0.03)
 */
export function estimateR(w, r0 = 0.03) {
  return r0 * Math.pow(w, -0.25);
}

/**
 * 根据体重估算自然死亡率
 * @param {number} w - 成年个体体重 (kg)
 * @param {number} d0 - 参考常数 (默认 0.004)
 */
export function estimateD(w, d0 = 0.004) {
  return d0 * Math.pow(w, -0.25);
}

/**
 * 估算攻击率 (基于体长比 R = wPred / wPrey)
 * @param {number} wPred - 捕食者体重
 * @param {number} wPrey - 猎物体重
 * @param {number} a0 - 参考常数
 * @param {number} Ropt - 最优体长比 (默认 30)
 */
export function estimateA(wPred, wPrey, a0 = 0.5, Ropt = 30) {
  const R = wPred / wPrey;
  return a0 * R * Math.exp(-R / Ropt);
}

/**
 * 估算处理时间
 * @param {number} wPred - 捕食者体重
 * @param {number} wPrey - 猎物体重
 * @param {number} h0 - 参考常数 (默认 0.2)
 */
export function estimateH(wPred, wPrey, h0 = 0.2) {
  return h0 * Math.pow(wPred, -0.94) * Math.pow(wPrey, 0.83);
}

/**
 * 估算密度制约系数 (种内竞争强度)
 * @param {number} w - 体重 (kg)
 * @param {number} c0 - 参考常数 (默认 0.0005)
 */
export function estimateC(w, c0 = 0.0005) {
  return c0 * Math.pow(w, -0.25);
}

// ==================== 观测衍生量 ====================

/**
 * 个体数
 */
export function populationSize(B, w) {
  return w > 0 ? B / w : 0;
}

/**
 * 种群总储能
 */
export function totalEnergy(B, gamma) {
  return B * gamma;
}

/**
 * 能量流动速率
 */
export function energyFlowRate(a, B_prey, B_pred, denom, gamma_prey) {
  const intake = ingestionRate(a, B_prey, B_pred, denom);
  return intake * gamma_prey;
}

/**
 * 计算当前时刻所有食物网连线的能量流动速率
 * @param {Array} species - 当前物种数组（含 B, w, gamma, diets 等）
 * @param {Array} links - 连线数组（含 source, target, a, h）
 * @returns {Array<{sourceId, targetId, value}>} 能量流列表
 */
export function computeEnergyFlows(species, links) {
  const flows = [];
  const spMap = {};
  species.forEach((s) => {
    spMap[s.id] = s;
  });

  links.forEach((link) => {
    const prey = spMap[link.source];
    const pred = spMap[link.target];
    if (!prey || !pred || prey.B <= 0 || pred.B <= 0) return;

    // 计算该捕食者的功能反应分母
    const preysOfPred = links
      .filter((l) => l.target === link.target)
      .map((l) => ({
        a: l.a,
        B: spMap[l.source]?.B ?? 0,
      }));
    let denom = 1;
    preysOfPred.forEach((p) => {
      denom += p.a * link.h * p.B;
    });

    const intake = (link.a * prey.B * pred.B) / denom;
    const energy = intake * (prey.gamma || 22);
    if (energy > 0.001) {
      flows.push({
        sourceId: link.source,
        targetId: link.target,
        value: energy,
      });
    }
  });
  return flows;
}

/**
 * 根据当前物种列表计算有效营养级（需要迭代至收敛）
 * @param {Array} species - 含 diets 和 B
 * @param {Array} links - 原始连线（用于查找 attack rate 和 h）
 * @returns {Map} 每个物种 id 对应的营养级
 */
export function computeTrophicLevels(species, links) {
  const TL = new Map();
  // 初始化生产者营养级为1
  species.forEach((s) => {
    if (s.type === 'producer') {
      TL.set(s.id, 1);
    } else {
      TL.set(s.id, 2);
    }
  });

  for (let iter = 0; iter < 20; iter++) {
    let changed = false;
    species.forEach((s) => {
      if (s.type === 'producer') return;
      const diets = links.filter((l) => l.target === s.id);
      if (diets.length === 0) return;
      let weightedSum = 0;
      let totalIntake = 0;
      diets.forEach((d) => {
        const prey = species.find((p) => p.id === d.source);
        if (!prey || prey.B <= 0) return;
        const denom = 1 + diets.reduce((sum, d2) => {
          const p2 = species.find((p) => p.id === d2.source);
          return sum + d2.a * (d2.h || 0.2) * (p2 ? p2.B : 0);
        }, 0);
        const intake = (d.a * prey.B * s.B) / denom;
        weightedSum += intake * (TL.get(prey.id) || 1);
        totalIntake += intake;
      });
      if (totalIntake > 0) {
        const newTL = 1 + weightedSum / totalIntake;
        if (Math.abs(newTL - (TL.get(s.id) || 2)) > 0.001) {
          TL.set(s.id, newTL);
          changed = true;
        }
      }
    });
    if (!changed) break;
  }
  return TL;
}