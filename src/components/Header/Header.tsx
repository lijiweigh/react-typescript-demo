import React from 'react'
import { Layout } from 'antd'
import Breadcrumb from './Breadcrumb/Breadcrumb'
import UserInfo from './UserInfo/UserInfo'

export default class Header extends React.Component {

  render() {
    return (
      <Layout.Header
        className="flex-align-center flex-justify-between"
        style={{
          position: 'fixed',
          left: '256px',
          top: 0,
          zIndex: 99,
          width: 'calc(100vw - 256px)',
          background: '#fff',
          padding: '0 20px',
          borderBottom: '1px solid #eee',
          boxShadow: '0 2px 2px #eee'
        }}
      >
        <Breadcrumb></Breadcrumb>
        <UserInfo></UserInfo>
      </Layout.Header>
    )
  }
}