import express from "express"
import controller from "../controllers/CompanyController"
import jwtAuthentication from "../middlewares/JwtAuthentication";

const router = express.Router()

router.get(
    "/",
    jwtAuthentication.authenticateToken,
    controller.getCompanyByPrincipal
)

export default router