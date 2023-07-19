import axios from "../utils/AxiosInterceptor"

export default {
    getCompanyByPrincipal
}


async function getCompanyByPrincipal(){

    let response = await axios.get(
        "/company",
    )

    if(response.status===200){
        return response.data
    }

    throw response.data

}