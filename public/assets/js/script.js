$(document).ready(function() {

    // get the page name and query parameters, form the orientation info and fill the page
    let currentPage = "";
    let searchParams = "";

    if ((window.location.pathname).match("/pages/")) {
        currentPage = (window.location + "").split("/pages/")[1].split(".html")[0]; // the page
    }
    if (window.location.search !== "") {
        searchParams = window.location.search.split("?"); // the query parameters
    }

    // to form the orientation info
    linkOrientation(currentPage);

    switch (currentPage) {
        case "doctors":
            fillAllDoctorsPage()
                .catch(function(err) {
                    printError(err);
                });
            break;
        case "doctor":
            fillDoctorPage(searchParams)
                .catch(function(err) {
                    printError(err);
                });
            break;
        case "services":
            fillAllServicesPage()
                .catch(function(err) {
                    printError(err);
                });
            break;
        case "service":
            fillServicePage(searchParams)
                .catch(function(err) {
                    printError(err);
                });
            break;
        case "servicedescription":
            fillServiceDescriptionPage(searchParams)
                .catch(function(err) {
                    printError(err);
                });
            break;
        case "locations":
            fillAllLocationsPage()
                .catch(function(err) {
                    printError(err);
                });
            break;
        case "location":
            fillLocationPage(searchParams)
                .catch(function(err) {
                    printError(err);
                });
            break;
        case "locationinfo":
            fillLocationInfoPage(searchParams)
                .catch(function(err) {
                    printError(err);
                });
            break;
        case "whoweare":
            fillWhoWeArePage()
                .catch(function(err) {
                    printError(err);
                });
            break;
    }

});

// on general pages (doctorS, locationS, etc.) the href set here is not visible
// it is only on the specific page (i.e. doctor, location, etc), filled with the element's name
function linkOrientation(currentPage) {
    let link = $('#link-orientation');
    formOrientationInfoElement(currentPage, window.location.href)
        .then(function(el) {
            link.attr("href", el[0].pagelink);
            link.append(el[0].pagename);
        })
}

// makes a query if needed and returns formatted data
function formOrientationInfoElement(page, pageLink) {
    return new Promise(function(resolve, reject) {
        if (page === "") {
            reject(); // don't add home page
        }
        let id;
        new Promise(function(resolve) {
            switch(page) {
                case "doctor":
                    id = pageLink.split("id=")[1];
                    getDoctorById(id)
                        .then(function(doctor) {
                            resolve(doctor.name + " " + doctor.surname);
                        });
                    break;
                case "service":
                    id = pageLink.split("id=")[1];
                    getServiceById(id)
                        .then(function(service) {
                            resolve(service.name);
                        });
                    break;
                case "servicedescription":
                    id = pageLink.split("id=")[1];
                    getServiceById(id)
                        .then(function(service) {
                            resolve(service.name + " description");
                        });
                    break;
                case "location":
                    id = pageLink.split("id=")[1];
                    getLocationById(id)
                        .then(function(location) {
                            resolve(location.name);
                        });
                    break;
                case "locationinfo":
                    id = pageLink.split("id=")[1];
                    getLocationById(id)
                        .then(function(location) {
                            resolve(location.name + " info");
                        });
                    break;
                    break;
                case "doctors":
                    resolve("Doctors");
                    break;
                case "services":
                    resolve("Services");
                    break;
                case "locations":
                    resolve("Locations");
                    break;
            }
        })
            .then(function(pageName) {
                let orInfoEl = [{
                    "loc": page,
                    "pagelink": pageLink,
                    "pagename": pageName
                }];
                resolve(orInfoEl);
            });
    });
}

// page filler functions

function fillAllDoctorsPage() {
    return new Promise(function(resolve, reject) {
        getAllDoctors()
            .then(function(doctors) {
                // print all doctors
                for (let i = 0; i < doctors.length; i++) {
                    let p = document.createElement("p");
                    p.setAttribute("class", "element-list element");
                    let doctorHref = document.createElement("a");
                    doctorHref.setAttribute("href", "/pages/doctor.html?id=" + doctors[i].id);
                    doctorHref.innerHTML = doctors[i].surname + " " + doctors[i].name;
                    p.append(doctorHref);
                    p.setAttribute("loc", doctors[i].location); // set the "loc" attribute in the p to doctor's location
                    $("#element-list").append(p);
                }
                resolve();
            })
            .catch(function(err) {
                reject(err);
            })
    });
}

