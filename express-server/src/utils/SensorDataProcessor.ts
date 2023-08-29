import SensorDataSample from "../interfaces/SensorDataSample";
import Sensor from "../entities/Sensor";
import constants from "./Constants";
import SensorData from "../entities/SensorData";
import dayjs from "dayjs";
import SensorDataFilters from "../interfaces/SensorDataFilters";

//Bucket (group) sensor data samples by corresponding sensor name
function groupBySensorName(sensorData: SensorDataSample[], numSamplesRequired: number, machinerySensors: Sensor[]) {
    const sensorDataMap: Map<string, { value: number, time: number }[]> = new Map()
    const sensorInfoMap: Map<string, Sensor> = new Map()
    let preliminaryCheckForEndOfData: "true" | "indefinite" | "false" = "true"
    let minSampleTime = Number.MAX_SAFE_INTEGER

    sensorData
        .forEach((entry: { name: string, value: number, time: number }) => {
            const sensorDataMapEntry = sensorDataMap.get(entry.name)
            if (sensorDataMapEntry)
                //Add sensor data to map only if limit of samples is not exceeded
                sensorDataMapEntry.push({value: entry.value, time: entry.time})

            else {
                sensorDataMap.set(entry.name, [{value: entry.value, time: entry.time}])

                const sensor = machinerySensors!.find((el) => (entry.name.endsWith(el.internalName)))
                if (!sensor)
                    throw `Could not find sensor info for ${entry.name}`


                sensorInfoMap.set(entry.name, sensor)
            }
        })

    //Check for end of data
    if (numSamplesRequired > 0)
        for (const [sensorName, dataSamples] of sensorDataMap.entries()) {
            if (dataSamples.length >= numSamplesRequired) {
                if (dataSamples.length > numSamplesRequired)
                    preliminaryCheckForEndOfData = "false"
                else if (preliminaryCheckForEndOfData !== "false")
                    preliminaryCheckForEndOfData = "indefinite"

                sensorDataMap.set(sensorName, dataSamples.slice(0, numSamplesRequired))
            }
        }
    else
        preliminaryCheckForEndOfData = "indefinite"


    for (const [sensorName, dataSamples] of sensorDataMap.entries()) {
        const ascSortedDataSamples = dataSamples.sort((a, b) => (a.time - b.time))
        if (ascSortedDataSamples.length > 0 && ascSortedDataSamples[0].time < minSampleTime)
            minSampleTime = ascSortedDataSamples[0].time

        // console.log(sensorDataMap.get(sensorName)!!.map((it)=>(it.time)))
        sensorDataMap.set(sensorName, ascSortedDataSamples)
        // console.log(sensorDataMap.get(sensorName)!!.map((it)=>(it.time)))
    }

    return {
        sensorDataMap,
        sensorInfoMap,
        preliminaryCheckForEndOfData,
        minSampleTime
    }
}

