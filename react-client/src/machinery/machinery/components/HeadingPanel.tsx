import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    HStack,
    Image,
    Stack,
    Text,
    VStack
} from '@chakra-ui/react'
import type Machinery from '../../../machineries-map/components/Machinery'
import React, {useRef, useState} from 'react'
import LoadDashboardModal from '../../dashboard/components/widget/components/modals/LoadDashboardModal'
import {FiChevronDown, FiChevronUp, FiFolder, FiFolderPlus} from 'react-icons/fi'
import Dashboard from '../../dashboard/models/Dashboard'
import type TooltipData from '../../dashboard/interfaces/TooltipData'
import type LoadDashboardAction from '../interfaces/LoadDashboardAction'

interface HeadingPanelProps {
    type: string
    machinery: Machinery
    dashboard: Dashboard
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    loadDashboard: (machineryUID, loadDashboard?: LoadDashboardAction) => Promise<void>
    dashboardPermissions: { read: boolean, modify: boolean, write: boolean }
    documentsPermissions: { read: boolean, modify: boolean, write: boolean }
    setChartTooltip: React.Dispatch<React.SetStateAction<TooltipData>>
}

export default function HeadingPanel(props: HeadingPanelProps) {
    const [expanded, setExpanded] = useState(true)
    const [loadDashboardModalOpen, setLoadDashboardModalOpen] = useState(false)

    const [dashboardNotSavedPromptObject, setDashboardNotSavedPromptObject] = useState<{
        open: boolean
        type: string
    }>({
        open: false,
        type: ''
    })

    // NEW DASHBOARD BUTTON CLICKED
    function handleNewDashboardButtonClicked() {
        if (props.dashboard.numUnsavedChanges)
            setDashboardNotSavedPromptObject({
                open: true,
                type: 'new-dashboard'
            })
        else
            props.setDashboard(
                new Dashboard()
            )
    }

    // LOAD DASHBOARD BUTTON CLICKED
    function handleLoadDashboardButtonClicked() {
        if (props.dashboard.numUnsavedChanges)
            setDashboardNotSavedPromptObject({
                open: true,
                type: 'load-dashboard'
            })
        else
            setLoadDashboardModalOpen(true)
    }

    // CLOSE TOOLTIP on mouse down over dashboard container
    function closeTooltip() {
        props.setChartTooltip((val) => {
            val.active = false

            return {...val}
        })
    }

    return (
        <>
            <Stack
                borderWidth="1px"
                borderRadius="lg"
                w="full"
                direction="row"
                bg="white"
                boxShadow="2xl"
                px={4}
                pt={4}
                pb={1}
                mb={6}
                justifyContent="stretch"
                onMouseDown={closeTooltip}
            >
                {
                    expanded &&
                    <ExpandedHeadingPanel
                        type={props.type}
                        machinery={props.machinery}
                        setLoadDashboardModalOpen={setLoadDashboardModalOpen}
                        setExpanded={setExpanded}
                        handleNewDashboardButtonClicked={handleNewDashboardButtonClicked}
                        handleLoadDashboardButtonClicked={handleLoadDashboardButtonClicked}
                        dashboardPermissions={props.dashboardPermissions}
                        documentsPermissions={props.documentsPermissions}
                    />
                }
                {
                    !expanded &&
                    <CollapsedHeadingPanel
                        type={props.type}
                        machinery={props.machinery}
                        setLoadDashboardModalOpen={setLoadDashboardModalOpen}
                        setExpanded={setExpanded}
                        handleNewDashboardButtonClicked={handleNewDashboardButtonClicked}
                        handleLoadDashboardButtonClicked={handleLoadDashboardButtonClicked}
                        dashboardPermissions={props.dashboardPermissions}
                        documentsPermissions={props.documentsPermissions}
                    />
                }

            </Stack>
            {
                loadDashboardModalOpen &&
                <LoadDashboardModal
                    machineryUID={props.machinery.uid}
                    dashboard={props.dashboard}
                    setDashboard={props.setDashboard}
                    loadDashboardModalOpen={loadDashboardModalOpen}
                    setLoadDashboardModalOpen={setLoadDashboardModalOpen}
                    loadDashboard={props.loadDashboard}
                    dashboardPermissions={props.dashboardPermissions}
                />
            }
            {
                dashboardNotSavedPromptObject &&
                <DashboardNotSavedPrompt
                    dashboardNotSavePromptObject={dashboardNotSavedPromptObject}
                    setDashboardNotSavePromptObject={setDashboardNotSavedPromptObject}
                    setDashboard={props.setDashboard}
                    setLoadDashboardModalOpen={setLoadDashboardModalOpen}
                />
            }
        </>
    )
}

