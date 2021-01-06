import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Descriptions } from 'antd'
import { getFormDetail } from '../../services/form'
import { FormDetailRes } from '../../types/form'
import { FormType, FormResource } from '../../const/form'
import PageHeader from '../../components/PageHeader/PageHeader'

const res: FormDetailRes = {
  name: '正经的名字',
  zone: 'Zone one',
  date: [new Date().toLocaleString(), new Date().toLocaleString()],
  delivery: false,
  type: [2, 3],
  resource: 2,
  desc: '多好的描述啊'
}

export default function FormDetail() {
  let { id } = useParams<{ id: string }>()
  const [detailData, setDetailData] = useState(res)

  useEffect(() => {
    getFormDetail({ id }).then((res) => {
      setDetailData(res.data)
    })
  }, [id])

  return (
    <>
      <PageHeader title='表单详情' />
      <section className='padding-4x'>
        {
          Array(10).fill('a').map((item, index) =>
            <Card style={{marginBottom: 20}} key={index}>
              <Descriptions title='表单详情'>
                <Descriptions.Item label='name'>{detailData.name}</Descriptions.Item>
                <Descriptions.Item label='zone'>{detailData.zone}</Descriptions.Item>
                <Descriptions.Item label='date'>{detailData.date.join('~')}</Descriptions.Item>
                <Descriptions.Item label='delivery'>
                  {detailData.delivery ? '是' : '否'}
                </Descriptions.Item>
                <Descriptions.Item label='type'>
                  {detailData.type.map((t, index) => (
                    <span key={t}>
                      {FormType[t] + (index === detailData.type.length - 1 ? '' : '、')}
                    </span>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label='resource'>
                  {FormResource[detailData.resource]}
                </Descriptions.Item>
                <Descriptions.Item label='desc'>{detailData.desc}</Descriptions.Item>
              </Descriptions>
            </Card>
          )
        }
      </section>
    </>
  )
}
