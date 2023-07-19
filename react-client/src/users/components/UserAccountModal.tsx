import React, {useContext, useEffect, useState} from "react";
import User from "../interfaces/User";
import {
    Box,
    Button,
    FormControl, FormHelperText,
    FormLabel,
    HStack,
    Input,
    InputGroup,
    InputRightElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay, Radio, RadioGroup,
    Select,
    VStack
} from "@chakra-ui/react";
import {FiEye, FiEyeOff} from "react-icons/fi";
import userService from "../../services/UserService";
import ToastContext from "../../utils/contexts/ToastContext";
import UserWithPermissions from "../../machinery-users/interfaces/UserWithPermissions";
import Machinery from "../../machineries-map/components/Machinery";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import toastHelper from "../../utils/ToastHelper";

interface UserAccountModalProps {
    accountModalUser: User | null
    setAccountModalUser: React.Dispatch<React.SetStateAction<User | null>>
    operationType: string
    user: User
    setUsers: React.Dispatch<React.SetStateAction<User[]>> | null
    setUsersWithPermissions: React.Dispatch<React.SetStateAction<UserWithPermissions[]>> | null
    machineries: Machinery[] | null
}

const rolesOptions = [
    {value: "none", displayName: "No role selected"},
    {value: "COMPANY_ROLE_WORKER", displayName: "Worker role"},
    {value: "COMPANY_ROLE_MANAGER", displayName: "Manager role"},
    {value: "COMPANY_ROLE_ADMIN", displayName: "Administrator role"},
]

