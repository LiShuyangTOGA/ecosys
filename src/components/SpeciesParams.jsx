import { useState } from 'react';
import { estimateR, estimateD, estimateC } from '../engine/formulas';

export default function SpeciesParams({ species, onSave, onCancel }) {
  const [name, setName] = useState(species.name);
  const [autoMode, setAutoMode] = useState(species.autoMode !== false);
  const [w, setW] = useState(species.w);
  const [initialB, setInitialB] = useState(species.initialBiomass ?? species.B);
  const [r, setR] = useState(species.r ?? 0);
  const [d, setD] = useState(species.d ?? 0.01);
  const [e, setE] = useState(species.e ?? 0.1);
  const [gamma, setGamma] = useState(species.gamma ?? 22);
  const [c, setC] = useState(species.c ?? 0);

  const autoR = autoMode ? estimateR(w).toFixed(4) : null;
  const autoD = autoMode ? estimateD(w).toFixed(4) : null;
  const autoC = autoMode ? estimateC(w).toFixed(6) : null;

  const handleSave = () => {
    const params = {
      name,
      autoMode,
      w,
      initialBiomass: initialB,
      d: autoMode ? Number(autoD) : d,
      gamma,
    };
    if (species.type === 'producer') {
      params.r = autoMode ? Number(autoR) : r;
    } else {
      params.e = e;
      params.c = autoMode ? Number(autoC) : c;
    }
    onSave(params);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ minWidth: 100 }}>名称：</span>
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ minWidth: 100 }}>自动调参：</span>
        <input type="checkbox" checked={autoMode} onChange={(e) => setAutoMode(e.target.checked)} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ minWidth: 100 }}>体重 (kg)：</span>
        <input type="number" step="any" value={w} onChange={(e) => setW(Number(e.target.value))} style={{ flex: 1 }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ minWidth: 100 }}>初始生物量：</span>
        <input type="number" step="any" value={initialB} onChange={(e) => setInitialB(Number(e.target.value))} style={{ flex: 1 }} />
      </div>

      {species.type === 'producer' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ minWidth: 100 }}>内禀增长率 r：</span>
          {autoMode ? (
            <span>{autoR} (自动)</span>
          ) : (
            <input type="number" step="any" value={r} onChange={(e) => setR(Number(e.target.value))} style={{ flex: 1 }} />
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ minWidth: 100 }}>自然死亡率 d：</span>
        {autoMode ? (
          <span>{autoD} (自动)</span>
        ) : (
          <input type="number" step="any" value={d} onChange={(e) => setD(Number(e.target.value))} style={{ flex: 1 }} />
        )}
      </div>

      {species.type === 'consumer' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ minWidth: 100 }}>转化效率 e：</span>
            <input type="number" step="any" value={e} onChange={(e) => setE(Number(e.target.value))} style={{ flex: 1 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ minWidth: 100 }}>种内竞争 c：</span>
            {autoMode ? (
              <span>{autoC} (自动)</span>
            ) : (
              <input type="number" step="0.0001" value={c} onChange={(e) => setC(Number(e.target.value))} style={{ flex: 1 }} />
            )}
          </div>
        </>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ minWidth: 100 }}>能量密度 γ：</span>
        <input type="number" step="any" value={gamma} onChange={(e) => setGamma(Number(e.target.value))} style={{ flex: 1 }} />
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
        <button onClick={onCancel}>取消</button>
        <button onClick={handleSave}>确定</button>
      </div>
    </div>
  );
}