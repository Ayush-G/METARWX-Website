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


function getMETAR(userLat, userLong) {
    var url = "https://avwx.rest/api/metar/" + userLat + "," + userLong + "?options=info"
    console.log(url);
    onlineRequest(url).then(function(result) {
        result = JSON.parse(result);
        var retrievedMETAR = result["Raw-Report"];
        document.getElementById("airportTitle").innerHTML = result.Info["City"] + " " + result.Info["Name"];
        document.getElementById("airportInfo").innerHTML = "Location: " + result.Info["City"] + ", " + result.Info["State"] + ", " + result.Info["Country"] + "<br>" + "Elevation: " + Math.round(parseInt(result.Info["Elevation"])*3.28) + "ft";
        document.getElementById("RawMETAR").innerHTML = retrievedMETAR;
        translateMETAR(retrievedMETAR);
    }).catch(function(error) {
        console.log(error);
    });

}

getLocation();

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById("demo").innerHTML = "Geolocation is not supported by this browser.";
    }
}
function showPosition(position) {
    getMETAR(position.coords.latitude,position.coords.longitude);
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }
}



//Translate Script Below

var dictDescriptors = {'-': 'Light',
                    '+': 'Heavy',
                    'MI': 'Shallow',
                    'BC': 'Patches',
                    'DR': 'Drifting',
                    'BL': 'Blowing',
                    'SH': 'Shower',
                    'TS': 'Thunderstorm',
                    'PR': 'Partial',
                    'FZ': 'Freezing'};
var dictConditions = {'DZ': 'Drizzle',
                    'RA': 'Rain',
                    'SN': 'Snow',
                    'SG': 'Snow Grains',
                    'PL': 'Ice Pellets',
                    'GR': 'Hail',
                    'GS': 'Snow Pellets',
                    'IC': 'Ice Crystals',
                    'UP': 'Unknown',
                    'HZ': 'Haze',
                    'FU': 'Smoke',
                    'SA': 'Sand',
                    'DU': 'Dust',
                    'FG': 'Fog',
                    'BR': 'Mist',
                    'VA': 'Volcanic Ash',
                    'PO': 'Dust/Sand Whirls',
                    'SS': 'Sandstorm',
                    'DS': 'Duststorm',
                    'SQ': 'Squalls',
                    'FC': 'Funnel Cloud',
                    'SH': 'Showers',
                     'TS': 'Thunderstorms'};
var dictClouds = {'CLR': 'Sky Clear',
                'SKC': 'Sky Clear',
                'FEW': 'Few Clouds',
                'SCT': 'Scattered Clouds',
                'BKN': 'Broken Clouds',
                'OVC': 'Overcast Clouds',
                'CAVOK': 'Ceiling and Visibility OK'};


var dictCloudType = {'CB': 'Cumulonimbus',
                    'TCU': 'Towering Cumulus',
                    'CU': 'Cumulus',
                    'CF': 'Cumulus Fractus',
                    'SC': 'Stratocumulus',
                    'NS': 'Nimbostratus',
                    'ST': 'Stratus',
                    'SF': 'Stratus Fractus',
                    'AS': 'Altostratus',
                    'AC': 'Altocumulus',
                    'ACC': 'Altocumulus Castellanus',
                    'CI': 'Cirrus',
                    'CC': 'Cirrocumulus',
                    'FG': 'Fog',
                    'BR': 'Mist',
                    'SN': 'Snow'};

