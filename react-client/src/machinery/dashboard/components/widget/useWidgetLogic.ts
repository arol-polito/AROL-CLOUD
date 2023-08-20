import React, {useContext, useEffect, useMemo, useState} from "react";
import ToastContext from "../../../../utils/contexts/ToastContext";
import Sensor from "../../models/Sensor";
import {DashboardWidgetProps} from "./Widget";
import {calculateChartProps, loadSensorData, setNewWidgetSensorData} from "../../utils"
import axiosExceptionHandler from "../../../../utils/AxiosExceptionHandler";

export interface ChartProps {
    yAxisDataMin: number,
    yAxisDataMax: number,
    yAxisProps: {
        style: any,
        width: number
    },
    xAxisProps: {
        dataKey: string,
        style: any
    }
}

export const useWidgetLogic = (props: DashboardWidgetProps) => {
    const {widget, widgetIndex, machinery, dashboardSize, layout} = props;
    const {availableSensors, chartTooltipActive} = props;
    const {setChartTooltip, dashboardPermissions} = props
    const {setDashboard} = props;

    const toast = useContext(ToastContext)

    const [availableSensorsMap, setAvailableSensorsMap] = useState<Map<string, Sensor[]>>(new Map())

    const [sensorsDataLoading, setSensorsDataLoading] = useState(false)
    const [sensorDataError, setSensorDataError] = useState(false)
    const [loadingMoreSensorData, setLoadingMoreSensorData] = useState(false)
    const [sensorsModalOpen, setSensorsModalOpen] = useState(false)
    const [settingsModalOpen, setSettingsModalOpen] = useState(false)
    const [historyModalOpen, setHistoryModalOpen] = useState(false)

    const [dataDisplaySize, setDataDisplaySize] = useState<{ height: number, width: number }>({
        height: 0,
        width: 0
    })

    const [widgetStatic, setWidgetStatic] = useState(widget.static)

    // const setDataDisplaySize = () => {}
    // DATA DISPLAY ZONE HEIGHT & WIDTH in px
    useEffect(() => {
        const rowHeight = dashboardSize.rowHeight
        const gridMargin = 5

        setDataDisplaySize({
            // 74 = 18 bottom text height + 32 widget heading + 16 top&bottom padd
            height: Math.round(layout.h * rowHeight + (layout.h - 1) * gridMargin - 66),
            // 16 = 16 left&right padd
            width: Math.floor(rowHeight * layout.w + (layout.w - 1) * gridMargin - 16)
        })
    }, [dashboardSize.rowHeight, dashboardSize.width, dashboardSize.numCols, layout.h, layout.w])

    // AVAILABLE SENSORS MAP - for use in Sensors Modal
    const generateAvailableSensorsMap = () => {
        const map = new Map<string, Sensor[]>()
        availableSensors.forEach((el) => {
            if (map.has(el.category))
                map.get(el.category)?.push(el)
            else
                map.set(el.category, [el])
        })
        setAvailableSensorsMap(map)
    }


    // LOAD MORE SENSOR DATA
    const loadMoreSensorData = async () => {
        setLoadingMoreSensorData(true);

        const requestType = 'cache-only'
        let cacheDataRequestMaxTime = 0;
        if (widget.sensorData.leftData.length > 0)
            cacheDataRequestMaxTime = widget.sensorData.leftData[0].time
        else if (widget.sensorData.displayData.length > 0)
            cacheDataRequestMaxTime = widget.sensorData.displayData[0].time

        try {
            const sensorDataResult = await loadSensorData(widget.sensorsMonitoring, requestType, cacheDataRequestMaxTime, 0, machinery, widget)
            const chartPropsResult = calculateChartProps(sensorDataResult, widget.chartProps);
            setNewWidgetSensorData(setDashboard, widgetIndex, sensorDataResult, chartPropsResult);
        } catch (e) {
            console.error(e)
            axiosExceptionHandler.handleAxiosExceptionWithToast(
                e,
                toast,
                'Sensor data could not be loaded'
            )
        }

        setLoadingMoreSensorData(false);

    }

    // OPEN SENSORS MODAL
    const handleOpenSensorsModalButton = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        generateAvailableSensorsMap();
        setSensorsModalOpen(true);
    }

    // WIDGET DESCRIPTOR TEXT - placed at the bottom
    const widgetBottomText = useMemo(
        () => {
            let text = ''
            if (widget.maxSensors > 1)
                text = `${widget.numSensorsMonitoring} sensors monitoring | `

            if (widget.numAggregationsMonitoring)
                text += 'Aggregated | '
            else
                text += 'No aggregations | '

            if (widgetStatic)
                text += 'Locked'
            else
                text += 'Unlocked'

            return text
        },
        [widgetStatic, widget.numSensorsMonitoring, widget.numAggregationsMonitoring, widget.maxSensors]
    )

    const handleWidgetMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!dashboardPermissions.modify || widgetStatic)
            e.stopPropagation()

        if (chartTooltipActive)
            setChartTooltip((val) => {
                val.active = false

                return val
            })
    }

    return {
        availableSensorsMap,
        sensorsDataLoading,
        sensorDataError,
        loadingMoreSensorData,
        sensorsModalOpen,
        setSensorsModalOpen,
        settingsModalOpen,
        setSettingsModalOpen,
        dataDisplaySize,
        widgetStatic,
        setWidgetStatic,
        historyModalOpen,
        setHistoryModalOpen,
        loadSensorData,
        loadMoreSensorData,
        handleOpenSensorsModalButton,
        widgetBottomText,
        handleWidgetMouseDown
    }

}