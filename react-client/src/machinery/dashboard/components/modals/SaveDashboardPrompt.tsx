import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    FormControl,
    FormLabel,
    Input,
    Switch,
    Text,
    VStack
} from "@chakra-ui/react";
import React, {useRef, useState} from "react";
import dayjs from "dayjs";
import Dashboard from "../../models/Dashboard";
import SaveDashboard from "../../interfaces/SaveDashboard";

interface SaveDashboardPromptProps{
    dashboard: Dashboard
    promptOpen: boolean
    setPromptOpen: React.Dispatch<React.SetStateAction<boolean>>
    saveDashboard: SaveDashboard
    setSaveDashboard: React.Dispatch<React.SetStateAction<SaveDashboard>>
    dashboardSaving: boolean
}


export default function SaveDashboardPrompt(props: SaveDashboardPromptProps){

    const [dashboardName, setDashboardName] = useState(
        props.dashboard.name!=="Unsaved new dashboard" ?
            props.dashboard.name : "Dashboard "+dayjs().format("ddd, MMM D, YYYY H:mm")
    )
    const [isDefaultDashboard, setIsDefaultDashboard] = useState(props.dashboard.isDefault)
    const cancelRef = useRef<HTMLButtonElement>(null)

    function handlePromptClose(){
        if(props.dashboardSaving) return

        props.setSaveDashboard({
            isDefault: false,
            name: "",
            save: false,
            saveAs: false,
            saveAsError: false
        })

        props.setPromptOpen(false)
    }

    function handleSaveButtonPressed(){
        props.setSaveDashboard({
            name: dashboardName,
            isDefault: isDefaultDashboard,
            save: false,
            saveAs: true,
            saveAsError: false
        })
    }

    return(
        <AlertDialog
            isOpen={props.promptOpen}
            leastDestructiveRef={cancelRef}
            onClose={handlePromptClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Save dashboard
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        <VStack w={"full"} justifyContent={"left"} alignItems={"left"}>
                            <Text fontSize={"sm"}>Please type a name for the dashboard</Text>
                            <Input
                                w={"full"}
                                variant='outline'
                                isInvalid={dashboardName.length===0}
                                errorBorderColor='red'
                                value={dashboardName}
                                onChange={(e) => (setDashboardName(e.target.value))}
                            />
                            <FormControl display='flex' alignItems='center'>
                                <FormLabel htmlFor='isDefault' mb='0'>
                                    Load this dashboard by default
                                </FormLabel>
                                <Switch
                                    id='isDefault'
                                    isChecked={isDefaultDashboard}
                                    onChange={(e)=>(setIsDefaultDashboard(e.target.checked))}
                                />
                            </FormControl>
                            {
                                dashboardName.length === 0 &&
                                <Text fontSize={"sm"} color={"red"}>Dashboard name cannot be empty</Text>
                            }
                            {
                                props.saveDashboard.saveAsError &&
                                <Text fontSize={"sm"} color={"red"}>A dashboard with this name already exists</Text>
                            }
                        </VStack>
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button
                            ref={cancelRef}
                            onClick={handlePromptClose}
                            disabled={props.dashboardSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            colorScheme='blue'
                            onClick={handleSaveButtonPressed} ml={3}
                            isLoading={props.dashboardSaving}
                            loadingText={"Saving"}
                            disabled={dashboardName.length===0 || props.dashboardSaving}
                        >
                            Save
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}
