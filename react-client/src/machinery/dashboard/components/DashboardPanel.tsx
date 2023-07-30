import {Box, Button, HStack, Portal, Spinner, Text, VStack} from '@chakra-ui/react'
import RGL, {type Layout, WidthProvider} from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import React, {Fragment, useContext, useEffect, useRef, useState} from 'react'
import {FiPlus} from 'react-icons/fi'
import type Sensor from '../models/Sensor'
import Widget from './widget/Widget'
import type Machinery from '../../../machineries-map/components/Machinery'
import SaveDashboardPrompt from './modals/SaveDashboardPrompt'
import dashboardService from '../../../services/DashboardService'
import Dashboard from '../models/Dashboard'
import ChartTooltip from './data-visualization/chart-components/Tooltip'
import type TooltipData from '../interfaces/TooltipData'
import type GridWidget from '../interfaces/GridWidget'
import type DashboardSize from '../interfaces/DashboardSize'
import ToastContext from '../../../utils/contexts/ToastContext'

import {useResizeDetector} from 'react-resize-detector'
import type LoadDashboardAction from '../../machinery/interfaces/LoadDashboardAction'
import axiosExceptionHandler from '../../../utils/AxiosExceptionHandler'
import toastHelper from '../../../utils/ToastHelper'
import type SaveDashboard from '../interfaces/SaveDashboard'
import DashboardControlPanel from './DashboardControlPanel'

const ReactGridLayout = WidthProvider(RGL)

interface DashboardPanelProps {
    machinery: Machinery
    dashboard: Dashboard
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    availableSensors: Sensor[]
    dashboardToLoadByDefault: string | null
    setDashboardToLoadByDefault: React.Dispatch<React.SetStateAction<string | null>>
    loadDashboard: LoadDashboardAction
    setLoadDashboard: React.Dispatch<React.SetStateAction<LoadDashboardAction>>
    dashboardPermissions: { read: boolean, modify: boolean, write: boolean }
    chartTooltip: TooltipData
    setChartTooltip: React.Dispatch<React.SetStateAction<TooltipData>>
}

