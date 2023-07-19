import SensorMonitoring from "./SensorMonitoring";
import Aggregation from "./Aggregation";
import SensorData from "../models/SensorData";

export default interface TooltipData {
    active: boolean
    label: string
    chartCoordinate: number[]
    clickCoordinate: number[]
    leftData: SensorData[]
    displayData: SensorData[]
    sensorData: any[]
    sensorDataIndex: number
    sensorsMonitoringObject: { [key: string]: SensorMonitoring }
    sensorsMonitoringArray: SensorMonitoring[]
    aggregationsArray: Aggregation[]
}