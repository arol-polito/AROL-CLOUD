import React, { useEffect, useReducer, useState } from 'react'
import './App.css'
import { ChakraProvider, useToast } from '@chakra-ui/react'
import Layout from './layout/Layout'
import { BrowserRouter } from 'react-router-dom'
import PrincipalContext from './utils/contexts/PrincipalContext'
import PrincipalReducer from './utils/reducers/PrincipalReducer'
import authService from './services/AuthService'
import LoadingPage from './layout/LoadingPage'
import SidebarStatusReducer from './utils/reducers/SidebarStatusReducer'
import SidebarStatusContext from './utils/contexts/SidebarStatusContext'
import axios from 'axios'
import ToastContext from './utils/contexts/ToastContext'
import { AxiosInterceptor } from './utils/AxiosInterceptor'

function App () {
  const [principal, dispatchPrincipal] = useReducer(PrincipalReducer, null)
  const valuePrincipal = { principal, dispatchPrincipal }

  const [sidebarStatus, dispatchSidebarStatus] = useReducer(SidebarStatusReducer, {
    type: 'sidebar',
    status: 'open',
    previousType: 'sidebar',
    previousStatus: 'open'
  })
  const valueSidebarStatus = { sidebarStatus, dispatchSidebar: dispatchSidebarStatus }

  const toast = useToast()

  const [loading, setLoading] = useState(true)

  // TOKEN REFRESH on reload
  useEffect(() => {
    if (principal != null) return

    async function getToken () {
      const principalID = localStorage.getItem('id')
      const refreshToken = localStorage.getItem('refreshToken')
      const rememberMe = localStorage.getItem('rememberMe')

      // CHECK FOR STORED PRINCIPAL
      const storedPrincipal = localStorage.getItem('principal')
      if (storedPrincipal) {
        const parsedPrincipal = JSON.parse(storedPrincipal)

        if (!rememberMe && parsedPrincipal.authTokenExpiration < Date.now()) {
          // IF NOT REMEMBER ME and TOKEN EXPIRED
          if (principalID && refreshToken)
            try {
              await authService.logout(parseInt(principalID), refreshToken)
            } catch (e) {
              console.error('ref token delete failed', e)
            }

          dispatchPrincipal({
            type: 'logout',
            principal: null
          })
        } else
          dispatchPrincipal({
            principal: parsedPrincipal,
            type: rememberMe ? 'login-remember' : 'login-no-remember'
          })

        setLoading(false)

        return
      }

      // NO PRINCIPAL & NO REFRESH TOKEN or NO REMEMBER-ME
      if (!principalID || isNaN(parseInt(principalID)) || !refreshToken || !rememberMe || rememberMe === 'false') {
        dispatchPrincipal({
          type: 'logout',
          principal: null
        })
        setLoading(false)

        return
      }

      // FALLBACK - sth wrong happened and principal is not stored
      // NO PRINCIPAL but YES REFRESH TOKEN (YES remember-me)
      try {
        const result = await authService.refreshToken(parseInt(principalID), refreshToken)

        dispatchPrincipal({
          type: 'refresh-token',
          principal: result
        })
        dispatchSidebarStatus({
          type: 'login'
        })
      } catch (e) {
        if (axios.isAxiosError(e)) {
          console.error('App useEff exception', e)

          dispatchPrincipal({
            type: 'logout',
            principal: null
          })
        }
        // if(e.response.data.msg === "Invalid refresh token"){
        //
        // }
      }

      setLoading(false)
    }

    getToken()
  }, [principal])

  return (
        <PrincipalContext.Provider value={valuePrincipal}>
            <ToastContext.Provider value={toast}>
                <BrowserRouter>
                    <ChakraProvider>
                        {loading && <LoadingPage/>}
                        <SidebarStatusContext.Provider value={valueSidebarStatus}>
                            <AxiosInterceptor>
                                {!loading && <Layout/>}
                            </AxiosInterceptor>
                        </SidebarStatusContext.Provider>
                    </ChakraProvider>
                </BrowserRouter>
            </ToastContext.Provider>
        </PrincipalContext.Provider>
  )
}

export default App
