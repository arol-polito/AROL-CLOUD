// CONVERT sensors monitoring & aggregation from map to array for showing them on chart
import Aggregation from "./interfaces/Aggregation";
import Sensor from "./models/Sensor";
import SensorMonitoring from "./interfaces/SensorMonitoring";
import SensorDataFilters from "./interfaces/SensorDataFilters";
import machineryService from "../../services/MachineryService";
import Machinery from "../../machineries-map/components/Machinery";
import SlidingSensorData from "./interfaces/SlidingSensorData";
import GridWidget from "./interfaces/GridWidget";
import {ChartProps} from "./components/widget/useWidgetLogic";
import React from "react";
import Dashboard from "./models/Dashboard";
import {Layout} from "react-grid-layout";

export const processSensorsMonitoring = (sensorsMonitoringConfig: SensorDataFilters, availableSensors: Sensor[]) => {
    const arrayOfSensorsMonitoring: SensorMonitoring[] = []
    const objectOfSensorsMonitoring: Record<string, SensorMonitoring> = {}

    for (const [, value] of Object.entries(sensorsMonitoringConfig.sensors))
        value.forEach((entry) => {
            entry.sensorNames.forEach((sensorName) => {
                if (entry.headNumber === 0) {
                    const sensorFound = availableSensors.find((el) => (el.internalName === sensorName.name))
                    if (sensorFound != null) {
                        const sensorMonitoring = {
                            name: sensorFound.name,
                            internalName: sensorFound.internalName,
                            unit: sensorFound.unit,
                            color: sensorName.color
                        }
                        arrayOfSensorsMonitoring.push(sensorMonitoring)
                        objectOfSensorsMonitoring[sensorFound.internalName] = sensorMonitoring
                    }
                } else {
                    const sensorFound = availableSensors.find((el) => (el.internalName === sensorName.name))
                    if (sensorFound != null) {
                        const sensorInternalName = `H${String(entry.headNumber).padStart(2, '0')}_${sensorName.name}`
                        const sensorMonitoring = {
                            name: `${sensorFound.name} - Head ${entry.headNumber}`,
                            internalName: sensorInternalName,
                            unit: sensorFound.unit,
                            color: sensorName.color
                        }
                        arrayOfSensorsMonitoring.push(sensorMonitoring)
                        objectOfSensorsMonitoring[sensorInternalName] = sensorMonitoring
                    }
                }
            })
        })

    const arrayOfAggregations: Aggregation[] = []
    sensorsMonitoringConfig.aggregations.forEach((aggregation) => {
        if (aggregation.name !== 'none' && arrayOfSensorsMonitoring.length > 0)
            arrayOfAggregations.push({
                ...aggregation,
                unit: arrayOfSensorsMonitoring[0].unit,
                internalName: aggregation.name
            })
    })

    return {
        sensorsMonitoringArray: arrayOfSensorsMonitoring,
        sensorsMonitoringObject: objectOfSensorsMonitoring,
        aggregationsArray: arrayOfAggregations,
        numSensorsMonitoring: arrayOfSensorsMonitoring.length,
        numAggregationsMonitoring: arrayOfAggregations.length
    }
}

