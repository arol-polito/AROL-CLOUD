const pgp = require('pg-promise')()

require('dotenv').config()

const pgConnectString = "postgres://" + process.env.POSTGRES_USER + ":" + process.env.POSTGRES_PASSWORD + "@" + process.env.POSTGRES_HOST + ":5432/arol"

const pgClient = pgp(pgConnectString)


export default pgClient 