import React from "react"
import { withRouter, Link } from 'react-router-dom'
import  { CommonObject } from '../../types/common'
import { Breadcrumb } from "antd"

const breadcrumbNameMap: CommonObject<string> = {
  '/form': '表单',
  '/form/createForm': '创建页表单',
  '/form/FormList': '表单列表',
};

export default withRouter(props => {
  const { location } = props;
  const pathSnippets = location.pathname.split('/').filter(i => i);
  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    return (
      <Breadcrumb.Item key={url}>
        <Link to={url}>{breadcrumbNameMap[url]}</Link>
      </Breadcrumb.Item>
    );
  });
  return (
    <Breadcrumb>{breadcrumbItems}</Breadcrumb>
  )
})