import {
    Avatar,
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
    VStack
} from '@chakra-ui/react'
import {FiBell, FiChevronDown, FiLogOut, FiUser} from 'react-icons/fi'
import React, {useContext, useEffect, useState} from 'react'
import PrincipalContext from '../utils/contexts/PrincipalContext'
import {useNavigate} from 'react-router-dom'
import companyService from '../services/CompanyService'
import roleTranslator from '../utils/RoleTranslator'
import SidebarStatusContext from '../utils/contexts/SidebarStatusContext'
import authService from '../services/AuthService'
import toastHelper from '../utils/ToastHelper'
import ToastContext from '../utils/contexts/ToastContext'

interface Company {
    id: number
    name: string
}

export default function Navbar() {
    const navigate = useNavigate()

    const toast = useContext(ToastContext)
    const {principal, dispatchPrincipal} = useContext(PrincipalContext)
    const {sidebarStatus} = useContext(SidebarStatusContext)

    const [company, setCompany] = useState<Company | null>()

    // FETCH COMPANY DETAILS
    useEffect(() => {
        if ((principal == null) || !principal.companyID)
            return

        async function getData() {
            const result = await companyService.getCompanyByPrincipal()

            setCompany(result)
        }

        getData()
    }, [principal])

    async function handleSignOut() {
        if (principal != null)
            try {
                const refreshToken = localStorage.getItem('refreshToken')
                if (refreshToken)
                    await authService.logout(parseInt(principal.id), refreshToken)
            } catch (e) {
                console.error('ref token delete failed', e)
            }

        dispatchPrincipal({
            principal: null,
            type: 'logout'
        })

        toastHelper.makeToast(
            toast,
            'Logout successful',
            'success'
        )
    }

    function handleLoginButtonClick() {
        navigate('/login')
    }

    return (
        <Flex
            px={4}
            height="20"
            alignItems="center"
            bg="white"
            borderBottomWidth="1px"
            borderBottomColor="gray.200"
            justifyContent={{base: 'space-between', md: 'flex-end'}}
        >
            {
                (principal != null) &&
                <HStack
                    pl={sidebarStatus.status === 'open' ? '289px' : '75px'}
                    w="full"
                    spacing={{base: '0', md: '6'}}
                    justifyContent="space-between"
                >
                    <Box
                        _hover={{
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            navigate('/')
                        }}
                    >
                        <Heading
                            size="md"
                        >
                            {(company != null) ? company.name : 'AROL'}
                        </Heading>
                    </Box>
                    <HStack>
                        <IconButton
                            size="lg"
                            variant="ghost"
                            aria-label="open menu"
                            icon={<FiBell/>}
                        />
                        <Flex alignItems="center">
                            <Menu>
                                <MenuButton
                                    py={2}
                                    transition="all 0.3s"
                                    _focus={{boxShadow: 'none'}}>
                                    <HStack>
                                        <Avatar
                                            size="sm"
                                            name={`${principal.name} ${principal.surname}`}
                                        />
                                        <VStack
                                            display={{base: 'none', md: 'flex'}}
                                            alignItems="flex-start"
                                            spacing="1px"
                                            ml="2">
                                            <Text fontSize="md">{`${principal.name} ${principal.surname}`}</Text>
                                            <Text fontSize="xs" color="gray.600" fontWeight={500}>
                                                {roleTranslator.translateRolesForNavbar(principal)}
                                            </Text>
                                        </VStack>
                                        <Box display={{base: 'none', md: 'flex'}}>
                                            <FiChevronDown/>
                                        </Box>
                                    </HStack>
                                </MenuButton>
                                <MenuList
                                    bg="white"
                                    borderColor="gray.200">
                                    {/* <MenuItem>Settings</MenuItem> */}
                                    {/* <MenuDivider/> */}
                                    <MenuItem
                                        icon={<FiLogOut/>}
                                        onClick={handleSignOut}
                                    >
                                        Sign out
                                    </MenuItem>
                                    <MenuItem
                                        icon={<FiUser/>}
                                        // onClick={handleSignOut}
                                    >
                                        My account
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </Flex>
                    </HStack>
                </HStack>
            }
            {
                (principal == null) &&
                <HStack>
                    <Button
                        colorScheme="blue"
                        variant="outline"
                        onClick={handleLoginButtonClick}
                    >
                        Login
                    </Button>
                    {/* <Button */}
                    {/*    colorScheme={"blue"} */}
                    {/*    onClick={handleSignupButtonClick} */}
                    {/* > */}
                    {/*    Sign up */}
                    {/* </Button> */}
                </HStack>
            }

        </Flex>
    )
}
