import express from "express"
import companiesService from "../services/CompaniesService";
import {validationResult} from "express-validator";

const getCompanyByPrincipal = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            msg: "Bad request body"
        });
    }

    await companiesService.getCompanyByPrincipal(req, res)
}

export default {
    getCompanyByPrincipal,
}