import express from "express";
import machineryRepository from "../repositories/MachineryRepository";
import dashboardRepository from "../repositories/DashboardRepository";
import userRepository from "../repositories/UserRepository";

async function saveDashboard(req: express.Request, res: express.Response) {

    const userID = req.principal.id
    const companyID = req.principal.companyID
    const dashboard = req.body.dashboard
    if (!userID) {
        return res.status(404).json({
            msg: "User ID unknown"
        })
    }

    if (!(await machineryRepository.verifyMachineryOwnershipByUID(dashboard.machineryUID, companyID))) {
        return res.status(403).json({
            msg: "Machinery not owned"
        })
    }

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {

        const userPermissions = await userRepository.getUserPermissionsForMachinery(req.principal.id, dashboard.machineryUID)
        if (!userPermissions) {
            return res.sendStatus(403)
        }

        const dashboardExists = await dashboardRepository.loadDashboard(dashboard.name, dashboard.machineryUID)
        if (dashboardExists && !userPermissions.dashboardsModify) {
            return res.sendStatus(403)
        } else if (!dashboardExists && !userPermissions.dashboardsWrite) {
            return res.sendStatus(403)
        }

    }

    dashboard.lastSave = Date.now()
    dashboard.numUnsavedChanges = 0
    const result = await dashboardRepository.saveDashboard(dashboard, userID)
    if (result) {
        return res.sendStatus(200)
    } else if (result === false) {
        return res.sendStatus(404)
    }

    return res.status(500).json({
        msg: "Oops! Could not save dashboard"
    })

}

async function saveAsDashboard(req: express.Request, res: express.Response) {

    const userID = req.principal.id
    const companyID = req.principal.companyID
    const dashboard = req.body.dashboard
    if (!userID) {
        return res.status(404).json({
            msg: "User ID unknown"
        })
    }

    if (!(await machineryRepository.verifyMachineryOwnershipByUID(dashboard.machineryUID, companyID))) {
        return res.status(403).json({
            msg: "Machinery not owned"
        })
    }

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {

        const userPermissions = await userRepository.getUserPermissionsForMachinery(req.principal.id, dashboard.machineryUID)
        if (!userPermissions) {
            return res.sendStatus(403)
        }

        const dashboardExists = await dashboardRepository.loadDashboard(dashboard.name, dashboard.machineryUID)
        if (dashboardExists && !userPermissions.dashboardsModify) {
            return res.sendStatus(403)
        } else if (!dashboardExists && !userPermissions.dashboardsWrite) {
            return res.sendStatus(403)
        }

    }

    dashboard.lastSave = Date.now()
    dashboard.numUnsavedChanges = 0
    const result = await dashboardRepository.saveAsDashboard(dashboard, userID)
    if (result) {
        return res.sendStatus(200)
    } else if (result === false) {
        return res.sendStatus(409)
    }
    return res.status(500).json({
        msg: "Oops! Could not save dashboard"
    })
}


async function deleteDashboard(req: express.Request, res: express.Response) {

    const userID = req.principal.id
    const machineryUID = req.query.machineryUID as string
    const dashboardName = req.query.dashboardName as string
    if (!userID) {
        return res.status(400).json({
            msg: "User ID unknown"
        })
    }

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {

        const userPermissions = await userRepository.getUserPermissionsForMachinery(req.principal.id, machineryUID)
        if (!userPermissions || !userPermissions.dashboardsWrite) {
            return res.sendStatus(403)
        }
    }

    if (!(await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, req.principal.companyID))) {
        return res.status(403).json({
            msg: "Machinery not owned"
        })
    }

    const result = await dashboardRepository.deleteDashboard(dashboardName, machineryUID)
    if (result === null) {
        return res.status(500).json({
            msg: "Oops! Could not delete the dashboard"
        })
    }

    if (result) {
        return res.sendStatus(200)
    }
    return res.status(404).json({
        msg: "Oops! Could not find dashboard to delete"
    })
}

async function loadDashboard(req: express.Request, res: express.Response) {
    const userID = req.principal.id
    const machineryUID = req.query.machineryUID as string
    const dashboardName = req.query.dashboardName as string

    if (!userID) {
        return res.status(400).json({
            msg: "User ID unknown"
        })
    }

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {

        const userPermissions = await userRepository.getUserPermissionsForMachinery(req.principal.id, machineryUID)
        if (!userPermissions || !userPermissions.dashboardsRead) {
            return res.sendStatus(403)
        }
    }

    if (!(await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, req.principal.companyID))) {
        return res.status(403).json({
            msg: "Machinery not owned"
        })
    }

    const result = await dashboardRepository.loadDashboard(dashboardName, machineryUID)
    if (result) {
        return res.status(200).json(result)
    }
    return res.status(404).json({
        msg: "Oops! Could not find dashboard to delete"
    })

}

async function loadDefaultDashboard(req: express.Request, res: express.Response) {

    const userID = req.principal.id
    const machineryUID = req.query.machineryUID as string

    if (!userID) {
        return res.status(400).json({
            msg: "User ID unknown"
        })
    }

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {

        const userPermissions = await userRepository.getUserPermissionsForMachinery(req.principal.id, machineryUID)
        if (!userPermissions || !userPermissions.dashboardsRead) {
            return res.sendStatus(403)
        }
    }

    if (!(await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, req.principal.companyID))) {
        return res.status(403).json({
            msg: "Machinery not owned"
        })
    }

    const result = await dashboardRepository.loadDefaultDashboard(machineryUID)
    if (result) {
        return res.status(200).json(result)
    }
    return res.status(404).json({
        msg: "No default dashboard found"
    })
}


async function getDashboards(req: express.Request, res: express.Response) {
    const machineryUID = req.query.machineryUID as string

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {
        const userPermissions = await userRepository.getUserPermissionsForMachinery(req.principal.id, machineryUID)
        console.log(userPermissions)
        if (!userPermissions || !userPermissions.dashboardsRead) {
            return res.sendStatus(403)
        }
    }

    if (!(await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, req.principal.companyID))) {
        return res.status(403).json({
            msg: "Machinery not owned"
        })
    }

    const result = await dashboardRepository.getDashboards(machineryUID)
    if (result) {
        // console.log(result)
        return res.status(200).json(result)
    }
    return res.status(500).json({
        msg: "Oops! Could not retrieve dashboards"
    })
}

async function getDashboardTemplates(req: express.Request, res: express.Response) {

    if (!req.principal.companyID) {
        return res.status(400).json({
            msg: "Bad company ID"
        })
    }

    const machineryUID = req.query.machineryUID as string
    const companyID = req.principal.companyID
    const userID = req.principal.id

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {
        const userPermissions = await userRepository.getUserPermissionsForMachinery(req.principal.id, machineryUID)
        console.log(userPermissions)
        if (!userPermissions || !userPermissions.dashboardsWrite) {
            return res.sendStatus(403)
        }
    }

    if (!(await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, req.principal.companyID))) {
        return res.status(403).json({
            msg: "Machinery not owned"
        })
    }

    const result = await dashboardRepository.getDashboardTemplates(machineryUID, companyID!, userID, req.principal.roles)
    if (result) {
        // console.log(result)
        return res.status(200).json(result)
    }
    return res.status(500).json({
        msg: "Oops! Could not retrieve dashboard templates"
    })
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