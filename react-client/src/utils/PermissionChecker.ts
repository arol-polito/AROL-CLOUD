import UserDetails from "../authentication/interfaces/UserDetails";

const ROLE_WORKER=1
const ROLE_MANAGER=2
const ROLE_ADMIN=3

function hasMachineryPermission(principal: UserDetails | null | undefined, machineryUID: string, requiredPermission: string){
    return principal && ((principal.permissions.hasOwnProperty(machineryUID) && principal.permissions[machineryUID][requiredPermission]) || isAdmin(principal))
}

function hasAnyMachineryAccess(principal: UserDetails | null | undefined){
    return principal && (Object.keys(principal.permissions).length>0 || isAdmin(principal))
}

function hasAnyDashboardAccess(principal: UserDetails | null | undefined){
    if(!principal) return false

    if(isAdmin(principal)) return true

    for(const permission of Object.values(principal.permissions)){
        if(permission["dashboardsRead"]) return true
    }
    return false
}

function hasAnyDocumentsAccess(principal: UserDetails | null | undefined){
    if(!principal) return false

    if(isAdmin(principal)) return true

    for(const permission of Object.values(principal.permissions)){
        if(permission["documentsRead"]) return true
    }
    return false
}

function hasSidebarItemAccess(principal: UserDetails | null, sidebarItemName: string){
    if(!principal) return false
    if(isAdmin(principal)) return true

    switch (sidebarItemName) {
        case "Home":{
            return true
        }
        case "Machineries": {
            return true
        }
        case "Dashboards": {
            return hasAnyDashboardAccess(principal)
        }
        case "Documents": {
            return hasAnyDocumentsAccess(principal)
        }
        case "Users management": {
            return isAdmin(principal)

        }
        case "Machinery permissions": {
            return isManagerOrAbove(principal)
        }
        default: {
            console.error("Unknown sidebar item name"+ sidebarItemName)
            return false
        }
    }

}

function getRoleRank(roles: string[] | undefined){
    if(!roles) return 0

    let maxRank = 0
    roles.forEach((role)=>{
        switch (role){
            case "COMPANY_ROLE_WORKER": {
                if(maxRank<1) maxRank=1
                break
            }
            case "COMPANY_ROLE_MANAGER": {
                if(maxRank<2) maxRank=2
                break
            }
            case "COMPANY_ROLE_ADMIN": {
                if(maxRank<3) maxRank=3
                break
            }
            default: {
                break
            }
        }
    })

    return maxRank

}

function isAdmin(principal: UserDetails | null | undefined){
    return principal && getRoleRank(principal.roles)===ROLE_ADMIN
}

function isManagerOrAbove(principal: UserDetails | null | undefined){
    return principal && getRoleRank(principal.roles)>=ROLE_MANAGER
}

export default {
    ROLE_WORKER,
    ROLE_MANAGER,
    ROLE_ADMIN,
    hasMachineryPermission,
    hasAnyMachineryAccess,
    hasSidebarItemAccess,
    hasAnyDashboardAccess,
    hasAnyDocumentsAccess,
    getRoleRank,
    isAdmin,
    isManagerOrAbove
}