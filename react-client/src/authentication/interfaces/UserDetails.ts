import type {UserPermissions} from './UserPermissons'

export default interface UserDetails {
  id: string
  companyID: number | null
  email: string
  name: string
  surname: string
  roles: string[]
  refreshToken: string
  authToken: string
  authTokenExpiration: number
  permissions: UserPermissions
}
