import type SensorData from '../models/SensorData'

export default interface SlidingSensorData {
  leftData: SensorData[]
  displayData: SensorData[]
  rightData: SensorData[]
  numSensorData: number
  minDisplayTime: number
  endOfData: boolean
  hasNewData: boolean
  numSamplesDisplaying: number
}
