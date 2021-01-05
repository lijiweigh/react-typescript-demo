import React from 'react'
import { Layout } from 'antd'
import Breadcrumb from '../Breadcrumb/Breadcrumb'

export default class Header extends React.Component {

  render() {
    return (
      <Layout.Header
        className="padding-left-4x padding-right-4x"
        style={{
          position: 'fixed',
          left: '256px',
          top: 0,
          width: 'calc(100vw - 256px)',
          background: '#fff'
        }}
      >
        <Breadcrumb></Breadcrumb>
      </Layout.Header>
    )
  }
}