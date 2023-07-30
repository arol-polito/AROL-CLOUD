import axios from '../utils/AxiosInterceptor'
import type UserDetails from '../authentication/interfaces/UserDetails'

interface UserCredentials {
  email: string
  password: string
}

interface SignupDetails {
  email: string
  password: string
  name: string
  username: string
  roles: string[]
  companyID: number | null
}

async function register (signupDetails: SignupDetails) {
  const response = await axios.post('/public/signup', {
    ...signupDetails
  })

  if (response.status === 200)
    return true

  throw response.data
}

async function login (userCredentials: UserCredentials): Promise<UserDetails> {
  const result = await axios.post('/public/login', {
    ...userCredentials
  })

  if (result.status === 200)
    return result.data

  throw result.data
}

async function logout (id: number, refreshToken: string): Promise<boolean> {
  const result = await axios.get(`/public/logout/?id=${id}&token=${refreshToken}`)

  if (result.status === 200)
    return true

  throw result.data
}

async function refreshToken (id: number, refreshToken: string): Promise<UserDetails> {
  const result = await axios.get(`/public/refreshtoken/?id=${id}&token=${refreshToken}`)

  if (result.status === 200)
    return result.data

  throw result.data
}

export default {
  register,
  login,
  refreshToken,
  logout
}
