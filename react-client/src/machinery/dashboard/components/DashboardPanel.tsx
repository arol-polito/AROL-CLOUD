import {Box, Button, HStack, Portal, Spinner, Text, VStack} from '@chakra-ui/react'
import RGL, {Layout, WidthProvider} from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import React, {Fragment, useMemo} from 'react'
import {FiPlus} from 'react-icons/fi'
import type Sensor from '../models/Sensor'
import type Machinery from '../../../machineries-map/components/Machinery'
import SaveDashboardPrompt from './modals/SaveDashboardPrompt'
import Dashboard from '../models/Dashboard'
import ChartTooltip from './data-visualization/chart-components/Tooltip'
import type TooltipData from '../interfaces/TooltipData'
import type LoadDashboardAction from '../../machinery/interfaces/LoadDashboardAction'
import DashboardControlPanel from './DashboardControlPanel'
import {useDashboardPanelLogic} from "./useDashboardPanelLogic";
import {UnderlayDashboard} from "./rglDashboard/UnderlayDashboard";
import {MemoizedWidget} from "./widget/MemoizedWidget";

const ReactGridLayout = WidthProvider(RGL)

export interface DashboardPanelProps {
    machinery: Machinery
    dashboard: Dashboard
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    layout: Layout[]
    setLayout: React.Dispatch<React.SetStateAction<Layout[]>>
    availableSensors: Sensor[]
    loadDashboard: (machineryUID, loadDashboard?: LoadDashboardAction) => Promise<void>
    dashboardPermissions: { read: boolean, modify: boolean, write: boolean }
    chartTooltip: TooltipData
    setChartTooltip: React.Dispatch<React.SetStateAction<TooltipData>>
}

