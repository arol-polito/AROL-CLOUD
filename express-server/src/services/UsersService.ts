import express from "express"
import jwt from "jsonwebtoken"
import userRepository from "../repositories/UserRepository";
import MachineryPermissions from "../entities/MachineryPermissions";

require('dotenv').config({path: __dirname + "/./../.env"})

const jwtSecret = process.env.JWT_SECRET_KEY!
const jwtExpiration = Number(process.env.JWT_EXPIRATION!)
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET_KEY!
const refreshTokenExpiration = Number(process.env.REFRESH_TOKEN_EXPIRATION!)

interface UserCredentials {
    email: string
    password: string
}

interface UserDetails {
    email: string,
    password: string,
    name: string,
    surname: string,
    roles: string[],
    companyID: number | null,
    permissions: UserPermissions
}

interface UserPermissions {
    [key: string]: {
        [key: string]: boolean
    }
}

interface AccountUpdateDetails {
    id: number,
    email: string,
    name: string,
    surname: string,
    roles: string[],
    active: boolean
}

interface PasswordResetDetails {
    id: number,
    password: string
}


async function login(req: express.Request, res: express.Response) {

    const userCredentials: UserCredentials = req.body

    const existingUser = await userRepository.authenticateAndGetUser(userCredentials!.email, userCredentials!.password)

    if (!existingUser) {
        console.log("non existing user")
        return res.status(403).json({
            msg: "Bad credentials"
        })
    }

    if (!existingUser.active) {
        console.log("user account disabled")
        return res.status(403).json({
            msg: "Account disabled"
        })
    }

    const refreshTokenExpiry = Date.now() + refreshTokenExpiration
    const refreshToken = jwt.sign(
        {
            id: existingUser.id,
            exp: refreshTokenExpiry
        },
        refreshTokenSecret
    );

    const refreshTokenInsertedInDB = await userRepository.insertRefreshToken(existingUser.id, refreshToken, refreshTokenExpiry)
    if (!refreshTokenInsertedInDB) {
        return res.status(500).json({
            msg: "Oops! Failed to create a refresh token, please ty again later"
        })
    }

    let jwtToken;
    const tokenExpiration = Math.floor(Date.now()) + jwtExpiration
    try {

        //Creating jwt token
        jwtToken = jwt.sign(
            {
                id: existingUser.id,
                companyID: existingUser.companyID ? existingUser.companyID : null,
                email: existingUser.email,
                name: existingUser.name,
                surname: existingUser.surname,
                roles: existingUser.roles,
                exp: tokenExpiration
            },
            jwtSecret
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            msg: "Oops! Failed to generate the JWT"
        })
    }

    const userPermissionsObject: UserPermissions = {}
    const userPermissionsArray = await userRepository.getAllUserPermissions(existingUser.id)
    if (!userPermissionsArray) {
        return res.status(500).json({
            msg: "Oops! Failed to get user permissions"
        })
    }
    userPermissionsArray.forEach((permissions) => {
        userPermissionsObject[permissions.machineryUID] = {
            dashboardsWrite: permissions.dashboardsWrite,
            dashboardsModify: permissions.dashboardsModify,
            dashboardsRead: permissions.dashboardsRead,
            documentsWrite: permissions.documentsWrite,
            documentsModify: permissions.documentsModify,
            documentsRead: permissions.documentsRead
        }
    })

    return res
        .status(200)
        .json({
            id: existingUser.id,
            companyID: existingUser.companyID ? existingUser.companyID : null,
            name: existingUser.name,
            surname: existingUser.surname,
            email: existingUser.email,
            roles: existingUser.roles,
            authToken: jwtToken,
            authTokenExpiration: tokenExpiration,
            refreshToken: refreshToken,
            refreshTokenExpiry: refreshTokenExpiry,
            permissions: userPermissionsObject
        });
}

async function logout(req: express.Request, res: express.Response) {

    const userID = parseInt(req.query.id as string)
    const token = req.query.token as string

    const result = await userRepository.getRefreshToken(
        userID,
        token
    )

    if (result) {
        await userRepository.deleteRefreshToken(result!.refreshToken)
        return res.sendStatus(200)
    }

    return res.sendStatus(200)

}