export const loadSensorData = async (
    sensorsMonitoringConfig: SensorDataFilters,
    requestType: string,
    cacheDataRequestMaxTime: number,
    newDataRequestMinTime: number,
    machinery: Machinery,
    widget: GridWidget,
) => {

    const currentSensorData = widget.sensorData;

    let hasSensorsMonitoring = false
    for (const value of Object.values(sensorsMonitoringConfig.sensors))
        for (const headEntry of value)
            if (headEntry.sensorNames.length) {
                hasSensorsMonitoring = true;
                break;
            }

    if (!hasSensorsMonitoring) return {
        leftData: [],
        displayData: [],
        rightData: [],
        numSensorData: 0,
        minDisplayTime: 0,
        endOfData: true,
        hasNewData: false,
        numSamplesDisplaying: 0
    };

    // if (sensorsMonitoringConfig.requestType === 'first-time')
    // setSensorsDataLoading(true)

    const result = await machineryService.getMachinerySensorsData(machinery.uid, {
        ...sensorsMonitoringConfig,
        requestType,
        cacheDataRequestMaxTime,
        newDataRequestMinTime,
    })

    if (requestType === 'first-time' && result.displaySensorData.length > 0) {
        const cachedData = await machineryService.getMachinerySensorsData(machinery.uid, {
            ...sensorsMonitoringConfig,
            requestType: 'cache-only',
            cacheDataRequestMaxTime: result.displaySensorData[0].time
        })

        result.cachedSensorData = cachedData.cachedSensorData
        result.endOfData = cachedData.endOfData
    }

    currentSensorData.endOfData = result.endOfData
    switch (result.requestType) {
        case 'first-time': {
            currentSensorData.displayData = result.displaySensorData
            currentSensorData.leftData = result.cachedSensorData
            currentSensorData.rightData = []
            currentSensorData.numSensorData = result.numSensorData
            currentSensorData.minDisplayTime = result.minDisplayTime
            currentSensorData.numSamplesDisplaying = currentSensorData.displayData.filter((el) => (!el.machineryOff)).length
            currentSensorData.hasNewData = false
            break
        }
        case 'cache-only': {
            currentSensorData.leftData = [...result.cachedSensorData, ...currentSensorData.leftData]
            break
        }
        case 'new-only': {
            if (widget.category === 'single-value') {
                if (result.newSensorData.length > 0) {
                    currentSensorData.leftData = [...currentSensorData.leftData, ...currentSensorData.displayData, ...result.cachedSensorData]
                    currentSensorData.displayData = result.newSensorData
                }
            } else if (currentSensorData.rightData.length === 0) {
                currentSensorData.numSamplesDisplaying -= currentSensorData.displayData.slice(0, result.newSensorData.length).filter((el) => (!el.machineryOff)).length
                currentSensorData.numSamplesDisplaying += result.newSensorData.filter((el) => (!el.machineryOff)).length

                currentSensorData.leftData = [...currentSensorData.leftData, ...currentSensorData.displayData.slice(0, result.newSensorData.length)]
                currentSensorData.displayData = [...currentSensorData.displayData.slice(result.newSensorData.length), ...result.newSensorData]
            } else {
                currentSensorData.rightData = [...result.newSensorData.reverse(), ...currentSensorData.rightData]
                if (result.newSensorData.length > 0)
                    currentSensorData.hasNewData = true
            }

            break
        }
        default: {
            console.error('Unknown sensor data request type')
            break
        }
    }

    return currentSensorData;

// const interval = setInterval(() => {
//     setSensorsMonitoring((val) => {
//         val.requestType = 'new-only'
//
//         val.newDataRequestMinTime = lastValueTimestamp
//
//         return {...val}
//     })
// }, helperFunctions.randomIntFromInterval(20000, 40000))
//
// return () => {
//     clearInterval(interval)
// }
}

export const calculateChartProps = (sensorDataConfig: SlidingSensorData, currentChartProps: ChartProps) => {

    const allSensorData = [...sensorDataConfig.leftData, ...sensorDataConfig.displayData, ...sensorDataConfig.rightData]

    const min = Math.min(...allSensorData.filter((el) => (!el.machineryOff)).map((el) => (
        Math.min(...Object.values(el.allData).filter(Number) as number[])
    )))

    const max = Math.max(...allSensorData.filter((el) => (!el.machineryOff)).map((el) => (
        Math.max(...Object.values(el.allData).filter(Number) as number[])
    )))

    let yAxisChangedFlag = false

    const range = max - min;

    if (currentChartProps.yAxisDataMin === Number.MIN_SAFE_INTEGER || min < currentChartProps.yAxisDataMin) {
        currentChartProps.yAxisDataMin = min - range / 5
        yAxisChangedFlag = true
    }

    if (currentChartProps.yAxisDataMax === Number.MAX_SAFE_INTEGER || max > currentChartProps.yAxisDataMax) {
        currentChartProps.yAxisDataMax = max + range / 5
        currentChartProps.yAxisProps.width = Math.max(
            ~~(currentChartProps.yAxisDataMax.toFixed(1).toString().length * 7),
            ~~(currentChartProps.yAxisDataMin.toFixed(1).toString().length * 7)
        )
        yAxisChangedFlag = true
    }

    if (yAxisChangedFlag) return {...currentChartProps}

    return currentChartProps
}

export const setNewWidgetSensorData = (
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>,
    widgetIndex: number,
    sensorData: SlidingSensorData,
    chartProps: ChartProps
) => {
    setDashboard((val) => {
        if (val.widgets[widgetIndex]) {
            val.widgets[widgetIndex] = {
                ...val.widgets[widgetIndex],
                sensorData: {...sensorData},
                chartProps: {...chartProps},
                numChange: val.widgets[widgetIndex].numChange + 1
            }

            return {...val}
        }

        return val;
    })
}

export const setNewWidgetSensorsMonitoring = (
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>,
    widgetIndex: number,
    sensorsMonitoring: SensorDataFilters,
    availableSensors: Sensor[]
) => {
    setDashboard((val) => {
        if (val.widgets[widgetIndex]) {
            val.widgets[widgetIndex] = {
                ...val.widgets[widgetIndex],
                sensorsMonitoring,
                ...processSensorsMonitoring(sensorsMonitoring, availableSensors),
                numChange: val.widgets[widgetIndex].numChange + 1
            }

            return {...val}
        }

        return val;
    })
}

export const setNewDashboardLayout = (
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>,
    newLayout: Layout[]
) => {
    setDashboard((val) => {
        val.layout = newLayout;

        return {...val}
    })
}