import {MongoClient} from "mongodb"

require('dotenv').config({path: __dirname + "/./../.env"})

// Create a new MongoClient
const mongoClient = new MongoClient(
    "mongodb://localhost:27017/?maxPoolSize=20&w=majority"
);

export default mongoClient