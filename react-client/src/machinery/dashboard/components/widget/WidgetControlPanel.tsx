import React, {memo, useContext, useState} from 'react'
import ToastContext from '../../../../utils/contexts/ToastContext'
import toastHelper from '../../../../utils/ToastHelper'
import {HStack, IconButton, Input, Menu, MenuButton, MenuItem, MenuList, Portal} from '@chakra-ui/react'
import {FiList, FiLock, FiMoreVertical, FiPlus, FiRefreshCw, FiSettings, FiTrash2, FiUnlock} from 'react-icons/fi'
import WidgetInfoPopover from './WidgetInfoPopover'
import type Sensor from '../../models/Sensor'
import type SensorDataFilter from '../../interfaces/SensorDataFilter'
import type SensorDataRange from '../../interfaces/SensorDataRange'
import type SensorDataFilters from '../../interfaces/SensorDataFilters'
import type TooltipData from '../../interfaces/TooltipData'
import SlidingSensorData from "../../interfaces/SlidingSensorData";
import GridWidget from "../../interfaces/GridWidget";
import Machinery from "../../../../machineries-map/components/Machinery";
import {calculateChartProps, loadSensorData, setNewWidgetSensorData} from "../../utils";
import axiosExceptionHandler from "../../../../utils/AxiosExceptionHandler";
import Dashboard from "../../models/Dashboard";

interface WidgetControlPanelProps {
    machinery: Machinery
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    widget: GridWidget
    widgetIndex: number
    widgetStatic: boolean
    setWidgetStatic: React.Dispatch<React.SetStateAction<boolean>>
    sensorDataError: boolean
    loadSensorData: (sensorsMonitoringConfig: SensorDataFilters, requestType: string, cacheDataRequestMaxTime: number, newDataRequestMinTime: number, machinery: Machinery, widget: GridWidget) => Promise<SlidingSensorData>
    setHistoryModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    setSensorsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    setSettingsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    widgetID: string
    widgetName: string
    widgetMaxSensors: number
    availableSensors: Sensor[]
    sensorsMonitoringSensors: Record<string, SensorDataFilter[]>
    sensorsMonitoringAggregations: Array<{ name: string, color: string }>
    sensorsMonitoringDataRange: SensorDataRange
    chartTooltipActive: boolean
    setChartTooltip: React.Dispatch<React.SetStateAction<TooltipData>>
    handleWidgetModified: Function
    dashboardPermissionsModify: boolean
}

function WidgetControlPanel(props: WidgetControlPanelProps) {

    const {setDashboard, widget, widgetIndex, machinery} = props;

    const toast = useContext(ToastContext)

    const [widgetName, setWidgetName] = useState(props.widgetName)

    // RE-LOAD SENSOR DATA - as first time
    async function refreshSensorData() {

        try {
            const sensorDataResult = await loadSensorData(widget.sensorsMonitoring, 'first-time', 0, 0, machinery, widget)
            const chartPropsResult = calculateChartProps(sensorDataResult, widget.chartProps);

            toastHelper.makeToast(
                toast,
                `${widget.name} sensor data refreshed`,
                'info'
            )

            setNewWidgetSensorData(setDashboard, widgetIndex, sensorDataResult, chartPropsResult);
        } catch (e) {
            console.error(e)
            axiosExceptionHandler.handleAxiosExceptionWithToast(
                e,
                toast,
                'Sensor data could not be loaded'
            )
        }
    }

    function handleWidgetControlPanelMouseDown(e) {
        e.stopPropagation()

        if (props.chartTooltipActive)
            props.setChartTooltip((val) => {
                val.active = false

                return {...val}
            })
    }

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
                onBlur={(e) => (props.handleWidgetModified('rename', {
                        id: props.widgetID,
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
                                colorScheme="gray"
                                variant="ghost"
                                icon={<FiList/>}
                                px="0!important"
                                aria-label="Sensor data history"
                                onClick={() => {
                                    props.setHistoryModalOpen(true)
                                }}
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
                            mx="0!important"
                        />
                        <Portal>
                            <MenuList
                                shadow="2xl"
                            >
                                <MenuItem
                                    icon={<FiPlus/>}
                                    onClick={() => {
                                        props.setSensorsModalOpen(true)
                                    }}
                                >
                                    Add sensors
                                </MenuItem>
                                <MenuItem
                                    icon={<FiSettings/>}
                                    onClick={() => {
                                        props.setSettingsModalOpen(true)
                                    }}
                                >
                                    Widget settings
                                </MenuItem>
                                <MenuItem
                                    icon={<FiTrash2/>}
                                    onClick={() => (props.handleWidgetModified('delete', {id: props.widgetID}))}
                                >
                                    Delete widget
                                </MenuItem>
                                {
                                    props.widgetStatic &&
                                    <MenuItem
                                        icon={<FiUnlock/>}
                                        onClick={() => {
                                            props.handleWidgetModified('static', {id: props.widgetID})
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
                                        onClick={() => (props.handleWidgetModified('static', {id: props.widgetID}))}
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
