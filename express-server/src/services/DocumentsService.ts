import express from "express";
import machineryRepository from "../repositories/MachineryRepository";
import documentsRepository from "../repositories/DocumentsRepository";
import userRepository from "../repositories/UserRepository";

interface RenameFileDetails {
    oldFileID: string,
    documentUID: string,
    newFileName: string,
    type: string
}

async function getDocument(req: express.Request, res: express.Response) {

    let machineryUID = req.query.machineryUID as string
    let documentUID = req.query.documentUID as string

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {

        let userPermissions = await userRepository.getUserPermissionsForMachinery(req.principal.id, machineryUID)
        if (!userPermissions || !userPermissions.documentsRead) {
            return res.sendStatus(403)
        }
    }

    if (!(await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, req.principal.companyID))) {
        return res.status(403).json({
            msg: "Machinery not owned"
        })
    }

    let result = await documentsRepository.getDocument(machineryUID, documentUID)
    if (result) {
        return res.contentType("application/pdf").status(200).send(result)
    }
    return res.status(404).json()
}

async function getMachineryDocuments(req: express.Request, res: express.Response) {

    let companyID = req.principal.companyID
    if (!companyID) {
        return res.status(404).json({
            msg: "User is system user and has no company associated"
        })
    }


    let machineryUID = req.query.machineryUID as string

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {

        let userPermissions = await userRepository.getUserPermissionsForMachinery(req.principal.id, machineryUID)
        if (!userPermissions || !userPermissions.documentsRead) {
            return res.sendStatus(403)
        }
    }

    if (!(await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, req.principal.companyID))) {
        return res.status(403).json({
            msg: "Machinery not owned"
        })
    }

    let result = await documentsRepository.getMachineryDocuments(machineryUID)
    if (result) {
        return res.status(200).json(result)
    }
    return res.status(404).json()
}

async function deleteMachineryDocuments(req: express.Request, res: express.Response) {

    let companyID = req.principal.companyID
    if (!companyID) {
        return res.status(404).json({
            msg: "User is system user and has no company associated"
        })
    }

    let machineryUID = req.query.machineryUID as string
    let documentsList = req.body.documentsList

    for (const document of documentsList) {
        if (!document.id.startsWith("\\" + machineryUID)) {
            return res.status(400).json({
                msg: "Bad file path"
            })
        }
    }

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {

        let userPermissions = await userRepository.getUserPermissionsForMachinery(req.principal.id, machineryUID)
        if (!userPermissions || !userPermissions.documentsWrite) {
            return res.sendStatus(403)
        }
    }

    if (!(await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, req.principal.companyID))) {
        return res.status(403).json({
            msg: "Machinery not owned"
        })
    }

    let result = await documentsRepository.deleteMachineryDocuments(machineryUID, documentsList)
    if (result !== null) {
        return res.status(200).json(result)
    }
    return res.status(500).json()
}

async function createMachineryFolder(req: express.Request, res: express.Response) {

    let machineryUID = req.query.machineryUID as string

    let companyID = req.principal.companyID
    if (!companyID) {
        return res.status(404).json({
            msg: "User is system user and has no company associated"
        })
    }

    let folderPath = req.body.folderPath

    if (!folderPath.startsWith("\\" + machineryUID)) {
        return res.status(400).json({
            msg: "Bad folder path"
        })
    }

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {

        let userPermissions = await userRepository.getUserPermissionsForMachinery(req.principal.id, machineryUID)
        if (!userPermissions || !userPermissions.documentsWrite) {
            return res.sendStatus(403)
        }
    }

    if (!(await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, req.principal.companyID))) {
        return res.status(403).json({
            msg: "Machinery not owned"
        })
    }

    let result = await documentsRepository.createMachineryFolder(folderPath, machineryUID, req.principal.id)

    if (result !== null) {
        return res.status(200).json(result)
    }
    return res.status(500).json()
}

async function uploadMachineryDocuments(req: express.Request, res: express.Response) {

    let machineryUID = req.query.machineryUID as string

    let companyID = req.principal.companyID
    if (!companyID) {
        return res.status(404).json({
            msg: "User is system user and has no company associated"
        })
    }

    let userID = req.principal.id
    if (!userID) {
        return res.status(404).json({
            msg: "User has no ID"
        })
    }

    let parentFolderPath = req.body.parentFolderPath
    let files = req.files as Express.Multer.File[]

    console.log(parentFolderPath)
    if (!parentFolderPath.startsWith("\\" + machineryUID)) {
        return res.status(400).json({
            msg: "Bad parent folder path"
        })
    }

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {

        let userPermissions = await userRepository.getUserPermissionsForMachinery(req.principal.id, machineryUID)
        if (!userPermissions || !userPermissions.documentsWrite) {
            return res.sendStatus(403)
        }
    }

    if (!(await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, req.principal.companyID))) {
        return res.status(403).json({
            msg: "Machinery not owned"
        })
    }

    let result = await documentsRepository.uploadMachineryDocuments(userID, machineryUID, parentFolderPath, files)

    if (result !== null) {
        return res.status(200).json(result)
    }
    return res.status(500).json()
}

async function renameMachineryFileOrFolder(req: express.Request, res: express.Response) {

    let machineryUID = req.query.machineryUID as string
    let renameDetails = req.body as RenameFileDetails

    let companyID = req.principal.companyID
    if (!companyID) {
        return res.status(404).json({
            msg: "User is system user and has no company associated"
        })
    }

    if (!renameDetails.oldFileID.startsWith("\\" + machineryUID)) {
        return res.status(400).json({
            msg: "Bad file path"
        })
    }

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {
        let userPermissions = await userRepository.getUserPermissionsForMachinery(req.principal.id, machineryUID)
        if (!userPermissions || !userPermissions.documentsModify) {
            return res.sendStatus(403)
        }
    }

    if (!(await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, req.principal.companyID))) {
        return res.status(403).json({
            msg: "Machinery not owned"
        })
    }

    let result = await documentsRepository.renameFileOrFolder(renameDetails.oldFileID, renameDetails.documentUID, renameDetails.newFileName, renameDetails.type, machineryUID)

    if (result !== null) {
        return res.status(200).json(result)
    }
    return res.status(500).json()
}

export default {
    getDocument,
    getMachineryDocuments,
    deleteMachineryDocuments,
    createMachineryFolder,
    uploadMachineryDocuments,
    renameMachineryFileOrFolder
}