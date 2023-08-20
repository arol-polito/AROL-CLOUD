import {useEffect, useState} from "react";
import {SingleValueDataDisplayProps} from "./SingleValueDataDisplay";

export const useSingleValueDataDisplayLogic = (props: SingleValueDataDisplayProps) => {
    const {sensorData} = props;

    const [sensorDataToDisplay, setSensorDataToDisplay] = useState<{
        value: string
        maxValue: number
        valueDiff: string
        aggregateNote: string
        formattedTime: string
    } | undefined>(undefined)

    // HANDLE DATA TO DISPLAY
    useEffect(() => {
        const displayData = sensorData.displayData
        const leftData = sensorData.leftData

        const newSensorData = {
            value: '',
            maxValue: 0,
            valueDiff: '',
            aggregateNote: '',
            formattedTime: ''
        }

        if (displayData.length > 0) {
            const displayDataEntry = displayData[0]

            // Display AGGREGATE
            if (Object.entries(displayDataEntry.aggregationData).length > 0 &&
                displayDataEntry.aggregationData.aggregation.value
            ) {
                // VALUE DIFF with previous aggregation
                let valueDiff = ''
                const filteredLeftData = leftData.filter((val) => {
                    if (Object.entries(val.aggregationData).length === 0 || !val.aggregationData.hasOwnProperty('aggregation')) return false

                    return val.aggregationData.aggregation.value
                })
                if (filteredLeftData.length > 0) {
                    const previousAggregation = leftData.slice(-1)[0]
                    if (previousAggregation.aggregationData.aggregation.value)
                        valueDiff = (displayDataEntry.aggregationData.aggregation.value - previousAggregation.aggregationData.aggregation.value).toFixed(2)
                }

                newSensorData.aggregateNote = displayDataEntry.aggregationData.aggregation.note
                newSensorData.formattedTime = ''
                newSensorData.value = displayDataEntry.aggregationData.aggregation.value.toFixed(2)
                newSensorData.valueDiff = valueDiff
                newSensorData.maxValue = displayDataEntry.aggregationData.aggregation.value * 1.5
            }
            // Display MOST RECENT SAMPLE
            else {
                const objectKeys = Object.keys(displayDataEntry.allData)
                if (objectKeys.length > 0 && displayDataEntry.allData[objectKeys[0]] !== null) {

                    // VALUE DIFF with previous sample
                    let valueDiff = ''
                    const filteredLeftData = leftData.filter((val) => {
                        if (Object.entries(val.aggregationData).length > 0) return false
                        const sampleKeys = Object.keys(val.allData)
                        if (sampleKeys.length === 0) return false

                        return val.allData[sampleKeys[0]]
                    })
                    if (filteredLeftData.length > 0) {
                        const previousSample = leftData.slice(-1)[0]
                        const previousSampleObjectKeys = Object.keys(previousSample.allData)
                        if (previousSampleObjectKeys.length > 0 && previousSample.allData[previousSampleObjectKeys[0]])
                            valueDiff = ((displayDataEntry.allData[objectKeys[0]] || 0) - (previousSample.allData[previousSampleObjectKeys[0]] || 0)).toFixed(2)
                    }

                    newSensorData.aggregateNote = ''
                    newSensorData.formattedTime = sensorData.displayData[0].formattedTime
                    newSensorData.value = (displayDataEntry.allData[objectKeys[0]] || 0).toFixed(2)
                    newSensorData.valueDiff = valueDiff
                    newSensorData.maxValue = (displayDataEntry.allData[objectKeys[0]] || 0) * 1.5
                } else {
                    newSensorData.aggregateNote = ''
                    newSensorData.formattedTime = displayDataEntry.formattedTime
                    newSensorData.value = 'N/A'
                    newSensorData.valueDiff = ''
                    newSensorData.maxValue = 100
                }
            }
        }
        // FALLBACK VALUES - if no entries in display data show last historical value
        else if (sensorData.leftData.length > 0) {
            const leftDataEntry = displayData.slice(-1)[0]

            if (Object.entries(leftDataEntry.aggregationData).length > 0 &&
                leftDataEntry.aggregationData.aggregation.value)
                if (Object.entries(leftDataEntry.aggregationData).length > 0 &&
                    leftDataEntry.aggregationData.aggregation.value) {
                    newSensorData.aggregateNote = leftDataEntry.aggregationData.aggregation.note
                    newSensorData.formattedTime = ''
                    newSensorData.value = leftDataEntry.aggregationData.aggregation.value.toFixed(2)
                    newSensorData.valueDiff = ''
                    newSensorData.maxValue = leftDataEntry.aggregationData.aggregation.value * 1.5
                } else {
                    setSensorDataToDisplay(undefined)

                    return
                }

            // FALLBACK VALUE - if no value in display data show last history data
            else {
                const objectKeys = Object.keys(leftDataEntry.allData)

                if (objectKeys.length > 0 && leftDataEntry.allData[objectKeys[0]] !== null) {
                    newSensorData.aggregateNote = ''
                    newSensorData.formattedTime = leftDataEntry.formattedTime
                    newSensorData.value = (leftDataEntry.allData[objectKeys[0]] || 0).toFixed(2)
                    newSensorData.valueDiff = ''
                    newSensorData.maxValue = (leftDataEntry.allData[objectKeys[0]] || 0) * 1.5
                } else {
                    newSensorData.aggregateNote = ''
                    newSensorData.formattedTime = leftDataEntry.formattedTime
                    newSensorData.value = 'N/A'
                    newSensorData.valueDiff = ''
                    newSensorData.maxValue = 100
                }
            }
        } else {
            setSensorDataToDisplay(undefined)

            return
        }

        setSensorDataToDisplay((val) => {
            if (val == null)
                return newSensorData

            val.aggregateNote = newSensorData.aggregateNote
            val.formattedTime = newSensorData.formattedTime
            val.value = newSensorData.value
            val.valueDiff = newSensorData.valueDiff
            if (val.maxValue < parseFloat(newSensorData.value))
                val.maxValue = newSensorData.maxValue

            return {...val}
        })
    }, [sensorData])

    // SENSOR DATA TIME OF SAMPLING
    const getSensorDataTimeOfSampling = () => {
        if (sensorDataToDisplay == null)
            return 'Time of sampling: N/A'

        if (!sensorDataToDisplay.aggregateNote)
            if (sensorDataToDisplay.formattedTime)
                return `Time of sampling: ${sensorDataToDisplay.formattedTime}`
            else
                return 'Time of sampling: N/A'

        return sensorDataToDisplay.aggregateNote
    }

    return {
        sensorDataToDisplay,
        getSensorDataTimeOfSampling
    }

}