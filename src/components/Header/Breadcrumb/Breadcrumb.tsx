import React from "react"
import { withRouter, Link } from 'react-router-dom'
import { matchRoutes, RouteConfig } from 'react-router-config'
import  { CommonObject } from '../../../types/common'
import { Breadcrumb } from "antd"
import routes from '../../../route/route'

export default withRouter(props => {
  const { location } = props;
  const matched = matchRoutes(routes, location.pathname)
  let breadcrumbs: CommonObject<string>[] = []
  matched.forEach((m: RouteConfig)  => {
    if(m.route.preBreadCrumb) {
      breadcrumbs.push(m.route.preBreadCrumb)
    }
    breadcrumbs.push({
      path: m.route.path as string,
      breadCrumb: m.route.breadCrumb
    })
  })

  const breadcrumbItems = breadcrumbs.map((b, index) => {
    return (
        <Breadcrumb.Item key={b.path}>
          {
            index === breadcrumbs.length - 1
            ? <span>{b.breadCrumb}</span>
            : <Link to={b.path}>{b.breadCrumb}</Link>
          }
        </Breadcrumb.Item>
    );
  });
  return (
    <Breadcrumb>{breadcrumbItems}</Breadcrumb>
  )
})