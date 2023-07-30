import type UserDetails from '../../authentication/interfaces/UserDetails'

interface Action {
    type: string
    principal: UserDetails | null
}

export default function PrincipalReducer(principal: UserDetails | null, action: Action): UserDetails | null {

    switch (action.type) {
        case 'login-no-remember': {
            if (!action.principal) 
                throw Error("Invalid principal")
            

            localStorage.setItem('rememberMe', 'false')
            localStorage.setItem('principal', JSON.stringify(action.principal))
            localStorage.setItem('authToken', action.principal.authToken)
            localStorage.setItem('id', action.principal.id)
            localStorage.setItem('refreshToken', action.principal.refreshToken)
            localStorage.removeItem('isRefreshing')
            localStorage.removeItem('refreshFailed')

            return action.principal
        }
        case 'login-remember': {
            if (!action.principal) 
                throw Error("Invalid principal")
            

            localStorage.setItem('rememberMe', 'true')
            localStorage.setItem('principal', JSON.stringify(action.principal))
            localStorage.setItem('authToken', action.principal.authToken)
            localStorage.setItem('id', action.principal.id)
            localStorage.setItem('refreshToken', action.principal.refreshToken)
            localStorage.removeItem('isRefreshing')
            localStorage.removeItem('refreshFailed')

            return action.principal
        }
        case 'logout': {
            localStorage.removeItem('rememberMe')
            localStorage.removeItem('principal')
            localStorage.removeItem('authToken')
            localStorage.removeItem('id')
            localStorage.removeItem('refreshToken')

            return null
        }
        case 'refresh-token': {
            if (!action.principal) 
                throw Error("Invalid principal")
            

            localStorage.setItem('principal', JSON.stringify(action.principal))
            localStorage.setItem('authToken', action.principal.authToken)
            localStorage.setItem('id', action.principal.id)
            localStorage.setItem('refreshToken', action.principal.refreshToken)

            return action.principal
        }
        case 'set-principal': {
            return action.principal
        }
        default: {
            throw Error(`Unknown action: ${action}`)
        }
    }
}
