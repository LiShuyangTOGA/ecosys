import { useState } from 'react';
import defaultEnvData from '../data/defaultEnv.json';

export default function EnvSettings({ currentEnv, onSave, onCancel }) {
  const [scene, setScene] = useState('');
  const [I, setI] = useState(currentEnv.I);
  const [epsilon, setEpsilon] = useState(currentEnv.epsilon);
  const [KN, setKN] = useState(currentEnv.KN);
  const [initialN, setInitialN] = useState(currentEnv.initialN || 10);
  const [seasonAmp, setSeasonAmp] = useState(currentEnv.seasonAmplitude || 0);

  const handleSceneChange = (e) => {
    const key = e.target.value;
    if (!key) return;
    setScene(key);
    const preset = defaultEnvData.scenes[key];
    if (preset) {
      setI(preset.I);
      setEpsilon(preset.epsilon);
      setKN(preset.KN);
      setInitialN(preset.initialN || 10);
      setSeasonAmp(preset.seasonAmplitude || 0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ minWidth: 100 }}>场景预设：</span>
        <select value={scene} onChange={handleSceneChange} style={{ flex: 1 }}>
          <option value="">-- 请选择 --</option>
          {Object.keys(defaultEnvData.scenes).map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>

      {[
        { label: '外源输入 I', value: I, setter: setI, step: 0.1 },
        { label: '分解速率 ε', value: epsilon, setter: setEpsilon, step: 0.01 },
        { label: '半饱和浓度 K_N', value: KN, setter: setKN, step: 0.1 },
        { label: '初始营养 N', value: initialN, setter: setInitialN, step: 0.1 },
        { label: '季节波动幅度', value: seasonAmp, setter: setSeasonAmp, step: 0.01 },
      ].map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ minWidth: 120 }}>{item.label}：</span>
          <input
            type="number"
            step={item.step}
            value={item.value}
            onChange={(e) => item.setter(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </div>
      ))}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
        <button onClick={onCancel}>取消</button>
        <button onClick={() => onSave({ I, epsilon, KN, initialN, seasonAmplitude: seasonAmp })}>确定</button>
      </div>
    </div>
  );
}