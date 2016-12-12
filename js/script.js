document.getElementById("a").innerHTML = "JS Initialized";
console.log("Running JS");

var promise

function onlineRequest(url, headers="") {
    var xmlhttp = new XMLHttpRequest();
    var userInformation = "";
    return new Promise(function(resolve, reject) {
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
               if (xmlhttp.status == 200) {
                   var Response = (xmlhttp.responseText);
                   resolve(Response);
               }
               else if (xmlhttp.status == 400) {
                  alert('There was an error 400');
               }
               else {
                   alert('something else other than 200 was returned');
               }
            }

        };
        xmlhttp.open("GET", url, true);
        if (headers !== "") {
            xmlhttp.setRequestHeader('X-Mashape-Key', headers);
        };
        xmlhttp.send();
    });
};


onlineRequest("http://www.freegeoip.net/json/99.245.2.227").then(function(result) {
    result = JSON.parse(result);
    console.log(result);
    getMETAR(result.latitude, result.longitude);
}).catch(function(){
    console.log("Error!");
});

function getMETAR(userLat, userLong) {
    var url = "http://avwx.rest/api/metar/" + userLat + "," + userLong + "?options=info"
    console.log(url);
    onlineRequest(url).then(function(result) {
        result = JSON.parse(result);
        var METAR = result["Raw-Report"] + " " + result["Remarks"];
        document.getElementById("airportTitle").innerHTML = result.Info["City"] + " " + result.Info["Name"];
        document.getElementById("airportInfo").innerHTML = "Location: " + result.Info["City"] + ", " + result.Info["State"] + ", " + result.Info["Country"] + "<br>" + "Elevation: " + Math.round(parseInt(result.Info["Elevation"])*3.28) + "ft";
        document.getElementById("RawMETAR").innerHTML = "<strong>RAW METAR: </strong>" + METAR;
    }).catch(function() {
        console.log("Error!");
    });
}


