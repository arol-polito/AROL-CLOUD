import express from "express"
import controller from "../controllers/PublicController"
import {query} from "express-validator";

const {body} = require("express-validator");

const router = express.Router()

router.post(
    "/login",
    body("email").isEmail(),
    body("password").notEmpty(),
    controller.login
)

router.post(
    "/logout",
    query("id").isNumeric(),
    query("token").notEmpty(),
    controller.logout
)

router.get(
    "/refreshtoken/",
    query("id").isNumeric(),
    query("token").notEmpty(),
    controller.refreshToken
)
router.get(
    "/status",
    controller.status
)

export default router