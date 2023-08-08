// noinspection RedundantIfStatementJS

import {
    Alert,
    AlertIcon,
    AlertTitle,
    Box,
    Button,
    Divider,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Select,
    Spinner,
    Text,
    VStack
} from '@chakra-ui/react'
import React, {useContext, useEffect, useState} from 'react'
import ToastContext from '../../utils/contexts/ToastContext'
import {FiLock, FiSearch, FiUserPlus, FiX} from 'react-icons/fi'
import UserCard from './UserCard'
import type User from '../interfaces/User'
import userService from '../../services/UserService'
import PrincipalContext from '../../utils/contexts/PrincipalContext'
import UserAccountModal from './UserAccountModal'
import PasswordResetModal from './PasswordResetModal'
import {useNavigate} from 'react-router-dom'
import roleTranslator from '../../utils/RoleTranslator'
import axiosExceptionHandler from '../../utils/AxiosExceptionHandler'
import toastHelper from '../../utils/ToastHelper'

export default function UsersPanel() {
    const navigate = useNavigate()

    const {principal} = useContext(PrincipalContext)

    const toast = useContext(ToastContext)

    const [users, setUsers] = useState<User[]>([])
    const [userSearch, setUserSearch] = useState<{ searchTerm: string, highlightTerm: string, doSearch: boolean }>({
        searchTerm: '',
        highlightTerm: '',
        doSearch: false
    })
    const [userSort, setUserSort] = useState('none')

    const [loadingUsers, setLoadingUsers] = useState(true)

    const [accountModalUser, setAccountModalUser] = useState<User | null>(null)
    const [accountModalType, setAccountModalType] = useState('')

    const [resetPasswordModalUser, setResetPasswordModalUser] = useState<User | null>(null)

    // LOAD USERS
    useEffect(() => {
        if (userSort !== 'none') return

        async function getUsers() {
            setLoadingUsers(true)

            try {
                if ((principal == null) || principal.companyID === null) {
                    setUsers([])
                    console.error('Principal not found')

                    return
                }

                const usersResult = await userService.getCompanyUsers()

                if (users.length > 0) {
                    setUsers(usersResult)

                    setUserSearch((val) => {
                        val.doSearch = true

                        return {...val}
                    })

                    toastHelper.makeToast(
                        toast,
                        'Sorting applied',
                        'info'
                    )

                    setLoadingUsers(false)

                    return
                }

                setUsers(usersResult)
            } catch (e) {
                console.error(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    'Dashboards could not be fetched'
                )
            }

            setLoadingUsers(false)
        }

        getUsers()
    }, [userSort, principal, toast, users.length])

    // HANDLE SEARCH
    useEffect(() => {
        if (!userSearch.doSearch) return

        const searchTerm = userSearch.searchTerm.toLowerCase()
        setUsers((val) => {
            val.forEach((el) => {
                if (!searchTerm ||
                    (`${el.name.toLowerCase()} ${el.surname.toLowerCase()}`).includes(searchTerm) ||
                    el.email.toLowerCase().includes(searchTerm) ||
                    roleTranslator.translateRoles(el.roles).toLowerCase().includes(searchTerm)
                )
                    el.active = true
                else
                    el.active = false
            })

            return [...val]
        })

        setUserSearch((val) => {
            val.doSearch = false
            val.highlightTerm = val.searchTerm

            return {...val}
        })
    }, [userSearch])

    // HANDLE SORT
    useEffect(() => {
        if (userSort === 'none') return

        setUsers((val) => {
            val.sort((a, b) => {
                switch (userSort) {
                    case 'name': {
                        return a.name.toLowerCase() + a.surname.toLowerCase() > b.name.toLowerCase() + b.surname.toLowerCase() ? 1 : -1
                    }
                    case 'email': {
                        return a.email.toLowerCase() > b.email.toLowerCase() ? 1 : -1
                    }
                    case 'account-status': {
                        return Number(b.active) - Number(a.active)
                    }
                    case 'created-at': {
                        return b.createdAt - a.createdAt
                    }
                    default: {
                        console.error('Unknown sort term')

                        return 0
                    }
                }
            })

            return [...val]
        })

        toastHelper.makeToast(
            toast,
            'Sorting applied',
            'info'
        )
    }, [userSort, toast])

    // SEARCH TERM CHANGED EVENT
    function handleSearchTermChanged(e) {
        setUserSearch((val) => {
            val.searchTerm = e.target.value

            return {...val}
        })
    }

    // HANDLE SEARCH BUTTON CLICKED
    function handleSearchButtonClicked() {
        setUserSearch((val) => {
            val.doSearch = true

            return {...val}
        })
    }

    return (
        <>
            <VStack
                w="full"
                h="full"
            >
                <VStack
                    px={6}
                    py={2}
                    w="full"
                    borderWidth={1}
                    borderColor="gray.200"
                    bgColor="white"
                    rounded="md"
                >
                    <HStack
                        w="full"
                        justifyContent="space-between"
                    >
                        <Text>Looking to create a new user account?</Text>
                        <Button
                            w="250px"
                            leftIcon={<FiUserPlus/>}
                            colorScheme="blue"
                            onClick={() => {
                                setAccountModalUser({
                                    id: 0,
                                    email: '',
                                    name: '',
                                    surname: '',
                                    roles: [],
                                    accountActive: true,
                                    companyID: principal?.companyID || -1,
                                    createdAt: 0,
                                    createdBy: '',
                                    active: true
                                })
                                setAccountModalType('create')
                            }}
                        >
                            Create new account
                        </Button>
                    </HStack>
                    <Divider/>
                    <HStack
                        w="full"
                        justifyContent="space-between"
                    >
                        <Text>Want to manage machinery access and permissions?</Text>
                        <Button
                            w="250px"
                            leftIcon={<FiLock/>}
                            colorScheme="blue"
                            onClick={() => {
                                navigate('/permissions')
                            }}
                        >
                            Manage machinery access
                        </Button>
                    </HStack>
                </VStack>
                <HStack
                    p={6}
                    w="full"
                    borderWidth={1}
                    borderColor="gray.200"
                    bgColor="white"
                    rounded="md"
                >
                    <InputGroup size='md'>
                        <InputLeftElement
                            pointerEvents='none'
                            color='gray.300'
                            fontSize='1.2em'
                        >
                            <FiSearch/>
                        </InputLeftElement>
                        <Input
                            pr='4.5rem'
                            type="text"
                            placeholder='Search users'
                            value={userSearch.searchTerm}
                            onChange={handleSearchTermChanged}
                        />
                        <InputRightElement width='6.5rem'>
                            <Box
                                pr={1}
                                _hover={{
                                    cursor: 'pointer'
                                }}
                                onClick={() => {
                                    setUserSearch({
                                        searchTerm: '',
                                        doSearch: true,
                                        highlightTerm: ''
                                    })
                                }}
                            >
                                <FiX size={18} color="gray"/>
                            </Box>
                            <Button
                                h='1.75rem'
                                size='sm'
                                colorScheme="blue"
                                onClick={handleSearchButtonClicked}
                            >
                                Search
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                    <Select
                        w="350px"
                        value={userSort}
                        onChange={(e) => {
                            setUserSort(e.target.value)
                        }}
                    >
                        <option value='none'>Sort by default order</option>
                        <option value='name'>Sort by name</option>
                        <option value='email'>Sort by email</option>
                        <option value='account-status'>Sort by account status</option>
                        <option value='created-at'>Sort by date of creation</option>
                    </Select>
                </HStack>

                <HStack
                    w="full"
                >
                    <Alert status='info' variant="left-accent" rounded="md">
                        <AlertIcon/>
                        <AlertTitle>Important information:</AlertTitle>
                        Changes can take up to 5 minute to fully propagate.
                    </Alert>
                </HStack>

                {
                    !loadingUsers &&
                    users
                        .filter((user) => (user.active))
                        .map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                setUsers={setUsers}
                                highlightTerm={userSearch.highlightTerm}
                                setAccountModalUser={setAccountModalUser}
                                setAccountModalType={setAccountModalType}
                                setResetPasswordModalUser={setResetPasswordModalUser}
                            />
                        ))
                }
                {
                    !loadingUsers &&
                    users
                        .filter((user) => (user.active))
                        .length === 0 &&
                    <HStack
                        w="full"
                        h="200px"
                        justifyContent="center"
                        alignItems="center"
                    >
                        {
                            userSearch.highlightTerm &&
                            <Text>Nothing matches your search term</Text>
                        }
                        {
                            !userSearch.highlightTerm &&
                            <Text>No users available. Start by creating a user.</Text>
                        }
                    </HStack>
                }
                {
                    loadingUsers &&
                    <VStack
                        w="full"
                        h="300px"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Spinner size="xl"/>
                    </VStack>
                }

            </VStack>
            {
                (accountModalUser != null) &&
                <UserAccountModal
                    accountModalUser={accountModalUser}
                    setAccountModalUser={setAccountModalUser}
                    operationType={accountModalType}
                    user={accountModalUser}
                    setUsers={setUsers}
                    setUsersWithPermissions={null}
                    machineries={null}
                />
            }
            {
                (resetPasswordModalUser != null) &&
                <PasswordResetModal
                    passwordResetModalUser={resetPasswordModalUser}
                    setPasswordResetModalUser={setResetPasswordModalUser}
                    user={resetPasswordModalUser}
                />
            }
        </>
    )
}
