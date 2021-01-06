import axios, { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios'
import { notification } from 'antd'
import qs from 'qs'

const instance: AxiosInstance = axios.create({
  baseURL: '/orion-experiment-admin/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json' // application/x-www-form-urlencoded
  },
  withCredentials: true,
  paramsSerializer: function(params) {
    return qs.stringify(params, { arrayFormat: "repeat" })
  },
})

instance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    return config
  },
  (err) => {
    return Promise.reject(err)
  }
)

instance.interceptors.response.use(
  (res) => {
    return Promise.resolve(res)
  },
  (err) => {
    const resStatus = err?.response?.status
    const errMsg = err?.response?.data?.message || '系统错误'
    if (resStatus === 401) {
      window.location.href = `https://account.zhenguanyu.com/login?service=${encodeURIComponent(
        window.location.href
      )}`
    } else if (resStatus === 403) {
      notification.error({
        message: '错误提示',
        description: '用户无权限'
      })
    } else {
      notification.error({
        message: '错误提示',
        description: errMsg
      })
    }
    return Promise.reject(err)
  }
)

export function request<T>(req: AxiosRequestConfig): AxiosPromise<T> {
  return instance.request(req)
}