function binSamples(sensorDataMap: Map<string, { value: number, time: number }[]>, sensorInfoMap: Map<string, Sensor>) {
    const binnedSensorDataMap = new Map<string, { value: number, time: number }[]>()

    sensorDataMap.forEach((value, key) => {

        const clusteredValue: { value: number, time: number }[] = []

        let i, j

        //HORIZONTAL MERGING of each sensor
        for (i = 0; i < value.length; i++) {

            const startIndex = i
            let endIndex = i

            //Find last index that is included in the merging interval
            for (j = i + 1; j < value.length; j++) {

                const timeDiff = value[j].time - value[i].time
                if (timeDiff < constants.HORIZONTAL_BUCKETING_MILLISECONDS)
                    endIndex = j
                else
                    break

            }

            //No merging if interval contains only 1 sample
            if (startIndex === endIndex)
                clusteredValue.push({
                    time: value[i].time,
                    value: value[i].value
                })

                //Merging done only if interval contains at least 2 samples
            //Merging done by the corresponding merging strategy (min, max, sum, avg, majority...)
            else {
                const bucketingType = sensorInfoMap.get(key)!.bucketingType

                switch (bucketingType) {
                    case "average": {
                        let sum = 0
                        let sumTime = 0
                        let numValues = 0

                        for (let k = startIndex; k <= endIndex; k++)
                            if (value[k].value !== null) {
                                sum += value[k].value
                                sumTime += value[k].time
                                numValues++
                            }


                        if (numValues > 0)
                            clusteredValue.push({
                                time: Math.trunc(sumTime / numValues),
                                value: sum / numValues
                            })

                        break
                    }
                    case "min": {
                        clusteredValue.push({
                            time: value[startIndex].time,
                            value: value[startIndex].value
                        })
                        break
                    }
                    case "max": {
                        clusteredValue.push({
                            time: value[endIndex].time,
                            value: value[endIndex].value
                        })
                        break
                    }
                    case "majority": {

                        const modeMap: Map<number, { time: number, occurrences: number }> = new Map()
                        let maxEl = value[startIndex].value, maxCount = 1

                        for (let k = startIndex; k <= endIndex; k++) {
                            const val = value[k].value
                            const time = value[k].time

                            if (!modeMap.get(val))
                                modeMap.set(val, {
                                    time: time,
                                    occurrences: 1
                                });
                            else {
                                const currEntry = modeMap.get(val)!
                                currEntry.occurrences++
                                modeMap.set(val, currEntry)
                            }

                            if (modeMap.get(val)!.occurrences > maxCount) {
                                maxEl = val;
                                maxCount = modeMap.get(val)!.occurrences
                            }
                        }

                        clusteredValue.push({
                            time: Math.ceil(modeMap.get(maxEl)!.time),
                            value: maxEl
                        })

                        break
                    }
                    default: {
                        throw `Unknown sensor bucketing type ${bucketingType}`
                    }
                }

            }

            //Restart scan from the first item outside the interval
            i = j - 1

        }

        binnedSensorDataMap.set(key, clusteredValue)

    })

    // console.log(binnedSensorDataMap)

    return binnedSensorDataMap
}

