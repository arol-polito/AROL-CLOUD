import {
    Box,
    Button,
    Divider,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    VStack
} from "@chakra-ui/react";
import React, {Fragment, useContext, useEffect, useState} from "react";
import dashboardService from "../../../../services/DashboardService";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import Dashboard from "../../models/Dashboard";
import SavedDashboard from "../../interfaces/SavedDashboard";
import LoadDashboardAction from "../../../machinery/interfaces/LoadDashboardAction";
import ToastContext from "../../../../utils/contexts/ToastContext";
import axiosExceptionHandler from "../../../../utils/AxiosExceptionHandler";

dayjs.extend(utc)

interface LoadDashboardModalProps {
    machineryUID: string
    dashboard: Dashboard
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    loadDashboardModalOpen: boolean
    setLoadDashboardModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    setLoadDashboard: React.Dispatch<React.SetStateAction<LoadDashboardAction>>
    dashboardPermissions: { read: boolean, modify: boolean, write: boolean }
}

export default function LoadDashboardModal(props: LoadDashboardModalProps) {

    const toast = useContext(ToastContext)

    const [tabIndex, setTabIndex] = useState(0)

    const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([])
    const [templateDashboards, setTemplateDashboards] = useState<SavedDashboard[]>([])
    const [loading, setLoading] = useState(true)

    //FETCH SAVED DASHBOARDS for this machinery
    useEffect(() => {

        if(tabIndex!==0) return

        async function getData() {

            setLoading(true)

            try {

                let result = await dashboardService.getSavedDashboards(props.machineryUID)
                setSavedDashboards(result)

            } catch (e) {
                console.log(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    "Dashboards could not be loaded"
                )
            }

            setLoading(false)
        }

        getData()

    }, [tabIndex])

    //FETCH TEMPLATE DASHBOARDS for machineries of this model
    useEffect(() => {

        if(tabIndex!==1) return

        async function getData() {

            setLoading(true)

            try {
                let result = await dashboardService.getDashboardTemplates(props.machineryUID)
                setTemplateDashboards(result)
            } catch (e) {
                console.log(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    "Dashboard templates could not be loaded"
                )
            }

            setLoading(false)
        }

        getData()

    }, [tabIndex])

    function closeModal(){
        props.setLoadDashboardModalOpen(false)
    }

    return (
        <Modal
            size={"lg"}
            isOpen={props.loadDashboardModalOpen}
            onClose={closeModal}
            scrollBehavior={"inside"}
        >
            <ModalOverlay
                onMouseDown={(e) => (e.stopPropagation())}
            />
            <ModalContent
                onMouseDown={(e) => (e.stopPropagation())}
            >
                <ModalHeader>Choose the dashboard to load</ModalHeader>
                <ModalCloseButton/>
                <ModalBody
                    pb={12}
                >
                    <Tabs
                        isFitted={true}
                        index={tabIndex}
                        variant='soft-rounded'
                        colorScheme='green'
                        onChange={(index) => setTabIndex(index)}
                    >
                        <TabList>
                            <Tab>Dashboards</Tab>
                            <Tab
                                isDisabled={!props.dashboardPermissions.write}
                                title={!props.dashboardPermissions.write ? "Operation not permitted" : ""}
                            >
                                Templates
                            </Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Text
                                    fontSize={"md"}
                                    fontWeight={400}
                                    color={"gray.500"}
                                    textAlign={"center"}
                                    mb={5}
                                >
                                    Below you can find the saved dashboards for this machinery
                                </Text>
                                {
                                    !loading && savedDashboards.length > 0 &&
                                    savedDashboards.map((savedDashboard) => (
                                        <Fragment key={savedDashboard.name}>
                                            <Divider/>
                                            <SavedDashboardEntry
                                                dashboard={props.dashboard}
                                                setDashboard={props.setDashboard}
                                                savedDashboard={savedDashboard}
                                                setSavedDashboards={setSavedDashboards}
                                                machineryUID={props.machineryUID}
                                                setLoadDashboardModalOpen={props.setLoadDashboardModalOpen}
                                                setLoadDashboard={props.setLoadDashboard}
                                            />
                                        </Fragment>
                                    ))
                                }
                                {
                                    !loading && savedDashboards.length === 0 &&
                                    <Box
                                        w={"full"}
                                        textAlign={"center"}
                                        my={"4"}
                                    >
                                        There are no saved dashboards for this machinery
                                    </Box>
                                }
                                {
                                    loading &&
                                    <VStack
                                        w={"full"}
                                        h={"150px"}
                                        justifyContent={"center"}
                                        alignItems={"center"}
                                    >
                                        <Spinner size={"md"}/>
                                    </VStack>
                                }
                            </TabPanel>
                            <TabPanel>
                                <Text
                                    fontSize={"md"}
                                    fontWeight={400}
                                    color={"gray.500"}
                                    textAlign={"center"}
                                    mb={5}
                                >
                                    Below you can find dashboard templates from machineries of the same model
                                </Text>
                                {
                                    !loading &&
                                    templateDashboards.length > 0 &&
                                    templateDashboards.map((templateDashboard) => (
                                        <Fragment key={templateDashboard.machineryUID+"-"+templateDashboard.name}>
                                            <Divider/>
                                            <DashboardTemplateEntry
                                                dashboard={props.dashboard}
                                                setDashboard={props.setDashboard}
                                                savedDashboard={templateDashboard}
                                                setSavedDashboards={setSavedDashboards}
                                                machineryUID={props.machineryUID}
                                                setLoadDashboardModalOpen={props.setLoadDashboardModalOpen}
                                                setLoadDashboard={props.setLoadDashboard}
                                            />
                                        </Fragment>
                                    ))
                                }
                                {
                                    !loading && templateDashboards.length === 0 &&
                                    <Box
                                        w={"full"}
                                        textAlign={"center"}
                                        my={"4"}
                                    >
                                        There are no dashboard templates for this machinery model
                                    </Box>
                                }
                                {
                                    loading &&
                                    <VStack
                                        w={"full"}
                                        h={"150px"}
                                        justifyContent={"center"}
                                        alignItems={"center"}
                                    >
                                        <Spinner size={"md"}/>
                                    </VStack>
                                }
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

interface SavedDashboardEntryProps {
    dashboard: Dashboard
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    savedDashboard: SavedDashboard
    setSavedDashboards: React.Dispatch<React.SetStateAction<SavedDashboard[]>>
    machineryUID: string
    setLoadDashboardModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    setLoadDashboard: React.Dispatch<React.SetStateAction<LoadDashboardAction>>
}

function SavedDashboardEntry(props: SavedDashboardEntryProps) {

    const [dashboardToDelete, setDashboardToDelete] = useState("")

    //LOAD DASHBOARD
    function handleLoadDashboardButton() {
        props.setLoadDashboard({
            doLoad: true,
            isTemplate: false,
            machineryUID: "",
            name: props.savedDashboard.name
        })
        props.setLoadDashboardModalOpen(false)
    }

    //DELETE DASHBOARD
    useEffect(() => {

        if (dashboardToDelete === "") return

        async function deleteDash() {

            try {

                if (props.dashboard.name === dashboardToDelete) {
                    props.setDashboard((val) => {
                        val.numUnsavedChanges++
                        val.lastSave = 0
                        return {...val}
                    })
                }

                let result = await dashboardService.deleteDashboard(props.machineryUID, props.savedDashboard.name)

                if (!result) {
                    console.log("Dashboard not deleted")
                    return
                }

                setDashboardToDelete("")

                props.setSavedDashboards((val) => {
                    return val.filter((el) => (el.name !== dashboardToDelete))
                })

            } catch (e) {
                console.log(e)
            }
        }

        deleteDash()

    }, [dashboardToDelete])

    return (
        <VStack
            w={"full"}
            justifyContent={"left"}
        >
            <HStack
                w={"full"}
                mt={2}
                justifyContent={"space-between"}
            >
                <VStack
                    w={"full"}
                    alignItems={"left"}
                >
                    {
                        props.savedDashboard.isDefault &&
                        <Text fontSize={"xs"} fontWeight={600} color={"green"}>
                            Default dashboard
                        </Text>
                    }
                    <Text fontSize={"md"} mt={props.savedDashboard.isDefault ? "0!important" : ""}>
                        {props.savedDashboard.name}
                    </Text>
                    <Text fontSize={"xs"} color={"gray.500"} fontWeight={500} mt={"0!important"}>
                        Saved on {dayjs(props.savedDashboard.timestamp).format("ddd, MMM D, YYYY H:mm")}
                    </Text>
                    <Text fontSize={"xs"} color={"gray.500"} mt={"0!important"}>
                        {props.savedDashboard.numSensorsMonitored} sensors monitored
                    </Text>
                    <Text fontSize={"xs"} color={"gray.500"} mt={"0!important"}>
                        {props.savedDashboard.numWidgets} widgets
                    </Text>
                </VStack>
                <VStack>
                    <Button
                        w={"full"}
                        colorScheme='teal'
                        variant='solid'
                        onClick={handleLoadDashboardButton}
                    >
                        Load
                    </Button>
                    <Button
                        w={"full"}
                        colorScheme='red'
                        variant='outline'
                        isLoading={dashboardToDelete !== ""}
                        loadingText={"Deleting"}
                        onClick={() => (setDashboardToDelete(props.savedDashboard.name))}
                    >
                        Delete
                    </Button>

                </VStack>
            </HStack>
            <Divider orientation={"horizontal"}/>
        </VStack>
    )
}

interface DashboardTemplateEntryProps {
    dashboard: Dashboard
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    savedDashboard: SavedDashboard
    setSavedDashboards: React.Dispatch<React.SetStateAction<SavedDashboard[]>>
    machineryUID: string
    setLoadDashboardModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    setLoadDashboard: React.Dispatch<React.SetStateAction<LoadDashboardAction>>
}

function DashboardTemplateEntry(props: DashboardTemplateEntryProps) {

    //LOAD DASHBOARD TEMPLATE
    function handleLoadDashboardButton() {
        props.setLoadDashboard({
            doLoad: true,
            isTemplate: true,
            machineryUID: props.savedDashboard.machineryUID,
            name: props.savedDashboard.name
        })
        props.setLoadDashboardModalOpen(false)
    }

    return (
        <VStack
            w={"full"}
            justifyContent={"left"}
        >
            <HStack
                w={"full"}
                mt={2}
                justifyContent={"space-between"}
            >
                <VStack
                    w={"full"}
                    alignItems={"left"}
                >
                    <Text fontSize={"md"} mt={props.savedDashboard.isDefault ? "0!important" : ""}>
                        {props.savedDashboard.name}
                    </Text>
                    <Text fontSize={"xs"} mt={props.savedDashboard.isDefault ? "0!important" : ""}>
                        Machinery {props.savedDashboard.machineryUID}
                    </Text>
                    <Text fontSize={"xs"} color={"gray.500"} fontWeight={500} mt={"0!important"}>
                        Saved on {dayjs(props.savedDashboard.timestamp).format("ddd, MMM D, YYYY H:mm")}
                    </Text>
                    <Text fontSize={"xs"} color={"gray.500"} mt={"0!important"}>
                        {props.savedDashboard.numWidgets} widgets
                    </Text>
                </VStack>
                <VStack>
                    <Button
                        w={"full"}
                        colorScheme='teal'
                        variant='solid'
                        onClick={handleLoadDashboardButton}
                    >
                        Use template
                    </Button>
                </VStack>
            </HStack>
            <Divider orientation={"horizontal"}/>
        </VStack>
    )
}