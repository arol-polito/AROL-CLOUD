import express from "express"
import usersService from "../services/UsersService"
import {validationResult} from "express-validator";

const login = async (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await usersService.login(req, res)
}

const logout = async (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await usersService.logout(req, res)
}

const refreshToken = async (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await usersService.refreshToken(req, res)
}

const status = (req: express.Request, res: express.Response) => {
    return res.sendStatus(200)
}

export default {
    login,
    logout,
    refreshToken,
    status
}