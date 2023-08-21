import {WidgetControlPanelProps} from "./WidgetControlPanel";
import {useContext, useState} from "react";
import ToastContext from "../../../../../../utils/contexts/ToastContext";
import {
    calculateChartProps,
    calculatePolarChartSensorData,
    loadSensorData,
    setNewWidgetSensorData,
    setWidgetSensorDataLoadingAndError
} from "../../../../utils";
import toastHelper from "../../../../../../utils/ToastHelper";
import axiosExceptionHandler from "../../../../../../utils/AxiosExceptionHandler";

export const useWidgetControlPanelLogic = (props: WidgetControlPanelProps) => {
    const {setDashboard, widget, widgetIndex, machinery} = props;
    const {chartTooltipActive, setChartTooltip} = props;

    const {name, dataDisplaySize} = widget;

    const toast = useContext(ToastContext)

    const [widgetName, setWidgetName] = useState(name)

    // RE-LOAD SENSOR DATA - as first time
    async function refreshSensorData() {

        try {
            setWidgetSensorDataLoadingAndError(setDashboard, widgetIndex, true, false, false);
            const sensorDataResult = await loadSensorData(widget.sensorsMonitoring, 'first-time', 0, 0, machinery.uid, widget)
            const chartPropsResult = calculateChartProps(sensorDataResult, widget.chartProps);
            const polarChartSensorDataResult = calculatePolarChartSensorData(widget.polarChartSensorData, sensorDataResult, widget.sensorsMonitoringArray, widget.type, widget.aggregationsArray, dataDisplaySize)

            toastHelper.makeToast(
                toast,
                `${widget.name} sensor data refreshed`,
                'info'
            )

            setNewWidgetSensorData(setDashboard, widgetIndex, sensorDataResult, chartPropsResult, polarChartSensorDataResult);
        } catch (e) {
            console.error(e)
            axiosExceptionHandler.handleAxiosExceptionWithToast(
                e,
                toast,
                'Sensor data could not be loaded'
            )
            setWidgetSensorDataLoadingAndError(setDashboard, widgetIndex, false, false, true);

        }
    }

    function handleWidgetControlPanelMouseDown(e) {
        e.stopPropagation()

        if (chartTooltipActive)
            setChartTooltip((val) => {
                val.active = false

                return {...val}
            })
    }

    return {
        widgetName,
        setWidgetName,
        refreshSensorData,
        handleWidgetControlPanelMouseDown
    }
}