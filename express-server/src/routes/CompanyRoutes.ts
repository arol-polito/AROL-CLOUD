import express from "express"
import controller from "../controllers/CompanyController"
import jwtAuthentication from "../middlewares/JwtAuthentication";

const {body} = require("express-validator");

const router = express.Router()

router.get(
    "/",
    jwtAuthentication.authenticateToken,
    controller.getCompanyByPrincipal
)

export default router