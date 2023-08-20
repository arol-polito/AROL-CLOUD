import {Box, HStack, Spinner, Text, VStack} from '@chakra-ui/react'
import type Sensor from '../../models/Sensor'
import React, {Fragment, useRef} from 'react'
import SensorsModal from '../modals/SensorsModal'
import type Machinery from '../../../../machineries-map/components/Machinery'
import WidgetSettingsModal from '../modals/WidgetSettingsModal'
import {type Layout} from 'react-grid-layout'
import type SensorDataFilters from '../../interfaces/SensorDataFilters'
import type GridWidget from '../../interfaces/GridWidget'
import type TooltipData from '../../interfaces/TooltipData'
import HistoryModal from '../modals/HistoryModal'
import type DashboardSize from '../../interfaces/DashboardSize'
import SingleValueDataDisplay from '../data-visualization/SingleValueDataDisplay'
import {MultiValueDataDisplay} from '../data-visualization/MultiValueDataDisplay'
import WidgetControlPanel from './WidgetControlPanel'
import {useWidgetLogic} from "./useWidgetLogic";
import Dashboard from "../../models/Dashboard";

export interface DashboardWidgetProps {
    widget: GridWidget
    widgetIndex: number
    machinery: Machinery
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    dashboardSize: DashboardSize
    layout: Layout
    availableSensors: Sensor[]
    sensorsMonitoringProp: SensorDataFilters
    handleWidgetModified: Function
    chartTooltipActive: boolean
    setChartTooltip: React.Dispatch<React.SetStateAction<TooltipData>>
    dashboardPermissions: { read: boolean, modify: boolean, write: boolean }
}

