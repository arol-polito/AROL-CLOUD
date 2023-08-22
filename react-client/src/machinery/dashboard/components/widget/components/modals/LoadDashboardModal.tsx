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
} from '@chakra-ui/react'
import React, {Fragment, useContext, useEffect, useState} from 'react'
import dashboardService from '../../../../../../services/DashboardService'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import type Dashboard from '../../../../models/Dashboard'
import type SavedDashboard from '../../../../interfaces/SavedDashboard'
import type LoadDashboardAction from '../../../../../machinery/interfaces/LoadDashboardAction'
import ToastContext from '../../../../../../utils/contexts/ToastContext'
import axiosExceptionHandler from '../../../../../../utils/AxiosExceptionHandler'

dayjs.extend(utc)

interface LoadDashboardModalProps {
    machineryUID: string
    dashboard: Dashboard
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    loadDashboardModalOpen: boolean
    setLoadDashboardModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    loadDashboard: (machineryUID, loadDashboard?: LoadDashboardAction) => Promise<void>
    dashboardPermissions: { read: boolean, modify: boolean, write: boolean }
}

interface DashboardTemplateEntryProps {
    dashboard: Dashboard
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    savedDashboard: SavedDashboard
    setSavedDashboards: React.Dispatch<React.SetStateAction<SavedDashboard[]>>
    machineryUID: string
    setLoadDashboardModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    loadDashboard: (machineryUID, loadDashboard?: LoadDashboardAction) => Promise<void>
}

interface SavedDashboardEntryProps {
    dashboard: Dashboard
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    savedDashboard: SavedDashboard
    setSavedDashboards: React.Dispatch<React.SetStateAction<SavedDashboard[]>>
    machineryUID: string
    setLoadDashboardModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    loadDashboard: (machineryUID, loadDashboard?: LoadDashboardAction) => Promise<void>
}

