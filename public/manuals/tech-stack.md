# 技术栈文档

## 概述
本项目是一个纯前端的生态系统模拟网页应用，无需后端服务器，所有计算和渲染均在用户浏览器中完成。

## 核心框架与工具

| 类别 | 技术 | 用途 |
|------|------|------|
| **构建工具** | Vite 5 | 开发服务器、热更新、生产构建 |
| **UI 框架** | React 18 | 组件化界面开发 |
| **状态管理** | Zustand | 轻量全局状态管理，无模板代码 |
| **食物网编辑器** | React Flow (reactflow) | 可拖拽节点、连线、自定义节点面板 |
| **数据可视化** | ECharts + echarts-for-react | 折线图、柱状图（金字塔） |
| **数学计算** | 纯 JavaScript 模块 | 微分方程求解、异速生长自动参数 |
| **数值求解** | 四阶龙格‑库塔法 (RK4) | 常微分方程组时间积分 |
| **数据持久化** | JSON + File API / Blob | 导出/导入食物网配置文件 |
| **样式** | CSS Modules | 组件级样式隔离，Vite 原生支持 |
| **Markdown 渲染** | marked + marked-katex-extension | 帮助文档富文本及公式展示 |
| **数学公式** | KaTeX | LaTeX 数学公式渲染 |
| **包管理** | npm | 依赖管理与脚本 |

## 关键依赖版本
- `react`: ^18.3.1
- `react-dom`: ^18.3.1
- `zustand`: ^4.5.4
- `reactflow`: ^11.11.4
- `echarts`: ^5.5.1
- `echarts-for-react`: ^3.0.2
- `marked`: ^（最新）
- `marked-katex-extension`: ^（最新）
- `katex`: ^0.16.0
- `vite`: ^5.4.0
- `@vitejs/plugin-react`: ^4.3.1

## 部署
项目构建后为纯静态文件，可部署到任何静态托管服务，如 Cloudflare Pages、GitHub Pages、Vercel 等。