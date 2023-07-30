import pgClient from "../configs/PgClient";
import User from "../entities/User";
import bcrypt from "bcrypt"
import RefreshToken from "../entities/RefreshToken";
import MachineryPermissions from "../entities/MachineryPermissions";

async function authenticateAndGetUser(email: string, password: string): Promise<User | null> {

    try {

        const result = await pgClient.oneOrNone("SELECT * FROM public.users WHERE email=$1", email)

        if (!result) {
            throw "User with email " + email + " not found"
        }

        const authenticationSuccess = await bcrypt.compare(password, result.password)

        if (!authenticationSuccess) {
            throw "Authentication failed: Passwords do not match"
        }

        return new User(
            result.id,
            result.email,
            result.name,
            result.surname,
            result.roles.split(","),
            result.active,
            result.company_id,
            result.created_at,
            result.created_by)

    } catch (e) {
        console.log(e)
        return null
    }
}

async function getUserByID(id: number) {
    try {

        const result = await pgClient.oneOrNone("SELECT * FROM public.users WHERE id=$1", id)

        return new User(
            result.id,
            result.email,
            result.name,
            result.surname,
            result.roles.split(","),
            result.active,
            result.company_id,
            result.created_at,
            result.created_by)

    } catch (e) {
        console.log(e)
        return null
    }
}

async function getCompanyUsers(companyID: number): Promise<User[] | null> {

    try {
        const result = await pgClient.manyOrNone(
            "SELECT * FROM public.users WHERE company_id=$1",
            companyID
        )

        if (result) {

            return result.map((row: any) => (
                new User(
                    row.id,
                    row.email,
                    row.name,
                    row.surname,
                    row.roles.split(","),
                    row.active,
                    row.company_id,
                    row.created_at,
                    row.created_by
                )
            ))
        }

        return []
    } catch (e) {
        console.log(e)
        return null
    }

}

async function createAccount(email: string, password: string, name: string, surname: string, roles: string[], createdBy: string, companyID: number): Promise<User | null> {

    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const insertResult = await pgClient.query(
            "INSERT INTO public.users(email, password, name, surname, roles, created_by, company_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [email, hashedPassword, name, surname, roles.join(","), createdBy, companyID]
        )

        return new User(
            insertResult[0].id,
            insertResult[0].email,
            insertResult[0].name,
            insertResult[0].surname,
            insertResult[0].roles.split(","),
            insertResult[0].active,
            insertResult[0].company_id,
            insertResult[0].created_at,
            insertResult[0].created_by
        )

    } catch (e) {
        console.log(e)
        return null
    }
}

async function updateAccountDetails(userID: number, email: string, name: string, surname: string, roles: string[], active: boolean): Promise<boolean> {

    try {
        await pgClient.query(
            "UPDATE public.users SET email = $2,  name=$3, surname=$4, roles=$5, active = $6 WHERE id=$1",
            [userID, email, name, surname, roles.join(","), active]
        )

        return true

    } catch (e) {
        console.log(e)
        return false
    }

}

async function resetAccountPassword(userID: number, newPassword: string): Promise<boolean> {

    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        const updateResult = await pgClient.query(
            "UPDATE public.users SET password = $1 WHERE id=$2 RETURNING *",
            [hashedPassword, userID]
        )

        if (!updateResult || updateResult.length === 0) {
            throw "File insertion in DB failed"
        }

        const deleteRefTokensResult = await pgClient.query(
            "DELETE FROM public.refresh_tokens WHERE user_id=$1",
            [userID]
        )

        return true

    } catch (e) {
        console.log(e)
        return false
    }

}

async function getUserPermissionsForMachinery(userID: number, machineryUID: string): Promise<MachineryPermissions | null | undefined> {

    try {

        const result = await pgClient.oneOrNone(
            "SELECT * FROM public.machinery_permissions WHERE user_id=$1 AND machinery_uid=$2",
            [userID, machineryUID]
        )

        if (result) {
            return new MachineryPermissions(
                result.user_id,
                result.machinery_uid,
                result.dashboards_write,
                result.dashboards_modify,
                result.dashboards_read,
                result.documents_write,
                result.documents_modify,
                result.documents_read,
            )
        }

        return null

    } catch (e) {
        console.log(e)
        return undefined
    }

}

