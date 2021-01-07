import React, { useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { RouteConfig, matchRoutes } from 'react-router-config'
import { Menu } from 'antd'
import routes from '../../../route/route'

export default withRouter(props => {

  const matched: RouteConfig[] = matchRoutes(routes, props.location.pathname)
  const [openKey] = useState(matched[0].route.path)
  let selectedKey: string
  if(matched[1].route.preBreadCrumb) {
    [selectedKey] = useState(matched[1].route.preBreadCrumb.path)
  } else {
    [selectedKey] = useState(matched[1].route.path)
  }

  function getMenu(routes: RouteConfig[]) {
    return routes.map(route => {
      if(route?.routes?.length) {
        return (
          <Menu.SubMenu key={route.path as string} title={route.breadCrumb}>
            {getMenu(route.routes)}
          </Menu.SubMenu>
        )
      }
      return route.hideInMenu
        ? null
        : <Menu.Item key={route.path as string}>
            <Link to={route.path as string}>{route.breadCrumb}</Link>
          </Menu.Item>
    })
  }

  return (
    <Menu
      defaultSelectedKeys={[selectedKey]}
      defaultOpenKeys={[openKey]}
      mode="inline"
      theme="dark"
    >
      <>
      { getMenu(routes) }
      </>
    </Menu>
  )
})