function fillAllLocationsPage() {
    return new Promise(function(resolve, reject) {
        getAllLocations()
            .then(function(locations) {
                for(let i = 0; i < locations.length; i++) {
                    let p = document.createElement("p");
                    p.setAttribute("class", "element-list");
                    let locationHref = document.createElement("a");
                    locationHref.setAttribute("href", "/pages/location.html?id=" + locations[i].id);
                    locationHref.innerHTML = locations[i].name;
                    p.append(locationHref);
                    $("#element-list").append(p);
                }
                resolve();
            })
            .catch(function(err) {
                reject(err);
            });
    });
}

function fillAllServicesPage() {
    return new Promise(function(resolve, reject) {
        getAllServices()
            .then(function(services) {
                for(let i = 0; i < services.length; i++) {
                    let p = document.createElement("p");
                    p.setAttribute("class", "element-list");
                    let serviceHref = document.createElement("a");
                    serviceHref.setAttribute("href", "/pages/service.html?id=" + services[i].id);
                    serviceHref.innerHTML = services[i].name;
                    p.append(serviceHref);
                    $("#element-list").append(p);
                }
                resolve();
            })
            .catch(function(err) {
                reject(err);
            });
    });
}

function fillDoctorPage(param) {
    return new Promise(function(resolve, reject) {
        let id = parseInt(param[1].split("id=")[1]);
        getDoctorById(id)
            .then(function(doc) {
                $("#doctor-image").attr("src", "../assets/" + doc.photo);
                $("#doctor-name").text(doc.surname + " " + doc.name);
                $("#doctor-contacts").html(doc.mail + "<br>" + doc.phone);
                $("#doctor-info").html(doc.presentation);
                $("#doctor-story").html(doc.professional_story);
            })
            .then(function() {
                // get the service he works on
                let servId;
                getDoctorsServiceById(id)
                    .then(function(docServ) {
                        servId = docServ.service_id;
                        return getServiceById(servId);
                    })
                    .then(function(serv) {
                        // check if he is the responsible of the service
                        getServiceResponsibleById(servId)
                            .then(function(resp) {
                                if (resp.doctor_id === id) {
                                    $("#doctor-service").append("Responsible of service ");
                                }
                            })
                            .then(function() {
                                // add link to service
                                let serviceHref = document.createElement("a");
                                serviceHref.setAttribute("href", "/pages/service.html?id=" + serv.id);
                                serviceHref.innerHTML = serv.name;
                                $("#doctor-service").append(serviceHref);
                                resolve();
                            })
                            .catch(function(err) {
                                reject(err)
                            });
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            })
            .catch(function(err) {
                reject(err);
            });
    });
}

function fillServicePage(param) {
    return new Promise(function(resolve, reject) {
        let id = parseInt(param[1].split("id=")[1]);
        getServiceById(id)
            .then(function(serv) {
                $("#service-name").text(serv.name);
                $("#service-presentation").html(serv.presentation);
                $("#service-description-link")[0].setAttribute("href", "/pages/servicedescription.html?id=" + id);
            })
            .then(function() {
                // get doctors operating this service
                getServiceDoctorsById(id)
                    .then(function(docs) {
                        for (let i = 0; i < docs.length; i++) {
                            // get the name of every doctor
                            getDoctorById(docs[i].doctor_id)
                                .then(function(doctor) {
                                    let doctorHref = document.createElement("a");
                                    doctorHref.setAttribute("href", "/pages/doctor.html?id=" + doctor.id);
                                    doctorHref.innerHTML = doctor.surname + " " + doctor.name;
                                    $("#doctors-operating").append(doctorHref);
                                    if (i < docs.length - 1) {
                                        $("#doctors-operating").append(", ");
                                    }
                                })
                                .catch(function(err) {
                                    reject(err);
                                });
                        }
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            })
            .then(function() {
                // get the service responsible
                getServiceResponsibleById(id)
                    .then(function(resp) {
                        getDoctorById(resp.doctor_id)
                            .then(function(doctor) {
                                let respHref = document.createElement("a");
                                respHref.setAttribute("href", "/pages/doctor.html?id=" + doctor.id);
                                respHref.innerHTML = doctor.surname + " " + doctor.name;
                                $("#doctor-responsible").append(respHref);
                            })
                    })
            })
            .then(function() {
                // get the locations where this service is offered
                getLocationsOfServiceById(id)
                    .then(function(locationIds) {
                        for (let i = 0; i < locationIds.length; i++) {
                            getLocationById(locationIds[i])
                                .then(function(location) {
                                    let locationHref = document.createElement("a");
                                    locationHref.setAttribute("href", "/pages/location.html?id=" + location.id);
                                    locationHref.innerHTML = location.name;
                                    $("#locations").append(locationHref);
                                    $("#locations").append("<br>");
                                })
                                .catch(function(err) {
                                    reject(err);
                                });
                        }
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            })
            .catch(function(err) {
                reject(err);
            });
    });
}

function fillServiceDescriptionPage(param) {
    return new Promise(function(resolve, reject) {
        let id = parseInt(param[1].split("id=")[1]);
        getServiceById(id)
            .then(function(serv) {
                $("#service-name").text(serv.name);
                $("#service-presentation").html(serv.presentation);
                $("#service-description").html(serv.description);
            })
            .then(function() {
                // get doctors operating this service
                getServiceDoctorsById(id)
                    .then(function(docs) {
                        for (let i = 0; i < docs.length; i++) {
                            // get the name of every doctor
                            getDoctorById(docs[i].doctor_id)
                                .then(function(doctor) {
                                    let doctorHref = document.createElement("a");
                                    doctorHref.setAttribute("href", "/pages/doctor.html?id=" + doctor.id);
                                    doctorHref.innerHTML = doctor.surname + " " + doctor.name;
                                    $("#doctors-operating").append(doctorHref);
                                    if (i < docs.length - 1) {
                                        $("#doctors-operating").append(", ");
                                    }
                                })
                                .catch(function(err) {
                                    reject(err);
                                });
                        }
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            })
            .then(function() {
                // get the service responsible
                getServiceResponsibleById(id)
                    .then(function(resp) {
                        getDoctorById(resp.doctor_id)
                            .then(function(doctor) {
                                let respHref = document.createElement("a");
                                respHref.setAttribute("href", "/pages/doctor.html?id=" + doctor.id);
                                respHref.innerHTML = doctor.surname + " " + doctor.name;
                                $("#doctor-responsible").append(respHref);
                            })
                    })
            })
            .then(function() {
                // get the locations where this service is offered
                getLocationsOfServiceById(id)
                    .then(function(locationIds) {
                        for (let i = 0; i < locationIds.length; i++) {
                            getLocationById(locationIds[i])
                                .then(function(location) {
                                    let locationHref = document.createElement("a");
                                    locationHref.setAttribute("href", "/pages/location.html?id=" + location.id);
                                    locationHref.innerHTML = location.name;
                                    $("#locations").append(locationHref);
                                    $("#locations").append("<br>");
                                })
                                .catch(function(err) {
                                    reject(err);
                                });
                        }
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            })
            .catch(function(err) {
                reject(err);
            });
    });
}

function fillLocationPage(param) {
    return new Promise(function(resolve, reject) {
        let id = parseInt(param[1].split("id=")[1]);
        getLocationById(id)
            .then(function(loc) {
                $("#location-name").text(loc.name);
                $("#location-address").html(loc.address + "<br>" +  loc.cap);
                $("#how-to-arrive")[0].setAttribute("href", "/pages/locationinfo.html?id=" + id);
                $("#location-presentation").text(loc.presentation);
                $("#location-img-1").attr("style", "background-image: url(" + "../assets/img/locations/" + loc.photo1 + ");");
                $("#location-img-2").attr("style", "background-image: url(" + "../assets/img/locations/" + loc.photo2 + ");");
                $("#location-img-3").attr("style", "background-image: url(" + "../assets/img/locations/" + loc.photo3 + ");");
            })
            .then(function() {
                // get services available in this location
                getServicesOfLocationById(id)
                    .then(function (services) {
                        for (let i = 0; i < services.length; i++) {
                            getServiceById(services[i])
                                .then(function (service) {
                                    // create link to service page
                                    let serviceHref = document.createElement("a");
                                    serviceHref.setAttribute("href", "/pages/service.html?id=" + service.id);
                                    serviceHref.innerHTML = service.name;
                                    $("#services-available").append(serviceHref);
                                    $("#services-available").append("<br>");
                                    resolve();
                                })
                                .catch(function(err) {
                                    reject(err);
                                });
                        }
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            })
            .catch(function(err) {
                reject(err);
            });
    });
}

function fillLocationInfoPage(param) {
    return new Promise(function(resolve, reject) {
        let id = parseInt(param[1].split("id=")[1]);
        getLocationById(id)
            .then(function(loc) {
                $("#location-name").text(loc.name);
                $("#location-address").html(loc.address + "<br>" +  loc.cap);
                $("#pub-transport").text(loc.info);
                // init google map
                let uluru = {lat: loc.lat, lng: loc.lng};
                let map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 16,
                    center: uluru
                });
                let marker = new google.maps.Marker({
                    position: uluru,
                    map: map
                });
            })
            .then(function() {
                // get services available in this location
                getServicesOfLocationById(id)
                    .then(function (services) {
                        for (let i = 0; i < services.length; i++) {
                            getServiceById(services[i])
                                .then(function (service) {
                                    // create link to service page
                                    let serviceHref = document.createElement("a");
                                    serviceHref.setAttribute("href", "/pages/service.html?id=" + service.id);
                                    serviceHref.innerHTML = service.name;
                                    $("#services-available").append(serviceHref);
                                    $("#services-available").append("<br>");
                                    resolve();
                                })
                                .catch(function(err) {
                                    reject(err);
                                });
                        }
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            })
            .catch(function(err) {
                reject(err);
            });
    });
}

function fillWhoWeArePage() {
    return new Promise(function(resolve, reject) {
        getWhoWeAreInfo()
            .then(function(info) {
                info = info[0];
                $("#who-we-are").html(info.whoweare);
                $("#story").html(info.story);
                resolve();
            }).catch(function(err) {
                reject(err);
        });
    });
}


// functions to require info from DB

// generic function to require info (used to require lists)
function getInfo(fetchLoc) {
    return new Promise(function(resolve, reject) {
        fetch(fetchLoc)
            .then(function(res) {
                if (res.status >= 400) {
                    reject(res);
                }
                else {
                    resolve(res.json());
                }
            })
            .catch(function(err) {
                console.log("cannot fetch " + fetchLoc);
                reject(err);
            })
    })
}

// generic function to require info by id
function getInfoById(id, fetchLoc) {
    return new Promise(function(resolve, reject) {
        fetch(fetchLoc + id)
            .then(function(res) {
                if (res.status >= 400) {
                    reject(res);
                }
                else {
                    resolve(res.json());
                }
            })
            .catch(function(err) {
                console.log("cannot fetch " + fetchLoc);
                reject(err);
            });
    })
}

// i could have removed all these one-line functions, but i decided to keep them for code clarity
// also, if for some reason one should need to change the path of the rest entry point,
// it's easier to change it here instead of changing it all over the code above

function getAllServices() {
    return getInfo("/services");
}

function getAllLocations() {
    return getInfo("/locations");
}

function getAllDoctors() {
    return getInfo("/doctors");
}

function getDoctorsServiceById(param) {
    return getInfoById(param, "/doctorservice/");
}

function getServiceDoctorsById(param) {
    return getInfoById(param, "/servicedoctors/");
}

function getServiceResponsibleById(param) {
    return getInfoById(param, "/serviceresponsable/");
}

function getDoctorById(param) {
    return getInfoById(param, "/doctor/");
}

function getServiceById(param) {
    return getInfoById(param, "/service/");
}

function getLocationById(param) {
    return getInfoById(param, "/location/");
}

function getServicesOfLocationById(param) {
    return new Promise(function(resolve, reject) {
        getInfoById(param, "/servicesoflocation/")
            .then(function(servicesString) {
                let servicesStr = servicesString.service_ids.split(", ");
                let services = [];
                for (let i = 0; i < servicesStr.length; i++) {
                    if (servicesStr[i] != "") {
                        services[i] = parseInt(servicesStr[i]);
                    }
                }
                resolve(services);
            })
            .catch(function(err) {
                console.log("cannot fetch services of location");
                reject(err);
            });
    });
}

function getLocationsOfServiceById(param) {
    return new Promise(function(resolve, reject) {
        let id = parseInt(param);
        // get entire table
        fetch("/servicesoflocation")
            .then(function(table) {
                return table.json();
            })
            .then(function (table) {
                let k = 0;
                let locations = [];
                for (let i = 0; i < table.length; i++) {
                    let services = table[i].service_ids.split(", ");
                    // get the service id
                    for (let j = 0; j < services.length; j++) {
                        if (services[j] != "") {
                            let service = parseInt(services[j]);
                            if (service === id) {
                                // get the location
                                locations[k] = table[i].location_id;
                            }
                        }
                    }
                }
                resolve(locations);
            })
            .catch(function(err) {
                reject(err);
            });
    });
}

function getWhoWeAreInfo() {
    return getInfo("/whoweare");
}

// print the error
function printError(err) {
    let cont = $(".info-container")[0];
    cont.innerHTML = "";
    let p = document.createElement("p");
    console.log(err);

    switch(err.status) {

        case 400: // bad request
            cont.innerHTML = "<h3>A bad request was made</h3>";
            err.json()
                .then(function(err) {
                    p.innerHTML = err.error;
                    cont.append(p);
                });
            break;

        case 404: // not found
            p.innerHTML = "<h3>Unfortunately, we can't find the resource you're looking for</h3>";
            break;
        // other error codes go here

    }
    $(".info-container").append(p);
}
