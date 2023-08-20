import React, {memo} from 'react'
import {HStack, IconButton, Input, Menu, MenuButton, MenuItem, MenuList, Portal} from '@chakra-ui/react'
import {FiList, FiLock, FiMoreVertical, FiPlus, FiRefreshCw, FiSettings, FiTrash2, FiUnlock} from 'react-icons/fi'
import WidgetInfoPopover from './components/WidgetInfoPopover'
import type Sensor from '../../../../models/Sensor'
import type TooltipData from '../../../../interfaces/TooltipData'
import GridWidget from "../../../../interfaces/GridWidget";
import Machinery from "../../../../../../machineries-map/components/Machinery";
import Dashboard from "../../../../models/Dashboard";
import {useWidgetControlPanelLogic} from "./useWidgetControlPanelLogic";

export interface WidgetControlPanelProps {
    machinery: Machinery
    widget: GridWidget
    widgetIndex: number
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    setWidgetStatic: React.Dispatch<React.SetStateAction<boolean>>
    sensorDataError: boolean
    setHistoryModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    setSensorsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    setSettingsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    availableSensors: Sensor[]
    chartTooltipActive: boolean
    setChartTooltip: React.Dispatch<React.SetStateAction<TooltipData>>
    handleWidgetModified: Function
    dashboardPermissionsModify: boolean
}

function WidgetControlPanel(props: WidgetControlPanelProps) {

    const {widget, availableSensors, sensorDataError, handleWidgetModified} = props;
    const {setSensorsModalOpen, setHistoryModalOpen, setSettingsModalOpen} = props;
    const {dashboardPermissionsModify, setWidgetStatic} = props;

    const {id, maxSensors, sensorsMonitoring} = widget;

    const sensorsMonitoringSensors = sensorsMonitoring.sensors
    const sensorsMonitoringAggregations = sensorsMonitoring.aggregations
    const sensorsMonitoringDataRange = sensorsMonitoring.dataRange

    const widgetControlPanelLogic = useWidgetControlPanelLogic(props);

    const {widgetName, setWidgetName, refreshSensorData} = widgetControlPanelLogic;
    const {handleWidgetControlPanelMouseDown} = widgetControlPanelLogic;

    return (
        <HStack
            w="full"
            pl={3}
            justifyContent="space-between"
            flexWrap="nowrap"
            onMouseDown={handleWidgetControlPanelMouseDown}
        >
            <Input
                w="full"
                fontWeight={550} flexWrap="nowrap"
                textOverflow="ellipsis"
                variant='unstyled'
                value={widgetName}
                onBlur={(e) => (handleWidgetModified('rename', {
                        id: id,
                        name: e.target.value
                    }
                ))}
                onChange={(e) => {
                    setWidgetName(e.target.value)
                }}
            />
            <HStack
                flexWrap="nowrap"
                _hover={{
                    cursor: 'pointer'
                }}
            >
                {
                    widget.numSensorsMonitoring > 0 &&
                    <HStack
                        flexWrap="nowrap"
                    >
                        <IconButton
                            colorScheme="gray"
                            variant="ghost"
                            icon={<FiRefreshCw/>}
                            px="0!important"
                            aria-label="Refresh data"
                            onClick={refreshSensorData}
                        />
                        {
                            !sensorDataError &&
                            maxSensors > 1 &&
                            <WidgetInfoPopover
                                sensorsMonitoringSensors={sensorsMonitoringSensors}
                                sensorsMonitoringAggregations={sensorsMonitoringAggregations}
                                sensorsMonitoringDataRange={sensorsMonitoringDataRange}
                                availableSensors={availableSensors}
                            />
                        }
                        {
                            !sensorDataError &&
                            maxSensors === 1 &&
                            <IconButton
                                colorScheme="gray"
                                variant="ghost"
                                icon={<FiList/>}
                                px="0!important"
                                aria-label="Sensor data history"
                                onClick={() => {
                                    setHistoryModalOpen(true)
                                }}
                            />
                        }

                    </HStack>
                }
                {
                    dashboardPermissionsModify &&
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical/>}
                            variant='ghost'
                            mx="0!important"
                        />
                        <Portal>
                            <MenuList
                                shadow="2xl"
                            >
                                <MenuItem
                                    icon={<FiPlus/>}
                                    onClick={() => {
                                        setSensorsModalOpen(true)
                                    }}
                                >
                                    Add sensors
                                </MenuItem>
                                <MenuItem
                                    icon={<FiSettings/>}
                                    onClick={() => {
                                        setSettingsModalOpen(true)
                                    }}
                                >
                                    Widget settings
                                </MenuItem>
                                <MenuItem
                                    icon={<FiTrash2/>}
                                    onClick={() => (handleWidgetModified('delete', {id: id}))}
                                >
                                    Delete widget
                                </MenuItem>
                                {
                                    widget.static &&
                                    <MenuItem
                                        icon={<FiUnlock/>}
                                        onClick={() => {
                                            handleWidgetModified('static', {id: id})
                                            setWidgetStatic((val) => (!val))
                                        }}
                                    >
                                        Unlock widget
                                    </MenuItem>
                                }
                                {
                                    !widget.static &&
                                    <MenuItem
                                        icon={<FiLock/>}
                                        onClick={() => (handleWidgetModified('static', {id: id}))}
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
