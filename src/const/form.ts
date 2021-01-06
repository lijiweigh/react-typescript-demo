export enum FormType {
  Online = 1,
  Promotion,
  Offline
}


export const FormTypeList = [
  { label: 'Online', value: FormType.Online },
  { label: 'Promotion', value: FormType.Promotion },
  { label: 'Offline', value: FormType.Offline }
]

export enum FormResource {
  Sponsor = 1,
  Venue
}

export const FormResourceList = [
  { label: 'Sponsor', value: FormResource.Sponsor },
  { label: 'Venue', value: FormResource.Venue }
]