interface ExpandedCollapsedHeadingPanelProps {
    type: string
    machinery: Machinery
    setLoadDashboardModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    setExpanded: React.Dispatch<React.SetStateAction<boolean>>
    handleNewDashboardButtonClicked: Function
    handleLoadDashboardButtonClicked: Function
    dashboardPermissions: { read: boolean, modify: boolean, write: boolean }
    documentsPermissions: { read: boolean, modify: boolean, write: boolean }
}

function ExpandedHeadingPanel(props: ExpandedCollapsedHeadingPanelProps) {
    function handleHeadingPanelCollapse() {
        props.setExpanded(false)
    }

    return <>
        <Flex>
            <Box boxSize="200px">
                <Image
                    objectFit="cover"
                    boxSize="100%"
                    // src={require("/src/assets/machineries/"+ props.machinery.modelID + ".png")}
                    src={require(`./../../../assets/machineries/${props.machinery.modelID}.png`)}
                />
            </Box>
        </Flex>
        <Divider orientation="vertical" h="auto"/>
        <VStack w="full">
            <HStack w="full">
                <Stack
                    flexDirection="column"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    flexWrap="nowrap"
                    w="full"
                    p={1}
                >
                    <Heading fontSize="md" fontFamily="body" color="gray.400" whiteSpace="nowrap">
                        {props.machinery.uid}
                    </Heading>
                    <Heading
                        fontSize="2xl"
                        fontFamily="body"
                        whiteSpace="nowrap"
                        mb="0!important"
                    >
                        {props.machinery.modelName}
                    </Heading>
                    <Text
                        fontWeight={300}
                        color="gray.400"
                        whiteSpace="nowrap"
                        fontSize="sm"
                    >
                        Machinery type
                    </Text>
                    <Text
                        // fontWeight={600}
                        color="black"
                        fontSize="md"
                        whiteSpace="nowrap"
                        mt="0!important"
                        mb={4}
                    >
                        {props.machinery.modelType}
                    </Text>
                    <Text
                        fontWeight={300}
                        color="gray.400"
                        whiteSpace="nowrap"
                        fontSize="sm"
                    >
                        Number of heads
                    </Text>
                    <Text
                        color="black"
                        whiteSpace="nowrap"
                        mt="0!important"
                        mb={4}
                    >
                        {props.machinery.numHeads} heads
                    </Text>
                    <Text
                        fontWeight={300}
                        color="gray.400"
                        whiteSpace="nowrap"
                        fontSize="sm"
                    >
                        Machinery location
                    </Text>
                    <Text
                        color="black"
                        whiteSpace="nowrap"
                        my="0!important"
                        // mb={0}
                    >
                        {props.machinery.locationCluster}
                    </Text>
                </Stack>
                {
                    props.type === 'dashboard' &&
                    <VStack
                        w="250px"
                        h="full"
                        alignItems="flex-start"
                    >
                        <Button
                            w="full"
                            leftIcon={<FiFolder/>}
                            colorScheme="blue"
                            isDisabled={!props.dashboardPermissions.read}
                            title={!props.dashboardPermissions.read ? 'Operation not permitted' : ''}
                            onClick={() => (props.handleLoadDashboardButtonClicked())}
                        >
                            Load dashboard
                        </Button>
                        <Button
                            w="full"
                            leftIcon={<FiFolderPlus/>}
                            colorScheme="blue"
                            isDisabled={!props.dashboardPermissions.write}
                            title={!props.dashboardPermissions.write ? 'Operation not permitted' : ''}
                            onClick={() => (props.handleNewDashboardButtonClicked())}
                        >
                            New dashboard
                        </Button>
                    </VStack>
                }
            </HStack>
            <HStack
                w="full"
                justifyContent="center"
            >
                <Box
                    px="2"
                    mr="225px"
                    _hover={{
                        cursor: 'pointer'
                    }}
                    onClick={handleHeadingPanelCollapse}
                >
                    <FiChevronUp/>
                </Box>
            </HStack>
        </VStack>
    </>
}