export default function UserAccountModal(props: UserAccountModalProps) {

    const toast = useContext(ToastContext)

    const [user, setUser] = useState<User>(JSON.parse(JSON.stringify(props.user)))
    const [userPassword, setUserPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const [submit, setSubmit] = useState(false)

    //SUBMIT UPDATED USER DETAILS
    useEffect(()=>{

        if(!submit) return

        async function doSubmit(){

            try{

                user.roles = user.roles.filter((el)=>(el!=="none"))

                if(props.operationType==="create"){
                    let newUser: User = await userService.createAccount(user, userPassword)
                    newUser.active = true

                    if(props.setUsers) {
                        props.setUsers((val) => {
                            return Array.from([newUser, ...val])
                        })
                    }
                    else if(props.setUsersWithPermissions && props.machineries){

                        props.setUsersWithPermissions((val)=>{

                            console.log("with perm", val)

                            return [
                                {
                                    user: newUser,
                                    permissions: props.machineries!!.map((el)=>(
                                        {
                                            dashboardsModify: false,
                                            dashboardsRead: false,
                                            dashboardsWrite: false,
                                            documentsModify: false,
                                            documentsRead: false,
                                            documentsWrite: false,
                                            machineryAccess: false,
                                            machineryUID: el.uid,
                                            userID: newUser.id
                                        }
                                    )),
                                    active: true
                                },
                                ...val]

                        })

                    }
                    else{
                        return
                    }

                    toastHelper.makeToast(
                        toast,
                        "Account created",
                        "success"
                    )

                    props.setAccountModalUser(null)

                }
                else{
                    await userService.updateAccountDetails(user)

                    if(props.setUsers) {
                        props.setUsers((val) => {
                            let foundUser = val.find((el) => (el.id === user.id))
                            if (foundUser) {
                                let userIndex = val.indexOf(foundUser)
                                val[userIndex] = user
                            }
                            return [...val]
                        })
                    }
                    else if(props.setUsersWithPermissions){
                        props.setUsersWithPermissions((val) => {
                            let foundUser = val.find((el) => (el.user.id === user.id))
                            if (foundUser) {
                                let userIndex = val.indexOf(foundUser)
                                val[userIndex].user = user
                            }
                            return [...val]
                        })
                    }
                    else{
                        return
                    }

                    toastHelper.makeToast(
                        toast,
                        "Account modified",
                        "success"
                    )

                    props.setAccountModalUser(null)

                }

            }
            catch (e){
                console.log(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    (props.operationType==="create" ? "Account creation" : "Account modification") +" failed"
                )
            }

            setSubmit(false)

        }

        doSubmit()

    }, [submit])

    //USER DETAILS (other than role) MODIFIED
    function handleUserDetailsChanged(target: string, newValue: string) {

        if (target === "password") {
            setUserPassword(newValue)
            return
        }

        setUser((val) => {

            switch (target) {
                case "name": {
                    val.name = newValue
                    break
                }
                case "surname": {
                    val.surname = newValue
                    break
                }
                case "email": {
                    val.email = newValue
                    break
                }
                case "account-status": {
                    val.accountActive = newValue === "enabled"
                    break
                }
                default: {
                    console.error("Unknown target in account form")
                    break
                }
            }

            return {...val}
        })

    }

    //ADD NEW USER ROLE DROPDOWN
    function addUserRole() {
        setUser((val) => {
            val.roles.push("none")
            return {...val}
        })
    }

    //SELECT NEW USER ROLE
    function handleRoleSelected(roleValue: string, index: number) {
        setUser((val) => {
            console.log(index, val.roles, index-val.roles.length)
            if(index-val.roles.length>0){
                return val
            }
            else if(index-val.roles.length===0){
                val.roles.push(roleValue)
            }
            else {
                val.roles[index] = roleValue
            }
            return {...val}
        })
    }

    //REMOVE USER ROLE
    function handleRoleRemoved(roleValue: string) {
        setUser((val) => {
            val.roles = val.roles.filter((el) => (el !== roleValue))
            return {...val}
        })
    }

    //CLOSE MODAL (only if not submitting)
    function closeModal() {
        if(submit) return

        props.setAccountModalUser(null)
    }

    return (
        <Modal isOpen={props.accountModalUser !== null} onClose={closeModal}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>{props.operationType === "create" ? "Create account" : "Modify account"}</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <VStack spacing={4}>
                        <HStack>
                            <Box>
                                <FormControl id="firstName" isRequired>
                                    <FormLabel>First Name</FormLabel>
                                    <Input
                                        type="text"
                                        value={user.name}
                                        onChange={(e) => (handleUserDetailsChanged("name", e.target.value))}
                                    />
                                </FormControl>
                            </Box>
                            <Box>
                                <FormControl id="lastName">
                                    <FormLabel>Last Name</FormLabel>
                                    <Input
                                        type="text"
                                        value={user.surname}
                                        onChange={(e) => (handleUserDetailsChanged("surname", e.target.value))}
                                    />
                                </FormControl>
                            </Box>
                        </HStack>
                        <FormControl id="email" isRequired>
                            <FormLabel>Email address</FormLabel>
                            <Input
                                type="email"
                                value={user.email}
                                onChange={(e) => (handleUserDetailsChanged("email", e.target.value))}
                            />
                        </FormControl>
                        {
                            props.operationType === "create" &&
                            <FormControl id="password" isRequired>
                                <FormLabel>Password</FormLabel>
                                <InputGroup>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={userPassword}
                                        onChange={(e) => (handleUserDetailsChanged("password", e.target.value))}
                                    />
                                    <InputRightElement h={'full'}>
                                        <Button
                                            variant={'ghost'}
                                            onClick={() =>
                                                setShowPassword((showPassword) => !showPassword)
                                            }>
                                            {showPassword ? <FiEye/> : <FiEyeOff/>}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>
                        }
                        <FormControl>
                            <FormLabel>Roles</FormLabel>
                            <VStack
                                w={"full"}
                            >
                                {
                                    user.roles.map((role, index, array) => (
                                        <HStack
                                            key={index}
                                            w={"full"}
                                        >
                                            <Select
                                                value={role}
                                                onChange={(e) => (handleRoleSelected(e.target.value, index))}
                                            >
                                                {
                                                    rolesOptions
                                                        .filter((roleOption) => (roleOption.value===role || !array.includes(roleOption.value)))
                                                        .map((roleOption) => (
                                                            <option
                                                                key={roleOption.value}
                                                                value={roleOption.value}
                                                            >
                                                                {roleOption.displayName}
                                                            </option>
                                                        ))
                                                }
                                            </Select>
                                            {
                                                index < array.length - 1 &&
                                                <Button
                                                    colorScheme={"red"}
                                                    onClick={() => (handleRoleRemoved(role))}
                                                >
                                                    -
                                                </Button>
                                            }
                                            {
                                                index === array.length - 1 &&
                                                role !== "none" &&
                                                <Button
                                                    colorScheme={"teal"}
                                                    onClick={addUserRole}
                                                >
                                                    +
                                                </Button>
                                            }
                                        </HStack>
                                    ))
                                }
                                {
                                    user.roles.length === 0 &&
                                    <Select
                                        value={"none"}
                                        onChange={(e) => (handleRoleSelected(e.target.value, 0))}
                                    >
                                        {
                                            rolesOptions
                                                .map((roleOption) => (
                                                    <option
                                                        key={roleOption.value}
                                                        value={roleOption.value}
                                                    >
                                                        {roleOption.displayName}
                                                    </option>
                                                ))
                                        }
                                    </Select>
                                }
                            </VStack>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Account status</FormLabel>
                            <RadioGroup
                                onChange={(e) => (handleUserDetailsChanged("account-status", e))}
                                value={user.accountActive ? "enabled" : "disabled"}
                            >
                                <HStack spacing='24px'>
                                    <Radio value='enabled'>Enabled</Radio>
                                    <Radio value='disabled'>Disabled</Radio>
                                </HStack>
                            </RadioGroup>
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='gray' mr={3} onClick={closeModal}>
                        Close
                    </Button>
                    <Button
                        colorScheme={"blue"}
                        isLoading={submit}
                        loadingText={props.operationType === "create" ? "Creating account" : "Modifying account"}
                        onClick={()=>(setSubmit(true))}
                    >
                        {props.operationType === "create" ? "Create account" : "Modify account"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )

}