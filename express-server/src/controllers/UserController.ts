import express from "express";
import {validationResult} from "express-validator";
import usersService from "../services/UsersService";

const getCompanyUsers = async (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await usersService.getCompanyUsers(req, res)
}

const updateAccountDetails = async (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await usersService.updateAccountDetails(req, res)
}

const resetAccountPassword = async (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await usersService.resetAccountPassword(req, res)
}

const createAccount = async (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await usersService.createAccount(req, res)
}

const getUserPermissionsForMachinery = async (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await usersService.getUserPermissionsForMachinery(req, res)
}

const getAllUserPermissions = async (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await usersService.getAllUserPermissions(req, res)
}

const updateUserPermissions = async (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await usersService.updateUserPermissions(req, res)
}

// const deleteUserPermissions = async (req: express.Request, res: express.Response) => {
//
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         console.log(errors)
//         return res.status(400).json({
//             msg: "Bad request body"
//         });
//     }
//
//     await usersService.deleteUserPermissions(req, res)
// }
//
// const insertUserPermissions = async (req: express.Request, res: express.Response) => {
//
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         console.log(errors)
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