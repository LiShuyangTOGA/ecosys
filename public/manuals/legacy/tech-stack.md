# 技术栈文档

## 概述
纯前端单页应用，无需后端服务，所有计算在浏览器完成。

## 构建工具与包管理
- **Vite**：快速开发服务器、热模块替换、生产构建
- **npm / pnpm**：依赖管理

## 前端框架
- **React**（或 Vue，本项目示例采用 React）
  - 组件化开发
  - Hooks 管理状态
  - 生态丰富

## 图形与交互
- **React Flow**（`reactflow`）：绘制食物网有向图
  - 拖拽节点、自定义节点外观
  - 连线交互、侧边面板
- **ECharts** 或 **Chart.js**
  - 种群动态折线图
  - 能量金字塔（柱状图）
  - 能量流桑基图

## 计算引擎
- **自研纯 JavaScript 模块**
  - 公式函数 `formulas.js`
  - 数值求解器 `solver.js`（RK4 或欧拉法）
  - 世界状态管理 `world.js`

## 数据处理
- **JSON**：食物网配置、预设物种、环境场景均用 JSON 存储
- **File API**：
  - `FileReader` 读取上传的 JSON 文件
  - `Blob` + `URL.createObjectURL` 触发下载

## 样式
- **CSS Modules** 或 **Tailwind CSS**（任选，不影响架构）

## 测试（可选）
- **Vitest** 或 **Jest**：对公式模块进行单元测试