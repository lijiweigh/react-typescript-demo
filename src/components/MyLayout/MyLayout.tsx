import React from 'react'
import { Layout } from 'antd'
import { renderRoutes, RouteConfig } from 'react-router-config'

import Sider from '../../components/Sider/Sider'
import Header from '../../components/Header/Header'

export default function MyLayout(route: RouteConfig) {
  return (
    <Layout className="layout-wrap">
      <Sider></Sider>
      <Layout>
        {/* <Header></Header> */}
        <Layout.Content style={{marginLeft: 256}}>
        {/* <Layout.Content> */}
          {renderRoutes(route.route.routes)}
        </Layout.Content>
      </Layout>
    </Layout>
  )
}