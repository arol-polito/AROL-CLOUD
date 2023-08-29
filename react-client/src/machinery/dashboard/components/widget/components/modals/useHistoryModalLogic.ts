import {HistoryModalProps} from "./HistoryModal";
import {useToast} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import Sensor from "../../../../models/Sensor";
import SensorData from "../../../../models/SensorData";
import {
    calculateChartProps,
    calculatePolarChartSensorData,
    loadSensorData,
    setNewWidgetSensorData,
    setWidgetSensorDataLoadingAndError
} from "../../../../utils";
import axiosExceptionHandler from "../../../../../../utils/AxiosExceptionHandler";

export const useHistoryModalLogic = (props: HistoryModalProps) => {

    const {widget, widgetIndex, setDashboard, machinery} = props;
    const {availableSensors, setHistoryModalOpen} = props;

    const {sensorData, sensorsMonitoring, dataDisplaySize} = widget;

    const toast = useToast();

    const [sensorToDisplay, setSensorToDisplay] = useState<Sensor | null>(null)
    const [sensorToDisplayNotFound, setSensorToDisplayNotFound] = useState(false)
    const [sensorDataToDisplay, setSensorDataToDisplay] = useState<SensorData[]>([])

    const [loadingMoreSensorData, setLoadingMoreSensorData] = useState(false)

    // FIND SENSOR MONITORING AND FIND SENSOR DETAILS
    useEffect(() => {
        let sensorMonitoring: string | null = null
        let headMonitoring = 0
        // let mechMonitoring = 0
        for (const entry of Object.values(sensorsMonitoring.sensors)) {
            for (const headMechEntry of entry)
                if (headMechEntry.sensorNames.length > 0) {
                    sensorMonitoring = headMechEntry.sensorNames[0].name
                    headMonitoring = headMechEntry.headNumber
                    // mechMonitoring = headMechEntry.mechNumber
                    break
                }

            if (sensorMonitoring)
                break
        }

        if (!sensorMonitoring) {
            setSensorToDisplayNotFound(true)

            return
        }

        const sensorFound = availableSensors.find((val) => (val.internalName === sensorMonitoring))

        if (sensorFound == null) {
            setSensorToDisplayNotFound(true)

            return
        }

        const sensor = {...sensorFound}

        if (headMonitoring > 0) {
            sensor.internalName = `H${String(headMonitoring).padStart(2, '0')}_${sensor.internalName}`
            sensor.name = `${sensor.name} - H${String(headMonitoring).padStart(2, '0')}`
        }

        setSensorToDisplay(sensor)
        setSensorToDisplayNotFound(false)
    }, [sensorsMonitoring, availableSensors])

    // SET SENSOR DATA TO BE DISPLAYED
    useEffect(() => {
        if (sensorToDisplay == null) return

        // console.log(sensorData.leftData.map((el)=>(el.formattedTime)))

        // Display data added to the end
        const sensorDataConfig = [...sensorData.displayData, ...[...sensorData.leftData].reverse()]

        setSensorDataToDisplay(sensorDataConfig.filter((val) => {
                if (Object.entries(val.aggregationData).length > 0) return false

                return val.allData.hasOwnProperty(sensorToDisplay.internalName)
            })
        )

        setLoadingMoreSensorData(false)
    }, [sensorData, sensorToDisplay])

    function handleClose() {
        setHistoryModalOpen(false)
    }

    // LOAD MORE SENSOR DATA
    async function handleLoadMoreSensorDataClicked() {
        setLoadingMoreSensorData(true)

        const requestType = 'cache-only'
        const cacheDataRequestMaxTime = sensorDataToDisplay.slice(-1)[0].time

        try {
            setWidgetSensorDataLoadingAndError(setDashboard, widgetIndex, false, true, false);
            const sensorDataResult = await loadSensorData(widget.sensorsMonitoring, requestType, cacheDataRequestMaxTime, 0, machinery.uid, widget)
            const chartPropsResult = calculateChartProps(sensorDataResult, widget.chartProps);
            const polarChartSensorDataResult = calculatePolarChartSensorData(widget.polarChartSensorData, sensorDataResult, widget.sensorsMonitoringArray, widget.type, widget.aggregationsArray, dataDisplaySize)

            setNewWidgetSensorData(setDashboard, widgetIndex, sensorDataResult, chartPropsResult, polarChartSensorDataResult);
        } catch (e) {
            console.error(e)
            axiosExceptionHandler.handleAxiosExceptionWithToast(
                e,
                toast,
                'Sensor data could not be loaded'
            )
            setWidgetSensorDataLoadingAndError(setDashboard, widgetIndex, false, false, false);

        }

    }

    return {
        sensorToDisplay,
        sensorToDisplayNotFound,
        sensorDataToDisplay,
        loadingMoreSensorData,
        handleClose,
        handleLoadMoreSensorDataClicked
    }

}