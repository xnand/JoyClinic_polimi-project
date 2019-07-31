$(document).ready(function() {

    // generate filter/sorting buttons
    // makes a query on the locations on DB to set the text of the button
    // the same location is passed to the function to filter by the desired location
    new Promise(function(resolve) {
        // a button to have back displayed back all the doctors
        let p = document.createElement("p");
        p.setAttribute("class", "btn restore-all-doctors");
        p.innerHTML = "All doctors";
        $("#btn-container").append(p);
        // sorting button
        p = document.createElement("p");
        p.setAttribute("class", "btn sort-btn");
        p.setAttribute("sort-by", "alphabetic");
        p.innerHTML = "Sort by alphabetic order";
        $("#btn-container").append(p);
        resolve();
    }).then(function() {
        getAllLocations()
            .then(function(locations) { // location filters
                for(let i = 0; i < locations.length; i++) {
                    let p = document.createElement("p");
                    p.setAttribute("class", "btn location-filter-btn");
                    p.setAttribute("id", locations[i].name.split(" - ")[0]);
                    p.innerHTML = "Filter for location " + locations[i].name.split(" - ")[0];
                    // $("#btn-container").append(p);
                    $(".dropdown-content").append(p);
                }
            })
            .then(function() {
                $(".location-filter-btn").click(function() {
                    filterByLocation($(this)[0].id);
                });
                $(".sort-btn").click(function() {
                    sortByAlphabeticOrder();
                });
                $(".restore-all-doctors").click(function() {
                    restoreAllDoctors();
                })
            });
        });
});


// filter function
// just set the "display:none" attribute on non-wanted elements
function filterByLocation(selectedLocation) {
    $("#list-title").text("Doctors in " + selectedLocation);
    $(".element").map(function() {
        let loc = this.getAttribute("loc");
        if (loc !== selectedLocation) {
            this.setAttribute("style", "display:none;");
        }
        else {
            this.setAttribute("style", "");
        }
    })
}

// sorting function
function sortByAlphabeticOrder() {
    let list = $(".element");
    list.sort(function(a, b) {
        return a.innerText.toLowerCase().localeCompare(b.innerText.toLowerCase()); // sort the elements by doctor's surname-name
    });
    $("#element-list").html(""); // empty the div and add back all the elements in order
    for (let i = 0; i < list.length; i++) {
        $("#element-list").append(list[i]);
    }
}

// makes the query on DB for the locations
function getAllLocations() {
    return new Promise(function(resolve, reject) {
        fetch("/locations")
            .then(function(res) {
                if (res.status >= 400) {
                    reject(res);
                }
                else {
                    resolve(res.json());
                }
            })
            .catch(function(err) {
                reject(err);
            })
    })
}

// makes all the doctors visible
function restoreAllDoctors() {
    $("#list-title").text("Complete list of our doctors");
    $(".element").map(function() {
        if (this.getAttribute("style") === "display:none;") {
            this.setAttribute("style", "");
        }
    })
}

function myFunction() {
    document.getElementById('myDropdown').classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {

        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}