function bucketVerticallyAndAggregateMultiValue(sensorDataArray: [string, {
    value: number,
    time: number
}[]][], sensorFilters: SensorDataFilters) {

    const sensorData: SensorData[] = []
    const sensorDataCursors = new Array(sensorDataArray.length).fill(0)
    let stop = false
    while (!stop) {

        const currentEntries: { value: number, time: number }[] = []
        sensorDataCursors.forEach((cursorValue, index) => {
            if (cursorValue < sensorDataArray[index][1].length)
                currentEntries.push(sensorDataArray[index][1][cursorValue])

        })

        const minTime = Math.min(...currentEntries.map((el) => (el.time)))

        const sensorDataObject: SensorData = {
            active: false,
            activeData: {},
            allData: {},
            fillerData: {},
            aggregationData: {},
            formattedTime: "",
            machineryOff: false,
            machineryOffFrom: 0,
            machineryOffTo: 0,
            time: 0,
            minTime: 0,
            maxTime: 0
        }
        let avgTime = 0
        let maxTime = 0
        let numSamplesInBucket = 0
        sensorDataCursors.forEach((cursorValue, index) => {
            if (cursorValue < sensorDataArray[index][1].length &&
                (sensorDataArray[index][1][cursorValue].time - minTime <= constants.VERTICAL_BUCKETING_MILLISECONDS)) {

                sensorDataObject.activeData[sensorDataArray[index][0]] = sensorDataArray[index][1][cursorValue].value
                sensorDataObject.allData[sensorDataArray[index][0]] = sensorDataArray[index][1][cursorValue].value

                avgTime += sensorDataArray[index][1][cursorValue].time
                numSamplesInBucket++

                if (sensorDataArray[index][1][cursorValue].time > maxTime)
                    maxTime = sensorDataArray[index][1][cursorValue].time


                sensorDataCursors[index]++
            } else if (sensorData.length)

                if (sensorData[sensorData.length - 1].activeData.hasOwnProperty(sensorDataArray[index][0])) {
                    sensorDataObject.fillerData[sensorDataArray[index][0]] = sensorData[sensorData.length - 1].activeData[sensorDataArray[index][0]]
                    sensorDataObject.allData[sensorDataArray[index][0]] = sensorData[sensorData.length - 1].activeData[sensorDataArray[index][0]]
                } else {
                    sensorDataObject.fillerData[sensorDataArray[index][0]] = sensorData[sensorData.length - 1].fillerData[sensorDataArray[index][0]]
                    sensorDataObject.allData[sensorDataArray[index][0]] = sensorData[sensorData.length - 1].fillerData[sensorDataArray[index][0]]
                }

            else {
                sensorDataObject.fillerData[sensorDataArray[index][0]] = null
                sensorDataObject.allData[sensorDataArray[index][0]] = null
            }


            // console.log(sensorDataObject)
        })

        //Flag for removing filler values (when machinery is turned off or last sensorData)
        let removeTrailingFillerValues = false
        let fillersToRemove: string[] = []

        if (numSamplesInBucket > 0) {

            const time = avgTime / numSamplesInBucket

            //AGGREGATIONS FOR MULTI-VALUE widgets)
            if (sensorFilters.widgetCategory === constants.WIDGETTYPE_MULTI)
                sensorFilters.aggregations.forEach((aggregation) => {
                    let aggregateValue = 0
                    let aggregateNote = ""
                    let pushAggregateValue = true
                    switch (aggregation.name) {
                        case "Minimum": {
                            aggregateValue = Math.min(
                                ...Object.values(sensorDataObject.allData)
                                    .map((val) => (val !== null ? val : Number.MAX_SAFE_INTEGER))
                            )
                            const sensorDataEntry = Object.entries(sensorDataObject.activeData).find(([, val]) => (val === aggregateValue))
                            if (sensorDataEntry)
                                aggregateNote = sensorDataEntry[0]

                            break
                        }
                        case "Maximum": {
                            aggregateValue = Math.max(
                                ...Object.values(sensorDataObject.allData)
                                    .map((val) => (val !== null ? val : Number.MIN_SAFE_INTEGER))
                            )
                            const sensorDataEntry = Object.entries(sensorDataObject.activeData).find(([, val]) => (val === aggregateValue))
                            if (sensorDataEntry)
                                aggregateNote = sensorDataEntry[0]

                            break
                        }
                        case "Average": {
                            let sum = 0
                            let numValues = 0
                            Object.values(sensorDataObject.allData).forEach((val) => {
                                if (val !== null) {
                                    sum += val
                                    numValues++
                                }
                            })

                            if (numValues > 0) {
                                aggregateValue = sum / numValues
                                aggregateNote = `${Object.values(sensorDataObject.activeData).length} sensors`
                            }
                            break
                        }
                        default: {
                            pushAggregateValue = false
                            break
                        }
                    }

                    if (pushAggregateValue)
                        sensorDataObject.aggregationData[aggregation.name] = {
                            value: Number(aggregateValue.toFixed(1)),
                            note: aggregateNote
                        }


                })


            //MACHINERY OFF PADDING - if sensor data gap is 1+ hours insert padding entries
            //1 padding entries for single-value widgets
            //3 padding entries for multi-value widgets
            if (sensorData.length > 0) {

                const previousSampleTime = sensorData[sensorData.length - 1].time

                const timeDiff = time - previousSampleTime

                if (timeDiff > 600000) {
                    removeTrailingFillerValues = true
                    fillersToRemove = Object.keys(sensorData[sensorData.length - 1].fillerData)

                    sensorData.push(...generateMachineryOffEntries(sensorFilters, time, timeDiff, previousSampleTime))
                }

            }

            //Add sensor data sample to final sensor data array
            sensorDataObject.active = true
            sensorDataObject.machineryOff = false
            sensorDataObject.machineryOffFrom = 0
            sensorDataObject.machineryOffTo = 0
            sensorDataObject.time = time
            sensorDataObject.minTime = minTime
            sensorDataObject.maxTime = maxTime
            sensorDataObject.formattedTime = dayjs(time).format("D MMM YYYY HH:mm")
            sensorData.push(sensorDataObject)

        } else {
            stop = true
            if (sensorData.length > 0) {
                removeTrailingFillerValues = true
                fillersToRemove = Object.keys(sensorData[sensorData.length - 1].fillerData)
            }
        }

        //Trim out filler values when machine is turned off or last sensorData value
        if (removeTrailingFillerValues) {
            let i: number
            if (stop)
                //Start from last value
                i = sensorData.length - 1
            else
                //Account for 5 "machineryOff" fillers inserted
                i = sensorData.length - 7


            for (i; i >= 0; i--) {

                //Remove filler values only since machinery was turned on
                if (sensorData[i].machineryOff)
                    break


                const fillersStopRemoval: string[] = []
                fillersToRemove.forEach((el) => {
                    if (sensorData[i].activeData.hasOwnProperty(el))
                        fillersStopRemoval.push(el)

                })

                fillersToRemove = fillersToRemove.filter((el) => (!fillersStopRemoval.includes(el)))

                // console.log(fillersToRemove.length)

                if (fillersToRemove.length === 0)
                    break


                fillersToRemove.forEach((el) => {
                    if (sensorData[i].fillerData.hasOwnProperty(el))
                        sensorData[i].fillerData[el] = null

                    sensorData[i].allData[el] = null
                })

            }
        }
    }


    return sensorData
}

