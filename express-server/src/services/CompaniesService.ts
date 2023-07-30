import express from "express";
import companyRepository from "../repositories/CompanyRepository";

async function getCompanyByPrincipal(req: express.Request, res: express.Response) {

    const companyID = req.principal.companyID
    if (!companyID) {
        return res.status(404).json({
            msg: "User is system user and has no company associated"
        })
    }

    const result = await companyRepository.getCompanyByID(companyID)
    if (result) {
        return res.status(200).json(result)
    }
    return res.status(404).json()
}

export default {
    getCompanyByPrincipal
}