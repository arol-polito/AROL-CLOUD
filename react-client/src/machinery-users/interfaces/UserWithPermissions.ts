import User from "../../users/interfaces/User";
import MachineryPermissions from "./MachineryPermissions";

export default interface UserWithPermissions{
    user: User
    permissions: MachineryPermissions[]
    active: boolean
}