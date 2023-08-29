import {Avatar, Box, Button, Divider, Heading, HStack, Text, VStack} from '@chakra-ui/react'
import React, {useContext, useEffect, useMemo, useState} from 'react'
import type User from '../interfaces/User'
import userService from '../../services/UserService'
import ToastContext from '../../utils/contexts/ToastContext'
import PrincipalContext from '../../utils/contexts/PrincipalContext'
import dayjs from 'dayjs'
import {FiCheckCircle, FiEdit3, FiKey, FiXCircle} from 'react-icons/fi'
import roleTranslator from '../../utils/RoleTranslator'
import helperFunctions from '../../utils/HelperFunctions'
import axiosExceptionHandler from '../../utils/AxiosExceptionHandler'
import toastHelper from '../../utils/ToastHelper'

interface UserCardProps {
    user: User
    setUsers: React.Dispatch<React.SetStateAction<User[]>>
    highlightTerm: string
    setAccountModalUser: React.Dispatch<React.SetStateAction<User | null>>
    setAccountModalType: React.Dispatch<React.SetStateAction<string>>
    setResetPasswordModalUser: React.Dispatch<React.SetStateAction<User | null>>
}

export default function UserCard(props: UserCardProps) {

    const {user, setUsers, highlightTerm} = props;
    const {setAccountModalUser, setAccountModalType} = props;
    const {setResetPasswordModalUser} = props;

    const {principal} = useContext(PrincipalContext)
    const toast = useContext(ToastContext)

    const [accountStatus, setAccountStatus] = useState('')

    useEffect(() => {
        if (!accountStatus) return

        async function changeAccountStatus() {
            try {
                const newAccountDetails = {...user}
                newAccountDetails.accountActive = accountStatus === 'enabled'

                await userService.updateAccountDetails(newAccountDetails)

                setUsers((val) => {
                    const foundUser = val.find((el) => (el.id === newAccountDetails.id))
                    if (foundUser != null) {
                        const userIndex = val.indexOf(foundUser)
                        val[userIndex] = newAccountDetails
                    }

                    return [...val]
                })

                toastHelper.makeToast(
                    toast,
                    'Account status updated',
                    'success'
                )
            } catch (e) {
                console.error(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    'Account status could not be updated'
                )
            }

            setAccountStatus('')
        }

        changeAccountStatus()
    }, [accountStatus, props, setUsers, toast, user])

    const isModifyUserButtonDisabled = useMemo(() =>
            (user.id.toString() === principal?.id.toString())
        , [user, principal])

    function handleModifyAccountClicked() {
        setAccountModalUser(user)
        setAccountModalType('modify')
    }

    return (

        <HStack
            px={6}
            pt={6}
            pb={2}
            w="full"
            h="fit-content"
            borderWidth={1}
            borderColor="gray.200"
            bgColor="white"
            rounded="md"
            alignItems="stretch"
            columnGap={5}
        >
            <VStack
                w="full"
            >
                <HStack
                    w="full"
                >
                    <Avatar
                        size="md"
                        name={`${user.name} ${user.surname}`}
                    />
                    <VStack
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        flexWrap="nowrap"
                        w="full"
                        h="full"
                        pl={3}
                    >
                        <Heading fontSize="2xl" fontFamily="body" fontWeight={550} color="black"
                                 whiteSpace="nowrap">
                            {helperFunctions.highlightText(`${user.name} ${user.surname}`, 550, highlightTerm)}
                            {
                                (principal != null) &&
                                user.id.toString() === principal.id &&
                                ' (You)'
                            }
                        </Heading>
                        <Heading
                            fontSize="md"
                            fontFamily="body"
                            fontWeight={450}
                            color="gray.500"
                            whiteSpace="nowrap"
                            mb="1!important"
                        >
                            {helperFunctions.highlightText(user.email, 450, highlightTerm)}
                        </Heading>
                    </VStack>
                </HStack>
                <Divider/>
                <HStack
                    w="full"
                    justifyContent="left"
                    alignItems="stretch"
                >
                    <Box>
                        <Text
                            fontWeight={300}
                            color="gray.400"
                            whiteSpace="nowrap"
                            fontSize="sm"
                        >
                            Account status
                        </Text>
                        <Text
                            color={user.accountActive ? 'teal' : 'red'}
                            fontWeight={500}
                            whiteSpace="nowrap"
                            mt="0!important"
                            mb={4}
                        >
                            {user.accountActive ? 'ACTIVE' : 'DISABLED'}
                        </Text>
                    </Box>
                    <Divider orientation="vertical" h="auto"/>
                    <Box>
                        <Text
                            fontWeight={300}
                            color="gray.400"
                            whiteSpace="nowrap"
                            fontSize="sm"
                        >
                            User Roles
                        </Text>
                        <Text
                            // fontWeight={600}
                            color="black"
                            fontSize="md"
                            fontWeight={400}
                            whiteSpace="nowrap"
                            mt="0!important"
                            mb={4}
                        >
                            {helperFunctions.highlightText(roleTranslator.translateRoles(user.roles), 400, highlightTerm)}
                        </Text>
                    </Box>
                </HStack>
                <HStack
                    w="full"
                    justifyContent="left"
                >
                    <Text fontSize="sm" color="gray.400" fontWeight={400}>Account created
                        on: {dayjs(+user.createdAt).format('D MMM YYYY H:mm')}</Text>
                </HStack>
            </VStack>
            <VStack
                h="full"
                justifyContent="start"
            >
                <Button
                    leftIcon={<FiEdit3/>}
                    colorScheme="blue"
                    isDisabled={isModifyUserButtonDisabled}
                    onClick={handleModifyAccountClicked}
                >
                    Modify account
                </Button>
                <Button
                    leftIcon={<FiKey/>}
                    colorScheme="purple"
                    isDisabled={isModifyUserButtonDisabled}
                    onClick={() => {
                        setResetPasswordModalUser(user)
                    }}
                >
                    Reset password
                </Button>
                {
                    user.accountActive &&
                    <Button
                        leftIcon={<FiXCircle/>}
                        colorScheme="red"
                        isLoading={accountStatus !== ''}
                        loadingText="Disabling account"
                        isDisabled={isModifyUserButtonDisabled}
                        onClick={() => {
                            setAccountStatus('disabled')
                        }}
                    >
                        Disable account
                    </Button>
                }
                {
                    !user.accountActive &&
                    <Button
                        leftIcon={<FiCheckCircle/>}
                        colorScheme="teal"
                        isLoading={accountStatus !== ''}
                        loadingText="Enabling account"
                        isDisabled={principal !== null && user.id.toString() === principal.id}
                        onClick={() => {
                            setAccountStatus('enabled')
                        }}
                    >
                        Enable account
                    </Button>
                }
            </VStack>
        </HStack>
    )
}
