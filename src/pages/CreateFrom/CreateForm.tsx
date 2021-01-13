import React, {  } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Card, Form, Input, Button, Select, message, DatePicker, Switch, Checkbox, Radio } from 'antd'
import PageHeader from '../../components/PageHeader/PageHeader'
import { CreateFormReq } from '../../types/form'
import { createForm } from '../../services/form'
import { FormTypeList, FormResourceList } from '../../const/form'

const { Option } = Select
const { RangePicker } = DatePicker

function CreateFrom(props: RouteComponentProps) {
  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8 }
  }
  const tailLayout = {
    wrapperCol: { offset: 4, span: 8 }
  }

  const [form] = Form.useForm()
  const onFinish = async (values: CreateFormReq) => {
    try {
      values.date = [
        +new Date(values.date[0]),
        +new Date(values.date[1]),
      ]
      // await createForm(values)
      message.success('创建成功')
      props.history.push('/form/formList')
    } catch {}
  }
  const onReset = () => {
    form.resetFields()
  }

  return (
    <>
      <PageHeader title='创建表单' />
      <section className='padding-4x'>
        <Card>
          <Form {...layout} form={form} name='createForm' onFinish={onFinish}>
            <Form.Item name='name' label='Activity name' rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name='zone' label='Activity zone' rules={[{ required: true }]}>
              <Select allowClear>
                <Option value='beijing'>zone one</Option>
                <Option value='shanghai'>zone twe</Option>
              </Select>
            </Form.Item>
            <Form.Item name='date' label='Activity date' rules={[{ required: true }]}>
              <RangePicker format={'YYYY-MM-DD'} />
            </Form.Item>
            <Form.Item name='delivery' label='Instant delivery' valuePropName="checked">
              <Switch></Switch>
            </Form.Item>
            <Form.Item name="type" label="Activity type" rules={[{ required: true }]}>
              <Checkbox.Group options={FormTypeList}></Checkbox.Group>
            </Form.Item>
            <Form.Item name="resource" label="Resources" rules={[{ required: true }]}>
              <Radio.Group options={FormResourceList}></Radio.Group>
            </Form.Item>

            <Form.Item {...tailLayout}>
              <Button type='primary' htmlType='submit' className='margin-right-4x'>
                Submit
              </Button>
              <Button htmlType='button' onClick={onReset}>
                Reset
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </section>
    </>
  )
}

export default withRouter(CreateFrom)
