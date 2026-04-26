import { useState } from 'react';

export default function SimSettings({
  speedMultiplier,
  singleStepMode,
  onSave,
  onCancel,
  onStepOnce,
  onReset,
  isRunning,
}) {
  const [speed, setSpeed] = useState(String(speedMultiplier ?? 1));
  const [single, setSingle] = useState(singleStepMode ?? false);

  const handleSave = () => {
    onSave({ speedMultiplier: Number(speed), singleStepMode: single });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ minWidth: 100 }}>模拟速度：</span>
        <select value={speed} onChange={(e) => setSpeed(e.target.value)} style={{ flex: 1 }}>
          <option value="1">1x</option>
          <option value="2">2x</option>
          <option value="5">5x</option>
          <option value="10">10x</option>
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ minWidth: 100 }}>单步模式：</span>
        <input type="checkbox" checked={single} onChange={(e) => setSingle(e.target.checked)} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onStepOnce} disabled={!isRunning}>单步推进</button>
        <button onClick={onReset}>重置模拟</button>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
        <button onClick={onCancel}>取消</button>
        <button onClick={handleSave}>确定</button>
      </div>
    </div>
  );
}