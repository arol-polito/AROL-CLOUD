import express from "express"
import documentsService from "../services/DocumentsService";
import {validationResult} from "express-validator";

const getDocument =  (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)
        
return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return  documentsService.getDocument(req, res)
}

const getMachineryDocuments =  (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)
        
return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return  documentsService.getMachineryDocuments(req, res)
}

const deleteMachineryDocuments =  (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)
        
return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return documentsService.deleteMachineryDocuments(req, res)
}

const createMachineryFolder =  (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)
        
return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return documentsService.createMachineryFolder(req, res)
}

const uploadMachineryDocuments =  (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)
        
return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return documentsService.uploadMachineryDocuments(req, res)
}

const renameMachineryFileOrFolder =  (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)
        
return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return documentsService.renameMachineryFileOrFolder(req, res)
}

export default {
    getDocument,
    getMachineryDocuments,
    deleteMachineryDocuments,
    createMachineryFolder,
    uploadMachineryDocuments,
    renameMachineryFileOrFolder
}