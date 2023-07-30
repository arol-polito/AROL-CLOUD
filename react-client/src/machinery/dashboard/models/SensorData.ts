export default class SensorData {
  // formattedTime: string
  active: boolean
  machineryOff: boolean
  machineryOffFrom: number
  machineryOffTo: number
  time: number
  minTime: number
  maxTime: number
  formattedTime: string

  activeData: Record<string, number | null>
  fillerData: Record<string, number | null>
  allData: Record<string, number | null>
  aggregationData: Record<string, { value: number, note: string }>

  constructor (active: boolean, machineryOff: boolean, machineryOffFrom: number, machineryOffTo: number, time: number, minTime: number, maxTime: number, formattedTime: string, activeData: Record<string, number | null>, fillerData: Record<string, number | null>, allData: Record<string, number | null>, aggregationData: Record<string, {
    value: number
    note: string
  }>) {
    this.active = active
    this.machineryOff = machineryOff
    this.machineryOffFrom = machineryOffFrom
    this.machineryOffTo = machineryOffTo
    this.time = time
    this.minTime = minTime
    this.maxTime = maxTime
    this.formattedTime = formattedTime
    this.activeData = activeData
    this.fillerData = fillerData
    this.allData = allData
    this.aggregationData = aggregationData
  }
}
