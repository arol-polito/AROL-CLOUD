import express from "express"
import dashboardService from "../services/DashboardService";
import {validationResult} from "express-validator";

const saveDashboard =  (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return dashboardService.saveDashboard(req, res)
}

const saveAsDashboard =  (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return dashboardService.saveAsDashboard(req, res)
}

const deleteDashboard =  (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return dashboardService.deleteDashboard(req, res)
}

const loadDashboard =  (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return dashboardService.loadDashboard(req, res)
}

const loadDefaultDashboard =  (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return dashboardService.loadDefaultDashboard(req, res)
}

const getDashboards =  (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return dashboardService.getDashboards(req, res)
}

const getDashboardTemplates =  (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return dashboardService.getDashboardTemplates(req, res)
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