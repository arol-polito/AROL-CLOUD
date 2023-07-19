// Create user
dbAdmin = db.getSiblingDB("admin");
dbAdmin.createUser({
  user: "",
  pwd: "",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }],
  mechanisms: ["SCRAM-SHA-1"],
});

// Authenticate user
dbAdmin.auth({
  user: "",
  pwd: "",
  mechanisms: ["SCRAM-SHA-1"],
  digestPassword: true,
});

// Create DB and collection
db = new Mongo().getDB("arol");
db.createCollection("dashboards", { capped: false });
db.createCollection("eqtq", { capped: false });
db.createCollection("ns", { capped: false });
db.createCollection("plc", { capped: false });
db.createCollection("drive", { capped: false });