async function getAllUserPermissions(userID: number): Promise<MachineryPermissions[] | null> {

    try {

        const result = await pgClient.manyOrNone(
            "SELECT * FROM public.machinery_permissions WHERE user_id=$1",
            userID
        )

        return result.map((row: any) => (
            new MachineryPermissions(
                row.user_id,
                row.machinery_uid,
                row.dashboards_write,
                row.dashboards_modify,
                row.dashboards_read,
                row.documents_write,
                row.documents_modify,
                row.documents_read
            )
        ))


    } catch (e) {
        console.log(e)
        return null
    }

}

async function updateUserPermissions(modifierUserID: number, isAdmin: boolean, machineryPermissions: MachineryPermissions) {
    try {
        //GET MODIFIER USER PERMISSIONS
        const modifierPermissions = await getUserPermissionsForMachinery(modifierUserID, machineryPermissions.machineryUID)

        if (!modifierPermissions) {
            throw "Could not get modifier permissions for machinery"
        }

        let numValueAdded = 0
        const params: any[] = []
        let query = "UPDATE public.machinery_permissions SET"
        if (modifierPermissions.dashboardsRead || isAdmin) {
            query += " dashboards_read=$" + (numValueAdded + 1)
            params.push(machineryPermissions.dashboardsRead)
            numValueAdded++
        } else {
            machineryPermissions.dashboardsRead = false
        }
        if (modifierPermissions.dashboardsModify || isAdmin) {
            if (numValueAdded) {
                query += " , "
            }
            query += "dashboards_modify=$" + (numValueAdded + 1)
            params.push(machineryPermissions.dashboardsModify)
            numValueAdded++
        } else {
            machineryPermissions.dashboardsModify = false
        }
        if (modifierPermissions.dashboardsWrite || isAdmin) {
            if (numValueAdded) {
                query += " , "
            }
            query += "dashboards_write=$" + (numValueAdded + 1)
            params.push(machineryPermissions.dashboardsWrite)
            numValueAdded++
        } else {
            machineryPermissions.dashboardsWrite = false
        }
        if (modifierPermissions.documentsRead || isAdmin) {
            if (numValueAdded) {
                query += " , "
            }
            query += "documents_read=$" + (numValueAdded + 1)
            params.push(machineryPermissions.documentsRead)
            numValueAdded++
        } else {
            machineryPermissions.documentsRead = false
        }
        if (modifierPermissions.documentsModify || isAdmin) {
            if (numValueAdded) {
                query += " , "
            }
            query += "documents_modify=$" + (numValueAdded + 1)
            params.push(machineryPermissions.documentsModify)
            numValueAdded++
        } else {
            machineryPermissions.documentsModify = false
        }
        if (modifierPermissions.documentsWrite || isAdmin) {
            if (numValueAdded) {
                query += " , "
            }
            query += "documents_write=$" + (numValueAdded + 1)
            params.push(machineryPermissions.documentsWrite)
            numValueAdded++
        } else {
            machineryPermissions.documentsWrite = false
        }

        //IF MODIFIER HAS NO PERMISSIONS OVER MACHINERY
        if (numValueAdded === 0) {
            return false
        }

        query += " WHERE machinery_uid=$" + (numValueAdded + 1) + " AND user_id=$" + (numValueAdded + 2) + " RETURNING *"
        params.push(machineryPermissions.machineryUID, machineryPermissions.userID)

        //GET CURRENT USER PERMISSIONS
        const userPermissionsExists = await getUserPermissionsForMachinery(machineryPermissions.userID, machineryPermissions.machineryUID)

        if (userPermissionsExists === undefined) {
            throw "Could not get user permission for machinery"
        }

        //UPDATE EXISTING USER PERMISSIONS
        if (userPermissionsExists) {
            const updateResult = await pgClient.query(
                query,
                params
            )

            if (
                updateResult &&
                updateResult.length &&
                updateResult[0].dashboards_read === false &&
                updateResult[0].dashboards_modify === false &&
                updateResult[0].dashboards_write === false &&
                updateResult[0].documents_read === false &&
                updateResult[0].documents_modify === false &&
                updateResult[0].documents_write === false
            ) {
                const deleteResult = await deleteUserPermissions(machineryPermissions.userID, machineryPermissions.machineryUID)
                if (deleteResult) {
                    return true
                }
                return false
            }

            return updateResult && updateResult.length > 0
        }
        //CREATE USER PERMISSIONS
        else {
            //IF NO PERMISSION IS SET TO TRUE
            if (
                !machineryPermissions.dashboardsRead &&
                !machineryPermissions.dashboardsModify &&
                !machineryPermissions.dashboardsWrite &&
                !machineryPermissions.documentsRead &&
                !machineryPermissions.documentsModify &&
                !machineryPermissions.documentsWrite
            ) {
                return true
            }

            const insertResult = await pgClient.query(
                "INSERT INTO public.machinery_permissions(user_id, machinery_uid, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
                [
                    machineryPermissions.userID,
                    machineryPermissions.machineryUID,
                    machineryPermissions.dashboardsWrite,
                    machineryPermissions.dashboardsModify,
                    machineryPermissions.dashboardsRead,
                    machineryPermissions.documentsWrite,
                    machineryPermissions.documentsModify,
                    machineryPermissions.documentsRead
                ]
            )

            return insertResult && insertResult.length > 0;
        }


    } catch (e) {
        console.log(e)
        return false
    }
}

