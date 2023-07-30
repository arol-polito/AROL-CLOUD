import type SensorDataFilter from './SensorDataFilter'
import type SensorDataRange from './SensorDataRange'

export default interface SensorDataFilters {
  requestType: string
  cacheDataRequestMaxTime: number
  newDataRequestMinTime: number
  widgetCategory: string
  dataRange: SensorDataRange
  sensors: Record<string, SensorDataFilter[]>
  aggregations: Array<{ name: string, color: string }>
}
