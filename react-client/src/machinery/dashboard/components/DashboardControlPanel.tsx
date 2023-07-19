import Dashboard from "../models/Dashboard";
import React, {useContext} from "react";
import DashboardSize from "../interfaces/DashboardSize";
import {Layout} from "react-grid-layout";
import SidebarStatusContext from "../../../utils/contexts/SidebarStatusContext";
import {
    Box, Button, Divider,
    HStack, Menu, MenuButton, MenuItem, MenuList,
    Popover,
    PopoverArrow, PopoverBody, PopoverCloseButton,
    PopoverContent,
    PopoverTrigger,
    Portal,
    Text,
    VStack
} from "@chakra-ui/react";
import {
    FiChevronDown,
    FiEdit,
    FiMaximize2,
    FiMinimize2,
    FiMoreHorizontal,
    FiMoreVertical,
    FiPlus,
    FiSave
} from "react-icons/fi";
import SaveDashboard from "../interfaces/SaveDashboard";

interface DashboardControlPanelProps {
    dashboard: Dashboard
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    dashboardLoading: boolean
    setDashboardSize: React.Dispatch<React.SetStateAction<DashboardSize>>
    dashboardCompactType: string | null
    setLayout: React.Dispatch<React.SetStateAction<Layout[]>>
    setSaveDashboardPromptOpen: React.Dispatch<React.SetStateAction<boolean>>
    setSaveDashboard: React.Dispatch<React.SetStateAction<SaveDashboard>>
    dashboardPermissions: { read: boolean, modify: boolean, write: boolean }
}

