#!/bin/bash

echo "########### Loading data to Mongo DB ###########"
mongoimport --jsonArray --db arol --collection drive --file /tmp/data/MongoDataDRIVE.json
mongoimport --jsonArray --db arol --collection eqtq --file /tmp/data/MongoDataEQTQ.json
mongoimport --jsonArray --db arol --collection ns --file /tmp/data/MongoDataNS.json
mongoimport --jsonArray --db arol --collection plc --file /tmp/data/MongoDataPLC.json
