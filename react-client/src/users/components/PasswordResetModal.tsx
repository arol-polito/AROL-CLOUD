import React, {useCallback, useContext, useEffect, useState} from 'react'
import type User from '../interfaces/User'
import {
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    VStack
} from '@chakra-ui/react'
import {FiEye, FiEyeOff} from 'react-icons/fi'
import userService from '../../services/UserService'
import ToastContext from '../../utils/contexts/ToastContext'
import axiosExceptionHandler from '../../utils/AxiosExceptionHandler'
import toastHelper from '../../utils/ToastHelper'

interface PasswordResetModalProps {
    passwordResetModalUser: User | null
    setPasswordResetModalUser: React.Dispatch<React.SetStateAction<User | null>>
    user: User
}

export default function PasswordResetModal(props: PasswordResetModalProps) {
    const toast = useContext(ToastContext)

    const [userPassword, setUserPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [userPasswordError, setUserPasswordError] = useState('')
    const [repeatUserPassword, setRepeatUserPassword] = useState('')
    const [repeatShowPassword, setRepeatShowPassword] = useState(false)
    const [repeatUserPasswordError, setRepeatUserPasswordError] = useState('')

    const [submit, setSubmit] = useState(false)

    const closeModal = useCallback(() => {
        props.setPasswordResetModalUser(null)
    }, [props])

    useEffect(() => {
        if (!submit) return

        if (userPassword.length < 8) {
            setUserPasswordError('Password must be at least 8 characters long')
            setSubmit(false)

            return
        }

        if (userPassword !== repeatUserPassword) {
            setRepeatUserPasswordError('Passwords do not match')
            setSubmit(false)

            return
        }

        setUserPasswordError('')
        setRepeatUserPasswordError('')

        async function doSubmit() {
            try {
                await userService.resetAccountPassword(props.user.id, userPassword)

                toastHelper.makeToast(
                    toast,
                    'Password reset',
                    'success'
                )

                closeModal()
            } catch (e) {
                console.error(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    'Password reset failed'
                )
            }

            setSubmit(false)
        }

        doSubmit()
    }, [submit, closeModal, props.user.id, repeatUserPassword, toast, userPassword])

    return (
        <Modal isOpen={props.passwordResetModalUser !== null} onClose={closeModal}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Password reset</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl id="password" isInvalid={userPasswordError !== ''} isRequired>
                            <FormLabel>New password</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={userPassword}
                                    onChange={(e) => {
                                        setUserPassword(e.target.value)
                                    }}
                                />
                                <InputRightElement h="full">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setShowPassword((showPassword) => !showPassword)
                                        }
                                        }>
                                        {showPassword ? <FiEye/> : <FiEyeOff/>}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                            {
                                userPasswordError &&
                                <FormErrorMessage>{userPasswordError}</FormErrorMessage>
                            }
                        </FormControl>
                        <FormControl id="password" isInvalid={repeatUserPasswordError !== ''} isRequired>
                            <FormLabel>Repeat password</FormLabel>
                            <InputGroup>
                                <Input
                                    type={repeatShowPassword ? 'text' : 'password'}
                                    value={repeatUserPassword}
                                    onChange={(e) => {
                                        setRepeatUserPassword(e.target.value)
                                    }}
                                />
                                <InputRightElement h="full">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setRepeatShowPassword((showPassword) => !showPassword)
                                        }
                                        }>
                                        {repeatShowPassword ? <FiEye/> : <FiEyeOff/>}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                            {
                                repeatUserPasswordError &&
                                <FormErrorMessage>{repeatUserPasswordError}</FormErrorMessage>
                            }
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='gray' mr={3} onClick={closeModal}>
                        Close
                    </Button>
                    <Button
                        colorScheme="blue"
                        isLoading={submit}
                        loadingText="Resetting password"
                        onClick={() => {
                            setSubmit(true)
                        }}
                    >
                        Reset password
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
