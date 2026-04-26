import { useState } from 'react';

export default function EdgeParams({ link, onSave, onCancel }) {
  const [a, setA] = useState(link?.a ?? 0.3);
  const [h, setH] = useState(link?.h ?? 0.2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ minWidth: 100 }}>攻击率 a：</span>
        <input
          type="number"
          step="0.01"
          value={a}
          onChange={(e) => setA(Number(e.target.value))}
          style={{ flex: 1 }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ minWidth: 100 }}>处理时间 h：</span>
        <input
          type="number"
          step="0.01"
          value={h}
          onChange={(e) => setH(Number(e.target.value))}
          style={{ flex: 1 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
        <button onClick={onCancel}>取消</button>
        <button onClick={() => onSave({ a, h })}>确定</button>
      </div>
    </div>
  );
}