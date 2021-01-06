import { RouteConfig } from 'react-router-config'

import MyLayout from '../components/MyLayout/MyLayout'
import CreateFrom from '../pages/CreateFrom/CreateForm'
import FormList from '../pages/FormList/FormList'
import FormDetail from '../pages/FormDetail/FormDetail'

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
        preBreadCrumb: {
          path: '/form/formList',
          breadCrumb: '表单列表',
          name: 'FormList'
        }
      },
    ]
  }
]

export default routes
