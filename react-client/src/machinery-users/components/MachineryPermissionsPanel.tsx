import React, {Fragment, useContext, useEffect, useState} from "react";
import Machinery from "../../machineries-map/components/Machinery";
import UserWithPermissions from "../interfaces/UserWithPermissions";
import userService from "../../services/UserService";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import machineryService from "../../services/MachineryService";
import MachineryPermissions from "../interfaces/MachineryPermissions";
import {
    Alert, AlertIcon,
    AlertTitle,
    Box,
    Button,
    Checkbox,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Select,
    Spinner,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack
} from "@chakra-ui/react";
import {FiEdit3, FiSearch, FiUserPlus, FiX} from "react-icons/fi";
import ToastContext from "../../utils/contexts/ToastContext";
import UserAccountModal from "../../users/components/UserAccountModal";
import User from "../../users/interfaces/User";
import MachineryModal from "./MachineryModal";
import roleTranslator from "../../utils/RoleTranslator";
import helperFunctions from "../../utils/HelperFunctions";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import toastHelper from "../../utils/ToastHelper";

interface MachineryPermissionsPanelProps {

}

export default function MachineryPermissionsPanel(props: MachineryPermissionsPanelProps) {

    const {principal} = useContext(PrincipalContext)

    const toast = useContext(ToastContext)

    const [permissions, setPermissions] = useState<UserWithPermissions[]>([])
    const [principalPermissions, setPrincipalPermissions] = useState<UserWithPermissions | null>(null)
    const [machineries, setMachineries] = useState<Machinery[]>([])

    const [refreshPermissions, setRefreshPermissions] = useState(false)

    const [userSearch, setUserSearch] = useState<{ searchTerm: string, highlightTerm: string, doSearch: boolean }>({
        searchTerm: "",
        highlightTerm: "",
        doSearch: false
    })
    const [userSort, setUserSort] = useState("name")

    const [accountModalUser, setAccountModalUser] = useState<User | null>(null)
    const [accountModalType, setAccountModalType] = useState("")

    const [machineryModalOpen, setMachineryModalOpen] = useState<Machinery | undefined>(undefined)

    const [fetchData, setFetchData] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [submit, setSubmit] = useState(false)

    //FETCH USERS, MACHINERIES and COMBINE in USERS WITH PERMISSIONS
    useEffect(() => {

        if (!principal || !principal.companyID) return

        async function getData() {

            if(!refreshPermissions && !fetchData) return

            if(!refreshPermissions) {
                setIsLoading(true)
            }

            try {
                let usersResultPromise = userService.getCompanyUsers()
                let machineriesMapResultPromise = machineryService.getMachineryByCompany()

                let usersResult = (await usersResultPromise).sort((a, b) => ((a.name.toLowerCase() + " " + a.surname.toLowerCase()) > (b.name.toLowerCase() + " " + b.surname.toLowerCase()) ? 1 : -1))

                let machineriesArray: Machinery[] = [];
                (await machineriesMapResultPromise).forEach((val) => {
                    machineriesArray.push(...val)
                })
                setMachineries(machineriesArray)

                let permissionsArray: UserWithPermissions[] = []
                for (const user of usersResult) {
                    let machineryPermissionsResult: MachineryPermissions[] = await userService.getAllUserPermissions(user.id)

                    let machineryPermissionsArray: MachineryPermissions[] = []
                    for (const machinery of machineriesArray) {
                        let foundPermission = machineryPermissionsResult.find((el) => (el.machineryUID === machinery.uid))
                        // noinspection RedundantConditionalExpressionJS
                        machineryPermissionsArray.push({
                            machineryAccess: foundPermission ? true : false,
                            dashboardsModify: foundPermission ? foundPermission.dashboardsModify : false,
                            dashboardsWrite: foundPermission ? foundPermission.dashboardsWrite : false,
                            dashboardsRead: foundPermission ? foundPermission.dashboardsRead : false,
                            documentsModify: foundPermission ? foundPermission.documentsModify : false,
                            documentsRead: foundPermission ? foundPermission.documentsRead : false,
                            documentsWrite: foundPermission ? foundPermission.documentsWrite : false,
                            machineryUID: machinery.uid,
                            userID: user.id
                        })
                    }

                    if (user.id.toString() === principal?.id) {
                        setPrincipalPermissions({
                            user: user,
                            permissions: machineryPermissionsArray,
                            active: false
                        })
                    }

                    permissionsArray.push({
                        user: user,
                        permissions: machineryPermissionsArray,
                        active: true
                    })

                }

                setPermissions(permissionsArray)

            } catch (e) {
                console.log(e)
            }

            setFetchData(false)

            if(!refreshPermissions) {
                setIsLoading(false)
            }
            else{
                setRefreshPermissions(false)
                setSubmit(false)
            }

        }

        getData()

    }, [fetchData, refreshPermissions])

    //HANDLE SEARCH
    useEffect(() => {

        if (!userSearch.doSearch) return

        let searchTerm = userSearch.searchTerm.toLowerCase()
        setPermissions((val) => {

            val.forEach((el) => {
                // noinspection RedundantIfStatementJS
                if (!searchTerm ||
                    (el.user.name.toLowerCase() + " " + el.user.surname.toLowerCase()).includes(searchTerm) ||
                    el.user.email.toLowerCase().includes(searchTerm) ||
                    roleTranslator.translateRoles(el.user.roles).toLowerCase().includes(searchTerm)
                ) {
                    el.active = true
                } else {
                    el.active = false
                }
            })

            return [...val]
        })

        setUserSearch((val) => {
            val.doSearch = false
            val.highlightTerm = val.searchTerm
            return {...val}
        })

    }, [userSearch])

    //HANDLE SORT
    useEffect(() => {

        if (permissions.length === 0) return

        setPermissions((val) => {
            val.sort((a, b) => {

                switch (userSort) {
                    case "name": {
                        return a.user.name.toLowerCase() + a.user.surname.toLowerCase() > b.user.name.toLowerCase() + b.user.surname.toLowerCase() ? 1 : -1
                    }
                    case "email": {
                        return a.user.email.toLowerCase() > b.user.email.toLowerCase() ? 1 : -1
                    }
                    case "account-status": {
                        return Number(b.user.active) - Number(a.user.active)
                    }
                    default: {
                        console.error("Unknown sort term")
                        return 0
                    }
                }

            })

            return [...val]
        })

        toastHelper.makeToast(
            toast,
            "Sorting applied",
            "info"
        )

    }, [userSort])

    //HANDLE SUBMIT (update permissions)
    useEffect(() => {

        if (!submit) return

        async function updatePermissions() {

            try {

                const permissionsToUpdatePromises: Promise<any>[] = []

                for (const userWithPermissions of permissions.filter((el) => (el.user.id.toString() !== principal?.id))) {
                    for (const permission of userWithPermissions.permissions) {
                        permissionsToUpdatePromises.push(userService.updateUserPermissions(permission))
                    }
                }

                for (const promise of permissionsToUpdatePromises) {
                    await promise
                }

                toastHelper.makeToast(
                    toast,
                    "Permissions updated",
                    "success"
                )

            } catch (e) {
                console.log(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    "Some permissions could not be updated"
                )
            }

            setRefreshPermissions(true)

        }

        updatePermissions()

    }, [submit])

    //SEARCH TERM CHANGED EVENT
    function handleSearchTermChanged(e) {
        setUserSearch((val) => {
            val.searchTerm = e.target.value
            return {...val}
        })
    }

    //HANDLE SEARCH BUTTON CLICKED
    function handleSearchButtonClicked() {
        setUserSearch((val) => {
            val.doSearch = true
            return {...val}
        })
    }

    //HANDLE PERMISSION CHECKED/UNCHECKED
    function handlePermissionChanged(userID: number, machineryUID: string, permissionType: string, value: boolean) {

        setPermissions((val) => {

                let userPermissionsFound = val.find((el) => (el.user.id === userID))
                if (!userPermissionsFound) return val
                let userPermissionFound = userPermissionsFound.permissions.find((el) => (el.machineryUID === machineryUID))
                if (!userPermissionFound) return val

                switch (permissionType) {
                    case "machinery-access": {
                        userPermissionFound.machineryAccess = value
                        userPermissionFound.dashboardsWrite = value
                        userPermissionFound.dashboardsModify = value
                        userPermissionFound.dashboardsRead = value
                        userPermissionFound.documentsWrite = value
                        userPermissionFound.documentsModify = value
                        userPermissionFound.documentsRead = value
                        break
                    }
                    default: {
                        if (Object(userPermissionFound).hasOwnProperty(permissionType)) {
                            userPermissionFound[permissionType] = value
                            if (value) {
                                userPermissionFound.machineryAccess = true

                                if (permissionType === "dashboardsWrite") {
                                    userPermissionFound.dashboardsModify = true
                                    userPermissionFound.dashboardsRead = true
                                } else if (permissionType === "dashboardsModify") {
                                    userPermissionFound.dashboardsRead = true
                                }

                                if (permissionType === "documentsWrite") {
                                    userPermissionFound.documentsModify = true
                                    userPermissionFound.documentsRead = true
                                } else if (permissionType === "documentsModify") {
                                    userPermissionFound.documentsRead = true
                                }

                            } else {

                                if (areAllPermissionsDisabled(userPermissionFound)) {
                                    userPermissionFound.machineryAccess = false
                                }

                                if (permissionType === "dashboardsRead") {
                                    userPermissionFound.dashboardsModify = false
                                    userPermissionFound.dashboardsWrite = false
                                } else if (permissionType === "dashboardsModify") {
                                    userPermissionFound.dashboardsWrite = false
                                }

                                if (permissionType === "documentsRead") {
                                    userPermissionFound.documentsModify = false
                                    userPermissionFound.documentsWrite = false
                                } else if (permissionType === "documentsModify") {
                                    userPermissionFound.documentsWrite = false
                                }

                            }
                        } else {
                            console.error("Unknown permission type")
                        }
                        break
                    }
                }

                return [...val]

            }
        )

    }

    //HELPER FN - check if all dash/doc permission are unchecked
    function areAllPermissionsDisabled(permission: MachineryPermissions) {
        return !permission.dashboardsWrite && !permission.dashboardsModify && !permission.dashboardsRead && !permission.documentsWrite && !permission.documentsModify && !permission.documentsRead
    }

    return (
        <>
            <VStack
                w={"full"}
                h={"full"}
            >
                <HStack
                    px={6}
                    py={2}
                    w={"full"}
                    borderWidth={1}
                    borderColor={"gray.200"}
                    bgColor={"white"}
                    rounded={'md'}
                    justifyContent={"space-between"}
                >
                    <Text>Looking to create a new user account?</Text>
                    <Button
                        w={"250px"}
                        leftIcon={<FiUserPlus/>}
                        colorScheme={"blue"}
                        onClick={() => {
                            setAccountModalUser({
                                id: 0,
                                email: "",
                                name: "",
                                surname: "",
                                roles: [],
                                accountActive: true,
                                companyID: principal!!.companyID,
                                createdAt: 0,
                                createdBy: "",
                                active: true
                            })
                            setAccountModalType("create")
                        }}
                    >
                        Create new account
                    </Button>
                </HStack>

                <HStack
                    p={6}
                    w={"full"}
                    borderWidth={1}
                    borderColor={"gray.200"}
                    bgColor={"white"}
                    rounded={'md'}
                >
                    <InputGroup size='md'>
                        <InputLeftElement
                            pointerEvents='none'
                            color='gray.300'
                            fontSize='1.2em'
                            children={<FiSearch/>}
                        />
                        <Input
                            pr='4.5rem'
                            type={'text'}
                            placeholder='Search users'
                            value={userSearch.searchTerm}
                            onChange={handleSearchTermChanged}
                        />
                        <InputRightElement width='6.5rem'>
                            <Box
                                pr={1}
                                _hover={{
                                    cursor: "pointer"
                                }}
                                onClick={() => {
                                    setUserSearch({
                                        searchTerm: "",
                                        doSearch: true,
                                        highlightTerm: ""
                                    })
                                }}
                            >
                                <FiX size={18} color={"gray"}/>
                            </Box>
                            <Button
                                h='1.75rem'
                                size='sm'
                                colorScheme={"blue"}
                                onClick={handleSearchButtonClicked}
                            >
                                Search
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                    <Select
                        w={"350px"}
                        value={userSort}
                        onChange={(e) => (setUserSort(e.target.value))}
                    >
                        <option value='name'>Sort by name</option>
                        <option value='email'>Sort by email</option>
                        <option value='account-status'>Sort by account status</option>
                    </Select>
                </HStack>

                <HStack
                    w={"full"}
                >
                    <Alert status='info' variant={"left-accent"} rounded={"md"}>
                        <AlertIcon/>
                        <AlertTitle>Important information:</AlertTitle>
                        Changes can take up to 5 minute to fully propagate.
                    </Alert>
                </HStack>

                <VStack
                    p={6}
                    w={"full"}
                    borderWidth={1}
                    borderColor={"gray.200"}
                    bgColor={"white"}
                    rounded={'md'}
                >
                    {
                        !isLoading &&
                        permissions.filter((el) => (el.active)).length > 0 &&
                        <>
                            <TableContainer
                                w={"full"}
                            >
                                <Table variant='simple'>
                                    <Thead>
                                        <Tr>
                                            <Th rowSpan={2} textAlign={"center"}>User</Th>
                                            <Th colSpan={2} textAlign={"center"}>Machinery</Th>
                                            <Th colSpan={3} textAlign={"center"}>Dashboards access</Th>
                                            <Th colSpan={3} textAlign={"center"}>Documents access</Th>
                                        </Tr>
                                        <Tr>
                                            <Th textAlign={"center"}>Name</Th>
                                            <Th textAlign={"center"}>Access</Th>
                                            <Th textAlign={"center"}>Write</Th>
                                            <Th textAlign={"center"}>Modify</Th>
                                            <Th textAlign={"center"}>Read</Th>
                                            <Th textAlign={"center"}>Write</Th>
                                            <Th textAlign={"center"}>Modify</Th>
                                            <Th textAlign={"center"}>Read</Th>
                                        </Tr>
                                    </Thead>

                                    <Tbody>
                                        {
                                            permissions.filter((el) => (el.active)).map((userWithPermissions) => {

                                                let isPrincipal = userWithPermissions.user.id.toString() === principal?.id
                                                let isAdmin = userWithPermissions.user.roles.includes("COMPANY_ROLE_ADMIN")

                                                return (
                                                    <Fragment key={userWithPermissions.user.id}>
                                                        {
                                                            userWithPermissions.permissions.map((permission, index) => {

                                                                let principalPermission = principalPermissions?.permissions.find((el) => (el.machineryUID) === permission.machineryUID)

                                                                return (
                                                                    <Fragment
                                                                        key={permission.userID + "_" + permission.machineryUID}>
                                                                        {
                                                                            principalPermission &&
                                                                            <Tr>
                                                                                {
                                                                                    index === 0 &&
                                                                                    <Td rowSpan={userWithPermissions.permissions.length}
                                                                                        textAlign={"center"}>
                                                                                        <VStack
                                                                                            _hover={{
                                                                                                cursor: "pointer"
                                                                                            }}
                                                                                            onClick={() => {
                                                                                                setAccountModalUser(userWithPermissions.user)
                                                                                                setAccountModalType("modify")
                                                                                            }}
                                                                                        >
                                                                                            <Text fontSize={"md"}
                                                                                                  fontWeight={500}>
                                                                                                {helperFunctions.highlightText(userWithPermissions.user.name + " " + userWithPermissions.user.surname, 500, userSearch.highlightTerm)}
                                                                                                {isPrincipal ? " (You)" : ""}
                                                                                            </Text>
                                                                                            <Text fontSize={"sm"}
                                                                                                  fontWeight={400}
                                                                                                  mt={"0!important"}>
                                                                                                {helperFunctions.highlightText(userWithPermissions.user.email, 400, userSearch.highlightTerm)}
                                                                                            </Text>
                                                                                            <Text fontSize={"sm"}
                                                                                                  fontWeight={400}
                                                                                                  color={"gray.400"}
                                                                                                  mt={"0!important"}>
                                                                                                {helperFunctions.highlightText(roleTranslator.translateRoles(userWithPermissions.user.roles), 400, userSearch.highlightTerm)}
                                                                                            </Text>
                                                                                            <Text
                                                                                                color={userWithPermissions.user.accountActive ? "teal" : "red"}
                                                                                                fontWeight={500}
                                                                                                whiteSpace={"nowrap"}
                                                                                            >
                                                                                                {userWithPermissions.user.accountActive ? "ACTIVE" : "DISABLED"}
                                                                                            </Text>
                                                                                        </VStack>
                                                                                    </Td>
                                                                                }
                                                                                <Td textAlign={"center"}>
                                                                                    <Text
                                                                                        fontSize={"md"}
                                                                                        fontWeight={500}
                                                                                        _hover={{
                                                                                            cursor: "pointer"
                                                                                        }}
                                                                                        onClick={() => (setMachineryModalOpen(machineries.find((el) => (el.uid === permission.machineryUID))))}
                                                                                    >
                                                                                        {permission.machineryUID}
                                                                                    </Text>
                                                                                </Td>
                                                                                <Td textAlign={"center"}>
                                                                                    <Checkbox
                                                                                        size='lg'
                                                                                        colorScheme='blue'
                                                                                        isDisabled={isPrincipal || isAdmin || !principalPermission.machineryAccess}
                                                                                        isChecked={isAdmin || permission.machineryAccess}
                                                                                        onChange={(e) => (handlePermissionChanged(permission.userID, permission.machineryUID, "machinery-access", e.target.checked))}
                                                                                    />
                                                                                </Td>
                                                                                <Td textAlign={"center"}>
                                                                                    <Checkbox
                                                                                        size='lg'
                                                                                        colorScheme='blue'
                                                                                        isDisabled={isPrincipal || isAdmin || !principalPermission.dashboardsWrite}
                                                                                        isChecked={isAdmin || permission.dashboardsWrite}
                                                                                        onChange={(e) => (handlePermissionChanged(permission.userID, permission.machineryUID, "dashboardsWrite", e.target.checked))}
                                                                                    />
                                                                                </Td>
                                                                                <Td textAlign={"center"}>
                                                                                    <Checkbox
                                                                                        size='lg'
                                                                                        colorScheme='blue'
                                                                                        isDisabled={isPrincipal || isAdmin || !principalPermission.dashboardsModify}
                                                                                        isChecked={isAdmin || permission.dashboardsModify}
                                                                                        onChange={(e) => (handlePermissionChanged(permission.userID, permission.machineryUID, "dashboardsModify", e.target.checked))}
                                                                                    />
                                                                                </Td>
                                                                                <Td textAlign={"center"}>
                                                                                    <Checkbox
                                                                                        size='lg'
                                                                                        colorScheme='blue'
                                                                                        isDisabled={isPrincipal || isAdmin || !principalPermission.dashboardsRead}
                                                                                        isChecked={isAdmin || permission.dashboardsRead}
                                                                                        onChange={(e) => (handlePermissionChanged(permission.userID, permission.machineryUID, "dashboardsRead", e.target.checked))}
                                                                                    />
                                                                                </Td>
                                                                                <Td textAlign={"center"}>
                                                                                    <Checkbox
                                                                                        size='lg'
                                                                                        colorScheme='blue'
                                                                                        isDisabled={isPrincipal || isAdmin || !principalPermission.documentsWrite}
                                                                                        isChecked={isAdmin || permission.documentsWrite}
                                                                                        onChange={(e) => (handlePermissionChanged(permission.userID, permission.machineryUID, "documentsWrite", e.target.checked))}
                                                                                    />
                                                                                </Td>
                                                                                <Td textAlign={"center"}>
                                                                                    <Checkbox
                                                                                        size='lg'
                                                                                        colorScheme='blue'
                                                                                        isDisabled={isPrincipal || isAdmin || !principalPermission.documentsModify}
                                                                                        isChecked={isAdmin || permission.documentsModify}
                                                                                        onChange={(e) => (handlePermissionChanged(permission.userID, permission.machineryUID, "documentsModify", e.target.checked))}
                                                                                    />
                                                                                </Td>
                                                                                <Td textAlign={"center"}>
                                                                                    <Checkbox
                                                                                        size='lg'
                                                                                        colorScheme='blue'
                                                                                        isDisabled={isPrincipal || isAdmin || !principalPermission.documentsRead}
                                                                                        isChecked={isAdmin || permission.documentsRead}
                                                                                        onChange={(e) => (handlePermissionChanged(permission.userID, permission.machineryUID, "documentsRead", e.target.checked))}
                                                                                    />
                                                                                </Td>
                                                                            </Tr>
                                                                        }
                                                                    </Fragment>
                                                                )
                                                            })
                                                        }
                                                        {
                                                            userWithPermissions.permissions.length === 0 &&
                                                            <Tr>
                                                                <Td textAlign={"center"}>
                                                                    <VStack
                                                                        _hover={{
                                                                            cursor: "pointer"
                                                                        }}
                                                                        onClick={() => {
                                                                            setAccountModalUser(userWithPermissions.user)
                                                                            setAccountModalType("modify")
                                                                        }}
                                                                    >
                                                                        <Text fontSize={"md"}
                                                                              fontWeight={500}>
                                                                            {helperFunctions.highlightText(userWithPermissions.user.name + " " + userWithPermissions.user.surname, 500, userSearch.highlightTerm)}
                                                                            {isPrincipal ? " (You)" : ""}
                                                                        </Text>
                                                                        <Text fontSize={"sm"}
                                                                              fontWeight={400}
                                                                              mt={"0!important"}>
                                                                            {helperFunctions.highlightText(userWithPermissions.user.email, 400, userSearch.highlightTerm)}
                                                                        </Text>
                                                                        <Text fontSize={"sm"}
                                                                              fontWeight={400}
                                                                              color={"gray.400"}
                                                                              mt={"0!important"}>
                                                                            {helperFunctions.highlightText(roleTranslator.translateRoles(userWithPermissions.user.roles), 400, userSearch.highlightTerm)}
                                                                        </Text>
                                                                        <Text
                                                                            color={userWithPermissions.user.accountActive ? "teal" : "red"}
                                                                            fontWeight={500}
                                                                            whiteSpace={"nowrap"}
                                                                        >
                                                                            {userWithPermissions.user.accountActive ? "ACTIVE" : "DISABLED"}
                                                                        </Text>
                                                                    </VStack>
                                                                </Td>
                                                                <Td colSpan={8} textAlign={"center"}>
                                                                    No machineries available
                                                                </Td>
                                                            </Tr>
                                                        }
                                                    </Fragment>
                                                )
                                            })
                                        }
                                    </Tbody>
                                </Table>
                            </TableContainer>
                            <HStack
                                w={"full"}
                                justifyContent={"right"}
                            >
                                <Button
                                    mt={2}
                                    leftIcon={<FiEdit3/>}
                                    colorScheme={"teal"}
                                    isLoading={submit}
                                    loadingText={"Updating permissions"}
                                    onClick={() => (setSubmit(true))}
                                >
                                    Update permissions
                                </Button>
                            </HStack>
                        </>
                    }
                    {
                        !isLoading &&
                        permissions
                            .filter((el) => (el.active))
                            .length === 0 &&
                        <HStack
                            w={"full"}
                            h={"200px"}
                            justifyContent={"center"}
                            alignItems={"center"}
                        >
                            {/*{*/}
                            {/*    userSearch.highlightTerm &&*/}
                            {/*    <Text>Nothing matches your search term</Text>*/}
                            {/*}*/}
                            {/*{*/}
                            {/*    !userSearch.highlightTerm &&*/}
                            <Text>No users available. Start by creating a user.</Text>
                            {/*}*/}
                        </HStack>
                    }
                    {
                        isLoading &&
                        <VStack
                            w={"full"}
                            h={"300px"}
                            justifyContent={"center"}
                            alignItems={"center"}
                        >
                            <Spinner size={"xl"}/>
                        </VStack>
                    }
                </VStack>
            </VStack>
            {
                accountModalUser &&
                <UserAccountModal
                    accountModalUser={accountModalUser}
                    setAccountModalUser={setAccountModalUser}
                    operationType={accountModalType}
                    user={accountModalUser}
                    setUsers={null}
                    setUsersWithPermissions={setPermissions}
                    machineries={machineries}
                />
            }
            {
                machineryModalOpen &&
                <MachineryModal
                    machineryModalMachinery={machineryModalOpen}
                    setMachineryModalMachinery={setMachineryModalOpen}
                />
            }
        </>
    )


}