import {PolarChartSensorDataBucket} from "./PolarChartSensorDataBucket";

export interface PolarChartSensorData {
    allData: Record<string, PolarChartSensorDataBucket[]>,
    aggregationData: Record<string, PolarChartSensorDataBucket[]>,
    sectionSize: number,
    startingFromTime: string
}