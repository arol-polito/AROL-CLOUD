import SensorData from "./SensorData";

export default class SensorDataResponse {
    requestType: string
    minDisplayTime: number
    cachedSensorData: SensorData[]
    displaySensorData: SensorData[]
    newSensorData: SensorData[]
    numSensorData: number
    endOfData: boolean


    constructor(requestType: string, cachedSensorData: SensorData[], displaySensorData: SensorData[], newSensorData: SensorData[], numSensorData: number, minDisplayTime: number, endOfData: boolean) {
        this.requestType = requestType;
        this.minDisplayTime = minDisplayTime;
        this.cachedSensorData = cachedSensorData;
        this.displaySensorData = displaySensorData;
        this.newSensorData = newSensorData;
        this.numSensorData = numSensorData;
        this.endOfData = endOfData;
    }
}