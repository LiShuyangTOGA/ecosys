import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

export default function SpeciesNode({ data }) {
  const { name, type, B, w, isExtinct, onRemove } = data;

  const icon = type === 'producer' ? '🌿' : '🐾';
  const bgColor = isExtinct ? '#555' : type === 'producer' ? '#4caf50' : '#2196f3';

  const [extinct, setExtinct] = useState(false);
  
  useEffect(() => {
    if (isExtinct && !extinct) {
      setExtinct(true);
      const timer = setTimeout(() => setExtinct(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isExtinct]);  // eslint-disable-line

  return (
    <div
      style={{
        padding: '8px 14px',
        borderRadius: 8,
        background: isExtinct ? '#555' : bgColor,
        color: '#fff',
        border: '2px solid #fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 120,
        position: 'relative',
        animation: extinct ? 'blinker 0.5s linear 6' : 'none',
      }}
    >
      <style>{`@keyframes blinker { 50% { opacity: 0.3; } }`}</style>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{
            position: 'absolute',
            top: 2,
            right: 4,
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: 14,
            fontWeight: 'bold',
            cursor: 'pointer',
            lineHeight: 1,
            opacity: 0.7,
          }}
          title="删除物种"
        >
          ✕
        </button>
      )}
      <Handle type="target" position={Position.Top} style={{ background: '#fff' }} />
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontWeight: 'bold', fontSize: 14 }}>{name}</div>
      <div style={{ fontSize: 11 }}>
        {type === 'producer' ? `B: ${B.toFixed(1)}` : `B: ${B.toFixed(2)} · ${w}kg`}
      </div>
      {isExtinct && <div style={{ fontSize: 10, color: '#fbb' }}>已灭绝</div>}
      <Handle type="source" position={Position.Bottom} style={{ background: '#fff' }} />
    </div>
  );
}