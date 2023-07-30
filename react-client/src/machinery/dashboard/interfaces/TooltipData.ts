import type SensorMonitoring from './SensorMonitoring'
import type Aggregation from './Aggregation'
import type SensorData from '../models/SensorData'

export default interface TooltipData {
  active: boolean
  label: string
  chartCoordinate: number[]
  clickCoordinate: number[]
  leftData: SensorData[]
  displayData: SensorData[]
  sensorData: any[]
  sensorDataIndex: number
  sensorsMonitoringObject: Record<string, SensorMonitoring>
  sensorsMonitoringArray: SensorMonitoring[]
  aggregationsArray: Aggregation[]
}