async function deleteUserPermissions(userID: number, machineryUID: string) {

    try {
        const result = await pgClient.result(
            "DELETE FROM public.machinery_permissions WHERE user_id=$1 AND machinery_uid=$2",
            [userID, machineryUID]
        )

        if (result.rowCount > 0) {
            return true
        }

        return false
    } catch (e) {
        console.log(e)
        return undefined
    }

}

// async function insertUserPermissions(machineryPermissions: MachineryPermissions): Promise<MachineryPermissions | null> {
//
//     try {
//         let insertResult = await pgClient.query(
//             "INSERT INTO public.machinery_permissions(user_id, machinery_uid, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
//             [machineryPermissions.userID, machineryPermissions.machineryUID, machineryPermissions.dashboardsWrite, machineryPermissions.dashboardsModify, machineryPermissions.dashboardsRead, machineryPermissions.documentsWrite, machineryPermissions.documentsModify, machineryPermissions.dashboardsRead]
//         )
//
//         return new MachineryPermissions(
//             insertResult.user_id,
//             insertResult.machinery_uid,
//             insertResult.dashboards_write,
//             insertResult.dashboards_modify,
//             insertResult.dashboards_read,
//             insertResult.documents_write,
//             insertResult.documents_modify,
//             insertResult.documents_read
//         )
//
//     } catch (e) {
//         console.log(e)
//         return null
//     }
//
// }

async function insertRefreshToken(userID: number, refreshToken: string, expiration: number): Promise<RefreshToken | null> {

    try {
        const insertResult = await pgClient.query(
            "INSERT INTO public.refresh_tokens(user_id, refresh_token, expiration) VALUES ($1, $2, $3) RETURNING *",
            [userID, refreshToken, expiration]
        )

        return new RefreshToken(
            insertResult[0].user_id,
            insertResult[0].refresh_token,
            insertResult[0].expiration
        )

    } catch (e) {
        console.log(e)
        return null
    }

}

async function getRefreshToken(userID: number, refreshToken: string): Promise<RefreshToken | null> {

    try {
        const result = await pgClient.oneOrNone(
            "SELECT * FROM public.refresh_tokens WHERE user_id=$1 AND refresh_token=$2",
            [userID, refreshToken]
        )

        if (result) {
            return new RefreshToken(
                result.user_id,
                result.refresh_token,
                result.expiration
            )
        }
        throw "Refresh token not found in getRefreshToken"

    } catch (e) {
        console.log(e)
        return null
    }

}

async function deleteRefreshToken(token: string): Promise<boolean> {

    try {
        const result = await pgClient.result(
            "DELETE FROM public.refresh_tokens WHERE refresh_token=$1",
            [token]
        )

        if (result.rowCount > 0) {
            return true
        }
        throw "Refresh token not found in deleteRefreshToken"

    } catch (e) {
        console.log(e)
        return false
    }

}

export default {
    authenticateAndGetUser,
    getUserByID,
    getCompanyUsers,
    updateAccountDetails,
    resetAccountPassword,
    createAccount,
    getUserPermissionsForMachinery,
    getAllUserPermissions,
    updateUserPermissions,
    // insertUserPermissions,
    insertRefreshToken,
    getRefreshToken,
    deleteRefreshToken
}