export default function DashboardPanel(props: DashboardPanelProps) {
    const toast = useContext(ToastContext)

    const dashboardContainerRef = useRef<HTMLDivElement>(null)
    const {width} = useResizeDetector({targetRef: dashboardContainerRef, refreshMode: 'debounce', refreshRate: 500})

    // This is the layout object passed to the react-grid-layout
    // This object is updated when a widget is dropped/deleted with values from the gridProps state
    // If not done like this, drag&dropping will not work as intended
    const [layout, setLayout] = useState<Layout[]>([])

    const [dashboardLoading, setDashboardLoading] = useState(false)
    const [dashboardSaving, setDashboardSaving] = useState(false)

    const [dashboardSize, setDashboardSize] = useState<DashboardSize>({
        width: 1000,
        numCols: 12,
        numRows: 0,
        rowHeight: 125,
        compactType: null
    })

    const [saveDashboardPromptOpen, setSaveDashboardPromptOpen] = useState(false)
    const [saveDashboard, setSaveDashboard] = useState<SaveDashboard>({
        isDefault: false,
        name: '',
        save: false,
        saveAs: false,
        saveAsError: false
    })

    // Avoid "Has unsaved changes" to appear in first time dashboard layout
    const [firstTimeLayout, setFirstTimeLayout] = useState(true)

    // RESET PLACEHOLDERS ON NEW DASHBOARD CREATED
    useEffect(() => {
        if (!props.dashboard.isNew) return

        props.setDashboard((val) => {
            if (val.isNew) {
                val.isNew = false

                setLayout([])
                setDashboardSize((el) => {
                    el.numCols = val.numCols
                    el.numRows = 4
                    el.compactType = 'vertical'

                    return {...el}
                })
                // updateDashboardSize()
            }

            return val
        })
    }, [props])

    // LOAD DEFAULT DASHBOARD
    useEffect(() => {
        if (props.dashboard.timestamp > 0) return

        async function getDefaultDashboard() {
            setDashboardLoading(true)

            try {
                let result: Dashboard
                if (props.dashboardToLoadByDefault)
                    result = await dashboardService.loadDashboard(props.machinery.uid, props.dashboardToLoadByDefault)
                else
                    result = await dashboardService.loadDefaultDashboard(props.machinery.uid)

                result.numUnsavedChanges = 0
                result.lastSave = 0
                result.isNew = false

                props.setChartTooltip((val) => {
                    val.active = false

                    return {...val}
                })

                setDashboardSize((val) => {
                    val.numCols = result.numCols
                    val.numRows = result.numRows
                    val.compactType = result.gridCompaction

                    return {...val}
                })
                // updateDashboardSize()

                setLayout(result.grid.layout)
                props.setDashboard(result)

                setFirstTimeLayout(true)

                toastHelper.makeToast(
                    toast,
                    props.dashboardToLoadByDefault ? `${props.dashboardToLoadByDefault} loaded` : 'Default dashboard loaded',
                    'info'
                )
            } catch (e) {
                console.error(e)
            }

            setDashboardLoading(false)
        }

        getDefaultDashboard()
    }, [props, toast])

    // SAVE dashboard
    useEffect(() => {
        if (!saveDashboard.save) return

        async function save() {
            setDashboardSaving(true)

            const gridWidgets: GridWidget[] = []
            props.dashboard.grid.widgets.forEach((widget) => {
                const widgetToSave = {...widget}
                widgetToSave.sensorsMonitoring.requestType = 'first-time'
                widgetToSave.sensorsMonitoring.cacheDataRequestMaxTime = 0
                widgetToSave.sensorsMonitoring.newDataRequestMinTime = 0
                gridWidgets.push(widgetToSave)
            })

            try {
                await dashboardService.saveDashboard(
                    new Dashboard(
                        saveDashboard.name,
                        props.machinery.uid,
                        Date.now(),
                        0,
                        saveDashboard.isDefault,
                        0,
                        0,
                        false,
                        dashboardSize.numCols,
                        dashboardSize.numRows,
                        dashboardSize.compactType,
                        {
                            widgets: gridWidgets,
                            layout: props.dashboard.grid.layout
                        }
                    )
                )
                props.setDashboard((val) => {
                    val.name = saveDashboard.name
                    val.isDefault = saveDashboard.isDefault
                    val.numUnsavedChanges = 0
                    val.lastSave = Date.now()

                    return {...val}
                })

                // setSaveDashboardPromptOpen(false)

                toastHelper.makeToast(
                    toast,
                    'Dashboard saved',
                    'success'
                )
            } catch (e: any) {
                console.error(e)
                let openSaveAsModal = false

                try {
                    if (e.response?.status === 404) {
                        setSaveDashboardPromptOpen(true)
                        openSaveAsModal = true
                    } else
                        openSaveAsModal = false
                } catch (e1) {
                    openSaveAsModal = false
                }

                if (!openSaveAsModal)
                    axiosExceptionHandler.handleAxiosExceptionWithToast(
                        e,
                        toast,
                        'Dashboard could not be saved'
                    )
            }

            setSaveDashboard({
                isDefault: false,
                name: '',
                save: false,
                saveAs: false,
                saveAsError: false
            })

            setDashboardSaving(false)
        }

        save()
    }, [saveDashboard, props, dashboardSize, toast])

    // SAVE AS dashboard
    useEffect(() => {
        if (!saveDashboard.saveAs) return

        async function save() {
            setDashboardSaving(true)

            const gridWidgets: GridWidget[] = []
            props.dashboard.grid.widgets.forEach((widget) => {
                const widgetToSave = {...widget}
                widgetToSave.sensorsMonitoring.requestType = 'first-time'
                widgetToSave.sensorsMonitoring.cacheDataRequestMaxTime = 0
                widgetToSave.sensorsMonitoring.newDataRequestMinTime = 0
                gridWidgets.push(widgetToSave)
            })

            try {
                await dashboardService.saveAsDashboard(
                    new Dashboard(
                        saveDashboard.name,
                        props.machinery.uid,
                        Date.now(),
                        0,
                        saveDashboard.isDefault,
                        0,
                        0,
                        false,
                        dashboardSize.numCols,
                        dashboardSize.numRows,
                        dashboardSize.compactType,
                        {
                            widgets: gridWidgets,
                            layout: props.dashboard.grid.layout
                        }
                    )
                )
                props.setDashboard((val) => {
                    val.name = saveDashboard.name
                    val.isDefault = saveDashboard.isDefault
                    val.numUnsavedChanges = 0
                    val.lastSave = Date.now()

                    return {...val}
                })

                setSaveDashboardPromptOpen(false)

                toastHelper.makeToast(
                    toast,
                    'Dashboard saved',
                    'success'
                )
            } catch (e: any) {
                console.error(e)

                try {
                    if (e.response?.status === 409) {
                        setSaveDashboard({
                            isDefault: false,
                            name: '',
                            save: false,
                            saveAs: false,
                            saveAsError: true
                        })

                        setDashboardSaving(false)

                        return
                    }
                } catch (e1) {
                    console.error(e1);
                }

                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    'Dashboard could not be saved'
                )
            }

            setSaveDashboard({
                isDefault: false,
                name: '',
                save: false,
                saveAs: false,
                saveAsError: false
            })

            setDashboardSaving(false)
        }

        save()
    }, [saveDashboard, props, dashboardSize, toast])

    // LOAD dashboard
    useEffect(() => {
        if (!props.loadDashboard.doLoad || props.loadDashboard.isTemplate) return

        async function getData() {
            setDashboardLoading(true)

            try {
                const result = await dashboardService.loadDashboard(props.machinery.uid, props.loadDashboard.name)

                result.numUnsavedChanges = 0
                result.lastSave = 0
                result.isNew = false

                props.setChartTooltip((val) => {
                    val.active = false

                    return {...val}
                })

                setDashboardSize((val) => {
                    val.numCols = result.numCols
                    val.numRows = result.numRows
                    val.compactType = result.gridCompaction

                    return {...val}
                })
                // updateDashboardSize()

                setLayout(result.grid.layout)
                props.setDashboard(result)

                props.setLoadDashboard((val) => {
                    val.doLoad = false

                    return {...val}
                })

                setFirstTimeLayout(true)

                toastHelper.makeToast(
                    toast,
                    'Dashboard loaded',
                    'info'
                )
            } catch (e) {
                console.error(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    'Dashboard could not be loaded'
                )
            }

            setDashboardLoading(false)
        }

        getData()
    }, [props, toast])

    // LOAD template
    useEffect(() => {
        if (!props.loadDashboard.doLoad || !props.loadDashboard.isTemplate) return

        async function getData() {
            setDashboardLoading(true)

            try {
                const result = await dashboardService.loadDashboard(props.loadDashboard.machineryUID, props.loadDashboard.name)

                result.name = 'Unsaved new dashboard'
                result.numUnsavedChanges++
                result.lastSave = 0
                result.isNew = false

                result.grid.widgets.forEach((widget) => {
                    widget.sensorsMonitoring = {
                        requestType: 'first-time',
                        cacheDataRequestMaxTime: 0,
                        newDataRequestMinTime: 0,
                        widgetCategory: widget.sensorsMonitoring.widgetCategory,
                        dataRange: {
                            amount: 15,
                            unit: 'sample'
                        },
                        sensors: {
                            drive: [],
                            eqtq: [],
                            plc: []
                        },
                        aggregations: [{name: 'none', color: '#A0AEC0'}]
                    }
                })

                props.setChartTooltip((val) => {
                    val.active = false

                    return {...val}
                })

                setDashboardSize((val) => {
                    val.numCols = result.numCols
                    val.numRows = result.numRows
                    val.compactType = result.gridCompaction

                    return {...val}
                })
                // updateDashboardSize()

                setLayout(result.grid.layout)
                props.setDashboard(result)

                props.setLoadDashboard((val) => {
                    val.doLoad = false

                    return {...val}
                })

                toastHelper.makeToast(
                    toast,
                    'Dashboard template loaded',
                    'info'
                )
            } catch (e) {
                console.error(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    'Dashboard template could not be loaded'
                )
            }

            setDashboardLoading(false)
        }

        getData()
    }, [props, toast])

    // DASHBOARD PROPS (width, numCols, rowHeight)
    useEffect(() => {
        if (width === undefined) return

        const dashboardContainerWidth = width

        if (dashboardContainerWidth === dashboardSize.width) return

        setDashboardSize((val) => {
            val.width = dashboardContainerWidth
            val.rowHeight = (dashboardContainerWidth - (5 * val.numCols)) / val.numCols

            return {...val}
        })

        window.dispatchEvent(new Event('resize'))
    }, [width, dashboardSize.width])

    // MODIFY WIDGET - this must be done to have un updated view of the widgets at save time
    function handleWidgetModifiedFn(type: string, bundle: any) {
        switch (type) {
            case 'delete': {
                props.setDashboard((val) => {
                    val.grid.widgets = val.grid.widgets.filter((el) => (el.id !== bundle.id))
                    val.grid.layout = val.grid.layout.filter((el) => (el.i !== bundle.id))
                    val.numUnsavedChanges++

                    setLayout(val.grid.layout)

                    return {...val}
                })
                break
            }
            case 'rename': {
                props.setDashboard((val) => {
                    const foundWidget = val.grid.widgets.find((el) => (el.id === bundle.id));
                    if (foundWidget) {
                        foundWidget.name = bundle.name
                        val.numUnsavedChanges++
                    }

                    return val
                })
                break
            }
            case 'static': {
                props.setDashboard((val) => {
                    const widget = val.grid.widgets.find((el) => (el.id === bundle.id))
                    const dashboardLayout = val.grid.layout.find((el) => (el.i === bundle.id))

                    if (widget != null) {
                        const isStatic = !widget.static

                        widget.static = isStatic

                        if (dashboardLayout != null)
                            dashboardLayout.static = isStatic

                        setLayout((val) => {
                            const gridLayoutEntry = layout.find((el) => (el.i === bundle.id))
                            if (gridLayoutEntry != null) {
                                gridLayoutEntry.static = isStatic

                                return [...val]
                            }

                            return val
                        })

                        val.numUnsavedChanges++

                        // Bypass Widget.tsx memoization by creation new object => this will propagate static/not static change
                        // val.grid.widgets[widgetIndex] = {...widget}
                    }

                    return val
                })
                break
            }
            case 'set-sensors-monitoring': {
                props.setDashboard((val) => {
                    const gridItemSensor = val.grid.widgets.find((el) => (el.id === bundle.id))

                    if (gridItemSensor) {
                        gridItemSensor.sensorsMonitoring = bundle.sensorsMonitoring
                        val.numUnsavedChanges++
                    }

                    return val
                })
                break
            }
            default: {
                throw Error(`Unknown action: ${type}`)
            }
        }
    }

    // LAYOUT CHANGES - reposition
    function onLayoutChange(layout: Layout[]) {
        props.setDashboard((val) => {
            val.grid.layout = layout
            if (!firstTimeLayout)
                val.numUnsavedChanges++

            return {...val}
        })

        if (firstTimeLayout)
            setFirstTimeLayout(false)
    }

    // DRAGGING OVER THE DASHBOARD - decode WIDGET HEIGHT AND WIDTH
    function onDropDragOver(e: any) {
        // width&height are coded into the dataTransfer type (e.g 2,1)
        const dataTransferType = e.dataTransfer.types[0].toString()
        const wh = dataTransferType.split(',')

        e.preventDefault()

        if (props.chartTooltip.active)
            closeTooltip()

        return {w: parseInt(wh[0]), h: parseInt(wh[1])}
    }

    // ON DROP - ADD ITEM TO WIDGETS TO DISPLAY
    function onDrop(rglLayout: RGL.Layout[], layoutItem: Layout, event: any) {
        // retrieve dataTransfer type as it is the coded info of the width&height of the element

        const dataType = event.dataTransfer.types[0].toString()
        const widgetData = JSON.parse(event.dataTransfer.getData(dataType))

        props.setDashboard((val) => {
            let newID
            if (val.grid.widgets.length === 0)
                newID = 0
            else
                newID = Math.max(...val.grid.widgets.map((el) => (parseInt(el.id)))) + 1

            val.grid.widgets.push({
                id: newID.toString(),
                name: widgetData.name,
                category: widgetData.category,
                type: widgetData.type,
                maxSensors: widgetData.maxSensors,
                static: false,
                sensorsMonitoring: {
                    requestType: 'first-time',
                    cacheDataRequestMaxTime: 0,
                    newDataRequestMinTime: 0,
                    widgetCategory: widgetData.widgetCategory,
                    dataRange: {
                        amount: 15,
                        unit: 'sample'
                    },
                    sensors: {
                        drive: [],
                        eqtq: [],
                        plc: []
                    },
                    aggregations: [{name: 'none', color: '#A0AEC0'}]
                }
            })

            val.grid.layout = rglLayout

            val.grid.layout[val.grid.layout.length - 1].i = newID.toString()

            val.numUnsavedChanges++

            let max = 0
            rglLayout.forEach((item) => {
                if (item.y + item.h > max)
                    max = item.y + item.h
            })
            if (max > dashboardSize.numRows)
                setDashboardSize((el) => {
                    el.numRows = max

                    return {...el}
                })

            setLayout(val.grid.layout)

            return {...val}
        })

        event.preventDefault()
    }

    // LAYOUT CHANGES - resize
    function onResize(layout: Layout[]) {
        props.setDashboard((val) => {
            let max = 0

            layout.forEach((item) => {
                if (item.y + item.h > max)
                    max = item.y + item.h
            })
            if (max > dashboardSize.numRows)
                setDashboardSize((el) => {
                    el.numRows = max

                    return {...el}
                })

            // if (newLayoutItem.h + newLayoutItem.y > dashboardSize.numRows) {
            //     let layoutEntryIndex = layout.map((el) => (el.i)).indexOf(newLayoutItem.i)
            //     if (layoutEntryIndex > -1) {
            //         layout[layoutEntryIndex].h -= (newLayoutItem.h + newLayoutItem.y - dashboardSize.numRows)
            //     }
            // }

            val.grid.layout = layout

            val.numUnsavedChanges++

            return {...val}
        })
    }

    // EXTEND DASHBOARD LENGTH
    function extendDashboard() {
        if (!props.dashboardPermissions.modify) return

        setDashboardSize((val) => {
            val.numRows += 2

            return {...val}
        })

        props.setDashboard((val) => {
            val.numUnsavedChanges++

            return val
        })
    }

    // CLOSE TOOLTIP on mouse down over dashboard container
    function closeTooltip() {
        props.setChartTooltip((val) => {
            val.active = false

            return {...val}
        })
    }

    return (
        <Fragment>
            {
                props.chartTooltip.active &&
                <Portal>
                    <ChartTooltip
                        chartTooltipData={props.chartTooltip}
                        setChartTooltipData={props.setChartTooltip}
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
                    dashboard={props.dashboard}
                    setDashboard={props.setDashboard}
                    dashboardLoading={dashboardLoading}
                    dashboardCompactType={dashboardSize.compactType}
                    setDashboardSize={setDashboardSize}
                    setLayout={setLayout}
                    dashboardPermissions={props.dashboardPermissions}
                    setSaveDashboardPromptOpen={setSaveDashboardPromptOpen}
                    setSaveDashboard={setSaveDashboard}
                />
            </VStack>
            {/* <Divider orientation={"horizontal"} mt={"0!important"}/> */}
            {
                !dashboardLoading &&
                <Box
                    w="full"
                    h={`${dashboardSize.numRows * dashboardSize.rowHeight + (dashboardSize.numRows + 1) * 8 + 25}px`}
                    position="relative"
                >
                    <Box
                        w="full"
                        h={`${dashboardSize.numRows * dashboardSize.rowHeight + (dashboardSize.numRows + 1) * 8}px`}
                        maxHeight={`${dashboardSize.numRows * dashboardSize.rowHeight + (dashboardSize.numRows + 1) * 8}px`}
                        position="absolute"
                        zIndex={0}
                        left={0}
                        top={0}
                    >
                        <ReactGridLayout
                            width={~~dashboardSize.width}
                            style={{
                                height: `${dashboardSize.numRows * dashboardSize.rowHeight + (dashboardSize.numRows + 1) * 8}px`,
                                maxHeight: `${dashboardSize.numRows * dashboardSize.rowHeight + (dashboardSize.numRows + 1) * 8}px`
                            }}
                            margin={[5, 5]}
                            cols={dashboardSize.numCols}
                            rowHeight={dashboardSize.rowHeight}
                            autoSize={false}
                            containerPadding={[0, 0]}
                            useCSSTransforms
                        >
                            {
                                Array(dashboardSize.numRows).fill(0).map((valRow, indexRow) => (
                                    Array(dashboardSize.numCols).fill(0).map((valCol, indexCol) => (
                                        <Box
                                            key={`${indexRow}_${indexCol}`}
                                            data-grid={{x: indexCol, y: indexRow, w: 1, h: 1, static: true}}
                                            w="full"
                                            h="full"
                                            borderWidth={1}
                                            borderColor="gray.300"
                                            rounded="md"
                                        />
                                    ))
                                ))
                            }
                        </ReactGridLayout>
                    </Box>
                    <Box
                        w="full"
                        position="absolute"
                        zIndex={1}
                        left={0}
                        top={0}
                    >
                        <ReactGridLayout
                            style={{
                                height: `${dashboardSize.numRows * dashboardSize.rowHeight + (dashboardSize.numRows + 1) * 8}px`,
                                maxHeight: `${dashboardSize.numRows * dashboardSize.rowHeight + (dashboardSize.numRows + 1) * 8}px`
                            }}
                            margin={[5, 5]}
                            autoSize={false}
                            width={~~dashboardSize.width}
                            compactType={dashboardSize.compactType}
                            onLayoutChange={onLayoutChange}
                            onResizeStop={onResize}
                            isResizable={props.dashboardPermissions.modify}
                            isDraggable={props.dashboardPermissions.modify}
                            isDroppable={props.dashboardPermissions.modify}
                            allowOverlap={props.dashboard.grid.widgets.length === 0}
                            onDropDragOver={onDropDragOver}
                            onDrop={onDrop}
                            layout={layout}
                            cols={dashboardSize.numCols}
                            rowHeight={dashboardSize.rowHeight}
                            containerPadding={[0, 0]}
                            isBounded
                            useCSSTransforms
                        >
                            {props.dashboard.grid.widgets.map((widget, index) =>
                                <Box key={widget.id}>
                                    <Widget
                                        widget={widget}
                                        machinery={props.machinery}
                                        dashboardSize={dashboardSize}
                                        layout={props.dashboard.grid.layout[index]}
                                        availableSensors={props.availableSensors}
                                        handleWidgetModified={handleWidgetModifiedFn}
                                        sensorsMonitoring={widget.sensorsMonitoring}
                                        chartTooltipActive={props.chartTooltip.active}
                                        setChartTooltip={props.setChartTooltip}
                                        dashboardPermissions={props.dashboardPermissions}
                                    />
                                </Box>
                            )}
                            {
                                props.dashboard.grid.widgets.length === 0 &&
                                dashboardSize.numRows === 4 &&
                                <VStack
                                    key="add-widgets-dummy"
                                    bgColor="white"
                                    boxShadow="xl"
                                    rounded="md"
                                    justifyContent="center"
                                    data-grid={{
                                        x: 0,
                                        y: 0,
                                        w: dashboardSize.numCols,
                                        h: 4,
                                        static: true,
                                        isDraggable: false,
                                        isResizable: false
                                    }}
                                >
                                    <Text fontSize="2xl" color="gray.500">Dashboard is empty</Text>
                                    {
                                        props.dashboardPermissions.modify &&
                                        <Text fontSize="md" color="gray.500">Start by drag & dropping widgets
                                            here</Text>
                                    }
                                </VStack>
                            }
                        </ReactGridLayout>
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
                            leftIcon={<FiPlus color={props.dashboardPermissions.modify ? '#000000' : '#A0AEC0'}/>}
                            disabled={!props.dashboardPermissions.modify}
                            onClick={extendDashboard}
                            title={!props.dashboardPermissions.modify ? 'Operation not permitted' : ''}
                        >
                            Extend dashboard
                        </Button>
                    </HStack>
                </Box>
            }
            {
                dashboardLoading &&
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
                    dashboard={props.dashboard}
                    promptOpen={saveDashboardPromptOpen}
                    setPromptOpen={setSaveDashboardPromptOpen}
                    saveDashboard={saveDashboard}
                    setSaveDashboard={setSaveDashboard}
                    dashboardSaving={dashboardSaving}
                />
            }
        </Fragment>
    )
}