async function getCompanyUsers(req: express.Request, res: express.Response) {

    console.log(req.principal)

    if (!req.principal.companyID) {
        return res.status(400).json({
            msg: "Company ID cannot be null"
        })
    }

    const companyID: number = req.principal.companyID

    const companyUsers = await userRepository.getCompanyUsers(companyID)
    if (companyUsers) {
        return res.status(200).json(companyUsers)
    } else {
        return res.status(500).json({
            msg: "Oops! Failed to fetch company users"
        })
    }
}

async function updateAccountDetails(req: express.Request, res: express.Response) {

    if (!req.principal.companyID) {
        return res.status(400).json({
            msg: "Company ID cannot be null"
        })
    }

    //TODO: check role here

    const companyID: number = req.principal.companyID

    const newAccountDetails: AccountUpdateDetails = req.body

    const userToUpdate = await userRepository.getUserByID(newAccountDetails.id)
    if (!userToUpdate || userToUpdate.companyID !== companyID) {
        return res.sendStatus(403)
    }

    const updateResult = await userRepository.updateAccountDetails(newAccountDetails.id, newAccountDetails.email, newAccountDetails.name, newAccountDetails.surname, newAccountDetails.roles, newAccountDetails.active)
    if (updateResult) {
        return res.status(200).json(updateResult)
    } else {
        return res.status(500).json({
            msg: "Oops! Account update failed"
        })
    }
}

async function resetAccountPassword(req: express.Request, res: express.Response) {

    if (!req.principal.companyID) {
        return res.status(400).json({
            msg: "Company ID cannot be null"
        })
    }

    //TODO: verify role

    const companyID: number = req.principal.companyID

    const resetPasswordDetails: PasswordResetDetails = req.body

    const userToResetPassword = await userRepository.getUserByID(resetPasswordDetails.id)
    if (!userToResetPassword || userToResetPassword.companyID !== companyID) {
        return res.sendStatus(403)
    }

    const updateResult = await userRepository.resetAccountPassword(resetPasswordDetails.id, resetPasswordDetails.password)
    if (updateResult) {
        return res.status(200).json(updateResult)
    } else {
        return res.status(500).json({
            msg: "Oops! Password reset failed"
        })
    }
}

async function createAccount(req: express.Request, res: express.Response) {

    if (!req.principal.companyID) {
        return res.status(400).json({
            msg: "Company ID cannot be null"
        })
    }

    const companyID: number = req.principal.companyID

    const userDetails: UserDetails = req.body

    const createdBy: string = req.principal.id.toString()

    const result = await userRepository.createAccount(
        userDetails.email,
        userDetails.password,
        userDetails.name,
        userDetails.surname,
        userDetails.roles,
        createdBy,
        companyID
    )

    if (result) {
        return res.status(200).json(result)
    }

    return res.status(400).json({
        msg: "Bad registration data"
    })

}

async function getUserPermissionsForMachinery(req: express.Request, res: express.Response) {

    const userID: number = parseInt(req.params.userID.toString())
    const machineryUID: string = req.params.machineryUID.toString()


    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {
        if (!req.principal.companyID) {
            return res.status(400).json({
                msg: "Company ID cannot be null"
            })
        }

        const companyID: number = req.principal.companyID

        const userToResetPassword = await userRepository.getUserByID(userID)
        if (!userToResetPassword || userToResetPassword.companyID !== companyID) {
            return res.sendStatus(403)
        }
    }

    const result = await userRepository.getUserPermissionsForMachinery(userID, machineryUID)
    if (result !== undefined) {
        return res.status(200).json(result)
    }
    return res.status(500).json({
        msg: "Failed to find user permissions for machinery " + machineryUID
    })

}


async function getAllUserPermissions(req: express.Request, res: express.Response) {

    const userID: number = parseInt(req.params.userID.toString())

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {
        if (!req.principal.companyID) {
            return res.status(400).json({
                msg: "Company ID cannot be null"
            })
        }

        const companyID: number = req.principal.companyID

        const userToGetPermissions = await userRepository.getUserByID(userID)
        if (!userToGetPermissions || userToGetPermissions.companyID !== companyID) {
            return res.sendStatus(403)
        }
    }

    const result = await userRepository.getAllUserPermissions(userID)
    if (result) {
        return res.status(200).json(result)
    }
    return res.status(500).json({
        msg: "Failed to find user permissions"
    })

}


