import type SensorDataFilters from './SensorDataFilters'

export default interface GridWidget {
  id: string
  name: string
  category: string
  type: string
  maxSensors: number
  static: boolean
  sensorsMonitoring: SensorDataFilters
}
