export default interface User {
  id: number
  email: string
  name: string
  surname: string
  roles: string[]
  accountActive: boolean
  companyID: number | null
  createdAt: number
  createdBy: string
  active: boolean
}
