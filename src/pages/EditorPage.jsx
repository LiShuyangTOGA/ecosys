import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import FoodWebCanvas from '../components/FoodWebCanvas';
import Panel from '../components/Panel';
import SpeciesParams from '../components/SpeciesParams';
import EdgeParams from '../components/EdgeParams';
import EnvSettings from '../components/EnvSettings';
import SimSettings from '../components/SimSettings';
import ManualPanel from '../components/ManualPanel';
import defaultSpeciesData from '../data/defaultSpecies.json';
import { exportFoodWeb, importFoodWeb } from '../utils/fileIO';
import styles from './EditorPage.module.css';

const presetCategories = [
  { key: 'producer', label: '生产者', icon: '🌿' },
  { key: 'herbivore', label: '草食动物', icon: '🐰' },
  { key: 'carnivore', label: '肉食动物', icon: '🦊' },
  { key: 'omnivore', label: '杂食动物', icon: '🐻' },
  { key: 'custom', label: '自定义', icon: '➕' },
];

const presetsByCategory = (category) => {
  switch (category) {
    case 'producer':
      return defaultSpeciesData.presets.filter((p) => p.type === 'producer');
    case 'herbivore':
      return defaultSpeciesData.presets.filter((p) => p.type === 'consumer' && p.w <= 0.1);
    case 'carnivore':
      return defaultSpeciesData.presets.filter((p) => p.type === 'consumer' && p.w > 0.1 && p.w <= 10);
    case 'omnivore':
      return defaultSpeciesData.presets.filter((p) => p.type === 'consumer' && p.w > 10);
    default:
      return [];
  }
};

