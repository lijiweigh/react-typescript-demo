import React from 'react'
import { Layout, Menu } from 'antd'
import './Sider.scss'

const { SubMenu } = Menu

export default class Sider extends React.Component {

  render() {
    return (
      <Layout.Sider
        className="layout-sider"
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          background: '#273352'
        }}
        width="256"
      >
        <Menu
          defaultSelectedKeys={['createForm']}
          defaultOpenKeys={['form']}
          mode="inline"
          theme="dark"
        >
          <SubMenu key="form" title="表单页">
            <Menu.Item key="createForm">创建页表单</Menu.Item>
            <Menu.Item key="FormList">表单列表</Menu.Item>
          </SubMenu>
        </Menu>
      </Layout.Sider>
    )
  }
}