export default function DashboardControlPanel(props: DashboardControlPanelProps) {

    const {dispatchSidebar} = useContext(SidebarStatusContext)

    //BUTTON CLICK - ADD WIDGET
    function handleAddWidgetButton() {
        dispatchSidebar({
            type: "widget-selector-open"
        })
    }

    //DASHBOARD COMPACTION/GRAVITY
    function setDashboardCompactType(compactType: string | null) {
        props.setLayout(props.dashboard.grid.layout)
        props.setDashboardSize((val) => {
            if (val.compactType !== compactType) {
                switch (compactType) {
                    case "horizontal": {
                        val.compactType = "horizontal"
                        break
                    }
                    case "vertical": {
                        val.compactType = "vertical"
                        break
                    }
                    default: {
                        val.compactType = null
                        break
                    }
                }

                props.setDashboard((el) => {
                    el.numUnsavedChanges++
                    return el
                })

                return {...val}
            }
            return val
        })
    }

    //SAVE DASHBOARD (set states to trigger save)
    function saveDashboard(isDefault: boolean){
        props.setSaveDashboard({
            isDefault: isDefault,
            name: props.dashboard.name,
            save: true,
            saveAs: false,
            saveAsError: false
        })
    }

    //SAVE AS DASHBOARD (set states to trigger save)
    function saveAsDashboard(){
        props.setSaveDashboardPromptOpen(true)
    }

    //FORMAT DASHBOARD COMPACTION/GRAVITY TEXT
    function getCompactionType() {
        if (!props.dashboardCompactType) {
            return "No grid compaction"
        }

        if (props.dashboardCompactType === "horizontal") {
            return "Compact grid horizontally"
        }
        if (props.dashboardCompactType === "vertical") {
            return "Compact grid vertically"
        }
    }


    return (
        <VStack
            w={"full"}
        >
            <HStack
                w={"full"}
                justifyContent={"center"}
                alignItems={"baseline"}
                my={2}
            >
                <Text fontSize={"md"} fontWeight={500}>{props.dashboard.name}</Text>
                {
                    props.dashboardPermissions.modify &&
                    <Popover>
                        <PopoverTrigger>
                            <Box
                                _hover={{
                                    cursor: "pointer"
                                }}
                            >
                                {
                                    props.dashboard.numUnsavedChanges > 0 ?
                                        <Text fontSize={"xs"} fontStyle={"italic"} color={"gray.400"}>Changes not
                                            yet
                                            saved</Text>
                                        :
                                        <Text fontSize={"xs"} fontStyle={"italic"} color={"gray.400"}>Saved</Text>
                                }
                            </Box>
                        </PopoverTrigger>
                        <Portal>
                            <PopoverContent shadow={"2xl"}>
                                <PopoverArrow/>
                                <PopoverCloseButton/>
                                <PopoverBody>
                                    {
                                        props.dashboard.numUnsavedChanges > 0 &&
                                        <Text fontSize={"md"}>There
                                            are {props.dashboard.numUnsavedChanges} unsaved changes. Please consider
                                            saving your modifications as soon as possible so not to risk them being
                                            lost.</Text>
                                    }
                                    {
                                        props.dashboard.numUnsavedChanges === 0 &&
                                        <Text fontSize={"md"}>All changes
                                            are saved. You can safely navigate away from the dashboard.</Text>
                                    }
                                </PopoverBody>
                            </PopoverContent>
                        </Portal>
                    </Popover>
                }
            </HStack>
            <Divider orientation={"horizontal"} m={"0!important"}/>
            <HStack
                w={"full"}
                justifyContent={"left"}
                alignItems={"stretch"}
                mt={"0!important"}
            >
                <Button
                    colorScheme='blue'
                    variant='ghost'
                    isDisabled={props.dashboardLoading || !props.dashboardPermissions.modify}
                    title={!props.dashboardPermissions.modify ? "Operation not permitted" : ""}
                    leftIcon={<FiPlus/>}
                    onClick={handleAddWidgetButton}
                >
                    Add widget
                </Button>
                {/*<Divider orientation={"vertical"} h={"auto"} m={"0!important"}/>*/}
                {/*<Button*/}
                {/*    colorScheme='blue'*/}
                {/*    variant='ghost'*/}
                {/*    leftIcon={<FiSave/>}*/}
                {/*    ml={"0!important"}*/}
                {/*    isDisabled={props.dashboard.grid.widgets.length === 0 || props.dashboardLoading || !props.dashboardPermissions.modify}*/}
                {/*    title={!props.dashboardPermissions.modify ? "Operation not permitted" : ""}*/}
                {/*    onClick={() => (}*/}
                {/*>*/}
                {/*    Save dashboard*/}
                {/*</Button>*/}
                <Divider orientation={"vertical"} h={"auto"} m={"0!important"}/>
                <Menu>
                    <MenuButton
                        as={Button}
                        leftIcon={<FiSave/>}
                        rightIcon={<FiChevronDown/>}
                        colorScheme={"blue"}
                        variant='ghost'
                        ml={"0!important"}
                        //Stop click from propagating down to dashboard
                        onMouseDown={(e) => (e.stopPropagation())}

                    >
                        Save dashboard
                    </MenuButton>
                    <Portal>
                        <MenuList
                            shadow={"2xl"}
                            //Stop click from propagating down to dashboard
                            onMouseDown={(e) => (e.stopPropagation())}
                        >
                            <MenuItem
                                icon={<FiSave/>}
                                isDisabled={props.dashboard.grid.widgets.length === 0 || props.dashboardLoading || !props.dashboardPermissions.modify}
                                title={!props.dashboardPermissions.modify ? "Operation not permitted" : ""}
                                onClick={()=>(saveDashboard(false))}
                            >
                                Save
                            </MenuItem>
                            <MenuItem
                                icon={<FiSave/>}
                                isDisabled={props.dashboard.grid.widgets.length === 0 || props.dashboardLoading || !props.dashboardPermissions.modify}
                                title={!props.dashboardPermissions.modify ? "Operation not permitted" : ""}
                                onClick={()=>(saveDashboard(true))}
                            >
                                Save and set as default
                            </MenuItem>
                            <MenuItem
                                icon={<FiEdit/>}
                                isDisabled={props.dashboard.grid.widgets.length === 0 || props.dashboardLoading || !props.dashboardPermissions.write}
                                title={!props.dashboardPermissions.write ? "Operation not permitted" : ""}
                                onClick={saveAsDashboard}
                            >
                                Save as
                            </MenuItem>
                        </MenuList>
                    </Portal>
                </Menu>
                <Divider orientation={"vertical"} h={"auto"} m={"0!important"}/>
                <Menu>
                    <MenuButton
                        as={Button}
                        leftIcon={<FiMinimize2/>}
                        rightIcon={<FiChevronDown/>}
                        colorScheme={"blue"}
                        variant='ghost'
                        ml={"0!important"}
                        //Stop click from propagating down to dashboard
                        onMouseDown={(e) => (e.stopPropagation())}

                    >
                        {getCompactionType()}
                    </MenuButton>
                    <Portal>
                        <MenuList
                            shadow={"2xl"}
                            //Stop click from propagating down to dashboard
                            onMouseDown={(e) => (e.stopPropagation())}
                        >
                            <MenuItem
                                icon={<FiMoreVertical/>}
                                isDisabled={!props.dashboardPermissions.modify}
                                title={!props.dashboardPermissions.modify ? "Operation not permitted" : ""}
                                onClick={() => (setDashboardCompactType("vertical"))}
                            >
                                Compact vertically
                            </MenuItem>
                            <MenuItem
                                icon={<FiMoreHorizontal/>}
                                isDisabled={!props.dashboardPermissions.modify}
                                title={!props.dashboardPermissions.modify ? "Operation not permitted" : ""}
                                onClick={() => (setDashboardCompactType("horizontal"))}
                            >
                                Compact horizontally
                            </MenuItem>
                            <MenuItem
                                icon={<FiMaximize2/>}
                                isDisabled={!props.dashboardPermissions.modify}
                                title={!props.dashboardPermissions.modify ? "Operation not permitted" : ""}
                                onClick={() => (setDashboardCompactType(null))}
                            >
                                Do not compact
                            </MenuItem>
                        </MenuList>
                    </Portal>
                </Menu>
                <Divider orientation={"vertical"} h={"auto"} m={"0!important"}/>
            </HStack>
        </VStack>
    )

}