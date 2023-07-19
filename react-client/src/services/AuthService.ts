import axios from "../utils/AxiosInterceptor"
import UserDetails from "../authentication/interfaces/UserDetails";

interface UserCredentials{
    email: string
    password: string
}

interface SignupDetails {
    email: string,
    password: string,
    name: string,
    username: string,
    roles: string[],
    companyID: number | null,
}

async function register(signupDetails: SignupDetails) {
    let response = await axios.post("/public/signup", {
        ...signupDetails
    });

    if(response.status===200){
        return true
    }

    throw response.data

}

async function login(userCredentials: UserCredentials) : Promise<UserDetails>{

    let result = await axios.post("/public/login", {
            ...userCredentials
        })

    if(result.status===200){
        return result.data
    }

    throw result.data
}

async function logout(id: number, refreshToken: string) : Promise<boolean> {
    let result = await axios.get("/public/logout/?id="+id+"&token="+refreshToken)

    if(result.status===200){
        return true
    }

    throw result.data
}

async function refreshToken(id: number, refreshToken: string) : Promise<UserDetails> {
    let result = await axios.get("/public/refreshtoken/?id="+id+"&token="+refreshToken)

    if(result.status===200){
        return result.data
    }

    throw result.data
}

export default {
    register,
    login,
    refreshToken,
    logout
}