function aggregateSingleValue(sensorData: SensorData[], sensorFilters: SensorDataFilters, displayMinTime: number) {
    if (sensorData.length > 0 && sensorFilters.widgetCategory === constants.WIDGETTYPE_SINGLE && sensorFilters.aggregations.length > 0) {

        const aggregation = sensorFilters.aggregations[0]
        let aggregateValue: SensorData | null = null

        let numSamplesToSlice
        if (sensorFilters.dataRange.unit === constants.DATARANGE_SAMPLE)
            numSamplesToSlice = sensorFilters.dataRange.amount + sensorData.slice(-sensorFilters.dataRange.amount).filter((el) => (el.machineryOff)).length

        else
            numSamplesToSlice = sensorData.filter((el) => (el.time >= displayMinTime)).length


        switch (aggregation.name) {
            case "Minimum": {
                let min = Number.MAX_SAFE_INTEGER
                let minEntry: SensorData
                sensorData.slice(-numSamplesToSlice).filter((val) => (!val.machineryOff)).forEach((val) => {

                    const objectKeys = Object.keys(val.allData)

                    if (objectKeys.length > 0 &&
                        val.allData[objectKeys[0]] &&
                        val.allData[objectKeys[0]]! < min
                    ) {
                        min = val.allData[objectKeys[0]]!
                        minEntry = val
                    }

                })

                if (min < Number.MAX_SAFE_INTEGER)
                    aggregateValue = {
                        active: true,
                        activeData: {},
                        aggregationData: {
                            aggregation: {
                                value: min,
                                note: `Minimum value at ${minEntry!.formattedTime!}`
                            }
                        },
                        allData: {},
                        fillerData: {},
                        formattedTime: "",
                        machineryOff: false,
                        machineryOffFrom: 0,
                        machineryOffTo: 0,
                        time: 0,
                        minTime: 0,
                        maxTime: 0
                    }


                break
            }
            case "Maximum": {
                let max = Number.MIN_SAFE_INTEGER
                let maxEntry: SensorData
                sensorData.slice(-numSamplesToSlice).filter((val) => (!val.machineryOff)).forEach((val) => {

                    const objectKeys = Object.keys(val.allData)

                    if (objectKeys.length > 0 &&
                        val.allData[objectKeys[0]] &&
                        val.allData[objectKeys[0]]! > max
                    ) {
                        max = val.allData[objectKeys[0]]!
                        maxEntry = val
                    }

                })

                if (max > Number.MIN_SAFE_INTEGER)
                    aggregateValue = {
                        active: true,
                        activeData: {},
                        aggregationData: {
                            aggregation: {
                                value: max,
                                note: `Maximum value at ${maxEntry!.formattedTime}`
                            }
                        },
                        allData: {},
                        fillerData: {},
                        formattedTime: "",
                        machineryOff: false,
                        machineryOffFrom: 0,
                        machineryOffTo: 0,
                        time: 0,
                        minTime: 0,
                        maxTime: 0
                    }


                break
            }
            case "Average": {
                let sum = 0
                let numValues = 0
                sensorData.slice(-numSamplesToSlice).filter((val) => (!val.machineryOff)).forEach((val) => {

                    const objectKeys = Object.keys(val.allData)

                    if (objectKeys.length > 0 &&
                        val.allData[objectKeys[0]]
                    ) {
                        sum += val.allData[objectKeys[0]]!
                        numValues++
                    }
                })

                aggregateValue = {
                    active: true,
                    activeData: {},
                    aggregationData: {
                        aggregation: {
                            value: sum / numValues,
                            note: `Average of ${numValues} samples`
                        }
                    },
                    allData: {},
                    fillerData: {},
                    formattedTime: "",
                    machineryOff: false,
                    machineryOffFrom: 0,
                    machineryOffTo: 0,
                    time: 0,
                    minTime: 0,
                    maxTime: 0
                }

                break
            }
            default: {
                break
            }
        }

        if (aggregateValue)
            sensorData.push(aggregateValue)

    }

    return sensorData
}

