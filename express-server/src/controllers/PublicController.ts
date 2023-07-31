import express from "express"
import usersService from "../services/UsersService"
import {validationResult} from "express-validator";

const login = (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return usersService.login(req, res)
}

const logout = (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return usersService.logout(req, res)
}

const refreshToken = (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors)

        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    return usersService.refreshToken(req, res)
}

const status = (req: express.Request, res: express.Response) => res.sendStatus(200)

export default {
    login,
    logout,
    refreshToken,
    status
}