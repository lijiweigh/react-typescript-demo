import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Form, Input, Button, Select, Radio, Card, Table, Pagination } from 'antd'
import PageHeader from '../../components/PageHeader/PageHeader'
import { FormResourceList, FormType, FormResource } from '../../const/form'
import { FromListReq, FormListRes, FormColumn } from '../../types/form'
import { searchFormList } from '../../services/form'

const { Option } = Select

let totalData: FormListRes[] = [
  {
    name: 'aabcc',
    zone: 'Zone one',
    date: [new Date().toLocaleString(), new Date().toLocaleString()],
    delivery: false,
    type: [1, 2],
    resource: 2,
    desc: 'desc csed',
  },
  {
    name: 'aaabbb',
    zone: 'Zone one',
    date: [new Date().toLocaleString(), new Date().toLocaleString()],
    delivery: false,
    type: [2, 3],
    resource: 2,
    desc: 'desc csed',
  },
  {
    name: 'ere',
    zone: 'Zone one',
    date: [new Date().toLocaleString(), new Date().toLocaleString()],
    delivery: false,
    type: [1, 3],
    resource: 1,
    desc: 'desc csed',
  },
  {
    name: 'ssss',
    zone: 'Zone one',
    date: [new Date().toLocaleString(), new Date().toLocaleString()],
    delivery: false,
    type: [2],
    resource: 2,
    desc: 'desc csed',
  },
  {
    name: 'dddd',
    zone: 'Zone one',
    date: [new Date().toLocaleString(), new Date().toLocaleString()],
    delivery: false,
    type: [3],
    resource: 1,
    desc: 'desc csed',
  },
  {
    name: 'ccc',
    zone: 'Zone one',
    date: [new Date().toLocaleString(), new Date().toLocaleString()],
    delivery: false,
    type: [1],
    resource: 1,
    desc: 'desc csed',
  },
]
totalData = [
  ...JSON.parse(JSON.stringify(totalData)),
  ...JSON.parse(JSON.stringify(totalData)),
  ...JSON.parse(JSON.stringify(totalData)),
  ...JSON.parse(JSON.stringify(totalData)),
  ...JSON.parse(JSON.stringify(totalData)),
  ...JSON.parse(JSON.stringify(totalData)),
  ...JSON.parse(JSON.stringify(totalData)),
  ...JSON.parse(JSON.stringify(totalData)),
]
totalData.forEach((item, index) => {
  item.id = item.name + index
})

export default function FormList() {
  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8 }
  }
  const tailLayout = {
    wrapperCol: { offset: 4, span: 8 }
  }

  const columns: FormColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text: string, record: FormListRes) =>
        <Link to={`/form/detail/${record.id}`}>{text}</Link>
    },
    {
      title: 'Zone',
      dataIndex: 'zone'
    },
    {
      title: 'Date',
      dataIndex: 'date',
      render: (text: string[]) =>
        <span>{text.join('~')}</span>
    },
    {
      title: 'Delivery',
      dataIndex: 'delivery',
      render: (text: boolean) =>
        <span>{text ? '是' : '否'}</span>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (text: number[], record: FormListRes) =>
        text.map(
          (t, index) =>
            <span key={index}>{FormType[t] + (index === text.length - 1 ? '' : '、')}</span>
        )
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      render: (text: number) =>
        <span>{FormResource[text]}</span>
    },
    {
      title: 'Desc',
      dataIndex: 'desc'
    },
  ]

  const [data, setTableList] = useState(totalData.slice(0, 10))
  let [page, setPage] = useState(1)
  let [pageSize, setPageSize] = useState(10)

  const [form] = Form.useForm()

  const onFinish = async (values: FromListReq) => {
    const res = await searchFormList({
      ...values,
      page,
      pageSize
    })
    setTableList(res.data)
  }

  const onReset = () => {
    form.resetFields()
  }

  const onPageChange = (page: number) => {
    setPage(page)
  }

  const onShowSizeChange = (cur: number, size: number) => {
    setPage(1)
    setPageSize(size)
  }
  // 在 page pageSize 更新的时候，执行回调里的代码（更新表格数据）
  useEffect(() => {
    setTableList(totalData.slice((page - 1) * pageSize, page * pageSize))
  }, [page, pageSize])

  return (
    <>
      <PageHeader title='表单列表' />
      <section className="padding-4x">
        <Card>
          <Form {...layout} onValuesChange={(c) => console.log(c)} form={form} name='createForm' onFinish={onFinish}>
            <Form.Item name='name' label='Activity name'>
              <div>
                <Input />
                <Form.Item name='aaa.zone2' label='Activity zone2'>
                  <Select allowClear>
                    <Option value='beijing'>zone one</Option>
                    <Option value='shanghai'>zone twe</Option>
                  </Select>
                </Form.Item>
              </div>
            </Form.Item>
            <Form.Item name='zone' label='Activity zone'>
              <Select allowClear>
                <Option value='beijing'>zone one</Option>
                <Option value='shanghai'>zone twe</Option>
              </Select>
            </Form.Item>
            <Form.Item name="resource" label="Resources">
                  <Radio.Group options={FormResourceList}></Radio.Group>
                </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type='primary' htmlType='submit' className='margin-right-4x'>
                Search
              </Button>
              <Button htmlType='button' onClick={onReset}>
                Reset
              </Button>
            </Form.Item>
          </Form>
        </Card>
        <Card style={{marginTop: 20}}>
          <Table columns={columns} dataSource={data} rowKey="id" pagination={false}></Table>
          <Pagination
            style={{marginTop: 20}}
            showSizeChanger
            onChange={onPageChange}
            onShowSizeChange={onShowSizeChange}
            pageSize={pageSize}
            current={page}
            showTotal={total => `共${total}条数据`}
            total={totalData.length}
          />
        </Card>

      </section>
    </>
  )
}