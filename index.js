const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const knex = require("knex");
const process = require("process");
const _ = require("lodash");
const doctorsDBfile = require("./other/doctors-db.json");
const servicesDBfile = require("./other/services-db.json");
const locationsDBfile = require("./other/locations-db.json");
const locationsServicesDBFile = require("./other/locations-services-db.json");
const doctorsServiceDBFile = require("./other/doctors-service-db.json");
const serviceResponsibleDBFile = require("./other/service-responsable-db.json");
const whoWeAreDBFile = require("./other/who-we-are.json");
let serverPort = process.env.PORT || 5000;
let renewDatabase = true; // used to debug
let jcdb;


app.set("port", serverPort);
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// create the database
function init_jcdb() {
  return new Promise(function(resolve) {
      if (process.env.TEST) {
          jcdb = knex({
              client: "sqlite3",
              debug: false,
              connection: {
                  filename: "./joy_clinic_db.sqlite"
              },
              useNullAsDefault: true
          });
          resolve();
      } else {
          jcdb = knex({
              debug: false,
              client: "pg",
              connection: process.env.DATABASE_URL,
              ssl: true
          });
          resolve();
      }
  })
}

// general function to create a table given its name, json file, and a function to read data from the json file
function createTable(tableName, DBFile, readDBFile) {
    return new Promise(function(resolve, reject) {
        dropTableIfRenewSet(tableName)
            .then(function() {
                jcdb.schema.hasTable(tableName)
                    .then(function(exists) {
                        if (!exists) {
                            jcdb.schema.createTable(tableName, readDBFile)
                                .then(function() {
                                    return Promise.all(
                                        _.map(DBFile, function(v) {
                                            return jcdb(tableName).insert(v);
                                        })
                                    )
                                }).then(resolve());
                        }
                        else {
                            resolve();
                        }
                    });
            }).catch(function(err) {
            reject(err);
        });
    });
}

// drops the table if renewDatabase == true
function dropTableIfRenewSet(tableName) {
    return new Promise(function(resolve, reject) {
        if (renewDatabase) {
            jcdb.schema.hasTable(tableName)
                .then(function(exists) {
                    if (exists) {
                        jcdb.schema.dropTable(tableName)
                            .then(resolve);
                    }
                    else {
                        resolve();
                    }
                }).catch(function(error) {
                    reject(error);
            });
        }
        else {
            resolve();
        }
    });
}


// create tables in the database

function createDoctorsTable() {
    return createTable("doctors", doctorsDBfile, function(table) {
        table.integer("id").primary().notNullable();
        table.string("name").notNullable();
        table.string("surname").notNullable();
        table.text("presentation");
        table.text("professional_story");
        table.string("photo");
        table.string("mail");
        table.string("phone");
        table.string("location");
    });
}

function createServicesTable() {
    return createTable("services", servicesDBfile, function(table) {
        table.integer("id").primary().notNullable();
        table.string("name");
        table.text("presentation");
        table.text("description");
    });
}

function createLocationsTable() {
    return createTable("locations", locationsDBfile, function(table) {
        table.integer("id").primary().notNullable();
        table.string("name").notNullable();
        table.string("phone").notNullable();
        table.integer("cap").notNullable();
        table.string("address").notNullable();
        table.text("presentation");
        table.string("photo1");
        table.string("photo2");
        table.string("photo3");
        table.string("photo4");
        table.string("info");
        table.float("lat");
        table.float("lng");
    });
}

function createLocationsServicesTable() {
    return createTable("locations-services", locationsServicesDBFile, function(table) {
        table.integer("location_id").primary().notNullable();
        table.string("service_ids").notNullable(); // sqlite3 does not have arrays, so i used a string in this field
    });
}

function createDoctorsServiceTable() {
    return createTable("doctors-service", doctorsServiceDBFile, function(table) {
        table.integer("doctor_id").primary().notNullable();
        table.integer("service_id").notNullable();
    });
}

function createServiceResponsibleTable() {
    return createTable("service-responsable", serviceResponsibleDBFile, function(table) {
        table.integer("service_id").primary().notNullable();
        table.integer("doctor_id").notNullable();
    });
}

function createWhoWeAreTable() {
    return createTable("whoweare", whoWeAreDBFile, function(table) {
        table.text("whoweare");
        table.text("story");
    });
}


// REST entry points

// function to get all data from a table given its name
function getData(req, res, tableName) {
    jcdb(tableName)
        .then(function(query) {
            res.send(query);
        });
}

// generic function to get information about a specific field in DB given its table name and field name to query
function getDataById(req, res, tableName, fieldName) {
    if (isNaN(req.params.id)) {
        res.status(400).json({error: "id is not a number"});
    }
    else {
        let id = parseInt(req.params.id);
        jcdb(tableName).where(fieldName, id)
            .then(function(query) {
                if (query[0] === undefined || query[0] === null) {
                    res.status(404).send();
                }
                else {
                    res.send(query[0]);
                }
            })
    }
}



// returns the details of all doctors
app.get("/doctors", function(req, res) {
    getData(req, res, "doctors");
});

// returns the details of a certain doctor
app.get("/doctor/:id", function(req, res) {
    getDataById(req, res, "doctors", "id");
});

// returns the details of all services
app.get("/services", function(req, res) {
    getData(req, res, "services");
});

// returns the details of a certain service
app.get("/service/:id", function(req, res) {
    getDataById(req, res, "services", "id");
});

// returns the details of all locations
app.get("/locations", function(req, res) {
    getData(req, res, "locations");
});

// returns the details of a certain location
app.get("/location/:id", function(req, res) {
    getDataById(req, res, "locations", "id");
});

// returns all services available in a certain location
app.get("/servicesoflocation/:id", function(req, res) {
    getDataById(req, res, "locations-services", "location_id");
});

// returns the entire table that links locations and services
app.get("/servicesoflocation", function(req, res) {
    getData(req, res, "locations-services");
});

// returns the service a certain doctor operates
app.get("/doctorservice/:id", function(req, res) {
    getDataById(req, res, "doctors-service", "doctor_id");
});

// returns all doctors operating for a certain service
app.get("/servicedoctors/:id", function(req, res) {
    getDataById(req, res, "doctors-service", "service_id");
});

// returns the responsible of a certain service
app.get("/serviceresponsable/:id", function(req, res) {
    getDataById(req, res, "service-responsable", "service_id");
});

// returns info for the "who we are" page
app.get("/whoweare", function(req, res) {
    getData(req, res, "whoweare");
});

// error page redirection
app.use(function(req, res) {
    res.writeHead(302, {
        "Location": "/pages/error.html"
    });
    res.end();
});


// start the server
init_jcdb()
    .then(createDoctorsTable)
    .then(createServicesTable)
    .then(createLocationsTable)
    .then(createLocationsServicesTable)
    .then(createDoctorsServiceTable)
    .then(createServiceResponsibleTable)
    .then(createWhoWeAreTable)
    .then(function() {
        app.listen(serverPort, function() {
            console.log(`Server is listening on port ${serverPort}`);
        });
    })
    .catch(function(error) {
        console.log("Cannot start server");
        console.log(error);
    });
