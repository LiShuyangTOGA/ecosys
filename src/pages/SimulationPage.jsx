import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import ReactECharts from 'echarts-for-react';
import { computeTrophicLevels } from '../engine/formulas';

function buildHistoryData(world, speciesMeta) {
  if (!world || !world.history || !world.history.length) {
    return { times: [], seriesData: [] };
  }
  const times = world.history.map((h) => h.time);
  const seriesData = speciesMeta.map((s) => ({
    name: s.name,
    data: world.history.map((h) => {
      const sp = h.species.find((x) => x.id === s.id);
      return sp ? sp.B : null;
    }),
  }));
  return { times, seriesData };
}

// 金字塔汇总：给定物种列表、物种元数据、营养级Map，返回按营养级分组的生物量、能量、个体数
function aggregatePyramid(species, meta, tlMap) {
  const levels = {};
  species.forEach((sp) => {
    if (sp.B <= 0) return;
    const tl = Math.round(tlMap.get(sp.id) || 1);
    if (!levels[tl]) levels[tl] = { biomass: 0, energy: 0, count: 0 };
    levels[tl].biomass += sp.B;
    const m = meta.find((x) => x.id === sp.id);
    const w = m ? m.w : 1;
    const gamma = m ? m.gamma : 22;
    levels[tl].energy += sp.B * gamma;
    levels[tl].count += sp.B / w;
  });
  return levels;
}

export default function SimulationPage({ mode }) {
  const world = useStore((s) => s.world);
  const species = useStore((s) => s.species);
  const links = useStore((s) => s.links);
  const simTick = useStore((s) => s.simTick);

  const speciesMeta = useMemo(
    () =>
      species.map(({ id, name, w, gamma }) => ({
        id,
        name,
        w: w || 1,
        gamma: gamma || 22,
      })),
    [species]
  );

  const { times, seriesData } = useMemo(
    () => buildHistoryData(world, speciesMeta),
    [world, speciesMeta]
  );

  // 个体数折线图
  const populationOption = useMemo(
    () => ({
      title: { text: '个体数变化' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'value', name: '时间（天）', min: 0 },
      yAxis: { type: 'value', name: '个体数' },
      series: seriesData.map((s) => ({
        name: s.name,
        type: 'line',
        data: s.data.map((B, i) => [
          times[i],
          B ? B / (speciesMeta.find((m) => m.name === s.name)?.w || 1) : 0,
        ]),
        smooth: true,
      })),
    }),
    [times, seriesData, speciesMeta]
  );

  // 总储能折线图
  const energyOption = useMemo(
    () => ({
      title: { text: '种群总储能' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'value', name: '时间（天）', min: 0 },
      yAxis: { type: 'value', name: '能量（kJ）' },
      series: seriesData.map((s) => ({
        name: s.name,
        type: 'line',
        data: s.data.map((B, i) => [
          times[i],
          B ? B * (speciesMeta.find((m) => m.name === s.name)?.gamma || 22) : 0,
        ]),
        smooth: true,
      })),
    }),
    [times, seriesData, speciesMeta]
  );

  // 金字塔时间滑块相关
  const [pyramidTimeIdx, setPyramidTimeIdx] = useState(0);

  const pyramidData = useMemo(() => {
    if (!world || !world.history.length) return null;
    const idx = Math.min(pyramidTimeIdx, world.history.length - 1);
    const snapshot = world.history[idx];
    const speciesAtTime = snapshot.species.map((s) => ({
      ...s,
      // 需要补全 diets 和 h 才能算营养级，但计算营养级只需要 B 和 links
      // 我们用原始的 species 中的 type 等，但 B 用 snapshot 的
    }));
    // 重新构建临时物种数组用于计算营养级
    const spList = snapshot.species.map((histSp) => {
      const editorSp = species.find((e) => e.id === histSp.id) || {};
      return {
        id: histSp.id,
        name: editorSp.name || histSp.id,
        type: editorSp.type || 'consumer',
        B: histSp.B,
      };
    });
    const tlMap = computeTrophicLevels(spList, links);
    const levels = aggregatePyramid(spList, speciesMeta, tlMap);
    return { tlMap, levels, time: snapshot.time };
  }, [world, pyramidTimeIdx, species, links, speciesMeta]);

  if (!world) {
    return (
      <div style={{ padding: 40 }}>
        <h2>暂无模拟数据</h2>
        <p>请先在食物网编辑器中开始模拟。</p>
      </div>
    );
  }

  if (mode === 'pyramid') {
    if (!pyramidData) return <div>计算中...</div>;
    const levels = pyramidData.levels || {};
    const tlSorted = Object.keys(levels).sort((a, b) => a - b);
    // 构建柱状图系列
    const biomassData = tlSorted.map((tl) => levels[tl].biomass);
    const energyData = tlSorted.map((tl) => levels[tl].energy);
    const countData = tlSorted.map((tl) => levels[tl].count);
    const categories = tlSorted.map((tl) => `营养级 ${tl}`);

    const pyramidOption = {
      title: { text: `金字塔（时间: ${pyramidData.time.toFixed(0)}天）` },
      tooltip: {},
      legend: { data: ['生物量', '能量', '个体数'] },
      xAxis: { type: 'category', data: categories },
      yAxis: { type: 'value' },
      series: [
        { name: '生物量', type: 'bar', data: biomassData },
        { name: '能量', type: 'bar', data: energyData },
        { name: '个体数', type: 'bar', data: countData },
      ],
    };
    return (
      <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <ReactECharts option={pyramidOption} style={{ height: '70vh' }} notMerge={true} key={`${pyramidTimeIdx}-${simTick}`} />
        </div>
        <div style={{ padding: '10px 0' }}>
          <input
            type="range"
            min={0}
            max={world.history.length - 1}
            value={pyramidTimeIdx}
            onChange={(e) => setPyramidTimeIdx(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ textAlign: 'center' }}>
            时间：{pyramidData.time.toFixed(0)} 天
          </div>
        </div>
      </div>
    );
  }

  // 折线图渲染（个体数或总储能）
  const option = mode === 'population' ? populationOption : energyOption;
  return (
    <div style={{ padding: 20, height: '100%', background: '#fff' }}>
      <ReactECharts
        option={option}
        style={{ height: '80vh', width: '100%' }}
        notMerge={true}
        key={simTick}  // 通过 simTick 强制刷新，确保动态更新
      />
    </div>
  );
}