import { request } from '../common/http/index'
import { AxiosPromise } from 'axios'
import {
  CreateFormReq,
  CreateFormRes,
  FromListReq,
  FormListRes,
  FormDetailReq,
  FormDetailRes
} from '../types/form'

export function createForm(req: CreateFormReq): AxiosPromise<CreateFormRes> {
  return request({
    method: 'POST',
    data: req
  })
}

export function searchFormList(req: FromListReq): AxiosPromise<FormListRes[]> {
  return request({
    method: 'GET',
    params: req
  })
}

export function getFormDetail(req: FormDetailReq): AxiosPromise<FormDetailRes> {
  return request({
    method: 'GET',
    params: req
  })
}
