import React from 'react'
import { ConfigProvider } from 'antd'
import { BrowserRouter as Router } from 'react-router-dom'
import { renderRoutes } from "react-router-config"

import './App.css';
import './common/style/page-base.css'
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/lib/locale/zh_CN';

import routes from './route/route'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        {renderRoutes(routes)}
      </Router>
    </ConfigProvider>
  );
}

export default App;
