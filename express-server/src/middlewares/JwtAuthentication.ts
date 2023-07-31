import express from "express"
import jwt from "jsonwebtoken"

require('dotenv').config({path: `${__dirname}/./../.env`})

const jwtSecret = process.env.JWT_SECRET_KEY!

/* eslint-disable */
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {

    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.status(401).send({msg: "Authorization header missing"})

    try {
        jwt.verify(token, jwtSecret, (err: any, user: any) => {

            if (err) {
                console.error(err)

                return res.status(401).send({msg: "The provided JWT is invalid"})
            }

            if (user.exp < Date.now()) {
                console.error("The provided JWT is invalid")
                throw "The provided JWT is invalid"
            }

            if (!bodyIsCorrect(user)) {
                console.error("The provided JWT is malformed")
                throw "The provided JWT is malformed"
            }

            req.principal = user

            return next();

        })
    } catch (e) {
        console.error(e)

        return res.status(401).send({msg: e})
    }
}

/* eslint-enable */

const bodyIsCorrect = (user: any): boolean => !isNaN(parseInt(user.id)) &&
    (user.companyID === null || !isNaN(user.companyID)) &&
    typeof user.email === "string" &&
    Array.isArray(user.roles) &&
    typeof user.iat === "number" &&
    typeof user.exp === "number";

export default {
    authenticateToken
}