import React from 'react'
import { PageHeader } from 'antd'

export default function PageHeaderC(props: {title: string}) {
  return (
    <PageHeader
      style={{background: '#fff'}}
      title={props.title}
    />
  )
}