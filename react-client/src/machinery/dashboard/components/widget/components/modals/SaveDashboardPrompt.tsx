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
} from '@chakra-ui/react'
import React, {useRef, useState} from 'react'
import dayjs from 'dayjs'
import type Dashboard from '../../../../models/Dashboard'
import type SaveDashboard from '../../../../interfaces/SaveDashboard'

interface SaveDashboardPromptProps {
    dashboard: Dashboard
    promptOpen: boolean
    setPromptOpen: React.Dispatch<React.SetStateAction<boolean>>
    saveDashboard: (saveDashboard: SaveDashboard) => Promise<void>
    dashboardSaving: boolean
}

export default function SaveDashboardPrompt(props: SaveDashboardPromptProps) {

    const {dashboard, dashboardSaving, setPromptOpen} = props;
    const {promptOpen, saveDashboard} = props;

    const [dashboardName, setDashboardName] = useState(
        dashboard.name !== 'Unsaved new dashboard'
            ? dashboard.name
            : `Dashboard ${dayjs().format('ddd, MMM D, YYYY H:mm')}`
    )
    const [isDefaultDashboard, setIsDefaultDashboard] = useState(dashboard.isDefault)
    const cancelRef = useRef<HTMLButtonElement>(null)

    function handlePromptClose() {
        if (dashboardSaving) return

        setPromptOpen(false)
    }

    function handleSaveButtonPressed() {
        saveDashboard({
            name: dashboardName,
            isDefault: isDefaultDashboard,
            save: false,
            saveAs: true,
        })
    }

    return (
        <AlertDialog
            isOpen={promptOpen}
            leastDestructiveRef={cancelRef}
            onClose={handlePromptClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Save dashboard
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        <VStack w="full" justifyContent="left" alignItems="left">
                            <Text fontSize="sm">Please type a name for the dashboard</Text>
                            <Input
                                w="full"
                                variant='outline'
                                isInvalid={dashboardName.length === 0}
                                errorBorderColor='red'
                                value={dashboardName}
                                onChange={(e) => {
                                    setDashboardName(e.target.value)
                                }}
                            />
                            <FormControl display='flex' alignItems='center'>
                                <FormLabel htmlFor='isDefault' mb='0'>
                                    Load this dashboard by default
                                </FormLabel>
                                <Switch
                                    id='isDefault'
                                    isChecked={isDefaultDashboard}
                                    onChange={(e) => {
                                        setIsDefaultDashboard(e.target.checked)
                                    }}
                                />
                            </FormControl>
                            {
                                dashboardName.length === 0 &&
                                <Text fontSize="sm" color="red">Dashboard name cannot be empty</Text>
                            }
                            {/*{*/}
                            {/*    saveDashboard.saveAsError &&*/}
                            {/*    <Text fontSize="sm" color="red">A dashboard with this name already exists</Text>*/}
                            {/*}*/}
                        </VStack>
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button
                            ref={cancelRef}
                            onClick={handlePromptClose}
                            disabled={dashboardSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            colorScheme='blue'
                            onClick={handleSaveButtonPressed} ml={3}
                            isLoading={dashboardSaving}
                            loadingText="Saving"
                            disabled={dashboardName.length === 0 || dashboardSaving}
                        >
                            Save
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}
