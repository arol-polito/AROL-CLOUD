import {useContext, useEffect, useRef, useState} from "react";
import ToastContext from "../../../utils/contexts/ToastContext";
import {useResizeDetector} from "react-resize-detector";
import RGL, {Layout} from "react-grid-layout";
import SaveDashboard from "../interfaces/SaveDashboard";
import {DashboardPanelProps} from "./DashboardPanel";
import dashboardService from "../../../services/DashboardService";
import GridWidget from "../interfaces/GridWidget";
import Dashboard from "../models/Dashboard";
import toastHelper from "../../../utils/ToastHelper";
import axiosExceptionHandler from "../../../utils/AxiosExceptionHandler";
import {processSensorsMonitoring} from "../utils";
import SensorDataFilters from "../interfaces/SensorDataFilters";
import SlidingSensorData from "../interfaces/SlidingSensorData";
import {ChartProps} from "./widget/useWidgetLogic";
import _ from "lodash";
import {PolarChartSensorData} from "../interfaces/PolarChartSensorData";
import {DataDisplaySize} from "../interfaces/DataDisplaySize";

export const useDashboardPanelLogic = (props: DashboardPanelProps) => {
    const {machinery, dashboard, setDashboard} = props;
    const {layout, setLayout, dashboardPermissions} = props;
    const {chartTooltip, setChartTooltip, availableSensors} = props;

    const toast = useContext(ToastContext)

    const dashboardContainerRef = useRef<HTMLDivElement>(null)
    const {width} = useResizeDetector({targetRef: dashboardContainerRef, refreshMode: 'debounce', refreshRate: 500});

    const [dashboardSaving, setDashboardSaving] = useState(false)

    const [saveDashboardPromptOpen, setSaveDashboardPromptOpen] = useState(false)


    // RESET PLACEHOLDERS ON NEW DASHBOARD CREATED
    // // TODO: function
    // useEffect(() => {
    //     if (!dashboard.isNew) return
    //
    //     debugger;
    //
    //     setDashboard((val) => {
    //         if (val.isNew) {
    //             val.isNew = false
    //             val.size.numRows = 4
    //             val.size.compactType = 'vertical'
    //             setLayout([])
    //             // updateDashboardSize()
    //         }
    //
    //         return {...val}
    //     })
    // }, [dashboard.isNew, setDashboard, setLayout])

    const saveDashboard = async (saveDashboard: SaveDashboard) => {
        setDashboardSaving(true)

        const gridWidgets: GridWidget[] = []
        dashboard.widgets.forEach((widget) => {
            const widgetToSave = {...widget}
            widgetToSave.sensorsMonitoring.requestType = 'first-time'
            widgetToSave.sensorsMonitoring.cacheDataRequestMaxTime = 0
            widgetToSave.sensorsMonitoring.newDataRequestMinTime = 0
            widgetToSave.numChange = 1
            widgetToSave.chartNumChange = 1
            widgetToSave.sensorData = {
                displayData: [],
                endOfData: true,
                hasNewData: false,
                leftData: [],
                minDisplayTime: 0,
                numSamplesDisplaying: 0,
                numSensorData: 0,
                rightData: []
            };
            widgetToSave.sensorsMonitoringArray = [];
            widgetToSave.sensorsMonitoringObject = {};
            widgetToSave.polarChartSensorData = {
                aggregationData: {},
                allData: {},
                sectionSize: 0,
                startingFromTime: ""
            }
            widgetToSave.sensorDataError = false;
            widgetToSave.sensorDataLoading = false;
            widgetToSave.sensorDataError = false;
            widgetToSave.dataDisplaySize = {
                height: 0,
                width: 0
            }
            gridWidgets.push(widgetToSave)
        })

        try {
            if (saveDashboard.saveAs)
                await dashboardService.saveAsDashboard(
                    new Dashboard(
                        saveDashboard.name,
                        false,
                        machinery.uid,
                        Date.now(),
                        0,
                        saveDashboard.isDefault,
                        0,
                        0,
                        false,
                        dashboard.size,
                        gridWidgets,
                        dashboard.layout
                    )
                )
            else
                await dashboardService.saveDashboard(
                    new Dashboard(
                        saveDashboard.name,
                        false,
                        machinery.uid,
                        Date.now(),
                        0,
                        saveDashboard.isDefault,
                        0,
                        0,
                        false,
                        dashboard.size,
                        gridWidgets,
                        layout
                    )
                )

            setSaveDashboardPromptOpen(false);

            setDashboard((val) => {
                val.name = saveDashboard.name
                val.isDefault = saveDashboard.isDefault
                val.numUnsavedChanges = 0
                val.lastSave = Date.now()

                return val
            })

            toastHelper.makeToast(
                toast,
                'Dashboard saved',
                'success'
            )
        } catch (e: any) {
            console.error(e)
            let openSaveAsModal: boolean;

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

        setDashboardSaving(false)
    }


    // DASHBOARD PROPS (width, numCols, rowHeight)
    useEffect(() => {

        if (width === undefined) return

        const dashboardContainerWidth = width

        setDashboard((val) => {
            val.size.width = dashboardContainerWidth
            val.size.rowHeight = (dashboardContainerWidth - (5 * val.size.numCols)) / val.size.numCols
            val.size = {...val.size};

            if (val.isNew)
                val.isNew = false;


            return {...val}
        })

        window.dispatchEvent(new Event('resize'))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, dashboard.isNew])

    // MODIFY WIDGET - this must be done to have un updated view of the widgets at save time
    const handleWidgetModifiedFn = (type: string, bundle: any) => {
        switch (type) {
            case 'delete': {
                setDashboard((val) => {
                    val.widgets = [...val.widgets.filter((el) => (el.id !== bundle.id))]
                    val.layout = [...val.layout.filter((el) => (el.i !== bundle.id))]
                    val.numUnsavedChanges++

                    setLayout(val.layout)

                    return {...val}
                })
                break
            }
            case 'rename': {
                setDashboard((val) => {
                    const foundWidget = val.widgets.find((el) => (el.id === bundle.id));
                    if (foundWidget) {
                        foundWidget.name = bundle.name
                        foundWidget.numChange++
                        val.numUnsavedChanges++
                    }

                    val.widgets = [...val.widgets]

                    return {...val}
                })
                break
            }
            case 'static': {
                setDashboard((val) => {
                    const widget = val.widgets.find((el) => (el.id === bundle.id))
                    const dashboardLayout = val.layout.find((el) => (el.i === bundle.id))

                    if (widget != null) {
                        const isStatic = !widget.static

                        widget.static = isStatic
                        widget.numChange++

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

                        val.widgets = [...val.widgets]
                        val.layout = [...val.layout]

                        val.numUnsavedChanges++

                        // Bypass Widget.tsx memoization by creation new object => this will propagate static/not static change
                        // val.grid.widgets[widgetIndex] = {...widget}
                    }

                    return {...val}
                })
                break
            }
            case 'set-sensors-monitoring': {
                setDashboard((val) => {
                    const foundWidget = val.widgets.find((el) => (el.id === bundle.id))

                    if (foundWidget) {
                        foundWidget.sensorsMonitoring = {...bundle.sensorsMonitoring}
                        val.numUnsavedChanges++
                    }

                    return {...val}
                })
                break
            }
            default: {
                throw Error(`Unknown action: ${type}`)
            }
        }
    }

    // LAYOUT CHANGES - reposition
    const onLayoutChange = (layout: Layout[]) => {
        setDashboard((val) => {
            if (!_.isEqual(val.layout, layout.filter((layoutItem) => (layoutItem.i !== 'add-widgets-dummy'))))
                val.numUnsavedChanges++;

            val.layout = [...layout]

            return {...val}
        })

    }

    // DRAGGING OVER THE DASHBOARD - decode WIDGET HEIGHT AND WIDTH
    const onDropDragOver = (e: any) => {
        // width&height are coded into the dataTransfer type (e.g 2,1)
        const dataTransferType = e.dataTransfer.types[0].toString()
        const wh = dataTransferType.split(',')

        e.preventDefault()

        if (chartTooltip.active)
            closeTooltip()

        return {w: parseInt(wh[0]), h: parseInt(wh[1])}
    }

    // ON DROP - ADD ITEM TO WIDGETS TO DISPLAY
    const onDrop = (rglLayout: RGL.Layout[], layoutItem: Layout, event: any) => {
        // retrieve dataTransfer type as it is the coded info of the width&height of the element

        const dataType = event.dataTransfer.types[0].toString()
        const widgetData = JSON.parse(event.dataTransfer.getData(dataType))

        setDashboard((val) => {
            let newID
            if (val.widgets.length === 0)
                newID = 0
            else
                newID = Math.max(...val.widgets.map((el) => (parseInt(el.id)))) + 1

            const sensorsMonitoring: SensorDataFilters = {
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

            const sensorData: SlidingSensorData = {
                leftData: [],
                displayData: [],
                rightData: [],
                endOfData: true,
                hasNewData: false,
                minDisplayTime: 0,
                numSamplesDisplaying: 0,
                numSensorData: 0,
            }

            const chartProps: ChartProps = {
                xAxisProps: {
                    dataKey: "", style: {
                        fontSize: "10px",
                    },
                },
                yAxisDataMax: Number.MAX_SAFE_INTEGER,
                yAxisDataMin: Number.MIN_SAFE_INTEGER,
                yAxisProps: {
                    style: {
                        fontSize: "10px",
                    },
                    width: 0
                }
            }

            const dataDisplaySize: DataDisplaySize = {
                width: 0,
                height: 0
            }

            const polarChartSensorData: PolarChartSensorData = {
                allData: {},
                aggregationData: {},
                sectionSize: 0,
                startingFromTime: ''
            }

            val.widgets.push({
                id: newID.toString(),
                name: widgetData.name,
                category: widgetData.category,
                type: widgetData.type,
                maxSensors: widgetData.maxSensors,
                static: false,
                sensorsMonitoring,
                ...processSensorsMonitoring(sensorsMonitoring, availableSensors),
                sensorData,
                sensorDataLoading: false,
                sensorDataCacheLoading: false,
                sensorDataError: false,
                polarChartSensorData,
                chartProps,
                dataDisplaySize,
                numChange: 1,
                chartNumChange: 1
            })

            val.layout = rglLayout

            val.layout[val.layout.length - 1].i = newID.toString()

            val.numUnsavedChanges++

            let max = 0
            rglLayout.forEach((item) => {
                if (item.y + item.h > max)
                    max = item.y + item.h
            })
            if (max > dashboard.size.numRows)
                setDashboard((el) => {
                    el.size.numRows = max
                    el.size = {...el.size}

                    return {...el}
                })

            setLayout(val.layout)

            return {...val}
        })

        event.preventDefault()
    }

    // LAYOUT CHANGES - resize
    const onResize = (layout: Layout[]) => {
        setDashboard((val) => {
            let max = 0

            layout.forEach((item) => {
                if (item.y + item.h > max)
                    max = item.y + item.h
            })
            if (max > dashboard.size.numRows)
                setDashboard((el) => {
                    el.size.numRows = max
                    el.size = {...el.size}

                    return el
                })

            // if (newLayoutItem.h + newLayoutItem.y > dashboardSize.numRows) {
            //     let layoutEntryIndex = layout.map((el) => (el.i)).indexOf(newLayoutItem.i)
            //     if (layoutEntryIndex > -1) {
            //         layout[layoutEntryIndex].h -= (newLayoutItem.h + newLayoutItem.y - dashboardSize.numRows)
            //     }
            // }

            val.layout = layout

            val.numUnsavedChanges++

            return val
        })
    }

    // EXTEND DASHBOARD LENGTH
    const extendDashboard = () => {
        if (!dashboardPermissions.modify) return

        setDashboard((val) => {
            val.size.numRows += 2
            val.size = {...val.size}

            val.numUnsavedChanges++;

            return {...val}
        })

    }

    // CLOSE TOOLTIP on mouse down over dashboard container
    const closeTooltip = () => {
        setChartTooltip((val) => {
            val.active = false

            return {...val}
        })
    }

    return {
        dashboardContainerRef,
        layout,
        setLayout,
        dashboardSaving,
        saveDashboardPromptOpen,
        setSaveDashboardPromptOpen,
        handleWidgetModifiedFn,
        onLayoutChange,
        onDropDragOver,
        onDrop,
        onResize,
        saveDashboard,
        extendDashboard,
        closeTooltip
    }
}