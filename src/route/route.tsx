import React from 'react'
import { RouteConfig } from 'react-router-config'
import MyLayout from '../components/MyLayout/MyLayout'
import CreateFrom from '../pages/CreateFrom/CreateForm'
import FormList from '../pages/FormList/FormList'
import FormDetail from '../pages/FormDetail/FormDetail'
import VirtualList from '../pages/virtual-list'
import DynamicList from '../pages/dynamic-list'
import { Redirect, Switch } from 'react-router-dom'

const routes: RouteConfig[] = [
  {
    component: MyLayout,
    path: '/form',
    name: 'form',
    breadCrumb: '表单',
    routes: [
      {
        component: CreateFrom,
        name: 'CreateFrom',
        path: '/form/createForm',
        breadCrumb: '表单创建页',
      },
      {
        component: FormList,
        name: 'FormList',
        path: '/form/formList',
        breadCrumb: '表单列表',
      },
      {
        component: FormDetail,
        name: 'FormDetail',
        path: '/form/detail/:id',
        breadCrumb: '表单详情',
        hideInMenu: true,
        preBreadCrumb: {
          path: '/form/formList',
          breadCrumb: '表单列表',
          name: 'FormList'
        }
      },
      {
        component: VirtualList,
        name: 'VirtualList',
        path: '/form/virtual-list',
        breadCrumb: '虚拟列表',
      },
      {
        component: DynamicList,
        name: 'DynamicList',
        path: '/form/dynamic-list',
        breadCrumb: '动态列表',
      },
    ]
  },
  {
    path: '/',
    component: () => (
      <Switch>
        <Redirect to="/form/createForm"></Redirect>
      </Switch>
    )
  }
]

export default routes
