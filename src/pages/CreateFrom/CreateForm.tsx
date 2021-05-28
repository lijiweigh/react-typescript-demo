import React, { useRef, useState } from 'react'
import { Card, Form, Button, message, DatePicker, Switch, Checkbox, Radio, Select, Input } from 'antd'
import PageHeader from '../../components/PageHeader/PageHeader'
import { CreateFormReq } from '../../types/form'
import { createForm } from '../../services/form'
import { FormTypeList, FormResourceList } from '../../const/form'
import { Code } from 'test-react-component';
// import GovRuleTree from '@aligov/gov-rule-tree';
import { RuleTree } from 'grammy'
// import { Select, Input } from '@alifd/next';
// javascript 所需引入的包
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/addon/hint/javascript-hint.js';
// import './index.less'
import mmmm from './index.module.less'

console.log(mmmm)

const { Option } = Select
const { RangePicker } = DatePicker

export default function CreateFrom() {
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
      await createForm(values)
      message.success('创建成功')
    } catch {}
  }
  const onReset = () => {
    form.resetFields()
  }

  const value = `import React from 'react';

export default ({ title }: { title: string }) => <h1>{title}</h1>;

function SayHello() {
  console.log('hello')
}
`;
  const [vvv, setVvv] = useState<any>({"relation":"or","children":[{"operation":">","amount":"3232"},{"operation":"<","amount":"3323"},{"relation":"and","children":[{"operation":"=","amount":"32323"},{"operation":">","amount":"32323"},{"operation":"=","amount":"23232322"}]}]})
  // useEffect(() => {
  //   setTimeout(() => {
  //     console.log('set')
  //     // @ts-ignore
  //     setVvv(pre => {
  //       // return {
  //       //   ...pre,
  //       //   relation: 'and'
  //       // }
  //       return {"relation":"and","children":[{"operation":">","amount":"666"},{"operation":"<","amount":"3323"},{"relation":"and","children":[{"operation":"=","amount":"32323"},{"operation":">","amount":"32323"},{"operation":"=","amount":"23232322"}]}]}
  //     })
  //   }, 3000);
  // }, [])

  const ctx = useRef(null)

  return (
    <div style={{padding: '50px', background: '#fff'}}>
      <RuleTree
        ref={ctx}
        // disabled
        // addConditionDisabled={(data) => data.level === 1}
        // addConditionGroupDisabled={(data) => data.level === 2}
        // canAddCondition={(data) => data.level === 1222}
        // canAddConditionGroup={(data) => data.level === 1222}
        // canDelete={ (node) => {
        //   return false
        // }}
        // deleteIcon={() => <StepBackwardOutlined />}
        // dragIcon={(node) => {
        //   return <StepBackwardOutlined />
        // }}
        // canDrag={() => {
        //   return false
        // }}
        // canAddCondition={(data) => data.level > 1 ? 'disabled' : true}
        // canAddConditionGroup={(data) => data.level > 1}
        // addConditionIcon={() => <StepBackwardOutlined style={{padding: '0 8px'}} />}
        // addConditionGroupIcon={<StepBackwardOutlined style={{padding: '0 8px'}} />}
        // canDrag={(data) => {
        //   if('data' in data) {
        //     return data?.data?.type === 'leaf'
        //   }
        //   return false
        // }}
        canRootChange={true}
        onChange={changedValues => {
          console.log('changedValues: ', JSON.stringify(changedValues));
          setVvv(changedValues)
        }}
        rootRelations={[{text: '且', value: 'and'}, {text: '或', value: 'or'}]}
        relations={[{text: '且', value: 'and'}, {text: '或', value: 'or'}]}
        value={vvv}
        fields={[
          // {
          //   id: 'fruit',
          //   element: <Card title="aaaa">sfsffsf</Card>
          // },
          {
            id: 'operation',
            element: (
              <Select style={{ width: 150 }} placeholder="请选择">
                <Select.Option value=">">Greater Than</Select.Option>
                <Select.Option value="<">Less Than</Select.Option>
                <Select.Option value="=">Equal</Select.Option>
              </Select>
            )
          },
          {
            id: 'amount',
            rules: [
              {
                required: true,
                message: '数量不能为空'
              }
            ],
            // element: <Input style={{ width: 200 }} placeholder="请输入数量" />
            render() {
              return <Input style={{ width: 200 }} placeholder="请输入数量" />
              // return <input type="text"/>
            }
          }
        ]}
      />
      <Code.Basic
        mode="javascript"
        value={value}
        events={[
          {
            name: 'beforeChange',
            handler(cm: any, changeObj: any) {
              console.log('beforeChange');
              console.log(cm, changeObj);
            },
          },
        ]}
        onChange={(value, cm, changeObj) => console.log(value, cm, changeObj)}
      ></Code.Basic>
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
    </div>
  )
}
