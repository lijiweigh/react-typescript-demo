import React from 'react'
import { Menu, Dropdown } from 'antd'
import { DownOutlined, LogoutOutlined, AppleOutlined, AndroidOutlined, UserOutlined } from '@ant-design/icons'

const menu = (
  <Menu>
    <Menu.Item>
      <AppleOutlined /> 这是安卓
    </Menu.Item>
    <Menu.Item>
      <AndroidOutlined /> 这是苹果
    </Menu.Item>
    <Menu.Item>
      <LogoutOutlined /> 退出登录
    </Menu.Item>
  </Menu>
)

export default class HeaderUserInfo extends React.Component {

  render() {
    return (
      <Dropdown overlay={menu}>
        <span onClick={e => e.preventDefault()}>
          <UserOutlined /> admin <DownOutlined />
        </span>
      </Dropdown>
    )
  }
}