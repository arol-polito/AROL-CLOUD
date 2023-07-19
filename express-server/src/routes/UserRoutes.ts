import express from "express"
import controller from "../controllers/UserController"
import jwtAuthentication from "../middlewares/JwtAuthentication";
import authorization from "../middlewares/Authorization"
import {param} from "express-validator";

const {body} = require("express-validator");

const router = express.Router()

router.get(
    "/company",
    jwtAuthentication.authenticateToken,
    authorization.authorizeRequest,
    controller.getCompanyUsers
)

router.post(
    "/create",
    body("email").isEmail(),
    body("password").notEmpty(),
    body("name").notEmpty(),
    body("surname").notEmpty(),
    body("roles").isArray({min: 1}),
    body("active").isBoolean(),
    jwtAuthentication.authenticateToken,
    authorization.authorizeRequest,
    controller.createAccount
)

router.post(
    "/details/update",
    body("id").isNumeric(),
    body("email").isEmail(),
    body("name").notEmpty(),
    body("surname").notEmpty(),
    body("roles").isArray({min: 1}),
    body("active").isBoolean(),
    jwtAuthentication.authenticateToken,
    authorization.authorizeRequest,
    controller.updateAccountDetails
)

router.post(
    "/password/reset",
    body("id").isNumeric(),
    body("password").notEmpty(),
    jwtAuthentication.authenticateToken,
    authorization.authorizeRequest,
    controller.resetAccountPassword
)

router.get(
    "/permissions/:userID/:machineryUID",
    param("userID").isNumeric(),
    param("machineryUID").notEmpty(),
    jwtAuthentication.authenticateToken,
    authorization.authorizeRequest,
    controller.getUserPermissionsForMachinery
)

router.get(
    "/permissions/:userID",
    param("userID").isNumeric(),
    jwtAuthentication.authenticateToken,
    authorization.authorizeRequest,
    controller.getAllUserPermissions
)

router.post(
    "/permissions/update",
    jwtAuthentication.authenticateToken,
    authorization.authorizeRequest,
    controller.updateUserPermissions
)

// router.delete(
//     "/permissions/:userID/:machineryUID",
//     param("userID").isNumeric(),
//     param("machineryUID").notEmpty(),
//     jwtAuthentication.authenticateToken,
//     authorization.authorizeRequest,
//     controller.deleteUserPermissions
// )
//
// router.post(
//     "/permissions/insert",
//     jwtAuthentication.authenticateToken,
//     authorization.authorizeRequest,
//     controller.insertUserPermissions
// )

export default router