export default function EditorPage() {
  // ========== 文件上传引用 ==========
  const fileInputRef = useRef(null);

  // 从 store 获取状态与方法
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const startSimulation = useStore((s) => s.startSimulation);
  const pauseSimulation = useStore((s) => s.pauseSimulation);
  const currentTool = useStore((s) => s.currentTool);
  const setCurrentTool = useStore((s) => s.setCurrentTool);
  const addSpecies = useStore((s) => s.addSpecies);
  const species = useStore((s) => s.species);
  const links = useStore((s) => s.links);
  const updateSpecies = useStore((s) => s.updateSpecies);
  const updateLink = useStore((s) => s.updateLink);
  const removeLink = useStore((s) => s.removeLink);
  const envParams = useStore((s) => s.envParams);
  const setEnvParams = useStore((s) => s.setEnvParams);
  const world = useStore((s) => s.world);
  const stepSimulation = useStore((s) => s.stepSimulation);
  const speedMultiplier = useStore((s) => s.speedMultiplier);
  const singleStepMode = useStore((s) => s.singleStepMode);
  const stepOnce = useStore((s) => s.stepOnce);
  const resetSimulation = useStore((s) => s.resetSimulation);
  const setSpeed = useStore((s) => s.setSpeed);
  const setSingleStepMode = useStore((s) => s.setSingleStepMode);

  // 所有 useState 必须在这里（组件内部）
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [showGlobal, setShowGlobal] = useState(false);
  const [showSimSettings, setShowSimSettings] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [deleteEdgeId, setDeleteEdgeId] = useState(null);

  const selectedSpecies = species.find((s) => s.id === selectedNodeId);
  const selectedLink = links.find((l) => l.id === selectedEdgeId);

  // 模拟主循环（非单步模式下自动步进）
  useEffect(() => {
    if (!world || !world.running) return;
    if (singleStepMode) return;

    const baseSteps = 5;
    const baseInterval = 100;
    const steps = baseSteps * speedMultiplier;
    const interval = baseInterval / speedMultiplier;

    const timer = setInterval(() => {
      stepSimulation(steps, 0.1);
    }, interval);

    return () => clearInterval(timer);
  }, [world?.running, speedMultiplier, singleStepMode, stepSimulation]);

  // ========== 导出功能 ==========
  const handleExport = () => {
    const data = {
      species: species.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        w: s.w,
        r: s.r,
        d: s.d,
        e: s.e,
        gamma: s.gamma,
        c: s.c,
        initialBiomass: s.initialBiomass ?? s.B,
        autoMode: s.autoMode,
        position: s.position,
      })),
      links: links.map((l) => ({
        source: l.source,
        target: l.target,
        a: l.a,
        h: l.h,
      })),
      envParams: envParams,
    };
    exportFoodWeb(data);
  };

  // ========== 触发文件选择 ==========
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // ========== 处理上传文件 ==========
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importFoodWeb(file);
      useStore.setState({
        species: data.species.map((s) => ({
          ...s,
          B: s.initialBiomass ?? s.B ?? 10,
          position: s.position || { x: Math.random() * 400, y: Math.random() * 300 },
          id: s.id || crypto.randomUUID(),
        })),
        links: data.links.map((l) => ({
          ...l,
          id: l.id || crypto.randomUUID(),
        })),
        envParams: data.envParams,
        world: null,
        simTick: 0,
        mode: 'edit',
        singleStepMode: false,
        speedMultiplier: 1,
      });
    } catch (err) {
      alert('导入失败：' + err.message);
    }
    e.target.value = '';
  };

  // ========== 添加预设或自定义物种 ==========
  const handleAddPreset = (preset) => {
    addSpecies({
      ...preset,
      B: preset.initialBiomass ?? 10,
      autoMode: true,
    });
  };

  // 开始/暂停
  const toggleMode = () => {
    if (mode === 'edit') {
      startSimulation();
    } else {
      pauseSimulation();
    }
  };

  const handleNodeSelect = (nodeId) => {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
  };
  const handleEdgeSelect = (edgeId) => {
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
  };
  const handleEdgeDeleteRequest = (edgeId) => {
    setDeleteEdgeId(edgeId);
  };
  const confirmDeleteEdge = () => {
    if (deleteEdgeId) {
      removeLink(deleteEdgeId);
      setDeleteEdgeId(null);
    }
  };

  // ========== 调参保存（立即生效） ==========
  const saveSpeciesParams = (params) => {
    if (selectedNodeId) {
      if (mode === 'edit' && params.initialBiomass !== undefined) {
        params.B = params.initialBiomass;
      }
      updateSpecies(selectedNodeId, params);
      setSelectedNodeId(null);
    }
  };

  const saveEdgeParams = (params) => {
    if (selectedEdgeId) {
      updateLink(selectedEdgeId, params);
      setSelectedEdgeId(null);
    }
  };

  const saveEnvParams = (params) => {
    setEnvParams(params);
    setShowGlobal(false);
  };

  const saveSimSettings = (settings) => {
    if (settings.speedMultiplier !== undefined) setSpeed(settings.speedMultiplier);
    if (settings.singleStepMode !== undefined) setSingleStepMode(settings.singleStepMode);
    setShowSimSettings(false);
  };

  return (
    <div className={styles.editorContainer}>
      {/* 左上角按钮 */}
      <div className={styles.topLeft}>
        <button className={styles.iconBtn} onClick={() => setShowManual(true)} title="说明文档">📘</button>
        <button className={styles.iconBtn} onClick={handleExport} title="保存食物网">💾</button>
        <button className={styles.iconBtn} onClick={handleImportClick} title="上传食物网">📂</button>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* 右上角模拟控制 */}
      <div className={styles.topRight}>
        <div className={styles.simTime}>
          {world ? `${world.time.toFixed(0)} 天` : '0 天'}
        </div>
        <button className={styles.iconBtn} onClick={() => setShowSimSettings(true)} title="模拟设置">⚙️</button>
        <button className={styles.iconBtn} onClick={toggleMode} title={mode === 'edit' ? '开始模拟' : '暂停模拟'}>
          {mode === 'edit' ? '▶️' : '⏸️'}
        </button>
      </div>

      {/* 右侧工具栏 */}
      <div className={styles.toolbar}>
        <button
          className={currentTool === 'edit' ? styles.activeTool : styles.toolBtn}
          onClick={() => setCurrentTool('edit')}
          title="调参"
        >
          ✏️
        </button>
        <button
          className={currentTool === 'arrow' ? styles.activeTool : styles.toolBtn}
          onClick={() => setCurrentTool('arrow')}
          title="连线"
        >
          ➡️
        </button>
      </div>

      {/* 画布 */}
      <FoodWebCanvas
        onNodeSelect={handleNodeSelect}
        onEdgeSelect={handleEdgeSelect}
        onEdgeDeleteRequest={handleEdgeDeleteRequest}
      />

      {/* 底部预设生物栏 */}
      <div className={styles.presetArea}>
        {selectedCategory && (
          <div className={styles.presetList}>
            {presetsByCategory(selectedCategory).map((p, idx) => (
              <button key={idx} className={styles.presetItem} onClick={() => handleAddPreset(p)}>
                {p.type === 'producer' ? '🌿' : '🐾'} {p.name}
              </button>
            ))}
            {selectedCategory === 'custom' && (
              <button
                className={styles.presetItem}
                onClick={() =>
                  addSpecies({
                    name: '新物种',
                    type: 'consumer',
                    w: 1,
                    d: 0.01,
                    e: 0.1,
                    gamma: 22,
                    h: 0.2,
                    c: 0.0001,
                    initialBiomass: 10,
                    autoMode: true,
                    B: 10,
                  })
                }
              >
                ➕ 新建空白
              </button>
            )}
          </div>
        )}
        <div className={styles.categoryBar}>
          {presetCategories.map((cat) => (
            <button
              key={cat.key}
              className={selectedCategory === cat.key ? styles.activeCat : styles.catBtn}
              onClick={() => setSelectedCategory(selectedCategory === cat.key ? null : cat.key)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 右下角全局环境按钮 */}
      <div className={styles.globalBtn}>
        <button className={styles.iconBtn} onClick={() => setShowGlobal(true)} title="全局环境设置">
          🌍
        </button>
      </div>

      {/* ===== 各种浮窗 ===== */}
      {selectedNodeId && selectedSpecies && (
        <Panel title={`编辑物种：${selectedSpecies.name}`} onClose={() => setSelectedNodeId(null)} width={420}>
          <SpeciesParams
            species={selectedSpecies}
            onSave={saveSpeciesParams}
            onCancel={() => setSelectedNodeId(null)}
          />
        </Panel>
      )}

      {selectedEdgeId && selectedLink && (
        <Panel title="编辑捕食关系" onClose={() => setSelectedEdgeId(null)} width={360}>
          <EdgeParams
            link={selectedLink}
            onSave={saveEdgeParams}
            onCancel={() => setSelectedEdgeId(null)}
          />
        </Panel>
      )}

      {deleteEdgeId && (
        <div className={styles.deleteConfirm}>
          <div className={styles.confirmBox}>
            <p>确认删除这条捕食关系？</p>
            <div className={styles.confirmActions}>
              <button onClick={confirmDeleteEdge}>确认</button>
              <button onClick={() => setDeleteEdgeId(null)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {showGlobal && (
        <Panel title="全局环境设置" onClose={() => setShowGlobal(false)} width={480}>
          <EnvSettings
            currentEnv={envParams}
            onSave={saveEnvParams}
            onCancel={() => setShowGlobal(false)}
          />
        </Panel>
      )}

      {showSimSettings && (
        <Panel title="模拟设置" onClose={() => setShowSimSettings(false)} width={340}>
          <SimSettings
            speedMultiplier={speedMultiplier}
            singleStepMode={singleStepMode}
            onSave={saveSimSettings}
            onCancel={() => setShowSimSettings(false)}
            onStepOnce={stepOnce}
            onReset={resetSimulation}
            isRunning={mode === 'run'}
          />
        </Panel>
      )}

      {showManual && (
        <ManualPanel onClose={() => setShowManual(false)} />
      )}
    </div>
  );
}