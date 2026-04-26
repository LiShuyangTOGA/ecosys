import React from 'react';
import ReactDOM from 'react-dom/client';
import 'reactflow/dist/style.css';
import './styles/global.css';
import App from './App';
import * as echarts from 'echarts/core';
import { SankeyChart } from 'echarts/charts';
import { TooltipComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必要的组件
echarts.use([TooltipComponent, TitleComponent, SankeyChart, CanvasRenderer]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);