import express from "express"
import machineriesService from "../services/MachineriesService";
import {validationResult} from "express-validator";

const getCompanyMachineries = (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return machineriesService.getCompanyMachineries(req, res)
}

const getCompanyMachineryByUID = (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return machineriesService.getCompanyMachineryByUID(req, res)
}

const getCompanyMachinerySensors = (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return machineriesService.getMachinerySensors(req, res)
}

const getCompanyMachinerySensorsData = (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return machineriesService.getCompanyMachinerySensorData(req, res)
}

export default {
    getCompanyMachineries,
    getCompanyMachineryByUID,
    getCompanyMachinerySensors,
    getCompanyMachinerySensorsData
}