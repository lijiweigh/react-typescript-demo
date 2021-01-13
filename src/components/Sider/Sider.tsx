import React from 'react'
import { Layout } from 'antd'
import routes from '../../route/route'
import MyMenu from './MyMenu/MyMenu'
import './Sider.scss'

export default function MySider() {

  return (
    <Layout.Sider
      className="layout-sider"
      style={{
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: '64px',
        background: '#273352'
      }}
      width="256"
    >
      <MyMenu>{routes}</MyMenu>
    </Layout.Sider>
  )
}