async function updateUserPermissions(req: express.Request, res: express.Response) {

    const userPermissions: MachineryPermissions = req.body
    const userID = req.principal.id

    if (!req.principal.roles.includes("COMPANY_ROLE_ADMIN")) {
        if (!req.principal.companyID) {
            return res.status(400).json({
                msg: "Company ID cannot be null"
            })
        }

        const companyID: number = req.principal.companyID

        const userToUpdatePermissions = await userRepository.getUserByID(userPermissions.userID)
        if (!userToUpdatePermissions || userToUpdatePermissions.companyID !== companyID) {
            return res.sendStatus(403)
        }
    }

    const result = await userRepository.updateUserPermissions(userID, req.principal.roles.includes("COMPANY_ROLE_ADMIN"), userPermissions)
    if (result) {
        return res.status(200).json(result)
    }
    return res.status(500).json({
        msg: "Failed to update user"
    })

}

async function refreshToken(req: express.Request, res: express.Response) {

    const userID = parseInt(req.query.id as string)
    const refToken = req.query.token as string

    const result = await userRepository.getRefreshToken(
        userID,
        refToken
    )


    if (!result) {
        return res.status(400).json({
            msg: "Invalid refresh token"
        })
    }

    const userDetails = await userRepository.getUserByID(userID)
    if (!userDetails) {
        return res.status(400).json({
            msg: "Invalid refresh token"
        })
    }
    if (!userDetails.active) {
        console.log("user account disabled")
        return res.status(403).json({
            msg: "Account disabled"
        })
    }

    try {
        jwt.verify(refToken, refreshTokenSecret, (err: any, claims: any) => {

            if (err) {
                console.log(err)
                throw err
            }

            if (claims.exp < Date.now()) {
                console.log("Invalid refresh token - token expired")
                throw "Invalid refresh token - token expired"
            }
        })
    } catch (e) {
        console.log(e)
        return res.status(401).json({msg: "Invalid refresh token"})
    }


    const refreshTokenExpiry = Date.now() + refreshTokenExpiration
    const refreshToken = jwt.sign(
        {
            id: userID,
            exp: refreshTokenExpiry
        },
        refreshTokenSecret
    );

    const refreshTokenInsertedInDB = await userRepository.insertRefreshToken(userID, refreshToken, refreshTokenExpiry)
    if (!refreshTokenInsertedInDB) {
        return res.status(500).json({
            msg: "Oops! Failed to create a refresh token, please ty again later"
        })
    }

    let newJwtToken;
    const tokenExpiration = Math.floor(Date.now()) + jwtExpiration
    try {
        //Creating jwt token
        newJwtToken = jwt.sign(
            {
                id: userDetails.id,
                companyID: userDetails.companyID ? userDetails.companyID : null,
                email: userDetails.email,
                name: userDetails.name,
                surname: userDetails.surname,
                roles: userDetails.roles,
                exp: tokenExpiration
            },
            jwtSecret
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            msg: "Oops! Failed to generate the JWT"
        })
    }

    const userPermissionsObject: UserPermissions = {}
    const userPermissionsArray = await userRepository.getAllUserPermissions(userDetails.id)
    if (!userPermissionsArray) {
        return res.status(500).json({
            msg: "Oops! Failed to get user permissions"
        })
    }
    userPermissionsArray.forEach((permissions) => {
        userPermissionsObject[permissions.machineryUID] = {
            dashboardsWrite: permissions.dashboardsWrite,
            dashboardsModify: permissions.dashboardsModify,
            dashboardsRead: permissions.dashboardsRead,
            documentsWrite: permissions.documentsWrite,
            documentsModify: permissions.documentsModify,
            documentsRead: permissions.documentsRead
        }
    })


    return res.status(200).json({
        id: userDetails.id,
        companyID: userDetails.companyID ? userDetails.companyID : null,
        email: userDetails.email,
        name: userDetails.name,
        surname: userDetails.surname,
        roles: userDetails.roles,
        refreshToken: refreshToken,
        refreshTokenExpiry: refreshTokenExpiry,
        authToken: newJwtToken,
        authTokenExpiration: tokenExpiration,
        permissions: userPermissionsObject
    })

}

export default {
    login,
    logout,
    getCompanyUsers,
    updateAccountDetails,
    resetAccountPassword,
    createAccount,
    getUserPermissionsForMachinery,
    getAllUserPermissions,
    updateUserPermissions,
    // deleteUserPermissions,
    // insertUserPermissions,
    refreshToken
}