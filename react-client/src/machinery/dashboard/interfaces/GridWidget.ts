import type SensorDataFilters from './SensorDataFilters'
import SensorMonitoring from "./SensorMonitoring";
import Aggregation from "./Aggregation";
import SlidingSensorData from "./SlidingSensorData";
import {ChartProps} from "../components/widget/useWidgetLogic";

export default interface GridWidget {
    id: string
    name: string
    category: string
    type: string
    maxSensors: number
    static: boolean
    sensorsMonitoring: SensorDataFilters
    numSensorsMonitoring: number
    sensorsMonitoringArray: SensorMonitoring[]
    sensorsMonitoringObject: Record<string, SensorMonitoring>
    aggregationsArray: Aggregation[]
    numAggregationsMonitoring: number
    sensorData: SlidingSensorData
    chartProps: ChartProps
    numChange: number
}
