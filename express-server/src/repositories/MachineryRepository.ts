// noinspection ExceptionCaughtLocallyJS

import Machinery from "../entities/Machinery";
import pgClient from "../configs/PgClient";
import Sensor from "../entities/Sensor";
import SensorDataFilters from "../interfaces/SensorDataFilters";
import timestreamParser from "../utils/SensorDataQueryResponseParser";
import {TimestreamQuery} from "aws-sdk";
import sensorDataQueryBuilder from "../utils/SensorDataQueryBuilder";
import SensorDataSample from "../interfaces/SensorDataSample";
import mongoClient from "../configs/MongoClient";
import {Document} from "mongodb";
import constants from "../utils/Constants";


async function verifyMachineryOwnershipByUID(machineryUID: string, companyID: number | null): Promise<Boolean> {

    if (companyID === null) {
        return true
    }

    try {
        let checkCompany = await pgClient.one(
            "SELECT COUNT(*) FROM public.company_machineries WHERE company_id=$1 AND machinery_uid=$2",
            [companyID, machineryUID]
        )

        if (checkCompany.count === 0) {
            throw "Company " + companyID + " has no machinery with UID " + machineryUID
        }

        return true
    } catch (e) {
        console.log(e)
        return false
    }

}

async function verifyMachineryOwnershipByModelID(modelID: string, companyID: number | null): Promise<Boolean> {

    if (companyID === null) {
        return true
    }

    try {
        let checkCompany = await pgClient.one(
            "SELECT COUNT(*) FROM public.company_machineries WHERE company_id=$1 AND machinery_model_id=$2",
            [companyID, modelID]
        )

        if (checkCompany.count === 0) {
            throw "Company " + companyID + " has no machinery with Model ID " + modelID
        }

        return true
    } catch (e) {
        console.log(e)
        return false
    }

}

async function getCompanyMachineries(companyID: number): Promise<Machinery[] | null> {

    try {
        let result = await pgClient.result(
            "SELECT * FROM public.company_machineries as CM, public.machineries_catalogue as MC WHERE company_id=$1 AND CM.machinery_model_id=MC.model_id",
            companyID
        )

        return result.rows.map((row: any) => (
            new Machinery(
                row.machinery_uid,
                row.company_id,
                row.machinery_model_id,
                row.name,
                row.type,
                row.geo_location,
                row.location_cluster,
                row.num_heads
            )
        ))

    } catch (e) {
        console.log(e)
        return null
    }

}

async function getCompanyMachineryByUID(companyID: number, machineryUID: string): Promise<Machinery | null> {

    try {
        let result = await pgClient.oneOrNone(
            "SELECT * FROM public.company_machineries as CM, public.machineries_catalogue as MC WHERE machinery_uid=$1 AND company_id=$2 AND CM.machinery_model_id=MC.model_id",
            [machineryUID, companyID]
        )

        if (result) {
            return new Machinery(
                result.machinery_uid,
                result.company_id,
                result.machinery_model_id,
                result.name,
                result.type,
                result.geo_location,
                result.location_cluster,
                result.num_heads
            )
        }
        return null
    } catch (e) {
        return null
    }

}

async function getMachinerySensors(machineryUID: string): Promise<Sensor[] | null> {
    try {
        let result = await pgClient.result(
            "SELECT * FROM public.machinery_sensors WHERE machinery_uid=$1",
            [machineryUID]
        )

        return result.rows.map((row: any) => (
                new Sensor(
                    row.machinery_uid,
                    row.sensor_name,
                    row.sensor_description,
                    row.sensor_unit,
                    row.sensor_threshold_low,
                    row.sensor_threshold_high,
                    row.sensor_internal_name,
                    row.sensor_category,
                    row.sensor_type,
                    row.sensor_is_head_mounted,
                    row.sensor_bucketing_type,
                    row.sensor_img_filename,
                    row.sensor_img_pointer_location
                )
            )
        )

    } catch (e) {
        console.log(e)
        return null
    }
}

