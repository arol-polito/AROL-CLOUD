import axios from "../utils/AxiosInterceptor"
import Machinery from "../machineries-map/components/Machinery";
import Sensor from "../machinery/dashboard/models/Sensor";
import SensorDataFilters from "../machinery/dashboard/interfaces/SensorDataFilters";
import SensorDataContainer from "../machinery/dashboard/interfaces/SensorDataContainer";

export default {
    getMachineryByCompany,
    getMachineryByUID,
    getMachinerySensors,
    getMachinerySensorsData
}

async function getMachineryByCompany() : Promise<Map<string, Machinery[]>>{

    let response = await axios.get<Map<string, Machinery[]>>(
        "/machinery/company",
    )

    if(response.status!==200){
        throw response.data
    }

    return new Map(Object.entries(response.data))

}

async function getMachineryByUID(machineryUID: string) : Promise<Machinery>{

    let response = await axios.get<Machinery>(
        "/machinery/company/"+machineryUID,
    )

    if(response.status!==200){
        throw response.data
    }

    return response.data

}

async function getMachinerySensors(machineryUID: string) : Promise<Sensor[]>{

    let response = await axios.get<Sensor[]>(
        "/machinery/sensors/?machineryUID="+machineryUID,
    )

    return response.data

}

async function getMachinerySensorsData(machineryUID: string, sensorFilters: SensorDataFilters) : Promise<SensorDataContainer>{

    let response = await axios.post<SensorDataContainer>(
        "/machinery/sensors/data/?machineryUID="+machineryUID,
        {sensorFilters: sensorFilters},
    )

    return response.data

}
