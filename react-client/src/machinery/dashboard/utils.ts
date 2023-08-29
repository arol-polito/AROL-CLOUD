// CONVERT sensors monitoring & aggregation from map to array for showing them on chart
import Aggregation from "./interfaces/Aggregation";
import Sensor from "./models/Sensor";
import SensorMonitoring from "./interfaces/SensorMonitoring";
import SensorDataFilters from "./interfaces/SensorDataFilters";
import machineryService from "../../services/MachineryService";
import SlidingSensorData from "./interfaces/SlidingSensorData";
import GridWidget from "./interfaces/GridWidget";
import {ChartProps} from "./components/widget/useWidgetLogic";
import React from "react";
import Dashboard from "./models/Dashboard";
import {PolarChartSensorData} from "./interfaces/PolarChartSensorData";
import {PolarChartSensorDataBucket} from "./interfaces/PolarChartSensorDataBucket";
import {DataDisplaySize} from "./interfaces/DataDisplaySize";

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
    machineryUID: string,
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

    const result = await machineryService.getMachinerySensorsData(machineryUID, {
        ...sensorsMonitoringConfig,
        requestType,
        cacheDataRequestMaxTime,
        newDataRequestMinTime,
    })

    if (requestType === 'first-time' && result.displaySensorData.length > 0) {
        const cachedData = await machineryService.getMachinerySensorsData(machineryUID, {
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

export const calculatePolarChartSensorData = (
    polarChartSensorData: PolarChartSensorData,
    sensorData: SlidingSensorData,
    sensorsMonitoringArray,
    widgetType: string,
    aggregationsArray,
    dataDisplaySize) => {

    if (!['pie-chart', 'scatter-chart'].includes(widgetType))
        return {
            allData: {},
            aggregationData: {},
            sectionSize: 0,
            startingFromTime: ''
        }

    const bucketSize = 1
    polarChartSensorData = {
        allData: {},
        aggregationData: {},
        sectionSize: polarChartSensorData.sectionSize,
        startingFromTime: polarChartSensorData.startingFromTime
    }

    const allSensorData = [...sensorData.leftData, ...sensorData.displayData, ...sensorData.rightData]

    polarChartSensorData.startingFromTime = allSensorData.length > 0 ? allSensorData[0].formattedTime : ''

    sensorsMonitoringArray.forEach((sensorMonitoring) => {
        const allDataMap = new Map<string, number>()
        allSensorData
            .forEach((el) => {
                if (!el.activeData.hasOwnProperty(sensorMonitoring.internalName) || el.activeData[sensorMonitoring.internalName] === null) return
                const key = (~~((el.activeData[sensorMonitoring.internalName] || 0) / bucketSize)).toString()
                if (allDataMap.has(key)) {
                    const occurrences = allDataMap.get(key) || 0
                    allDataMap.set(key, occurrences + 1)
                } else
                    allDataMap.set(key, 1)
            })

        const bucketArray: PolarChartSensorDataBucket[] = []
        for (const [key, value] of Array.from(allDataMap.entries()))
            bucketArray.push({
                bucketStart: (~~key) * bucketSize,
                bucketEnd: ((~~key) + 1) * bucketSize,
                sensorUnit: sensorMonitoring.unit,
                sensorName: sensorMonitoring.name,
                occurrences: value
            })

        polarChartSensorData.allData[sensorMonitoring.internalName] = bucketArray
    })
    aggregationsArray.forEach((aggregation) => {
        const allDataMap = new Map<string, number>()
        allSensorData
            .forEach((el) => {
                if (!el.aggregationData.hasOwnProperty(aggregation.name) || el.aggregationData[aggregation.name].value === null) return
                const key = (~~(el.aggregationData[aggregation.name].value / bucketSize)).toString()
                if (allDataMap.has(key)) {
                    const occurrences = allDataMap.get(key) || 0
                    allDataMap.set(key, occurrences + 1)
                } else
                    allDataMap.set(key, 1)
            })

        const bucketArray: PolarChartSensorDataBucket[] = []
        for (const [key, value] of Array.from(allDataMap.entries()))
            bucketArray.push({
                bucketStart: (~~key) * bucketSize,
                bucketEnd: ((~~key) + 1) * bucketSize,
                sensorUnit: aggregation.unit,
                sensorName: aggregation.name,
                occurrences: value
            })

        polarChartSensorData.aggregationData[aggregation.name] = bucketArray
    })

    if (widgetType !== 'pie-chart') return polarChartSensorData

    const numSectionsNeeded = sensorsMonitoringArray.length + aggregationsArray.length
    let shortestDimension = Math.min(dataDisplaySize.width, dataDisplaySize.height)
    if (dataDisplaySize.height - shortestDimension < 40)
        shortestDimension = dataDisplaySize.height - 40

    const resultingSectionSize = ~~(shortestDimension / numSectionsNeeded)
    if (resultingSectionSize < 30)
        polarChartSensorData.sectionSize = 30
    else
        polarChartSensorData.sectionSize = resultingSectionSize

    return polarChartSensorData;
}

export const setNewWidgetSensorData = (
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>,
    widgetIndex: number,
    sensorData: SlidingSensorData,
    chartProps: ChartProps,
    polarChartSensorData: PolarChartSensorData
) => {
    setDashboard((val) => {
        if (val.widgets[widgetIndex]) {
            val.widgets[widgetIndex] = {
                ...val.widgets[widgetIndex],
                sensorData: {...sensorData},
                chartProps: {...chartProps},
                polarChartSensorData: {...polarChartSensorData},
                sensorDataLoading: false,
                sensorDataCacheLoading: false,
                sensorDataError: false,
                numChange: val.widgets[widgetIndex].numChange + 1,
                chartNumChange: val.widgets[widgetIndex].chartNumChange + 1
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
                numChange: val.widgets[widgetIndex].numChange + 1,
                chartNumChange: val.widgets[widgetIndex].chartNumChange + 1,
            }

            return {...val}
        }

        return val;
    })
}

export const setWidgetSensorDataLoadingAndError = (
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>,
    widgetIndex: number,
    isLoading: boolean,
    isLoadingCache: boolean,
    hasError: boolean
) => {
    setDashboard((val) => {
        if (val.widgets[widgetIndex]) {
            val.widgets[widgetIndex] = {
                ...val.widgets[widgetIndex],
                sensorDataLoading: isLoading,
                sensorDataError: hasError,
                numChange: val.widgets[widgetIndex].numChange + 1,
            }

            return {...val}
        }

        return val
    })
}

export const setWidgetDataDisplaySize = (
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>,
    widgetIndex: number,
    dataDisplaySize: DataDisplaySize
) => {
    setDashboard((val) => {
        if (val.widgets[widgetIndex]) {
            val.widgets[widgetIndex] = {
                ...val.widgets[widgetIndex],
                dataDisplaySize: {...dataDisplaySize},
                numChange: val.widgets[widgetIndex].numChange + 1,
                chartNumChange: val.widgets[widgetIndex].chartNumChange + 1,
            }

            return {...val}
        }

        return val
    })
}