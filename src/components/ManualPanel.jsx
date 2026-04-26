import { useState, useEffect } from 'react';
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import Panel from './Panel';

// 导入 Katex CSS（在组件内引入一次即可）
import 'katex/dist/katex.min.css';

// 配置 marked 使用 Katex 扩展
marked.use(markedKatex({ nonStandard: true }));

const docList = [
  { key: 'user_manual', title: '用户手册', path: '/manuals/user_manual.md' },
  { key: 'theory', title: '科学手册', path: '/manuals/theory.md' },
  { key: 'tech-stack', title: '技术栈', path: '/manuals/tech-stack.md' },
  { key: 'project-structure', title: '项目结构', path: '/manuals/project-structure.md' },
];

export default function ManualPanel({ onClose }) {
  const [activeKey, setActiveKey] = useState('user_manual');
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const doc = docList.find((d) => d.key === activeKey);
    fetch(doc.path)
      .then((res) => {
        if (!res.ok) throw new Error('Load failed');
        return res.text();
      })
      .then((text) => {
        setHtml(marked.parse(text));
        setLoading(false);
      })
      .catch(() => {
        setHtml('<p style="color:red">文档加载失败，请确认文件存在于 public/manuals/ 下。</p>');
        setLoading(false);
      });
  }, [activeKey]);

  return (
    <Panel title="帮助文档" onClose={onClose} width={800}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #ddd', paddingBottom: 8 }}>
        {docList.map((doc) => (
          <button
            key={doc.key}
            onClick={() => setActiveKey(doc.key)}
            style={{
              padding: '4px 12px',
              border: 'none',
              borderRadius: 4,
              background: activeKey === doc.key ? '#0f3460' : '#f0f0f0',
              color: activeKey === doc.key ? '#fff' : '#333',
              cursor: 'pointer',
            }}
          >
            {doc.title}
          </button>
        ))}
      </div>
      <div
        style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          padding: '0 8px',
          lineHeight: 1.6,
        }}
        dangerouslySetInnerHTML={{ __html: loading ? '<p>加载中...</p>' : html }}
      />
    </Panel>
  );
}