import React, {memo, useContext, useState} from "react";
import ToastContext from "../../../../utils/contexts/ToastContext";
import toastHelper from "../../../../utils/ToastHelper";
import {HStack, IconButton, Input, Menu, MenuButton, MenuItem, MenuList, Portal} from "@chakra-ui/react";
import {FiList, FiLock, FiMoreVertical, FiPlus, FiRefreshCw, FiSettings, FiTrash2, FiUnlock} from "react-icons/fi";
import WidgetInfoPopover from "./WidgetInfoPopover";
import Sensor from "../../models/Sensor";
import SensorDataFilter from "../../interfaces/SensorDataFilter";
import SensorDataRange from "../../interfaces/SensorDataRange";
import SensorDataFilters from "../../interfaces/SensorDataFilters";
import TooltipData from "../../interfaces/TooltipData";

interface WidgetControlPanelProps {
    widgetStatic: boolean
    setWidgetStatic: React.Dispatch<React.SetStateAction<boolean>>
    numSensorsMonitoring: number
    sensorDataError: boolean
    setHistoryModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    setSensorsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    setSettingsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    widgetID: string
    widgetName: string
    widgetMaxSensors: number
    availableSensors: Sensor[]
    sensorsMonitoringSensors: {[key: string]: SensorDataFilter[]}
    sensorsMonitoringAggregations: { name: string, color: string }[]
    sensorsMonitoringDataRange: SensorDataRange
    setSensorsMonitoring: React.Dispatch<React.SetStateAction<SensorDataFilters>>
    chartTooltipActive: boolean
    setChartTooltip: React.Dispatch<React.SetStateAction<TooltipData>>
    handleWidgetModified: Function
    dashboardPermissionsModify: boolean
}

function WidgetControlPanel(props: WidgetControlPanelProps) {

    const toast = useContext(ToastContext)

    const [widgetName, setWidgetName] = useState(props.widgetName)

    //RE-LOAD SENSOR DATA - as first time
    function refreshSensorData() {
        props.setSensorsMonitoring((val) => {
            val.requestType = "first-time"
            val.cacheDataRequestMaxTime = 0
            val.newDataRequestMinTime = 0
            return {...val}
        })

        toastHelper.makeToast(
            toast,
            "Refreshing sensor data",
            "info"
        )
    }

    function handleWidgetControlPanelMouseDown(e){
        e.stopPropagation()

        if(props.chartTooltipActive){
            props.setChartTooltip((val)=>{
                val.active = false
                return {...val}
            })
        }
    }

    return (
        <HStack
            w={"full"}
            pl={3}
            justifyContent={"space-between"}
            flexWrap={"nowrap"}
            onMouseDown={handleWidgetControlPanelMouseDown}
        >
            <Input
                w={"full"}
                fontWeight={550} flexWrap={"nowrap"}
                textOverflow={"ellipsis"}
                variant='unstyled'
                value={widgetName}
                onBlur={(e) => (props.handleWidgetModified("rename", {
                        id: props.widgetID,
                        name: e.target.value
                    }
                ))}
                onChange={(e) => (setWidgetName(e.target.value))}
            />
            <HStack
                flexWrap={"nowrap"}
                _hover={{
                    cursor: "pointer"
                }}
            >
                {
                    props.numSensorsMonitoring > 0 &&
                    <HStack
                        flexWrap={"nowrap"}
                    >
                        <IconButton
                            colorScheme={"gray"}
                            variant={"ghost"}
                            icon={<FiRefreshCw/>}
                            px={"0!important"}
                            aria-label={"Refresh data"}
                            onClick={refreshSensorData}
                        />
                        {
                            !props.sensorDataError &&
                            props.widgetMaxSensors > 1 &&
                            <WidgetInfoPopover
                                sensorsMonitoringSensors={props.sensorsMonitoringSensors}
                                sensorsMonitoringAggregations={props.sensorsMonitoringAggregations}
                                sensorsMonitoringDataRange={props.sensorsMonitoringDataRange}
                                availableSensors={props.availableSensors}
                            />
                        }
                        {
                            !props.sensorDataError &&
                            props.widgetMaxSensors === 1 &&
                            <IconButton
                                colorScheme={"gray"}
                                variant={"ghost"}
                                icon={<FiList/>}
                                px={"0!important"}
                                aria-label={"Sensor data history"}
                                onClick={() => (props.setHistoryModalOpen(true))}
                            />
                        }

                    </HStack>
                }
                {
                    props.dashboardPermissionsModify &&
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical/>}
                            variant='ghost'
                            mx={"0!important"}
                        />
                        <Portal>
                            <MenuList
                                shadow={"2xl"}
                            >
                                <MenuItem
                                    icon={<FiPlus/>}
                                    onClick={() => (props.setSensorsModalOpen(true))}
                                >
                                    Add sensors
                                </MenuItem>
                                <MenuItem
                                    icon={<FiSettings/>}
                                    onClick={() => (props.setSettingsModalOpen(true))}
                                >
                                    Widget settings
                                </MenuItem>
                                <MenuItem
                                    icon={<FiTrash2/>}
                                    onClick={() => (props.handleWidgetModified("delete", {id: props.widgetID}))}
                                >
                                    Delete widget
                                </MenuItem>
                                {
                                    props.widgetStatic &&
                                    <MenuItem
                                        icon={<FiUnlock/>}
                                        onClick={() => {
                                            props.handleWidgetModified("static", {id: props.widgetID});
                                            props.setWidgetStatic((val) => (!val))
                                        }}
                                    >
                                        Unlock widget
                                    </MenuItem>
                                }
                                {
                                    !props.widgetStatic &&
                                    <MenuItem
                                        icon={<FiLock/>}
                                        onClick={() => (props.handleWidgetModified("static", {id: props.widgetID}))}
                                    >
                                        Lock widget
                                    </MenuItem>
                                }
                            </MenuList>
                        </Portal>
                    </Menu>
                }
            </HStack>
        </HStack>
    )

}

export default memo(WidgetControlPanel)