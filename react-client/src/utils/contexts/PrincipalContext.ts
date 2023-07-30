import React from 'react'
import type UserDetails from '../../authentication/interfaces/UserDetails'

interface Action {
  type: string
  principal: UserDetails | null
}

interface PrincipalContextInterface {
  principal: UserDetails | null
  dispatchPrincipal: React.Dispatch<Action>
}

const PrincipalContext = React.createContext<PrincipalContextInterface>({
  principal: null,
  dispatchPrincipal: () => void 0
})

export default PrincipalContext
