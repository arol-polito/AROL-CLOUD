const pgp = require('pg-promise')()

require('dotenv').config()

const pgConnectString = `postgres://${  process.env.POSTGRES_USER  }:${  process.env.POSTGRES_PASSWORD  }@${  process.env.POSTGRES_HOST  }:${  process.env.POSTGRES_PORT  }/arol`

const pgClient = pgp(pgConnectString)


export default pgClient 