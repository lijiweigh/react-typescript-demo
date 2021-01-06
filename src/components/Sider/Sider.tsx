import React, {useState} from 'react'
import { matchRoutes, RouteConfig } from 'react-router-config'
import { Link, useLocation, withRouter } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import routes from '../../route/route'
import './Sider.scss'

const { SubMenu } = Menu

export default withRouter((props) => {
  const matched: RouteConfig[] = matchRoutes(routes, props.location.pathname)
  const [openKey] = useState(matched[0].route.name)
  let selectedKey: string
  if(matched[1].route.preBreadCrumb) {
    [selectedKey] = useState(matched[1].route.preBreadCrumb.name)
  } else {
    [selectedKey] = useState(matched[1].route.name)
  }

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
        defaultSelectedKeys={[selectedKey as string]}
        defaultOpenKeys={[openKey as string]}
        mode="inline"
        theme="dark"
      >
        <SubMenu key="form" title="表单页">
          <Menu.Item key="createForm">
            <Link to="/form/createForm">创建页表单</Link>
          </Menu.Item>
          <Menu.Item key="FormList">
            <Link to="/form/formList">表单列表</Link>
          </Menu.Item>
        </SubMenu>
      </Menu>
    </Layout.Sider>
  )
})