import axios from '../utils/AxiosInterceptor'
import type Machinery from '../machineries-map/components/Machinery'
import type Sensor from '../machinery/dashboard/models/Sensor'
import type SensorDataFilters from '../machinery/dashboard/interfaces/SensorDataFilters'
import type SensorDataContainer from '../machinery/dashboard/interfaces/SensorDataContainer'

export default {
  getMachineryByCompany,
  getMachineryByUID,
  getMachinerySensors,
  getMachinerySensorsData
}

async function getMachineryByCompany (): Promise<Map<string, Machinery[]>> {
  const response = await axios.get<Map<string, Machinery[]>>(
    '/machinery/company'
  )

  if (response.status !== 200)
    throw response.data

  return new Map(Object.entries(response.data))
}

async function getMachineryByUID (machineryUID: string): Promise<Machinery> {
  const response = await axios.get<Machinery>(
    `/machinery/company/${machineryUID}`
  )

  if (response.status !== 200)
    throw response.data

  return response.data
}

async function getMachinerySensors (machineryUID: string): Promise<Sensor[]> {
  const response = await axios.get<Sensor[]>(
    `/machinery/sensors/?machineryUID=${machineryUID}`
  )

  return response.data
}

async function getMachinerySensorsData (machineryUID: string, sensorFilters: SensorDataFilters): Promise<SensorDataContainer> {
  const response = await axios.post<SensorDataContainer>(
    `/machinery/sensors/data/?machineryUID=${machineryUID}`,
    { sensorFilters }
  )

  return response.data
}
