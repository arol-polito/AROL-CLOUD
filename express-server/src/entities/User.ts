export default class User {
    id: number
    email: string
    name: string
    surname: string
    roles: string[]
    active: boolean
    companyID: number | null
    createdAt: number
    createdBy: string

    constructor(
        id: number,
        email: string,
        name: string,
        surname: string,
        roles: string[],
        active: boolean,
        companyID: number | null,
        createdAt: number,
        createdBy: string
    ) {
        this.id = id
        this.email = email
        this.name = name
        this.surname = surname
        this.roles = roles
        this.active = active
        this.companyID = companyID
        this.createdAt = createdAt
        this.createdBy = createdBy
    }
}