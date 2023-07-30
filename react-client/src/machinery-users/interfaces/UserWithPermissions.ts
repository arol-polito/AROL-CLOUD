import type User from '../../users/interfaces/User'
import type MachineryPermissions from './MachineryPermissions'

export default interface UserWithPermissions {
  user: User
  permissions: MachineryPermissions[]
  active: boolean
}
