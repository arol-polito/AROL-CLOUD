import express from "express"
import controller from "../controllers/MachineryController"
import jwtAuthentication from "../middlewares/JwtAuthentication";
import {param, query} from "express-validator";

const router = express.Router()

router.get(
    "/company",
    jwtAuthentication.authenticateToken,
    controller.getCompanyMachineries
)

router.get(
    "/company/:machineryUID",
    param("machineryUID").notEmpty(),
    jwtAuthentication.authenticateToken,
    controller.getCompanyMachineryByUID
)

router.get(
    "/sensors/",
    query("machineryUID").notEmpty(),
    jwtAuthentication.authenticateToken,
    controller.getCompanyMachinerySensors
)

router.post(
    "/sensors/data/",
    query("machineryUID").notEmpty(),
    jwtAuthentication.authenticateToken,
    controller.getCompanyMachinerySensorsData
)

export default router