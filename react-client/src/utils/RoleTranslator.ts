import UserDetails from "../authentication/interfaces/UserDetails";

const rolesTranslation = [
    {value: "COMPANY_ROLE_WORKER", displayName: "Worker role"},
    {value: "COMPANY_ROLE_MANAGER", displayName: "Manager role"},
    {value: "COMPANY_ROLE_ADMIN", displayName: "Administrator role"},
]

const shortRolesTranslation = [
    {value: "COMPANY_ROLE_WORKER", displayName: "Worker"},
    {value: "COMPANY_ROLE_MANAGER", displayName: "Manager"},
    {value: "COMPANY_ROLE_ADMIN", displayName: "Administrator"},
]


//GET TRANSLATED (human readable) ROLE
function translateRoles(roles: string[]) {
    let translatedRoles: string[] = []
    roles.forEach((role) => {
        let translationFound = rolesTranslation.find((roleTranslation) => (roleTranslation.value === role))
        if (translationFound) {
            translatedRoles.push(translationFound.displayName)
        } else {
            translatedRoles.push("Unknown role")
        }
    })
    return translatedRoles.join(", ")
}

//GET TRANSLATED (human readable) ROLE
function translateRolesForNavbar(principal: UserDetails | null | undefined) {
    if(!principal) return "Unknown role"

    let translatedRoles: string[] = []
    principal.roles.forEach((role) => {
        let translationFound = shortRolesTranslation.find((roleTranslation) => (roleTranslation.value === role))
        if (translationFound) {
            translatedRoles.push(translationFound.displayName)
        } else {
            translatedRoles.push("Unknown role")
        }
    })
    return translatedRoles.join(", ")
}

export default {
    translateRoles,
    translateRolesForNavbar
}