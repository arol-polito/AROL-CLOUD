import express from "express";

require('dotenv').config({path: `${__dirname  }/./../.env`})

const CMP_ADMIN = "COMPANY_ROLE_ADMIN"
const CMP_MGR = "COMPANY_ROLE_MANAGER"

function authorizeRequest(req: express.Request, res: express.Response, next: express.NextFunction) {

    if (req.baseUrl.startsWith("/users")) {
        if (req.url.startsWith("/company") && !req.principal.roles.some((role) => ([CMP_MGR, CMP_ADMIN].includes(role)))) 
            return res.sendStatus(403)
        
        if (req.url.startsWith("/create") && !req.principal.roles.some((role) => ([CMP_MGR, CMP_ADMIN].includes(role)))) 
            return res.sendStatus(403)
        
        if (req.url.startsWith("/details/update") && !req.principal.roles.some((role) => ([CMP_ADMIN].includes(role)))) 
            return res.sendStatus(403)
        
        if (req.url.startsWith("/permissions") && !req.principal.roles.some((role) => ([CMP_MGR, CMP_ADMIN].includes(role)))) 
            return res.sendStatus(403)
        
    }

    return next()

}

export default {
    authorizeRequest
}