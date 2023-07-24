import {MongoClient} from "mongodb"

require('dotenv').config({path: __dirname + "/./../.env"})

// Create a new MongoClient
const mongoClient = new MongoClient(
    "mongodb://" + process.env.MONGODB_HOST + ":" + process.env.MONGODB_PORT + "/?maxPoolSize=20&w=majority"
);

export default mongoClient