function insertMachineryOffPadding(sensorData: SensorData[], sensorFilters: SensorDataFilters) {
    if (sensorData.length === 0)
        return sensorData


    if (sensorFilters.requestType === constants.REQUESTTYPE_CACHE) {
        const timeDiff = sensorFilters.cacheDataRequestMaxTime - sensorData[sensorData.length - 1].time
        if (timeDiff > 60000)
            return [...sensorData, ...generateMachineryOffEntries(sensorFilters, sensorFilters.cacheDataRequestMaxTime, timeDiff, sensorData[sensorData.length - 1].time)]

    } else if (sensorFilters.requestType === constants.REQUESTTYPE_NEW) {
        const timeDiff = sensorData[0].time - sensorFilters.newDataRequestMinTime
        if (timeDiff > 60000)
            return [...generateMachineryOffEntries(sensorFilters, sensorData[0].time, timeDiff, sensorFilters.newDataRequestMinTime), ...sensorData]

    }

    return sensorData
}

function formatForResponse(sensorData: SensorData[], sensorFilters: SensorDataFilters) {
    let displaySensorData: SensorData[] = []
    let cacheSensorData: SensorData[] = []
    let newSensorData: SensorData[] = []

    switch (sensorFilters.requestType) {
        case constants.REQUESTTYPE_FIRST: {
            if (sensorFilters.widgetCategory === constants.WIDGETTYPE_SINGLE) {
                displaySensorData = sensorData.slice(-1)
                cacheSensorData = sensorData.slice(0, -1)
            } else if (sensorFilters.widgetCategory === constants.WIDGETTYPE_MULTI)
                displaySensorData = sensorData
            else
                throw `Unknown widget category ${sensorFilters.widgetCategory}`

            break
        }
        case constants.REQUESTTYPE_CACHE: {
            cacheSensorData = sensorData
            break
        }
        case constants.REQUESTTYPE_NEW: {
            if (sensorFilters.widgetCategory === constants.WIDGETTYPE_SINGLE) {
                newSensorData = sensorData.slice(-1)
                cacheSensorData = sensorData.slice(0, -1)
            } else if (sensorFilters.widgetCategory === constants.WIDGETTYPE_MULTI)
                newSensorData = sensorData
            else
                throw `Unknown widget category ${sensorFilters.widgetCategory}`

            break
        }
        default: {
            throw "Unknown request type"
        }
    }

    return {
        cacheSensorData,
        displaySensorData,
        newSensorData
    }
}

function generateMachineryOffEntries(sensorFilters: SensorDataFilters, time: number, timeDiff: number, previousSampleTime: number) {
    let numPaddingEntriesToAdd = 0
    if (sensorFilters.widgetCategory === constants.WIDGETTYPE_SINGLE)
        numPaddingEntriesToAdd = 1
    else if (sensorFilters.widgetCategory === constants.WIDGETTYPE_MULTI)
        numPaddingEntriesToAdd = 3
    else
        throw `Unknown widget category${sensorFilters.widgetCategory}`


    const machineryOffEntries: SensorData[] = []
    for (let i = 0; i < numPaddingEntriesToAdd; i++) {
        const emptySensorDataObject: SensorData = {
            active: true,
            time: time - ((timeDiff / 4) * (3 - i)),
            minTime: time - ((timeDiff / 4) * (3 - i)),
            maxTime: time - ((timeDiff / 4) * (3 - i)),
            formattedTime: dayjs(time - ((timeDiff / (numPaddingEntriesToAdd + 1)) * (numPaddingEntriesToAdd - i))).format("D MMM YYYY HH:mm"),
            machineryOff: true,
            machineryOffFrom: previousSampleTime,
            machineryOffTo: time,
            activeData: {},
            allData: {},
            fillerData: {},
            aggregationData: {}
        }
        machineryOffEntries.push(emptySensorDataObject)
    }

    return machineryOffEntries
}

export default {
    groupBySensorName,
    binSamples,
    bucketVerticallyAndAggregateMultiValue,
    aggregateSingleValue,
    insertMachineryOffPadding,
    formatForResponse
}