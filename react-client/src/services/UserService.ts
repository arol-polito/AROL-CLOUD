import axios from '../utils/AxiosInterceptor'
import type User from '../users/interfaces/User'
import type MachineryPermissions from '../machinery-users/interfaces/MachineryPermissions'

async function getCompanyUsers (): Promise<User[]> {
  const response = await axios.get('/users/company')

  if (response.status === 200)
  // Translate to USER object to avoid "active" property conflict
  // In the UsersPanel.tsx component, the "active" label is used to perform the SEARCH
  // Conflict avoided by mapping the BE user.active to user.accountActive
    return response.data.map((user) => (
      {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        roles: user.roles,
        accountActive: user.active,
        companyID: user.companyID,
        createdAt: user.createdAt,
        createdBy: user.createdBy,
        active: true
      }
    ))

  throw response.data
}

async function updateAccountDetails (user: User): Promise<boolean> {
  const result = await axios.post('/users/details/update', {
    id: user.id,
    email: user.email,
    name: user.name,
    surname: user.surname,
    roles: user.roles,
    active: user.accountActive
  })

  if (result.status === 200)
    return true

  throw result.data
}

async function resetAccountPassword (id: number, password: string): Promise<boolean> {
  const result = await axios.post('/users/password/reset', {
    id,
    password
  })

  if (result.status === 200)
    return true

  throw result.data
}

async function createAccount (user: User, password: string): Promise<User> {
  const result = await axios.post('/users/create', {
    email: user.email,
    password,
    name: user.name,
    surname: user.surname,
    roles: user.roles,
    active: user.accountActive
  })

  if (result.status === 200)
  // Translate to USER object to avoid "active" property conflict
  // In the UsersPanel.tsx component, the "active" label is used to perform the SEARCH
  // Conflict avoided by mapping the BE user.active to user.accountActive
    return {
      id: result.data.id,
      email: result.data.email,
      name: result.data.name,
      surname: result.data.surname,
      roles: result.data.roles,
      accountActive: result.data.active,
      companyID: result.data.companyID,
      createdAt: result.data.createdAt,
      createdBy: result.data.createdBy,
      active: false
    }

  throw result.data
}

async function getUserPermissionsForMachinery (userID: number, machineryUID: string): Promise<MachineryPermissions | null> {
  const result = await axios.get(`/users/permissions/${userID}/${machineryUID}`)

  if (result.status === 200)
    return result.data

  throw result.data
}

async function getAllUserPermissions (userID: number): Promise<MachineryPermissions[]> {
  const result = await axios.get(`/users/permissions/${userID}`)

  if (result.status === 200)
    return result.data

  throw result.data
}

async function updateUserPermissions (machineryPermissions: MachineryPermissions) {
  const result = await axios.post(
    '/users/permissions/update',
    {
      ...machineryPermissions
    }
  )

  if (result.status === 200)
    return result.data

  throw result.data
}

async function deleteUserPermissions (userID: number, machineryUID: string) {
  const result = await axios.delete(`/users/permissions/${userID}/${machineryUID}`)

  if (result.status === 200)
    return result.data

  throw result.data
}

async function insertUserPermissions (machineryPermissions: MachineryPermissions) {
  const result = await axios.post(
    '/users/permissions/insert',
    {
      ...machineryPermissions
    }
  )

  if (result.status === 200)
    return result.data

  throw result.data
}

export default {
  getCompanyUsers,
  updateAccountDetails,
  resetAccountPassword,
  createAccount,
  getUserPermissionsForMachinery,
  getAllUserPermissions,
  updateUserPermissions,
  deleteUserPermissions,
  insertUserPermissions
}
