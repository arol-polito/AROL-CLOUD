import express from "express"
import jwtAuthentication from "../middlewares/JwtAuthentication";
import controller from "../controllers/DocumentsController"
import {query} from "express-validator";

const multer = require("multer");
const upload = multer({dest: "uploads/"});

const {body} = require("express-validator");

const router = express.Router()

router.get(
    "/",
    query("machineryUID").notEmpty(),
    jwtAuthentication.authenticateToken,
    controller.getMachineryDocuments
)

router.get(
    "/document/",
    query("machineryUID").notEmpty(),
    query("documentUID").notEmpty(),
    jwtAuthentication.authenticateToken,
    controller.getDocument
)

router.post(
    "/rename/",
    query("machineryUID").notEmpty(),
    body("oldFileID").exists().notEmpty(),
    body("documentUID").exists().notEmpty(),
    body("newFileName").exists().notEmpty(),
    body("type").exists().notEmpty(),
    jwtAuthentication.authenticateToken,
    controller.renameMachineryFileOrFolder
)

router.put(
    "/folder/",
    query("machineryUID").notEmpty(),
    body("folderPath").exists().notEmpty(),
    jwtAuthentication.authenticateToken,
    controller.createMachineryFolder
)

router.put(
    "/files/",
    query("machineryUID").notEmpty(),
    //body("parentFolderPath").exists().notEmpty(),
    jwtAuthentication.authenticateToken,
    upload.array("files"),
    controller.uploadMachineryDocuments
)

router.delete(
    "/",
    query("machineryUID").notEmpty(),
    body("documentsList").exists(),
    jwtAuthentication.authenticateToken,
    controller.deleteMachineryDocuments
)

export default router