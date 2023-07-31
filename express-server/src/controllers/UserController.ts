import express from "express";
import {validationResult} from "express-validator";
import usersService from "../services/UsersService";

const getCompanyUsers =  (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return usersService.getCompanyUsers(req, res)
}

const updateAccountDetails =  (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return usersService.updateAccountDetails(req, res)
}

const resetAccountPassword =  (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return usersService.resetAccountPassword(req, res)
}

const createAccount =  (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return usersService.createAccount(req, res)
}

const getUserPermissionsForMachinery =  (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return usersService.getUserPermissionsForMachinery(req, res)
}

const getAllUserPermissions =  (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return usersService.getAllUserPermissions(req, res)
}

const updateUserPermissions =  (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return usersService.updateUserPermissions(req, res)
}

// const deleteUserPermissions =  (req: express.Request, res: express.Response) => {
//
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         console.error(errors)
//         return res.status(400).json({
//             msg: "Bad request body"
//         });
//     }
//
//     await usersService.deleteUserPermissions(req, res)
// }
//
// const insertUserPermissions =  (req: express.Request, res: express.Response) => {
//
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         console.error(errors)
//         return res.status(400).json({
//             msg: "Bad request body"
//         });
//     }
//
//     await usersService.insertUserPermissions(req, res)
// }

export default {
    getCompanyUsers,
    updateAccountDetails,
    resetAccountPassword,
    createAccount,
    getUserPermissionsForMachinery,
    getAllUserPermissions,
    updateUserPermissions,
    // deleteUserPermissions,
    // insertUserPermissions
}