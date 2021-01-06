export interface CreateFormReq {
  name: string
  zone: string | undefined
  date: (string | number)[]
  delivery: boolean
  type: number[]
  resource: number
  desc: string
}

export interface CreateFormRes extends CreateFormReq {
  id?: string
}

export interface FromListReq {
  name: string
  region: string | undefined
  resource: number | undefined
  page: number
  pageSize: number
}

export interface FormListRes extends CreateFormRes {

}

export interface FormColumn {
  title?: string
  dataIndex: string
  [key: string]: any
}

export interface FormDetailReq {
  id: string
}

export interface FormDetailRes extends CreateFormRes {

}