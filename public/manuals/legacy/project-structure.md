
# 项目结构文档

## 根目录
```

ecosys/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.ico
├── src/
│   ├── main.jsx                 # 应用入口
│   ├── App.jsx                  # 路由 / 页面切换
│   ├── pages/
│   │   ├── EditorPage.jsx       # 食物网编辑与参数设置
│   │   └── SimulationPage.jsx   # 动态模拟与可视化
│   ├── components/
│   │   ├── FoodWebCanvas.jsx    # React Flow 画布封装
│   │   ├── SpeciesNode.jsx      # 自定义物种节点
│   │   ├── EdgePanel.jsx        # 连线参数面板
│   │   ├── SpeciesPanel.jsx     # 节点参数面板
│   │   ├── EnvironmentPanel.jsx # 全局环境控制面板
│   │   ├── PopulationChart.jsx  # 种群动态折线图
│   │   ├── EnergyPyramid.jsx    # 能量金字塔图
│   │   └── EnergyFlow.jsx       # 能量流桑基图（可选）
│   ├── engine/
│   │   ├── formulas.js          # 所有核心公式（纯函数）
│   │   ├── solver.js            # 数值求解器（RK4）
│   │   └── world.js             # 模拟世界状态管理与步进逻辑
│   ├── data/
│   │   ├── models.js            # 数据模型校验与默认值
│   │   ├── defaultSpecies.json  # 预设物种库
│   │   ├── defaultEnv.json      # 预设环境场景
│   │   └── reference.json       # 异速生长参考校准对
│   ├── utils/
│   │   ├── fileIO.js            # 导出 / 导入 JSON 文件
│   │   ├── autoParams.js        # 基于体型的自动参数填充
│   │   └── helpers.js           # 通用工具函数
│   └── styles/
│       └── （样式文件）
└── manuals/                     # 项目文档（本文件夹）
├── theory.md                # 理论与公式
├── tech-stack.md            # 技术栈（本文档）
├── project_design.md        # 项目规划与细节要求（最重要）
└── project-structure.md     # 项目结构

```

## 核心模块说明

### engine/ - 计算引擎
- `formulas.js`：导出所有微分方程、异速生长关系等纯函数，供其他模块调用。
- `solver.js`：接收当前状态和步长，返回下一个时间步的状态（RK4）。
- `world.js`：维护模拟运行时状态（物种、营养池、历史记录），调用 solver 推进，并对外暴露当前数据。

### data/ - 静态数据
- `defaultSpecies.json`：预设物种数组，每个物种包含名称、类型、体重、默认参数。
- `defaultEnv.json`：预设环境场景键值对，包含 I、ε、KN 等参数。
- `reference.json`：参考校准对，用于自动参数生成的基准。

### utils/ - 工具
- `fileIO.js`：将当前食物网状态序列化为 JSON 并触发下载；读取用户上传的 JSON 并解析。
- `autoParams.js`：根据用户填入的体重，调用 `formulas.js` 中的异速方程，自动填充 r、d、a、h 等。
- `helpers.js`：深拷贝、ID 生成等工具。

### 数据流
1. 编辑页操作 → 更新状态树（物种数组、连线数组、环境参数）。
2. 启动模拟 → 状态序列化传入 `world.js`，构建快速计算结构（邻接表、参数数组）。
3. 每帧调用 `solver.step()` → 更新 `world` 状态 → 推入历史数组。
4. 模拟页组件订阅 `world` 数据，驱动图表更新。
5. 暂停后可跳回编辑页，携带当前生物量覆盖初始值，参数可调后继续模拟。