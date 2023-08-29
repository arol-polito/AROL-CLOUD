import axios, {type AxiosError} from 'axios'
import type React from 'react'

function handleAxiosExceptionWithToast(exception: any, toast: any, toastMessage: string) {
    try {
        if (axios.isAxiosError(exception)) {
            const error = exception as AxiosError<any>
            if (error.response == null) return

            if (error.response.status === 403)
                toast({
                    title: 'Operation not permitted',
                    variant: 'left-accent',
                    status: 'error',
                    position: 'top-right',
                    isClosable: true
                })
            else
                toast({
                    title: toastMessage,
                    variant: 'left-accent',
                    status: 'error',
                    position: 'top-right',
                    isClosable: true
                })
        }
    } catch (e) {
        console.error('Exception in AXIOS exception handler', e)
    }
}

function handleAxiosExceptionWithSetState(exception: any, setState: React.Dispatch<React.SetStateAction<any>>, newState: any, newStateForbidden: any) {
    try {
        if (axios.isAxiosError(exception)) {
            const error = exception as AxiosError<any>
            if (error.response == null) return

            // if (error.response.status === 401) {
            //
            // } else
            if (error.response.status === 403)
                setState(newStateForbidden)
            else
                setState(newState)
        }
    } catch (e) {
        console.error('Exception in AXIOS exception handler', e)
    }
}

function handleAxiosExceptionForLoginWithSetState(exception: any, setState: React.Dispatch<React.SetStateAction<string>>) {
    try {
        if (axios.isAxiosError(exception)) {
            const error = exception as AxiosError<{ msg: string }>
            if (error.response == null) return

            if (error.response && error.response.status === 403)
                if (error.response.data.msg === 'Bad credentials')
                    setState('Wrong email and/or password.')
                else if (error.response.data.msg === 'Account disabled')
                    setState('Your account is disabled.')
                else
                    setState('Oops! Something went wrong. Please try again.')
        } else
            setState('Oops! Something went wrong. Please try again.')
    } catch (e) {
        console.error('Exception in AXIOS exception handler', e)
    }
}

export default {
    handleAxiosExceptionWithToast,
    handleAxiosExceptionWithSetState,
    handleAxiosExceptionForLoginWithSetState
}