export default function LoadDashboardModal(props: LoadDashboardModalProps) {

    const {dashboard, setDashboard, loadDashboard, dashboardPermissions} = props;
    const {machineryUID, setLoadDashboardModalOpen, loadDashboardModalOpen} = props;

    const toast = useContext(ToastContext)

    const [tabIndex, setTabIndex] = useState(0)

    const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([])
    const [templateDashboards, setTemplateDashboards] = useState<SavedDashboard[]>([])
    const [loading, setLoading] = useState(true)

    // FETCH SAVED DASHBOARDS for this machinery
    useEffect(() => {
        if (tabIndex !== 0) return

        async function getData() {
            setLoading(true)

            try {
                const result = await dashboardService.getSavedDashboards(machineryUID)
                setSavedDashboards(result)
            } catch (e) {
                console.error(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    'Dashboards could not be loaded'
                )
            }

            setLoading(false)
        }

        getData()
    }, [tabIndex, machineryUID, toast])

    // FETCH TEMPLATE DASHBOARDS for machineries of this model
    useEffect(() => {
        if (tabIndex !== 1) return

        async function getData() {
            setLoading(true)

            try {
                const result = await dashboardService.getDashboardTemplates(machineryUID)
                setTemplateDashboards(result)
            } catch (e) {
                console.error(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    'Dashboard templates could not be loaded'
                )
            }

            setLoading(false)
        }

        getData()
    }, [tabIndex, machineryUID, toast])

    function closeModal() {
        setLoadDashboardModalOpen(false)
    }

    return (
        <Modal
            size="lg"
            isOpen={loadDashboardModalOpen}
            onClose={closeModal}
            scrollBehavior="inside"
        >
            <ModalOverlay
                onMouseDown={(e) => {
                    e.stopPropagation()
                }}
            />
            <ModalContent
                onMouseDown={(e) => {
                    e.stopPropagation()
                }}
            >
                <ModalHeader>Choose the dashboard to load</ModalHeader>
                <ModalCloseButton/>
                <ModalBody
                    pb={12}
                >
                    <Tabs
                        index={tabIndex}
                        variant='soft-rounded'
                        colorScheme='green'
                        onChange={(index) => {
                            setTabIndex(index)
                        }}
                        isFitted
                    >
                        <TabList>
                            <Tab>Dashboards</Tab>
                            <Tab
                                isDisabled={!dashboardPermissions.write}
                                title={!dashboardPermissions.write ? 'Operation not permitted' : ''}
                            >
                                Templates
                            </Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Text
                                    fontSize="md"
                                    fontWeight={400}
                                    color="gray.500"
                                    textAlign="center"
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
                                                dashboard={dashboard}
                                                setDashboard={setDashboard}
                                                savedDashboard={savedDashboard}
                                                setSavedDashboards={setSavedDashboards}
                                                machineryUID={machineryUID}
                                                setLoadDashboardModalOpen={setLoadDashboardModalOpen}
                                                loadDashboard={loadDashboard}
                                            />
                                        </Fragment>
                                    ))
                                }
                                {
                                    !loading && savedDashboards.length === 0 &&
                                    <Box
                                        w="full"
                                        textAlign="center"
                                        my="4"
                                    >
                                        There are no saved dashboards for this machinery
                                    </Box>
                                }
                                {
                                    loading &&
                                    <VStack
                                        w="full"
                                        h="150px"
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <Spinner size="md"/>
                                    </VStack>
                                }
                            </TabPanel>
                            <TabPanel>
                                <Text
                                    fontSize="md"
                                    fontWeight={400}
                                    color="gray.500"
                                    textAlign="center"
                                    mb={5}
                                >
                                    Below you can find dashboard templates from machineries of the same model
                                </Text>
                                {
                                    !loading &&
                                    templateDashboards.length > 0 &&
                                    templateDashboards.map((templateDashboard) => (
                                        <Fragment key={`${templateDashboard.machineryUID}-${templateDashboard.name}`}>
                                            <Divider/>
                                            <DashboardTemplateEntry
                                                dashboard={dashboard}
                                                setDashboard={setDashboard}
                                                savedDashboard={templateDashboard}
                                                setSavedDashboards={setSavedDashboards}
                                                machineryUID={machineryUID}
                                                setLoadDashboardModalOpen={setLoadDashboardModalOpen}
                                                loadDashboard={loadDashboard}
                                            />
                                        </Fragment>
                                    ))
                                }
                                {
                                    !loading && templateDashboards.length === 0 &&
                                    <Box
                                        w="full"
                                        textAlign="center"
                                        my="4"
                                    >
                                        There are no dashboard templates for this machinery model
                                    </Box>
                                }
                                {
                                    loading &&
                                    <VStack
                                        w="full"
                                        h="150px"
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <Spinner size="md"/>
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

function SavedDashboardEntry(props: SavedDashboardEntryProps) {

    const {dashboard, setDashboard, setSavedDashboards} = props;
    const {machineryUID, loadDashboard, setLoadDashboardModalOpen, savedDashboard} = props;

    const [dashboardDeleting, setDashboardDeleting] = useState(false);

    // LOAD DASHBOARD
    function handleLoadDashboardButton() {
        loadDashboard(machineryUID, {
            isTemplate: false,
            machineryUID: machineryUID,
            name: savedDashboard.name
        });
        setLoadDashboardModalOpen(false)
    }

    // DELETE DASHBOARD
    const deleteDashboard = async (dashboardToDelete) => {
        setDashboardDeleting(true);

        try {

            if (dashboard.name === dashboardToDelete)
                setDashboard((val) => {
                    val.numUnsavedChanges++
                    val.lastSave = 0

                    return {...val}
                })

            const result = await dashboardService.deleteDashboard(machineryUID, savedDashboard.name)

            if (!result) {
                console.error('Dashboard not deleted')

                return
            }

            setSavedDashboards((val) => val.filter((el) => (el.name !== dashboardToDelete)))
        } catch (e) {
            console.error(e)
        }

        setDashboardDeleting(false);
    }

    return (
        <VStack
            w="full"
            justifyContent="left"
        >
            <HStack
                w="full"
                mt={2}
                justifyContent="space-between"
            >
                <VStack
                    w="full"
                    alignItems="left"
                >
                    {
                        savedDashboard.isDefault &&
                        <Text fontSize="xs" fontWeight={600} color="green">
                            Default dashboard
                        </Text>
                    }
                    <Text fontSize="md" mt={savedDashboard.isDefault ? '0!important' : ''}>
                        {savedDashboard.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight={500} mt="0!important">
                        Saved on {dayjs(savedDashboard.timestamp).format('ddd, MMM D, YYYY H:mm')}
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt="0!important">
                        {savedDashboard.numSensorsMonitored} sensors monitored
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt="0!important">
                        {savedDashboard.numWidgets} widgets
                    </Text>
                </VStack>
                <VStack>
                    <Button
                        w="full"
                        colorScheme='teal'
                        variant='solid'
                        onClick={handleLoadDashboardButton}
                    >
                        Load
                    </Button>
                    <Button
                        w="full"
                        colorScheme='red'
                        variant='outline'
                        isLoading={dashboardDeleting}
                        loadingText="Deleting"
                        onClick={() => {
                            deleteDashboard(savedDashboard.name)
                        }}
                    >
                        Delete
                    </Button>

                </VStack>
            </HStack>
            <Divider orientation="horizontal"/>
        </VStack>
    )
}

function DashboardTemplateEntry(props: DashboardTemplateEntryProps) {

    const {savedDashboard, loadDashboard, setLoadDashboardModalOpen} = props;

    // LOAD DASHBOARD TEMPLATE
    function handleLoadDashboardButton() {
        loadDashboard({
            isTemplate: true,
            machineryUID: savedDashboard.machineryUID,
            name: savedDashboard.name
        })
        setLoadDashboardModalOpen(false)
    }

    return (
        <VStack
            w="full"
            justifyContent="left"
        >
            <HStack
                w="full"
                mt={2}
                justifyContent="space-between"
            >
                <VStack
                    w="full"
                    alignItems="left"
                >
                    <Text fontSize="md" mt={savedDashboard.isDefault ? '0!important' : ''}>
                        {savedDashboard.name}
                    </Text>
                    <Text fontSize="xs" mt={savedDashboard.isDefault ? '0!important' : ''}>
                        Machinery {savedDashboard.machineryUID}
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight={500} mt="0!important">
                        Saved on {dayjs(savedDashboard.timestamp).format('ddd, MMM D, YYYY H:mm')}
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt="0!important">
                        {savedDashboard.numWidgets} widgets
                    </Text>
                </VStack>
                <VStack>
                    <Button
                        w="full"
                        colorScheme='teal'
                        variant='solid'
                        onClick={handleLoadDashboardButton}
                    >
                        Use template
                    </Button>
                </VStack>
            </HStack>
            <Divider orientation="horizontal"/>
        </VStack>
    )
}
