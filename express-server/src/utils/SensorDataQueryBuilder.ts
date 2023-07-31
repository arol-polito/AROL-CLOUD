import SensorDataFilters from "../interfaces/SensorDataFilters";
import dayjs from "dayjs";
import constants from "./Constants";

function getMinMaxDisplayTimesAndLimits(sensorFilters: SensorDataFilters) {
    let displayMinTime = 0
    let displayMaxTime = Number.MAX_SAFE_INTEGER
    let numSamplesRequiredPerSensor = 0

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
                    throw `Unknown range unit ${sensorFilters.dataRange.unit}`
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
            throw `Unknown request type ${sensorFilters.requestType}`
        }
    }

    return {
        numSamplesRequiredPerSensor,
        displayMinTime,
        displayMaxTime
    }
}

export default {
    getMinMaxDisplayTimesAndLimits,
}