function CollapsedHeadingPanel(props: ExpandedCollapsedHeadingPanelProps) {
    function handleHeadingPanelExpand() {
        props.setExpanded(true)
    }

    return <>
        <Flex>
            <Box boxSize="85px">
                <Image
                    objectFit="cover"
                    boxSize="100%"
                    src={require(`./../../../assets/machineries/${props.machinery.modelID}.png`)}
                />
            </Box>
        </Flex>
        <Divider orientation="vertical" h="auto"/>
        <VStack w="full">
            <HStack w="full">
                <VStack
                    flexWrap="nowrap"
                    w="max-content"
                    alignItems="left"
                >
                    <HStack
                        alignItems="baseline"
                    >
                        <Heading
                            fontSize="2xl"
                            fontFamily="body"
                            whiteSpace="nowrap"
                            mb="4!important"
                            mr={3}
                        >
                            {props.machinery.modelName}
                        </Heading>
                        <Heading fontSize="md" fontFamily="body" color="gray.400" whiteSpace="nowrap">
                            {props.machinery.uid}
                        </Heading>
                    </HStack>
                    <HStack mt="-2!important">
                        <Text
                            whiteSpace="nowrap"
                            mt="0!important"
                        >
                            {props.machinery.modelType}
                        </Text>
                        <Text color="gray.200" mx={1} mt="0!important">|</Text>
                        <Text
                            whiteSpace="nowrap"
                            mt="0!important"
                        >
                            {props.machinery.numHeads} heads
                        </Text>
                        <Text color="gray.200" mx={1} mt="0!important">|</Text>
                        <Text
                            whiteSpace="nowrap"
                            mt="0!important"
                        >
                            {props.machinery.locationCluster}
                        </Text>
                    </HStack>
                </VStack>
                {
                    props.type === 'dashboard' &&
                    <VStack
                        w="full"
                        alignItems="flex-end"
                        justifyContent="center"
                    >
                        <HStack>
                            <Button
                                leftIcon={<FiFolder/>}
                                colorScheme="blue"
                                isDisabled={!props.dashboardPermissions.read}
                                title={!props.dashboardPermissions.read ? 'Operation not permitted' : ''}
                                onClick={() => (props.handleLoadDashboardButtonClicked())}
                            >
                                Load dashboard
                            </Button>
                            <Button
                                leftIcon={<FiFolderPlus/>}
                                colorScheme="blue"
                                isDisabled={!props.dashboardPermissions.write}
                                title={!props.dashboardPermissions.write ? 'Operation not permitted' : ''}
                                onClick={() => (props.handleNewDashboardButtonClicked())}
                            >
                                New dashboard
                            </Button>
                        </HStack>
                    </VStack>
                }
            </HStack>
            <HStack
                w="full"
                justifyContent="center"
            >
                <Box
                    px="2"
                    mr="110px"
                    _hover={{
                        cursor: 'pointer'
                    }}
                    onClick={handleHeadingPanelExpand}
                >
                    <FiChevronDown/>
                </Box>
            </HStack>
        </VStack>
    </>
}

interface DashboardNotSavedPromptProps {
    dashboardNotSavePromptObject: { open: boolean, type: string }
    setDashboardNotSavePromptObject: React.Dispatch<React.SetStateAction<{ open: boolean, type: string }>>
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    setLoadDashboardModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function DashboardNotSavedPrompt(props: DashboardNotSavedPromptProps) {
    const cancelRef = useRef<HTMLButtonElement>(null)

    function closePrompt() {
        props.setDashboardNotSavePromptObject({
            open: false,
            type: ''
        })
    }

    function handleContinueButtonClicked() {
        if (props.dashboardNotSavePromptObject.type === 'new-dashboard')
            createNewDashboard()
        else {
            props.setLoadDashboardModalOpen(true)
            closePrompt()
        }
    }

    function createNewDashboard() {
        const newDash = new Dashboard()

        props.setDashboard(
            newDash
        )

        closePrompt()
    }

    return (
        <AlertDialog
            isOpen={props.dashboardNotSavePromptObject.open}
            leastDestructiveRef={cancelRef}
            onClose={closePrompt}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Unsaved changes
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        There are unsaved changes in the current dashboard. If you continue all the changes will be lost
                        forever. Are you sure?
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={closePrompt}>
                            Cancel
                        </Button>
                        <Button colorScheme='blue' onClick={handleContinueButtonClicked} ml={3}>
                            Continue
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}