export default function DashboardPanel(props: DashboardPanelProps) {
    const {machinery, dashboard, setDashboard} = props;
    const {availableSensors, layout, setLayout, dashboardPermissions} = props;
    const {chartTooltip, setChartTooltip} = props;

    const dashboardPanelLogic = useDashboardPanelLogic(props);
    const {dashboardSaving, saveDashboard} = dashboardPanelLogic;
    const {saveDashboardPromptOpen, setSaveDashboardPromptOpen} = dashboardPanelLogic;
    const {dashboardContainerRef} = dashboardPanelLogic;
    const {handleWidgetModifiedFn, onLayoutChange, onDropDragOver, onDrop} = dashboardPanelLogic;
    const {onResize, extendDashboard, closeTooltip} = dashboardPanelLogic;

    const underlayDashboard = useMemo(
        () => <UnderlayDashboard dashboardSize={dashboard.size}/>,
        [dashboard.size]
    )

    console.log(dashboard);

    return (
        <Fragment>
            {
                chartTooltip.active &&
                <Portal>
                    <ChartTooltip
                        chartTooltipData={chartTooltip}
                        setChartTooltipData={setChartTooltip}
                    />
                </Portal>
            }
            <VStack
                ref={dashboardContainerRef}
                h="full"
                w="full"
                bg="white"
                mb="10px"
                boxShadow="2xl"
                rounded="lg"
                onMouseDown={closeTooltip}
            >
                <DashboardControlPanel
                    dashboard={dashboard}
                    setDashboard={setDashboard}
                    setLayout={setLayout}
                    dashboardLoading={dashboard.isLoading}
                    dashboardCompactType={dashboard.size.compactType}
                    dashboardPermissions={dashboardPermissions}
                    setSaveDashboardPromptOpen={setSaveDashboardPromptOpen}
                    saveDashboard={saveDashboard}
                />
            </VStack>
            {
                !dashboard.isLoading &&
                <Box
                    w="full"
                    h={`${dashboard.size.numRows * dashboard.size.rowHeight + (dashboard.size.numRows + 1) * 8 + 25}px`}
                    position="relative"
                >
                    <Box
                        w="full"
                        h={`${dashboard.size.numRows * dashboard.size.rowHeight + (dashboard.size.numRows + 1) * 8}px`}
                        maxHeight={`${dashboard.size.numRows * dashboard.size.rowHeight + (dashboard.size.numRows + 1) * 8}px`}
                        position="absolute"
                        zIndex={0}
                        left={0}
                        top={0}
                    >
                        {dashboard.size && underlayDashboard}
                    </Box>
                    <Box
                        w="full"
                        position="absolute"
                        zIndex={1}
                        left={0}
                        top={0}
                    >
                        {dashboard.size &&
                            <ReactGridLayout
                                style={{
                                    height: `${dashboard.size.numRows * dashboard.size.rowHeight + (dashboard.size.numRows + 1) * 8}px`,
                                    maxHeight: `${dashboard.size.numRows * dashboard.size.rowHeight + (dashboard.size.numRows + 1) * 8}px`
                                }}
                                margin={[5, 5]}
                                autoSize={false}
                                width={~~dashboard.size.width}
                                compactType={dashboard.size.compactType}
                                onLayoutChange={onLayoutChange}
                                onResizeStop={onResize}
                                isResizable={dashboardPermissions.modify}
                                isDraggable={dashboardPermissions.modify}
                                isDroppable={dashboardPermissions.modify}
                                allowOverlap={dashboard.widgets.length === 0}
                                onDropDragOver={onDropDragOver}
                                onDrop={onDrop}
                                layout={layout}
                                cols={dashboard.size.numCols}
                                rowHeight={dashboard.size.rowHeight}
                                containerPadding={[0, 0]}
                                isBounded
                                useCSSTransforms
                            >
                                {dashboard.widgets.map((widget, index) =>
                                    <Box key={widget.id}>
                                        <MemoizedWidget
                                            widget={widget}
                                            widgetIndex={index}
                                            setDashboard={setDashboard}
                                            machinery={machinery}
                                            dashboardSize={dashboard.size}
                                            layout={dashboard.layout[index]}
                                            availableSensors={availableSensors}
                                            handleWidgetModified={handleWidgetModifiedFn}
                                            sensorsMonitoringProp={widget.sensorsMonitoring}
                                            chartTooltipActive={chartTooltip.active}
                                            setChartTooltip={setChartTooltip}
                                            dashboardPermissions={dashboardPermissions}
                                        />
                                    </Box>
                                )}
                                {
                                    dashboard.widgets.length === 0 &&
                                    dashboard.size.numRows === 4 &&
                                    <VStack
                                        key="add-widgets-dummy"
                                        bgColor="white"
                                        boxShadow="xl"
                                        rounded="md"
                                        justifyContent="center"
                                        data-grid={{
                                            x: 0,
                                            y: 0,
                                            w: dashboard.size.numCols,
                                            h: 4,
                                            static: true,
                                            isDraggable: false,
                                            isResizable: false
                                        }}
                                    >
                                        <Text fontSize="2xl" color="gray.500">Dashboard is empty</Text>
                                        {
                                            dashboardPermissions.modify &&
                                            <Text fontSize="md" color="gray.500">Start by drag & dropping widgets
                                                here</Text>
                                        }
                                    </VStack>
                                }
                            </ReactGridLayout>
                        }
                    </Box>
                    <HStack
                        position="absolute"
                        w="full"
                        justifyContent="center"
                        bottom={0}
                    >
                        <Button
                            bg="white"
                            boxShadow="2xl"
                            rounded="lg"
                            leftIcon={<FiPlus color={dashboardPermissions.modify ? '#000000' : '#A0AEC0'}/>}
                            disabled={!dashboardPermissions.modify}
                            onClick={extendDashboard}
                            title={!dashboardPermissions.modify ? 'Operation not permitted' : ''}
                        >
                            Extend dashboard
                        </Button>
                    </HStack>
                </Box>
            }
            {
                dashboard.isLoading &&
                <VStack
                    w="full"
                    h="300px"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Spinner size="xl"/>
                </VStack>
            }
            {
                saveDashboardPromptOpen &&
                <SaveDashboardPrompt
                    dashboard={dashboard}
                    promptOpen={saveDashboardPromptOpen}
                    setPromptOpen={setSaveDashboardPromptOpen}
                    saveDashboard={saveDashboard}
                    dashboardSaving={dashboardSaving}
                />
            }
        </Fragment>
    )
}
