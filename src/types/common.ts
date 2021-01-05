export interface BreadcrumbItem {
  path: string
  breadcrumbName: string
  children?: Array<{
    path: string
    breadcrumbName: string
  }>
}

export interface CommonObject<T> {
  [key: string]: T
}