async function getMachinerySensorData(machineryUID: string, machineryModelID: string, sensorFilters: SensorDataFilters): Promise<SensorDataSample[] | null> {

    let {
        numSamplesRequiredPerSensor,
        displayMinTime,
        displayMaxTime
    } = sensorDataQueryBuilder.getMinMaxDisplayTimesAndLimits(sensorFilters)

    let filteredSensorData: SensorDataSample[] = []

    for (const [key, value] of Object.entries(sensorFilters.sensors)) {

        let singleValueWidgetSensorFoundFlag = false

        for (const sensorFilter of value) {

            let formattedHeadNumber = String(sensorFilter.headNumber).padStart(2, "0")

            const aggregate = [
                {
                    $sort: {first_time: -1}
                },
                {
                    $match: {
                        $and: [
                            {
                                last_time: {$gte: displayMinTime}
                            },
                            {
                                first_time: {$lt: displayMaxTime}
                            },
                            {
                                $or: [
                                    {
                                        $and: [
                                            {
                                                folder: {$exists: true}
                                            },
                                            {
                                                folder: "Head_" + formattedHeadNumber
                                            },
                                        ]
                                    },
                                    {
                                        $and: [
                                            {variable: {$exists: true}},
                                            {
                                                variable: {
                                                    $in: [...sensorFilter.sensorNames.map((el) => (el.name))]
                                                }
                                            },
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                },
                /*{
                    $unwind: "$samples"
                },
                {
                    $sort: {"samples.time": -1}
                },
                {
                    $group: {
                        _id: "$_id",

                        samples: {$push: "$samples"}
                    }
                },*/

                {
                    $project: {
                        _id: 0,
                        folder: 1,
                        variable: 1,
                        samples: {
                            $filter: {
                                input: '$samples',
                                as: 'sample',
                                cond: {
                                    $and: [
                                        {
                                            $ne: ["$$sample.time", null]
                                        },
                                        {
                                            $gte: ["$$sample.time", displayMinTime]
                                        },
                                        {
                                            $lt: ["$$sample.time", displayMaxTime]
                                        },
                                        sensorFilter.headNumber > 0 ?
                                            {
                                                $or: [
                                                    ...sensorFilter.sensorNames.map((sensorName) => ({
                                                        $eq: ["$$sample.name", "H" + formattedHeadNumber + "_" + sensorName.name]
                                                    }))
                                                ]
                                            } : {}
                                        // {
                                        //     $or: [
                                        //         {
                                        //             $and: [
                                        //                 {
                                        //                     $ne: ["$folder", undefined]
                                        //                 },
                                        //                 {
                                        //                     $or: [
                                        //                         ...sensorFilter.sensorNames.map((sensorName) => ({
                                        //                             $eq: ["$$sample.name", "H" + formattedHeadNumber + "_" + sensorName.name]
                                        //                         }))
                                        //                     ]
                                        //                 }
                                        //             ]
                                        //         },
                                        //         {
                                        //             $ne: ["$variable", undefined]
                                        //         }
                                        //     ]
                                        // }
                                    ]
                                },
                                //limit: limit
                            }
                        }
                    }
                }
            ]

            let queryResults = mongoClient.db("arol").collection(key).aggregate(
                aggregate
            )

            await queryResults.forEach((queryResultObject: Document) => {

                if (queryResultObject["folder"]) {
                    // if (sensorFilters.dataRange.unit === "sample") {
                    //     samplesArray.push(...queryResultObject.samples)
                    // } else {
                    filteredSensorData.push(...queryResultObject.samples)
                    // }
                } else if (queryResultObject["variable"]) {
                    // if (sensorFilters.dataRange.unit === "sample") {
                    //     samplesArray.push(...queryResultObject.samples.map((el: any) => ({
                    //         name: queryResultObject.variable,
                    //         value: el.value,
                    //         time: el.time
                    //     })))
                    // } else {
                    filteredSensorData.push(...queryResultObject.samples.map((el: any) => ({
                        name: queryResultObject.variable,
                        value: el.value,
                        time: el.time
                    })))
                    // }
                }
            })

            //If single value widget, query only sensor data of first sensor
            if (sensorFilters.widgetCategory === constants.WIDGETTYPE_SINGLE) {
                singleValueWidgetSensorFoundFlag = true
                break
            }

        }

        //If single value widget, query only sensor data of first sensor
        if (sensorFilters.widgetCategory === constants.WIDGETTYPE_SINGLE && singleValueWidgetSensorFoundFlag) {
            break
        }

    }

    // console.log(filteredSensorData)

    return filteredSensorData.map((el) => {
        if (sensorFilters.requestType === constants.REQUESTTYPE_NEW) {
            if(!["OperationState","Alarm","OperationMode","ProductionSpeed","TotalProduct"].includes(el.name)) {
                el.value = el.value + (el.value * /*sign*/(Math.round(Math.random()) * 2 - 1) * /*random between 0.01 and 0.4*/((Math.floor(Math.random() * 15) + 1) / 100))
            }
            if(el.name==="Alarm"){
                el.value = 0
            }
            if(el.name === "ProductionSpeed"){
                el.value = 46800
            }
            if(el.name === "TotalProduct"){
                el.value = el.value + (el.value * ((Math.floor(Math.random() * 10) + 1) / 100))
            }
            el.time = Date.now() - 3944700000 + 43200000
        }
        el.value = +el.value.toFixed(2)

        return el
    })
}

async function isEndOfSensorDataForMachinery(sensorFilters: SensorDataFilters, minSampleTime: number): Promise<boolean> {
    let endOfData = true

    for (const [key, value] of Object.entries(sensorFilters.sensors)) {

        let singleValueWidgetSensorFoundFlag = false

        for (const sensorFilter of value) {

            let formattedHeadNumber = String(sensorFilter.headNumber).padStart(2, "0")

            const aggregate = [
                {
                    $sort: {first_time: -1}
                },
                {
                    $match: {
                        $and: [
                            {
                                first_time: {$lt: minSampleTime}
                            },
                            {
                                $or: [
                                    {
                                        $and: [
                                            {
                                                folder: {$exists: true}
                                            },
                                            {
                                                folder: "Head_" + formattedHeadNumber
                                            },
                                        ]
                                    },
                                    {
                                        $and: [
                                            {variable: {$exists: true}},
                                            {
                                                variable: {
                                                    $in: [...sensorFilter.sensorNames.map((el) => (el.name))]
                                                }
                                            },
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                },
                /*{
                    $unwind: "$samples"
                },
                {
                    $sort: {"samples.time": -1}
                },
                {
                    $group: {
                        _id: "$_id",

                        samples: {$push: "$samples"}
                    }
                },*/

                {
                    $project: {
                        _id: 0,
                        folder: 1,
                        variable: 1,
                        samples: {
                            $filter: {
                                input: '$samples',
                                as: 'sample',
                                cond: {
                                    $and: [
                                        {
                                            $ne: ["$$sample.time", null]
                                        },
                                        {
                                            $lt: ["$$sample.time", minSampleTime]
                                        },
                                        sensorFilter.headNumber > 0 ?
                                            {
                                                $or: [
                                                    ...sensorFilter.sensorNames.map((sensorName) => ({
                                                        $eq: ["$$sample.name", "H" + formattedHeadNumber + "_" + sensorName.name]
                                                    }))
                                                ]
                                            } : {}
                                        // {
                                        //     $or: [
                                        //         {
                                        //             $and: [
                                        //                 {
                                        //                     $ne: ["$folder", undefined]
                                        //                 },
                                        //                 {
                                        //                     $or: [
                                        //                         ...sensorFilter.sensorNames.map((sensorName) => ({
                                        //                             $eq: ["$$sample.name", "H" + formattedHeadNumber + "_" + sensorName.name]
                                        //                         }))
                                        //                     ]
                                        //                 }
                                        //             ]
                                        //         },
                                        //         {
                                        //             $ne: ["$variable", undefined]
                                        //         }
                                        //     ]
                                        // }
                                    ]
                                },
                                //limit: limit
                            }
                        }
                    }
                },
                // {
                //     $limit: 1
                // }
            ]

            let queryResults = mongoClient.db("arol").collection(key).aggregate(
                aggregate
            )

            await queryResults.forEach((queryResultObject: Document) => {
                endOfData = false
            })

            //If single value widget, query only sensor data of first sensor
            if (sensorFilters.widgetCategory === constants.WIDGETTYPE_SINGLE) {
                singleValueWidgetSensorFoundFlag = true
                break
            }

            if (!endOfData) {
                break
            }

        }

        //If single value widget, query only sensor data of first sensor
        if (sensorFilters.widgetCategory === constants.WIDGETTYPE_SINGLE && singleValueWidgetSensorFoundFlag) {
            break
        }

        if (!endOfData) {
            break
        }

    }

    return endOfData
}

export default {
    verifyMachineryOwnershipByUID,
    verifyMachineryOwnershipByModelID,
    getCompanyMachineries,
    getCompanyMachineryByUID,
    getMachinerySensors,
    getMachinerySensorData,
    getSingleSensorDataForMachineryBeforeTime: isEndOfSensorDataForMachinery
}