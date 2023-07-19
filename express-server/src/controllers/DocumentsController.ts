import express from "express"
import documentsService from "../services/DocumentsService";
import {validationResult} from "express-validator";

const getDocument = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await documentsService.getDocument(req, res)
}

const getMachineryDocuments = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await documentsService.getMachineryDocuments(req, res)
}

const deleteMachineryDocuments = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await documentsService.deleteMachineryDocuments(req, res)
}

const createMachineryFolder = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await documentsService.createMachineryFolder(req, res)
}

const uploadMachineryDocuments = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await documentsService.uploadMachineryDocuments(req, res)
}

const renameMachineryFileOrFolder = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await documentsService.renameMachineryFileOrFolder(req, res)
}

export default {
    getDocument,
    getMachineryDocuments,
    deleteMachineryDocuments,
    createMachineryFolder,
    uploadMachineryDocuments,
    renameMachineryFileOrFolder
}