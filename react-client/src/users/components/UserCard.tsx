import {useNavigate} from "react-router-dom";
import {Avatar, Box, Button, Divider, Heading, HStack, Text, VStack} from "@chakra-ui/react";
import React, {useContext, useEffect, useState} from "react";
import User from "../interfaces/User";
import userService from "../../services/UserService";
import ToastContext from "../../utils/contexts/ToastContext";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import dayjs from "dayjs";
import {FiCheckCircle, FiEdit2, FiEdit3, FiKey, FiXCircle} from "react-icons/fi";
import roleTranslator from "../../utils/RoleTranslator";
import helperFunctions from "../../utils/HelperFunctions";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import toastHelper from "../../utils/ToastHelper";

interface UserCardProps {
    user: User
    setUsers: React.Dispatch<React.SetStateAction<User[]>>
    highlightTerm: string
    setAccountModalUser: React.Dispatch<React.SetStateAction<User | null>>
    setAccountModalType: React.Dispatch<React.SetStateAction<string>>
    setResetPasswordModalUser: React.Dispatch<React.SetStateAction<User | null>>
}

const rolesTranslation = [
    {value: "COMPANY_ROLE_WORKER", displayName: "Worker role"},
    {value: "COMPANY_ROLE_MANAGER", displayName: "Manager role"},
    {value: "COMPANY_ROLE_ADMIN", displayName: "Administrator role"},
]

export default function UserCard(props: UserCardProps) {

    const navigate = useNavigate()

    const {principal} = useContext(PrincipalContext)
    const toast = useContext(ToastContext)

    const [accountStatus, setAccountStatus] = useState("")

    useEffect(() => {

        if (!accountStatus) return

        async function changeAccountStatus() {

            try {
                let newAccountDetails = {...props.user}
                newAccountDetails.accountActive = accountStatus === "enabled"

                await userService.updateAccountDetails(newAccountDetails)

                props.setUsers((val) => {
                    let foundUser = val.find((el) => (el.id === newAccountDetails.id))
                    if (foundUser) {
                        let userIndex = val.indexOf(foundUser)
                        val[userIndex] = newAccountDetails
                    }
                    return [...val]
                })

                toastHelper.makeToast(
                    toast,
                    "Account status updated",
                    "success"
                )

            } catch (e) {
                console.log(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    "Account status could not be updated"
                )
            }

            setAccountStatus("")

        }

        changeAccountStatus()

    }, [accountStatus])

    function handleModifyAccountClicked() {
        props.setAccountModalUser(props.user)
        props.setAccountModalType("modify")
    }

    return (

        <HStack
            px={6}
            pt={6}
            pb={2}
            w={"full"}
            h={"fit-content"}
            borderWidth={1}
            borderColor={"gray.200"}
            bgColor={"white"}
            rounded={'md'}
            alignItems={"stretch"}
            columnGap={5}
        >
            <VStack
                w={"full"}
            >
                <HStack
                    w={"full"}
                >
                    <Avatar
                        size={"md"}
                        name={props.user.name+" "+props.user.surname}
                    />
                    <VStack
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        flexWrap={"nowrap"}
                        w={"full"}
                        h={"full"}
                        pl={3}
                    >
                        <Heading fontSize={"2xl"} fontFamily={"body"} fontWeight={550} color={"black"}
                                 whiteSpace={"nowrap"}>
                            {helperFunctions.highlightText(props.user.name + " " + props.user.surname, 550, props.highlightTerm)}
                            {
                                principal &&
                                props.user.id.toString() === principal!!.id &&
                                " (You)"
                            }
                        </Heading>
                        <Heading
                            fontSize={"md"}
                            fontFamily={"body"}
                            fontWeight={450}
                            color={"gray.500"}
                            whiteSpace={"nowrap"}
                            mb={"1!important"}
                        >
                            {helperFunctions.highlightText(props.user.email, 450, props.highlightTerm)}
                        </Heading>
                    </VStack>
                </HStack>
                <Divider/>
                <HStack
                    w={"full"}
                    justifyContent={"left"}
                    alignItems={"stretch"}
                >
                    <Box>
                        <Text
                            fontWeight={300}
                            color={"gray.400"}
                            whiteSpace={"nowrap"}
                            fontSize={"sm"}
                        >
                            Account status
                        </Text>
                        <Text
                            color={props.user.accountActive ? "teal" : "red"}
                            fontWeight={500}
                            whiteSpace={"nowrap"}
                            mt={"0!important"}
                            mb={4}
                        >
                            {props.user.accountActive ? "ACTIVE" : "DISABLED"}
                        </Text>
                    </Box>
                    <Divider orientation={"vertical"} h={"auto"}/>
                    <Box>
                        <Text
                            fontWeight={300}
                            color={"gray.400"}
                            whiteSpace={"nowrap"}
                            fontSize={"sm"}
                        >
                            User Roles
                        </Text>
                        <Text
                            // fontWeight={600}
                            color={"black"}
                            fontSize="md"
                            fontWeight={400}
                            whiteSpace={"nowrap"}
                            mt={"0!important"}
                            mb={4}
                        >
                            {helperFunctions.highlightText(roleTranslator.translateRoles(props.user.roles), 400, props.highlightTerm)}
                        </Text>
                    </Box>
                </HStack>
                <HStack
                    w={"full"}
                    justifyContent={"left"}
                >
                    <Text fontSize={"sm"} color={"gray.400"} fontWeight={400}>Account created
                        on: {dayjs(+props.user.createdAt).format("D MMM YYYY H:mm")}</Text>
                </HStack>
            </VStack>
            <VStack
                h={"full"}
                justifyContent={"start"}
            >
                <Button
                    leftIcon={<FiEdit3 />}
                    colorScheme={"blue"}
                    disabled={principal !== null && props.user.id.toString() === principal!!.id}
                    onClick={handleModifyAccountClicked}
                >
                    Modify account
                </Button>
                <Button
                    leftIcon={<FiKey />}
                    colorScheme={"purple"}
                    disabled={principal !== null && props.user.id.toString() === principal!!.id}
                    onClick={() => (props.setResetPasswordModalUser(props.user))}
                >
                    Reset password
                </Button>
                {
                    props.user.accountActive &&
                    <Button
                        leftIcon={<FiXCircle />}
                        colorScheme={"red"}
                        isLoading={accountStatus !== ""}
                        loadingText={"Disabling account"}
                        disabled={principal !== null && props.user.id.toString() === principal!!.id}
                        onClick={() => (setAccountStatus("disabled"))}
                    >
                        Disable account
                    </Button>
                }
                {
                    !props.user.accountActive &&
                    <Button
                        leftIcon={<FiCheckCircle />}
                        colorScheme={"teal"}
                        isLoading={accountStatus !== ""}
                        loadingText={"Enabling account"}
                        disabled={principal !== null && props.user.id.toString() === principal!!.id}
                        onClick={() => (setAccountStatus("enabled"))}
                    >
                        Enable account
                    </Button>
                }
            </VStack>
        </HStack>
    )

}