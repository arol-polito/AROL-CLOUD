import SensorDataFilters from "../interfaces/SensorDataFilters";
import dayjs from "dayjs";
import constants from "./Constants";

const dbName = "\"arol-dev-database\""
const eqtqTable = "\"arol-dev-plc-eqtqhead-data\""
const nsTable = "\"arol-dev-plc-nshead-data\""
const plcTable = "\"arol-dev-plc-plc-data\""

const cacheNumSamplesLimit = 20

function buildRetrieveSensorDataQuery(sensorFilters: SensorDataFilters, category: string): string {

    const supportedTypes = ["plc", "ns", "eqtq"]

    category = category.toLowerCase()

    if (!supportedTypes.includes(category)) {
        throw "Unsupported sensor category - supported categories are: " + supportedTypes.join(",")
    }

    let numColsChecked = 0
    let query = ""

    if (category === "eqtq") {
        query = "SELECT * FROM " + dbName + "." + eqtqTable + " WHERE "
    } else if (category === "ns") {
        query = "SELECT * FROM " + dbName + "." + nsTable + " WHERE "
    } else if (category === "plc") {
        query = "SELECT * FROM " + dbName + "." + plcTable + " WHERE "
    }

    let machineryHeadsArray: string[] = getMachineryHeadsArray(sensorFilters, category)

    query += "iot_shadow IN (" + machineryHeadsArray.join(",") + ") "

    switch (sensorFilters.requestType) {
        case constants.REQUESTTYPE_FIRST: {
            switch (sensorFilters.dataRange.unit) {
                case
                constants.DATARANGE_SAMPLE: {
                    let numSamplesLimit = 0
                    if (category === "plc") {
                        numSamplesLimit = sensorFilters.dataRange.amount * sensorFilters.sensors["plc"][0].sensorNames.length
                    } else {
                        numSamplesLimit = sensorFilters.dataRange.amount * machineryHeadsArray.length
                    }

                    query += "ORDER BY time DESC LIMIT " + (numSamplesLimit) + " "
                    break
                }
                case
                constants.DATARANGE_DAY: {
                    query += "AND time > ago(" + sensorFilters.dataRange.amount + "d) ORDER BY time DESC "
                    // displayMinTime = dayjs().subtract(sensorFilters.dataRange.amount, "day").startOf("day").valueOf()
                    break
                }
                case
                constants.DATARANGE_WEEK: {
                    query += "AND time > ago(" + (sensorFilters.dataRange.amount * 7) + "d) ORDER BY time DESC "
                    //displayMinTime = dayjs().subtract(sensorFilters.dataRange.amount, "week").startOf("week").valueOf()
                    break
                }
                case
                constants.DATARANGE_MONTH: {
                    query += "AND time > ago(" + (sensorFilters.dataRange.amount * 30) + "d) ORDER BY time DESC "
                    // displayMinTime = dayjs().subtract(sensorFilters.dataRange.amount, "month").startOf("month").valueOf()
                    break
                }
                default: {
                    throw "Unknown range unit " + sensorFilters.dataRange.unit
                }
            }
            break
        }
        case constants.REQUESTTYPE_CACHE: {
            //let maxTime = dayjs(sensorFilters.cacheDataRequestMaxTime+7200000).toISOString()
            query += "AND to_milliseconds(time) < " + sensorFilters.cacheDataRequestMaxTime + " ORDER BY time DESC LIMIT " + cacheNumSamplesLimit + " "
            // displayMaxTime = sensorFilters.cacheDataRequestMaxTime
            break
        }
        case constants.REQUESTTYPE_NEW: {
            console.log("NEW DATA REQUEST")
            //let minTime = new Date(sensorFilters.newDataRequestMinTime+7200000).toISOString()
            query += "AND to_milliseconds(time) >= " + sensorFilters.newDataRequestMinTime + " ORDER BY time DESC "
            break
        }
        default: {
            throw "Unknown request type " + sensorFilters.requestType
        }
    }

    console.log(query)

    return query
}

