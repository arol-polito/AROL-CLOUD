import express from "express";
import machineryRepository from "../repositories/MachineryRepository";
import SensorDataFilters from "../interfaces/SensorDataFilters";
import userRepository from "../repositories/UserRepository";
import Machinery from "../entities/Machinery";
import sensorDataProcessor from "../utils/SensorDataProcessor";
import SensorDataResponse from "../entities/SensorDataResponse";
import sensorDataQueryBuilder from "../utils/SensorDataQueryBuilder";

async function getCompanyMachineries(req: express.Request, res: express.Response) {
    if (!req.principal.companyID)
        return res.status(400).json({
            msg: "Bad company ID"
        })


    let result = await machineryRepository.getCompanyMachineries(req.principal.companyID)

    if (result) {

        //FILTER MACHINERIES THAT USER CAN VIEW
        if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {
            const userMachineries = await userRepository.getAllUserPermissions(req.principal.id)
            if (userMachineries)
                result = result.filter((machinery) => (userMachineries!.find((el) => (el.machineryUID === machinery.uid)) !== undefined))
            else
                return res.status(200).json(new Map())

        }

        const machineriesMappedByCluster = new Map<string, Machinery[]>()
        result.forEach((machinery) => {
            if (machineriesMappedByCluster.has(machinery.locationCluster))
                machineriesMappedByCluster.get(machinery.locationCluster)!.push(machinery)
            else
                machineriesMappedByCluster.set(
                    machinery.locationCluster,
                    [machinery]
                )

        })

        return res.status(200).json(Object.fromEntries(machineriesMappedByCluster))
    }

    return res.status(500).json({
        msg: "Oops! Something went wrong and could not retrieve machineries"
    })
}

async function getCompanyMachineryByUID(req: express.Request, res: express.Response) {

    if (!req.principal.companyID)
        return res.status(400).json({
            msg: "Bad company ID"
        })


    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN") &&
        !await userRepository.getUserPermissionsForMachinery(req.principal.id, req.params.machineryUID))
        return res.sendStatus(403)


    //if(!(await machineryRepository.verifyMachineryOwnershipByUID(req.params.machineryUID, req.principal.companyID))){
    //    return res.status(403).json({
    //        msg: "Machinery not owned"
    //    })
    //}

    const result = await machineryRepository.getCompanyMachineryByUID(req.principal.companyID, req.params.machineryUID)
    if (result)
        return res.status(200).json(result)


    return res.status(404).json()
}

async function getMachinerySensors(req: express.Request, res: express.Response) {

    if (!req.principal.companyID)
        return res.status(400).json({
            msg: "Bad company ID"
        })


    const machineryUID = req.query.machineryUID as string

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN") &&
        !await userRepository.getUserPermissionsForMachinery(req.principal.id, machineryUID))
        return res.sendStatus(403)


    if (!(await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, req.principal.companyID)))
        return res.status(403).json({
            msg: "Machinery not owned"
        })


    const result = await machineryRepository.getMachinerySensors(machineryUID)
    if (result)
        return res.status(200).json(result)


    return res.status(500).json({
        msg: "Oops! Something went wrong and could not retrieve machinery sensors"
    })
}

async function getCompanyMachinerySensorData(req: express.Request, res: express.Response) {

    if (!req.principal.companyID)
        return res.status(400).json({
            msg: "Bad company ID"
        })


    const machineryUID = req.query.machineryUID as string
    const sensorFilters = req.body.sensorFilters as SensorDataFilters

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN") &&
        !await userRepository.getUserPermissionsForMachinery(req.principal.id, machineryUID))
        return res.sendStatus(403)


    if (!(await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, req.principal.companyID)))
        return res.status(403).json({
            msg: "Machinery not owned"
        })


    const machinery = await machineryRepository.getCompanyMachineryByUID(req.principal.companyID!, machineryUID)
    if (!machinery)
        return res.status(403).json({
            msg: "Machinery not owned"
        })


    const filteredSensorData = await machineryRepository.getMachinerySensorData(machineryUID, machinery!.modelID, sensorFilters)
    if (!filteredSensorData)
        return res.status(500).json({
            msg: "Oops! Something went wrong and could not retrieve machinery sensor data"
        })


    //Retrieve machinery sensors - used for naming each sample
    const sensors = await machineryRepository.getMachinerySensors(machineryUID)
    if (!sensors)
        return res.status(500).json({
            msg: "Oops! Something went wrong and could not retrieve machinery sensor data"
        })


    try {

        const {
            numSamplesRequiredPerSensor,
            displayMinTime
        } = sensorDataQueryBuilder.getMinMaxDisplayTimesAndLimits(sensorFilters)

        //Bucket sensor data samples by corresponding sensor name
        const {
            sensorDataMap,
            sensorInfoMap,
            preliminaryCheckForEndOfData,
            minSampleTime
        } = sensorDataProcessor.groupBySensorName(filteredSensorData, numSamplesRequiredPerSensor, sensors)

        //HORIZONTAL SAMPLE MERGING - bucket samples of same sensor using the corresponding merging strategy (min, max, sum, avg, majority...)
        const binnedSensorDataMap = sensorDataProcessor.binSamples(sensorDataMap, sensorInfoMap)

        //Transform map of sensor data samples indexed by sensor name to array of sensor data
        const sensorDataArray = Array.from(binnedSensorDataMap.entries())

        //VERTICAL BUCKETING + eventual (only for multi-value widgets) AGGREGATIONS
        let sensorData = sensorDataProcessor.bucketVerticallyAndAggregateMultiValue(sensorDataArray, sensorFilters)

        //AGGREGATION FOR SINGLE-VALUE widgets (aggregation for multi-value is done in vertical bucketing)
        sensorData = sensorDataProcessor.aggregateSingleValue(sensorData, sensorFilters, displayMinTime)

        //INSERT MACHINERY OFF PADDING FOR EDGE CASES (in the newest of cache data OR in the beginning of new data)
        //sensorData = sensorDataProcessor.insertMachineryOffPadding(sensorData, sensorFilters)

        //FORMAT SENSOR DATA for OUTPUT to client
        const {
            cacheSensorData,
            displaySensorData,
            newSensorData
        } = sensorDataProcessor.formatForResponse(sensorData, sensorFilters)

        let lastBatchOfSensorData: boolean
        if (preliminaryCheckForEndOfData === "indefinite")

            lastBatchOfSensorData = await machineryRepository.getSingleSensorDataForMachineryBeforeTime(sensorFilters, minSampleTime)

        else
            lastBatchOfSensorData = preliminaryCheckForEndOfData === "true";


        const sensorDataResponse = new SensorDataResponse(
            sensorFilters.requestType,
            cacheSensorData,
            displaySensorData,
            newSensorData,
            cacheSensorData.length + displaySensorData.length + newSensorData.length,
            minSampleTime,
            lastBatchOfSensorData
        )

        return res.status(200).json(sensorDataResponse)

    } catch (e) {
        return res.status(500).json({
            msg: "Oops! Something went wrong and could not retrieve machinery sensor data"
        })
    }

}

export default {
    getCompanyMachineries,
    getCompanyMachineryByUID,
    getMachinerySensors,
    getCompanyMachinerySensorData
}