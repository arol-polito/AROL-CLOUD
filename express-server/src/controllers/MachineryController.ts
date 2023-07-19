import express from "express"
import machineriesService from "../services/MachineriesService";
import {validationResult} from "express-validator";

const getCompanyMachineries = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await machineriesService.getCompanyMachineries(req, res)
}

const getCompanyMachineryByUID = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await machineriesService.getCompanyMachineryByUID(req, res)
}

const getCompanyMachinerySensors = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await machineriesService.getMachinerySensors(req, res)
}

const getCompanyMachinerySensorsData = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await machineriesService.getCompanyMachinerySensorData(req, res)
}

export default {
    getCompanyMachineries,
    getCompanyMachineryByUID,
    getCompanyMachinerySensors,
    getCompanyMachinerySensorsData
}