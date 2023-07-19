import SensorData from "../models/SensorData";

export default interface SensorDataContainer{
    requestType: string
    minDisplayTime: number
    cachedSensorData: SensorData[]
    displaySensorData: SensorData[]
    newSensorData: SensorData[]
    numSensorData: number
    endOfData: boolean
}