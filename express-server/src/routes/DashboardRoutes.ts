import express from "express"
import controller from "../controllers/DashboardController"
import jwtAuthentication from "../middlewares/JwtAuthentication";
import {query} from "express-validator";

const {body} = require("express-validator");

const router = express.Router()

router.post(
    "/save",
    body("dashboard").exists(),
    //body("dashboard.machineryUID").notEmpty(),
    //body("dashboard.dashboardName").notEmpty(),
    //body("dashboard.dashboard").exists(),
    jwtAuthentication.authenticateToken,
    controller.saveDashboard
)

router.post(
    "/saveas",
    body("dashboard").exists(),
    //body("dashboard.machineryUID").notEmpty(),
    //body("dashboard.dashboardName").notEmpty(),
    //body("dashboard.dashboard").exists(),
    jwtAuthentication.authenticateToken,
    controller.saveAsDashboard
)

router.delete(
    "/delete/",
    query("machineryUID").notEmpty(),
    query("dashboardName").notEmpty(),
    jwtAuthentication.authenticateToken,
    controller.deleteDashboard
)

router.get(
    "/load/",
    query("machineryUID").notEmpty(),
    query("dashboardName").notEmpty(),
    jwtAuthentication.authenticateToken,
    controller.loadDashboard
)

router.get(
    "/load/default/",
    query("machineryUID").notEmpty(),
    jwtAuthentication.authenticateToken,
    controller.loadDefaultDashboard
)

router.get(
    "/saved/",
    query("machineryUID").notEmpty(),
    jwtAuthentication.authenticateToken,
    controller.getDashboards
)

router.get(
    "/templates/",
    query("machineryUID").notEmpty(),
    jwtAuthentication.authenticateToken,
    controller.getDashboardTemplates
)

export default router