function translateMETAR(METAR) {
    //Split RMKs from METAR
    if (METAR.indexOf("RMK") === -1) {
        var rmkTemp = "";
        var metRMK = "";
        var metMETAR = METAR;
    } else {
        var rmkTemp = METAR.split("RMK");
        var metRMK = rmkTemp[1].trim();
        var metMETAR = rmkTemp[0];
    }
    var metTranslate = {};
    metTranslate.IMC = false;
    //metTranslate.RawMETAR = metMETAR;
    //Station
    metTranslate.Station = metMETAR.slice(0,4);
    metMETAR = metMETAR.slice(5);

    //Time
    metTranslate.Time = {};
    metTranslate.Time.Day = metMETAR.slice(0,2);
    metTranslate.Time.Hour = metMETAR.slice(2,4) + ":" + metMETAR.slice(4,6);
    metMETAR = metMETAR.slice(8);
    //CCA and AUTO
    if ((metMETAR.match(/CC./)) || (metMETAR.indexOf('AUTO') != -1) || (metMETAR.indexOf('AWOS') != -1)) {
        metTranslate.ReportMod = metMETAR.split(' ')[0];
        metMETAR = metMETAR.replace(metTranslate.ReportMod, "")
        metMETAR = metMETAR.trim();
    }
    //Winds
    metTranslate.Winds = {};
    var metWinds = metMETAR.split(' ')[0];
    metMETAR = metMETAR.replace(metWinds, "");
    if (metWinds == "00000KT") {
        metTranslate.Winds = "Calm";
    }else if (metWinds.indexOf("VRB") != -1) {
        metTranslate.Winds.Direction = "Variable";
        metTranslate.Winds.Speed = metWinds.slice(3);
    } else {
        metTranslate.Winds.Direction = metWinds.slice(0,3);
        metTranslate.Winds.Speed = metWinds.slice(3,5);
        if (metWinds.indexOf("G") != -1) {
            metTranslate.Winds.Gust = metWinds.slice(6,8);
        }
    }
    metMETAR = metMETAR.trim();
    if (metMETAR.split(' ')[0].length == 7) {
        metTranslate.Winds.Var = metMETAR.split(' ')[0]
        metMETAR = metMETAR.replace(metTranslate.Winds.Var, '')
        metTranslate.Winds.Var = "Variable Between: " + metTranslate.Winds.Var.slice(0,3) + " and " + metTranslate.Winds.Var.slice(4)
    }
    metMETAR = metMETAR.trim();

    //Visibility
    if (metMETAR.indexOf("SM") != -1) {
        metTranslate.Visibility = metMETAR.split('SM')[0];
        if (metMETAR.indexOf("/") == -1) {
            metTranslate.IMC = true;
        } else{
            if (parseInt(metTranslate.Visibility) <= 3.1) {
                metTranslate.IMC = true;
            }
        }
        metTranslate.Visibility = metTranslate.Visibility + "SM";
        metMETAR = metMETAR.replace(metTranslate.Visibility, "");
    } else {
        metTranslate.Visibility = metMETAR.split(' ')[0];
        metMETAR = metMETAR.replace(metTranslate.Visibility, "");
        if (metTranslate.Visibility.indexOf("9999") != -1) {
            metTranslate.Visibility = ">10 KM";
        } else if (metTranslate.Visibility.indexOf("0000") != -1) {
            metTranslate.Visibility = "<50 metres";
        } else if (metTranslate.Visibility.slice(1) == "000") {
            metTranslate.Visibility = metTranslate.Visibility.charAt(0) + "KM";
        } else {
            metTranslate.Visibility = metTranslate.Visibility + " metres";
        }
    };
    metMETAR = metMETAR.trim();

    //RVR
    metTranslate.RVR = "";
    if (metMETAR.split(' ')[0].indexOf('/') != -1) {
        metTranslate.RVR = {};
        metTranslate.IMC = true;
        var x = 0;
        do {
            metTranslate.RVR[x] = {}
            metTranslate.RVR[x].Runway = metMETAR.split('/')[0].slice(1);
            metTranslate.RVR[x].Visibility = metMETAR.split('/')[1];
            if (metTranslate.RVR[x].Visibility.indexOf('V') != -1) {
                metTranslate.RVR[x].Visibility = "Between " + metTranslate.RVR[x].Visibility.slice(0,4) + " and " + metTranslate.RVR[x].Visibility.slice(5);
            }
            if (metTranslate.RVR[x].Visibility.indexOf('P') != -1) {
                metTranslate.RVR[x].Visibility = metTranslate.RVR[x].Visibility.replace('P', 'Greater than ');
            }
            metTranslate.RVR[x].Tendency = metMETAR.split('/')[2].split(' ')[0];
            switch(metTranslate.RVR[x].Tendency) {
                case "U":
                    metTranslate.RVR[x].Tendency = "Upwards"
                    break;
                case "N":
                    metTranslate.RVR[x].Tendency = "No Change"
                    break;
                case "D":
                    metTranslate.RVR[x].Tendency = "Downwards"
                    break;
            }
            metMETAR = metMETAR.split(/ (.+)/)[1];
            x++;
        }
        while (metMETAR.split(' ')[0].indexOf('/') != -1);
    }

    //Vicinity Wx
    metTranslate.Vicinity = "None";
    if ((metMETAR.split(' ')[0].indexOf('VC') != -1) && (metMETAR.split(' ')[0].indexOf('OVC') == -1)) {
        metTranslate.Vicinity = metMETAR.split(' ')[0];
        metMETAR = metMETAR.replace(metTranslate.Vicinity, "");
        metTranslate.Vicinity = metTranslate.Vicinity.slice(2);
        if (metTranslate.Vicinity.length == 4) {
            metTranslate.Vicinity = dictDescriptors[metTranslate.Vicinity.slice(0,2)] + ' ' + dictConditions[metTranslate.Vicinity.slice(2)]
        } else {
            metTranslate.Vicinity = dictConditions[metTranslate.Vicinity]
        }
    } else if (metRMK.indexOf('VC') != -1) {
        var VCIndex = metRMK.indexOf('VC');
        metTranslate.Vicinity = metRMK.slice(VCIndex).split(/ (.+)/)[0]
        metTranslate.Vicinity = metTranslate.Vicinity.slice(2);
        if (metTranslate.Vicinity.length == 4) {
            metTranslate.Vicinity = dictDescriptors[metTranslate.Vicinity.slice(0,2)] + ' ' + dictConditions[metTranslate.Vicinity.slice(2)]
        } else {
            metTranslate.Vicinity = dictConditions[metTranslate.Vicinity]
        }
    }
    metMETAR = metMETAR.trim()
    //Present Weather
    metTranslate.Weather = ""
    if ((metMETAR.split(' ')[0].slice(0,1) in dictDescriptors) || (metMETAR.split(' ')[0].slice(-2) in dictConditions)) {
        metTranslate.Weather = {};
        var x = 0;
        do {
            var metWeather = metMETAR.split(' ')[0];
            metMETAR = metMETAR.replace(metWeather, "");
            metMETAR = metMETAR.trim();
            if (metWeather.slice(0,1) in dictDescriptors) {
                metTranslate.Weather[x] = dictDescriptors[metWeather.slice(0,1)];
                if (metWeather.slice(1,3) in dictDescriptors) {
                    metTranslate.Weather[x] += " " + dictDescriptors[metWeather.slice(1,3)];
                }
                metTranslate.Weather[x] += " " + dictConditions[metWeather.slice(-2)];
            }else if (metWeather.slice(0,2) in dictDescriptors) {
                metTranslate.Weather[x] = dictDescriptors[metWeather.slice(0,2)];
                metTranslate.Weather[x] += " " + dictConditions[metWeather.slice(-2)];
            }else {
                metTranslate.Weather[x] = dictConditions[metWeather.slice(-2)];
            }
            x++;
            metWeather = ""
        } while ((metMETAR.split(' ')[0].slice(0,1) in dictDescriptors) || (metMETAR.split(' ')[0].slice(-2) in dictConditions))
    }
    metMETAR = metMETAR.trim()
    //Clouds
    metTranslate.Clouds = {};
    if (metMETAR.split(' ')[0].indexOf("NSC") != -1) {
        metTranslate.Clouds = "No Significant Clouds";
        metMETAR = metMETAR.replace('NSC', "");
    } else if (metMETAR.split(' ')[0].indexOf("NCD") != -1) {
        metTranslate.Clouds = "No Cloud Detected";
        metMETAR = metMETAR.replace('NCD', "");
    }
    var x = 0;
    while (metMETAR.split(' ')[0].slice(0,3) in dictClouds) {
        metTranslate.Clouds[x] = {};
        metClouds = metMETAR.split(' ')[0];
        metMETAR = metMETAR.replace(metClouds, '')
        if (metClouds.indexOf('CB') != -1) {
            metClouds = metClouds.slice(0,-2)
            metTranslate.Clouds[x].Layer = "Cumulonimbus"
        } else if (metClouds.indexOf('TCU') != -1) {
            metClouds = metClouds.slice(0,-3)
            metTranslate.Clouds[x].Layer = "Towering Cumulonimbus"
        }
        metTranslate.Clouds[x].Layer = dictClouds[metClouds.slice(0,3)]
        metTranslate.Clouds[x].Height = metClouds.slice(3,6)
        while (metTranslate.Clouds[x].Height.charAt(0) === '0') {
            metTranslate.Clouds[x].Height = metTranslate.Clouds[x].Height.substr(1);
        }
        metTranslate.Clouds[x].Height += '00';
        metMETAR = metMETAR.trim()
        if ((parseInt(metTranslate.Clouds[x].Height) < 1500) && ((metTranslate.Clouds[x].Layer === "Broken Clouds") || (metTranslate.Clouds[x].Layer === "Overcast Clouds"))) {
            metTranslate.IMC = true;
        }
        x++;
    };
    metMETAR = metMETAR.trim();

    //VV
    metTranslate.VV = "";
    if (metMETAR.split(' ')[0].slice(0,2).indexOf('VV') != -1) {
        metTranslate.IMC = true;
        metTranslate.VV = metMETAR.split(' ')[0];
        metMETAR = metMETAR.replace(metTranslate.VV, "");
        metTranslate.VV = metTranslate.VV.slice(2);
        while (metTranslate.VV.charAt(0) === '0') {
            metTranslate.VV = metTranslate.VV.substr(1);
        };
        metTranslate.VV = metTranslate.VV + "00 ft";
    }
    metMETAR = metMETAR.trim();

    //Temperature and Dewpoint
    metTempDew = metMETAR.split(' ')[0];
    metMETAR = metMETAR.replace(metTempDew, "");
    metTranslate.Temperature = metTempDew.split('/')[0];
    metTranslate.Temperature = metTranslate.Temperature.replace('M', '-') + 'C';
    metTranslate.Dewpoint = metTempDew.split('/')[1];
    metTranslate.Dewpoint = metTranslate.Dewpoint.replace('M', '-') + 'C';
    metMETAR = metMETAR.trim();

    //Altimeter
    if (metMETAR.length == 5) {
        metTranslate.Altimeter = metMETAR;
        metMETAR = metMETAR.replace(metTranslate.Altimeter, '');
        if (metMETAR.indexOf('Q') != -1) {
            metTranslate.Altimeter = metTranslate.Altimeter.slice(1) + "hPa";
        } else {
            metTranslate.Altimeter = metTranslate.Altimeter.slice(1,3) + '.' + metTranslate.Altimeter.slice(3) + '"Hg'
        }
    } else {
        metTranslate.Altimeter = metMETAR.split(' ')[0];
        metMETAR = metMETAR.replace(metTranslate.Altimeter, '');
        if (metMETAR.indexOf('Q') != -1) {
            metTranslate.Altimeter = metTranslate.Altimeter.slice(1) + "hPa";
        } else {
            metTranslate.Altimeter = metTranslate.Altimeter.slice(1,3) + '.' + metTranslate.Altimeter.slice(3) + '"Hg'
        }
    }
    metMETAR = metMETAR.trim();

    //Recent Wx
    metTranslate.Recent = ""
    if (metMETAR.split(' ')[0].indexOf('RE') != -1) {
       metTranslate.Recent =  metMETAR.split(' ')[0];
       metMETAR = metMETAR.replace(metTranslate.Recent, '')
       metTranslate.Recent = metTranslate.Recent.slice(2)
       if (metTranslate.Recent.length == 4) {
            metTranslate.Recent = dictDescriptors[metTranslate.Recent.slice(0,2)] + ' ' + dictConditions[metTranslate.Recent.slice(2)]
        } else {
            metTranslate.Recent = dictConditions[metTranslate.Recent]
        }
    }
    metMETAR = metMETAR.trim();

    //Wind Shear
    if (metMETAR.split(' ')[0].indexOf('WS') != -1) {
        metTranslate.WindShear = metMETAR.split(' ')[0] + ' ' + metMETAR.split(' ')[1];
        metMETAR = metMETAR.replace(metTranslate.WindShear, '');
        if (metTranslate.WindShear.indexOf('ALL RWY') != -1) {
            metTranslate.WindShear = "All Runways";
        } else {
            metTranslate.WindShear = "Runway " + metTranslate.WindShear.slice(6);
        }
    } else metTranslate.WindShear = "";

    //Remarks
    metRMK = metRMK.replace('RMK', '');
    metRMK = metRMK.trim();
    //Cloud Details
    if (metRMK != "") {
        metRMK = metRMK.trim();
        var CloudDet = metRMK.split(' ')[0]
        metRMK = metRMK.replace(CloudDet, '');
        var x = 0;
        metTranslate.CloudDet = {}
        while (CloudDet.split(/\d+/)[x] in dictCloudType) {
            metTranslate.CloudDet[x] = {}
            metTranslate.CloudDet[x].Type = dictCloudType[CloudDet.split(/\d+/)[x]]
            metTranslate.CloudDet[x].Coverage = CloudDet.split(/\D+/)[x+1] + '/8';
            x++;
            }
    }
    metRMK = metRMK.trim();

    //Sea Level Pressure
    if (metRMK != "") {
        if (metRMK.indexOf('SLP') != -1) {
            SLPIndex = metRMK.indexOf('SLP')
            metTranslate.SLP = metRMK.slice(SLPIndex,SLPIndex+6)
        } else {
            metTranslate.SLP = metRMK.split(' ')[metRMK.split(' ').length-1]
        }
        metRMK = metRMK.replace(metTranslate.SLP, '');
        metTranslate.SLP = metTranslate.SLP.slice(3);
        if ((parseInt(metTranslate.SLP.charAt(0)) <= 5)) {
            metTranslate.SLP = '10' + metTranslate.SLP.slice(0,-1) + '.' + metTranslate.SLP.slice(-1) + 'hPa';
        } else {
            metTranslate.SLP = '9' + metTranslate.SLP.slice(0,-1) + '.' + metTranslate.SLP.slice(-1) + 'hPa';
        };
    };
    metRMK = metRMK.trim();

    //Density Altitude
    metTranslate.DensityAlt = "";
    if (metRMK != "") {
        if (metRMK.split(' ')[metRMK.split(' ').length-1].indexOf('FT') != -1) {
            metTranslate.DensityAlt = metRMK.split(' ')[metRMK.split(' ').length-1];
            metRMK = metRMK.replace('DENSITY', "");
            metRMK = metRMK.replace('ALTITUDE', "");
            metRMK = metRMK.replace('ALT', "");
            metRMK = metRMK.replace(metTranslate.DensityAlt, "");
        }
    }
    metRMK = metRMK.trim();
    metTranslate.Metar = metMETAR;
    metTranslate.Remarks = metRMK;
    console.log(metTranslate);
    printValues(metTranslate);
    function printValues(obj) {
        for (var key in obj) {
            if (typeof obj[key] === "object") {
                document.getElementById('demo').innerHTML += "<strong>" + key + "</strong>" +"<br>"
                printValues(obj[key]);
            } else {
                document.getElementById('demo').innerHTML += key + ': ' + obj[key] + "<br>"
            }
        }
    }


}





