import pgClient from "../configs/PgClient";
import Company from "../entities/Company";

async function getCompanyByID(companyID: number): Promise<Company | null> {

    try {
        const result = await pgClient.oneOrNone(
            "SELECT * FROM public.companies_catalogue WHERE id=$1",
            companyID
        )

        if (result) 
            return new Company(
                result.id,
                result.name,
            )
        
        
return null
    } catch (e) {
        return null
    }

}

export default {
    getCompanyByID
}