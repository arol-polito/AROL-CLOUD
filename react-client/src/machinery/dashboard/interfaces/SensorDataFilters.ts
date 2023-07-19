import SensorDataFilter from "./SensorDataFilter";
import SensorDataRange from "./SensorDataRange";

export default interface SensorDataFilters{
    requestType: string
    cacheDataRequestMaxTime: number
    newDataRequestMinTime: number
    widgetCategory: string
    dataRange: SensorDataRange
    sensors: {[key: string]: SensorDataFilter[]},
    aggregations: { name: string, color: string }[]
}