function buildCheckEndOfSensorDataQuery(sensorFilters: SensorDataFilters, category: string, lastSampleTime: number, plcColumns: string[]) {

    const supportedTypes = ["plc", "ns", "eqtq"]

    category = category.toLowerCase()

    if (!supportedTypes.includes(category)) {
        throw "Unsupported sensor category - supported categories are: " + supportedTypes.join(",")
    }

    let query = ""
    let numColsChecked = 0
    if (category === "eqtq") {
        query = "SELECT * FROM " + dbName + "." + eqtqTable + " WHERE "
    } else if (category === "ns") {
        query = "SELECT * FROM " + dbName + "." + nsTable + " WHERE "
    } else if (category === "plc") {
        query = "SELECT * FROM " + dbName + "." + plcTable + " WHERE "
        for (const el of sensorFilters.sensors["plc"][0].sensorNames) {
            if (!plcColumns.includes(el.name.toLowerCase() + "_value")) {
                continue
            }
            if (numColsChecked > 0) {
                query += "OR "
            }
            query = query + el.name + "_value IS NOT NULL "
            numColsChecked++
        }
        query += ") AND "

    }

    let sensorNamesArray: string[] = getMachineryHeadsArray(sensorFilters, category)

    query += "iot_thing IN (" + sensorNamesArray.join(",") + ") AND to_milliseconds(time) < " + lastSampleTime + " LIMIT 1"

    console.log("END OF DATA CHECK: " + query)

    return query
}

function getMinMaxDisplayTimesAndLimits(sensorFilters: SensorDataFilters) {
    let displayMinTime = 0
    let displayMaxTime = Number.MAX_SAFE_INTEGER
    let numSamplesRequiredPerSensor = 0

    let numSensorsToMonitor: number = 0
    Object.values(sensorFilters.sensors).forEach((sensorToMonitorCategory) => {
        sensorToMonitorCategory.forEach((sensorToMonitorEntry) => {
            sensorToMonitorEntry.sensorNames.forEach((sensorToMonitor) => {
                numSensorsToMonitor++
            })
        })
    })


    switch (sensorFilters.requestType) {
        case constants.REQUESTTYPE_FIRST: {
            switch (sensorFilters.dataRange.unit) {
                case
                constants.DATARANGE_SAMPLE: {
                    numSamplesRequiredPerSensor = sensorFilters.dataRange.amount
                    break
                }
                case
                constants.DATARANGE_DAY: {
                    displayMinTime = dayjs().subtract(sensorFilters.dataRange.amount, "day").startOf("day").valueOf()
                    break
                }
                case
                constants.DATARANGE_WEEK: {
                    displayMinTime = dayjs().subtract(sensorFilters.dataRange.amount, "week").startOf("week").valueOf()
                    break
                }
                case
                constants.DATARANGE_MONTH: {
                    displayMinTime = dayjs().subtract(sensorFilters.dataRange.amount, "month").startOf("month").valueOf()
                    break
                }
                default: {
                    throw "Unknown range unit " + sensorFilters.dataRange.unit
                }
            }
            break
        }
        case constants.REQUESTTYPE_CACHE: {
            numSamplesRequiredPerSensor = 20
            displayMaxTime = sensorFilters.cacheDataRequestMaxTime
            break
        }
        case constants.REQUESTTYPE_NEW: {
            displayMinTime = sensorFilters.newDataRequestMinTime
            break
        }
        default: {
            throw "Unknown request type " + sensorFilters.requestType
        }
    }

    return {
        numSamplesRequiredPerSensor,
        displayMinTime,
        displayMaxTime
    }
}

function getMachineryHeadsArray(sensorFilters: SensorDataFilters, category: string) {

    const supportedTypes = ["plc", "ns", "eqtq"]

    category = category.toLowerCase()

    if (!supportedTypes.includes(category)) {
        throw "Unsupported sensor category - supported categories are: " + supportedTypes.join(",")
    }

    if (category === "plc") {
        return ["'PLC'"]
    }

    let machineryHeadsArray: string[] = []
    Object.values(sensorFilters.sensors).forEach((sensorToMonitorCategory) => {
        sensorToMonitorCategory.forEach((sensorToMonitorEntry) => {
            if (category === "eqtq") {
                let formattedHeadNumber = String(sensorToMonitorEntry.headNumber).padStart(2, "0")
                machineryHeadsArray.push("'EQTQ-Head_" + formattedHeadNumber + "'")
            } else if (category === "ns") {
                machineryHeadsArray.push("'NS-head" + sensorToMonitorEntry.headNumber + "'")
            }

        })
    })

    return machineryHeadsArray
}

export default {
    buildRetrieveSensorDataQuery,
    getMinMaxDisplayTimesAndLimits,
    buildCheckEndOfSensorDataQuery
}