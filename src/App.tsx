import React from 'react'
import { ConfigProvider, Layout } from 'antd'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom"
import './App.css';
import './common/style/page-base.css'
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/lib/locale/zh_CN';

import Sider from './components/Sider/Sider'
import Header from './components/Header/Header'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Layout className="layout-wrap">
        <Sider></Sider>
        <Layout>
          <Header></Header>
          <Layout.Content>
            <Router>

            </Router>
          </Layout.Content>
        </Layout>
        </Layout>
    </ConfigProvider>
  );
}

export default App;
