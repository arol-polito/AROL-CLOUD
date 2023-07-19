import express from "express"
import dashboardService from "../services/DashboardService";
import {validationResult} from "express-validator";

const saveDashboard = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await dashboardService.saveDashboard(req, res)
}

const saveAsDashboard = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await dashboardService.saveAsDashboard(req, res)
}

const deleteDashboard = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await dashboardService.deleteDashboard(req, res)
}

const loadDashboard = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await dashboardService.loadDashboard(req, res)
}

const loadDefaultDashboard = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await dashboardService.loadDefaultDashboard(req, res)
}

const getDashboards = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await dashboardService.getDashboards(req, res)
}

const getDashboardTemplates = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await dashboardService.getDashboardTemplates(req, res)
}

export default {
    saveDashboard,
    saveAsDashboard,
    deleteDashboard,
    loadDashboard,
    loadDefaultDashboard,
    getDashboards,
    getDashboardTemplates
}