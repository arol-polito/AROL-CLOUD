import type Dashboard from '../../models/Dashboard'
import React, {useContext} from 'react'
import {type Layout} from 'react-grid-layout'
import SidebarStatusContext from '../../../../utils/contexts/SidebarStatusContext'
import {
    Box,
    Button,
    Divider,
    HStack,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverTrigger,
    Portal,
    Text,
    VStack
} from '@chakra-ui/react'
import {
    FiChevronDown,
    FiEdit,
    FiMaximize2,
    FiMinimize2,
    FiMoreHorizontal,
    FiMoreVertical,
    FiPlus,
    FiSave
} from 'react-icons/fi'
import type SaveDashboard from '../../interfaces/SaveDashboard'

interface DashboardControlPanelProps {
    dashboard: Dashboard
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    setLayout: React.Dispatch<React.SetStateAction<Layout[]>>
    setSaveDashboardPromptOpen: React.Dispatch<React.SetStateAction<boolean>>
    saveDashboard: (saveDashboard: SaveDashboard) => Promise<void>
    dashboardPermissions: { read: boolean, modify: boolean, write: boolean }
}

export default function DashboardControlPanel(props: DashboardControlPanelProps) {
    const {dispatchSidebar} = useContext(SidebarStatusContext)

    const {dashboard, setDashboard, setLayout} = props;
    const {setSaveDashboardPromptOpen, dashboardPermissions} = props;

    // BUTTON CLICK - ADD WIDGET
    const handleAddWidgetButton = () => {
        dispatchSidebar({
            type: 'widget-selector-open'
        })
    }

    // DASHBOARD COMPACTION/GRAVITY
    function setDashboardCompactType(compactType: string | null) {
        setLayout(dashboard.layout)
        setDashboard((val) => {
            if (val.size.compactType !== compactType) {
                switch (compactType) {
                    case 'horizontal': {
                        val.size.compactType = 'horizontal'
                        break
                    }
                    case 'vertical': {
                        val.size.compactType = 'vertical'
                        break
                    }
                    default: {
                        val.size.compactType = null
                        break
                    }
                }

                val.numUnsavedChanges++;

                return {...val}
            }

            return val
        })
    }

    // SAVE DASHBOARD (set states to trigger save)
    function saveDashboard(isDefault: boolean) {
        props.saveDashboard({
            isDefault,
            name: dashboard.name,
            save: true,
            saveAs: false,
        })
    }

    // SAVE AS DASHBOARD (set states to trigger save)
    function saveAsDashboard() {
        setSaveDashboardPromptOpen(true)
    }

    // FORMAT DASHBOARD COMPACTION/GRAVITY TEXT
    function getCompactionType() {
        if (dashboard.size.compactType === 'horizontal')
            return 'Compact grid horizontally'

        if (dashboard.size.compactType === 'vertical')
            return 'Compact grid vertically'

        return 'No grid compaction'
    }

    return (
        <VStack
            w="full"
        >
            <HStack
                w="full"
                justifyContent="center"
                alignItems="baseline"
                my={2}
            >
                <Text fontSize="md" fontWeight={500}>{dashboard.name}</Text>
                {
                    dashboardPermissions.modify &&
                    <Popover>
                        <PopoverTrigger>
                            <Box
                                _hover={{
                                    cursor: 'pointer'
                                }}
                            >
                                {
                                    dashboard.numUnsavedChanges > 0
                                        ? <Text fontSize="xs" fontStyle="italic" color="gray.400">Changes not
                                            yet
                                            saved</Text>
                                        : <Text fontSize="xs" fontStyle="italic" color="gray.400">
                                            {!dashboard.lastSave ? '' : 'Saved'}
                                        </Text>
                                }
                            </Box>
                        </PopoverTrigger>
                        <Portal>
                            <PopoverContent shadow="2xl">
                                <PopoverArrow/>
                                <PopoverCloseButton/>
                                <PopoverBody>
                                    {
                                        dashboard.numUnsavedChanges > 0 &&
                                        <Text fontSize="md">There
                                            are {dashboard.numUnsavedChanges} unsaved changes. Please consider
                                            saving your modifications as soon as possible so not to risk them being
                                            lost.</Text>
                                    }
                                    {
                                        dashboard.numUnsavedChanges === 0 &&
                                        <Text fontSize="md">All changes
                                            are saved. You can safely navigate away from the dashboard.</Text>
                                    }
                                </PopoverBody>
                            </PopoverContent>
                        </Portal>
                    </Popover>
                }
            </HStack>
            <Divider orientation="horizontal" m="0!important"/>
            <HStack
                w="full"
                justifyContent="left"
                alignItems="stretch"
                mt="0!important"
            >
                <Button
                    colorScheme='blue'
                    variant='ghost'
                    isDisabled={dashboard.isLoading || !dashboardPermissions.modify}
                    title={!dashboardPermissions.modify ? 'Operation not permitted' : ''}
                    leftIcon={<FiPlus/>}
                    onClick={handleAddWidgetButton}
                >
                    Add widget
                </Button>
                <Divider orientation="vertical" h="auto" m="0!important"/>
                <Menu>
                    <MenuButton
                        as={Button}
                        leftIcon={<FiSave/>}
                        rightIcon={<FiChevronDown/>}
                        colorScheme="blue"
                        variant='ghost'
                        ml="0!important"
                        // Stop click from propagating down to dashboard
                        onMouseDown={(e) => {
                            e.stopPropagation()
                        }}

                    >
                        Save dashboard
                    </MenuButton>
                    <Portal>
                        <MenuList
                            shadow="2xl"
                            // Stop click from propagating down to dashboard
                            onMouseDown={(e) => {
                                e.stopPropagation()
                            }}
                        >
                            <MenuItem
                                icon={<FiSave/>}
                                isDisabled={dashboard.widgets.length === 0 || dashboard.isLoading || !dashboardPermissions.modify}
                                title={!dashboardPermissions.modify ? 'Operation not permitted' : ''}
                                onClick={() => {
                                    saveDashboard(false)
                                }}
                            >
                                Save
                            </MenuItem>
                            <MenuItem
                                icon={<FiSave/>}
                                isDisabled={dashboard.widgets.length === 0 || dashboard.isLoading || !dashboardPermissions.modify}
                                title={!dashboardPermissions.modify ? 'Operation not permitted' : ''}
                                onClick={() => {
                                    saveDashboard(true)
                                }}
                            >
                                Save and set as default
                            </MenuItem>
                            <MenuItem
                                icon={<FiEdit/>}
                                isDisabled={dashboard.widgets.length === 0 || dashboard.isLoading || !dashboardPermissions.write}
                                title={!dashboardPermissions.write ? 'Operation not permitted' : ''}
                                onClick={saveAsDashboard}
                            >
                                Save as
                            </MenuItem>
                        </MenuList>
                    </Portal>
                </Menu>
                <Divider orientation="vertical" h="auto" m="0!important"/>
                <Menu>
                    <MenuButton
                        as={Button}
                        leftIcon={<FiMinimize2/>}
                        rightIcon={<FiChevronDown/>}
                        colorScheme="blue"
                        variant='ghost'
                        ml="0!important"
                        // Stop click from propagating down to dashboard
                        onMouseDown={(e) => {
                            e.stopPropagation()
                        }}

                    >
                        {getCompactionType()}
                    </MenuButton>
                    <Portal>
                        <MenuList
                            shadow="2xl"
                            // Stop click from propagating down to dashboard
                            onMouseDown={(e) => {
                                e.stopPropagation()
                            }}
                        >
                            <MenuItem
                                icon={<FiMoreVertical/>}
                                isDisabled={!dashboardPermissions.modify}
                                title={!dashboardPermissions.modify ? 'Operation not permitted' : ''}
                                onClick={() => {
                                    setDashboardCompactType('vertical')
                                }}
                            >
                                Compact vertically
                            </MenuItem>
                            <MenuItem
                                icon={<FiMoreHorizontal/>}
                                isDisabled={!dashboardPermissions.modify}
                                title={!dashboardPermissions.modify ? 'Operation not permitted' : ''}
                                onClick={() => {
                                    setDashboardCompactType('horizontal')
                                }}
                            >
                                Compact horizontally
                            </MenuItem>
                            <MenuItem
                                icon={<FiMaximize2/>}
                                isDisabled={!dashboardPermissions.modify}
                                title={!dashboardPermissions.modify ? 'Operation not permitted' : ''}
                                onClick={() => {
                                    setDashboardCompactType(null)
                                }}
                            >
                                Do not compact
                            </MenuItem>
                        </MenuList>
                    </Portal>
                </Menu>
                <Divider orientation="vertical" h="auto" m="0!important"/>
            </HStack>
        </VStack>
    )
}
