
# 项目结构文档

## 根目录
```

ecosys/
├── index.html
├── package.json
├── vite.config.js
├── public/
│ └── manuals/ # 说明文档（可被前端直接访问）
│ ├── user_manual.md
│ ├── theory.md
│ ├── tech-stack.md
│ └── project-structure.md
├── src/
│ ├── main.jsx # 应用入口，注册 ECharts 组件
│ ├── App.jsx # 页面路由（编辑器 / 可视化）
│ ├── App.module.css
│ ├── pages/
│ │ ├── EditorPage.jsx # 食物网编辑 + 模拟控制
│ │ ├── EditorPage.module.css
│ │ ├── SimulationPage.jsx # 动态可视化（折线图 / 金字塔）
│ │ └── SimulationPage.module.css
│ ├── components/
│ │ ├── FoodWebCanvas.jsx # React Flow 画布封装
│ │ ├── SpeciesNode.jsx # 自定义物种节点（显示实时数据）
│ │ ├── SpeciesParams.jsx # 物种参数浮窗
│ │ ├── EdgeParams.jsx # 连线参数浮窗
│ │ ├── EnvSettings.jsx # 全局环境设置浮窗
│ │ ├── SimSettings.jsx # 模拟速度/单步设置浮窗
│ │ ├── ManualPanel.jsx # 帮助文档浮窗
│ │ ├── Panel.jsx # 通用浮窗容器
│ │ └── Panel.module.css
│ ├── engine/
│ │ ├── formulas.js # 核心方程（纯函数）
│ │ ├── solver.js # RK4 数值求解器
│ │ └── world.js # 世界状态管理与步进
│ ├── data/
│ │ ├── defaultSpecies.json # 预设物种库
│ │ └── defaultEnv.json # 预设环境场景
│ ├── store/
│ │ └── useStore.js # Zustand 全局状态
│ ├── utils/
│ │ └── fileIO.js # JSON 导入/导出工具
│ └── styles/
│ └── global.css # 全局样式重置
└── manuals/ # 项目文档（源文件）
├── theory.md
├── tech-stack.md
├── project-structure.md
└── user_manual.md

```


## 核心模块职责

### engine/ - 计算引擎
- `formulas.js`：所有微分方程、异速生长关系、营养级计算等纯函数，供其他模块调用。
- `solver.js`：接收当前状态和步长，用四阶龙格‑库塔法（RK4）计算下一时间步的状态。
- `world.js`：维护模拟运行时状态（物种数组、营养池浓度、历史记录），调用 solver 推进，并对外暴露当前数据。

### data/ - 静态数据
- `defaultSpecies.json`：预设物种数组，包含名称、类型、体重、默认速率参数。
- `defaultEnv.json`：预设环境场景键值对，包含 `I`、`ε`、`KN` 等参数。

### store/ - 状态管理
- `useStore.js`：Zustand 全局 store，管理物种、连线、环境参数、模拟世界、运行模式等。

### utils/ - 工具
- `fileIO.js`：将食物网状态序列化为 JSON 并触发下载；读取用户上传的 JSON 并解析。