export function Widget(props: DashboardWidgetProps) {

    const {widget, widgetIndex, machinery, layout, setDashboard} = props;
    const {availableSensors, handleWidgetModified, chartTooltipActive} = props;
    const {setChartTooltip, dashboardPermissions} = props;

    const {sensorsMonitoring, sensorsMonitoringArray} = widget
    const {numSensorsMonitoring, sensorData, name} = widget
    const {maxSensors, category} = widget

    const ref = useRef<any>();

    const widgetLogic = useWidgetLogic(props);
    const {availableSensorsMap, widgetBottomText, handleWidgetMouseDown} = widgetLogic;
    const {sensorsDataLoading, sensorDataError, loadingMoreSensorData} = widgetLogic;
    const {sensorsModalOpen, setSensorsModalOpen, settingsModalOpen, setSettingsModalOpen} = widgetLogic;
    const {dataDisplaySize, widgetStatic, setWidgetStatic} = widgetLogic;
    const {historyModalOpen, setHistoryModalOpen, handleOpenSensorsModalButton} = widgetLogic;
    const {loadSensorData, loadMoreSensorData} = widgetLogic;

    return (
        <Fragment>
            <VStack
                ref={ref}
                boxShadow="xl"
                rounded="md"
                bgColor="white"
                w="full"
                h="full"
                overflow="none"
                onMouseDown={handleWidgetMouseDown}
            >
                <WidgetControlPanel
                    machinery={machinery}
                    setDashboard={setDashboard}
                    widget={widget}
                    widgetIndex={widgetIndex}
                    widgetStatic={widgetStatic}
                    setWidgetStatic={setWidgetStatic}
                    sensorDataError={sensorDataError}
                    setHistoryModalOpen={setHistoryModalOpen}
                    setSensorsModalOpen={setSensorsModalOpen}
                    setSettingsModalOpen={setSettingsModalOpen}
                    widgetID={widget.id}
                    widgetName={name}
                    widgetMaxSensors={maxSensors}
                    availableSensors={availableSensors}
                    loadSensorData={loadSensorData}
                    sensorsMonitoringSensors={sensorsMonitoring.sensors}
                    sensorsMonitoringAggregations={sensorsMonitoring.aggregations}
                    sensorsMonitoringDataRange={sensorsMonitoring.dataRange}
                    chartTooltipActive={chartTooltipActive}
                    setChartTooltip={setChartTooltip}
                    handleWidgetModified={handleWidgetModified}
                    dashboardPermissionsModify={dashboardPermissions.modify}
                />
                {
                    !sensorsDataLoading &&
                    numSensorsMonitoring === 0 &&
                    <VStack
                        w="full"
                        h={dataDisplaySize.height}
                        justifyContent="center"
                        alignContent="center"
                    >
                        <Box
                            p={3}
                            _hover={{
                                cursor: 'pointer'
                            }}
                            onClick={handleOpenSensorsModalButton}
                            onMouseDown={(e) => {
                                e.stopPropagation()
                            }}
                        >
                            <Text textAlign="center" fontSize={50} color="gray.500">+</Text>
                            <Text textAlign="center" fontSize="sm" color="gray.500" mt="-3!important">Choose
                                sensors</Text>
                        </Box>
                    </VStack>
                }
                {
                    !sensorsDataLoading &&
                    numSensorsMonitoring > 0 &&
                    <>
                        <VStack
                            w="full"
                            justifyContent="center"
                            alignContent="center"
                        >
                            {
                                (sensorData.displayData.length > 0) &&
                                (sensorsMonitoringArray.length > 0) &&
                                <Box
                                    w="full"
                                    h={dataDisplaySize.height}
                                    maxH={dataDisplaySize.height}
                                >
                                    {
                                        category === 'single-value' &&
                                        <SingleValueDataDisplay
                                            widget={widget}
                                            sensorMonitoring={sensorsMonitoringArray[0]}
                                            sensorData={sensorData}
                                            dataDisplaySize={dataDisplaySize}
                                        />
                                    }
                                    {
                                        category === 'multi-value' &&
                                        <MultiValueDataDisplay
                                            widget={widget}
                                            widgetIndex={widgetIndex}
                                            setDashboard={setDashboard}
                                            displayType="dashboard"
                                            availableSensors={availableSensors}
                                            loadMoreSensorData={loadMoreSensorData}
                                            loadingMoreSensorData={loadingMoreSensorData}
                                            chartTooltipActive={chartTooltipActive}
                                            setChartTooltip={setChartTooltip}
                                            dataDisplaySize={dataDisplaySize}
                                        />
                                    }
                                </Box>
                            }
                            {
                                !sensorDataError &&
                                sensorData.numSensorData === 0 &&
                                <VStack
                                    w="full"
                                    h={dataDisplaySize.height}
                                    justifyContent="center"
                                    alignContent="center"
                                >
                                    <Text textAlign="center" fontSize="sm" color="gray.500">No data from
                                        sensors</Text>
                                </VStack>
                            }
                            {
                                sensorDataError &&
                                <VStack
                                    w="full"
                                    h={dataDisplaySize.height}
                                    justifyContent="center"
                                    alignContent="center"
                                >
                                    <Text textAlign="center" fontSize="sm" color="gray.500">Failed to load
                                        sensor data. Please try again.</Text>
                                </VStack>
                            }
                        </VStack>
                        <HStack
                            h="auto"
                            w="full"
                            justifyContent="center"
                            textOverflow="ellipsis"
                            whiteSpace="nowrap"
                        >
                            <Text
                                mt="-12px"
                                fontSize="xs"
                                color="gray.400"
                                _hover={{
                                    cursor: 'default'
                                }}
                                // onMouseDown={(e)=>(e.stopPropagation())}
                            >
                                {widgetBottomText}
                            </Text>
                        </HStack>
                    </>
                }
                {
                    sensorsDataLoading &&
                    <VStack
                        w="full"
                        h={`${(180 - 50) + ((layout.h - 1) * 180)}px`}
                        alignItems="center"
                        justifyContent="center"
                        // Stop click from propagating down to dashboard
                        onMouseDown={(e) => {
                            e.stopPropagation()
                        }}
                    >
                        <Spinner size="xl"/>
                    </VStack>
                }
            </VStack>
            {
                sensorsModalOpen &&
                <SensorsModal
                    machinery={machinery}
                    widget={widget}
                    widgetIndex={widgetIndex}
                    setDashboard={setDashboard}
                    modalOpen={sensorsModalOpen}
                    setModalOpen={setSensorsModalOpen}
                    availableSensors={availableSensors}
                    availableSensorsMap={availableSensorsMap}
                    sensorsMonitoring={sensorsMonitoring}
                    numHeads={machinery.numHeads}
                    maxSelectableSensors={maxSensors}
                />
            }
            {
                settingsModalOpen &&
                <WidgetSettingsModal
                    machinery={machinery}
                    widget={widget}
                    widgetIndex={widgetIndex}
                    setDashboard={setDashboard}
                    settingsModalOpen={settingsModalOpen}
                    setSettingsModalOpen={setSettingsModalOpen}
                    availableSensors={availableSensors}
                />
            }
            {
                historyModalOpen &&
                <HistoryModal
                    machinery={machinery}
                    widget={widget}
                    widgetIndex={widgetIndex}
                    setDashboard={setDashboard}
                    historyModalOpen={historyModalOpen}
                    setHistoryModalOpen={setHistoryModalOpen}
                    availableSensors={availableSensors}
                />
            }
        </Fragment>
    )
}
