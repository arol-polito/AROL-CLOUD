export default class RefreshToken {
    userID: number
    refreshToken: string
    expiration: number

    constructor(userID: number, refreshToken: string, expiration: number) {
        this.userID = userID
        this.refreshToken = refreshToken
        this.expiration = expiration
    }
}