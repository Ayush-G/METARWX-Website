console.log("Running JS");
var getMETARbtn = document.getElementById("getMETAR");
var getMETARLocbtn = document.getElementById("getMETARLoc");
var promise

getMETARbtn.addEventListener('click', function(event) {
    $('#ResultBox').remove()
    var station = document.getElementById("stationID").value;
    getMETAR(station);
})

getMETARLocbtn.addEventListener('click', function(event) {
    getLocation();

})

document.getElementById('stationID').onkeypress=function(e){
	if (e.keyCode == 13){
		document.getElementById('getMETAR').click();
		document.getElementById('stationID').blur(); // To hide the software keyboard after user presses enter
	}
}


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
               else {
                addAlert("Unable to retrieve data.")
               }
            }

        };
        xmlhttp.open("GET", url, true);
        if (headers !== "") {
            xmlhttp.setRequestHeader(headers);
        };
        xmlhttp.send();
    });
};


function getMETAR(params) {
    url = "https://avwx.rest/api/metar/" + params + "?options=info,translate";
    console.log(url);
    onlineRequest(url).then(function(result) {
        result = JSON.parse(result);
        if (result["Raw-Report"] !== undefined) {
            var retrievedMETAR = result["Raw-Report"];
            if (result.Info["Name"].split(' ')[0] === result.Info["City"]){
              document.getElementById("airportTitle").innerHTML = result.Info["Name"];
            } else {
              document.getElementById("airportTitle").innerHTML = result.Info["City"] + " " + result.Info["Name"];

            }
            document.getElementById("airportInfo").innerHTML = "Location: " + result.Info["City"] + ", " + result.Info["State"] + ", " + result.Info["Country"] + "<br>" + "Elevation: " + Math.round(parseInt(result.Info["Elevation"])*3.28) + "ft";
            document.getElementById("RawMETAR").innerHTML = retrievedMETAR;
            document.getElementById("demo").innerHTML = "";
            translateMETAR(retrievedMETAR);
        } else {
            addAlert("Invalid ICAO Code");
            document.getElementById("airportTitle").innerHTML = "";
            document.getElementById("airportInfo").innerHTML = "";
            document.getElementById("RawMETAR").innerHTML = "";
            document.getElementById("demo").innerHTML = "";
            $('#ResultBox').remove();
        };
    }).catch(function(error) {
        addAlert(error);
    });

}

getLocation();

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        addAlert("Geolocation is not supported by this browser.");
    }
}
function showPosition(position) {
    getMETAR(position.coords.latitude + "," + position.coords.longitude);
}


function showError(error) {
  $('#ResultBox').remove()
    switch(error.code) {
        case error.PERMISSION_DENIED:
            addAlert("Please enable geolocation to get closest data.")
            break;
        case error.POSITION_UNAVAILABLE:
            addAlert("Location information is unavailable.")
            break;
        case error.TIMEOUT:
            addAlert("Location request timed out.")
            break;
        case error.UNKNOWN_ERROR:
            addAlert("An unknown error occurred.")
            break;
    }
}


function addAlert(message) {
    $('#metMain').prepend(
        '<div id="alert" class="alert alert-danger alert-dismissable fade in" role="alert">' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
            '<span aria-hidden="true">' +
              '&times;</span>' +
              '</button>' +
              message + '</div>');

    $("#alert").fadeTo(5000, 500).slideUp(500, function(){
        $("#alert").slideUp(500);
    });
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
                'OVC': 'Overcast Clouds'};


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
    $('#alert').remove()
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
    metTranslate.FlightCat = {};
    //var metMETAR = "CYWG 172000Z 30015G25KT 1 3/4SM R36/4000FT/D R06/P6000FT/N VCFC -SN BLSN BKN004 OVC040 VV007 M05/M08 A2992 REFZRA WS RWY36"
    //var metRMK = "RMK SF5NS3 SLP134 PRESRR"
    //metTranslate.RawMETAR = metMETAR;
    //Station
    metTranslate.Station = metMETAR.slice(0,4);
    metMETAR = metMETAR.slice(5);

    //Time
    metTranslate.Time = {};
    metTranslate.Time.Day = metMETAR.slice(0,2);
    metTranslate.Time.Hour = metMETAR.slice(2,4) + ":" + metMETAR.slice(4,6);
    metMETAR = metMETAR.slice(8);

    //Retrieval Time
    var d = new Date();
    if (d.getHours().toString().length == 1) {
      RTHours = "0" + d.getHours();
    } else {
      RTHours = d.getHours();
    }
    if (d.getMinutes().toString().length == 1) {
      RTMinutes = "0" + d.getMinutes();
    } else {
      RTMinutes = d.getMinutes();
    }
    metTranslate.RetrieveTime = RTHours + ":" + RTMinutes;



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
        metTranslate.Winds.Speed = metWinds.slice(3,5);
    } else {
        metTranslate.Winds.Direction = metWinds.slice(0,3);
        metTranslate.Winds.Speed = metWinds.slice(3,5);
        if (metWinds.indexOf("G") != -1) {
            metTranslate.Winds.Gust = metWinds.slice(6,8);
        }
    }
    if (metWinds.indexOf('MPS') != -1) {
      metTranslate.Winds.Units = "m/s";
    } else {
      metTranslate.Winds.Units = "KTS"
    }
    metMETAR = metMETAR.trim();
    if (metMETAR.split(' ')[0].length == 7) {
        metTranslate.Winds.Var = metMETAR.split(' ')[0]
        metMETAR = metMETAR.replace(metTranslate.Winds.Var, '')
        metTranslate.Winds.Var = "Variable Between: " + metTranslate.Winds.Var.slice(0,3) + " and " + metTranslate.Winds.Var.slice(4)
    }
    metMETAR = metMETAR.trim();

    //Visibility

    metTranslate.Visibility = {}
    metTranslate.FlightCat.Visibility = 3;
    if (metMETAR.indexOf("CAVOK") != -1) {
      metTranslate.Visibility = "Visibility OK"
      metTranslate.FlightCat.Visibility = 3;
      metMETAR = metMETAR.replace("CAVOK", "")
      metTranslate.Clouds = 'Clouds OK'
    } else {
      if (metMETAR.indexOf("SM") != -1) {
        metTranslate.Visibility = metMETAR.split('SM')[0];
        if ((metTranslate.Visibility.indexOf("/") != -1) && (metTranslate.Visibility.indexOf("1 ") != 0)) {
          metTranslate.FlightCat.Visibility = 0;
        } else {
          if ((parseInt(metTranslate.Visibility) <= 5) && (parseInt(metTranslate.Visibility) >= 3)) {
            metTranslate.FlightCat.Visibility = 2;
          } else if ((parseInt(metTranslate.Visibility) < 3) && (parseInt(metTranslate.Visibility) >= 1)) {
            metTranslate.FlightCat.Visibility = 1;
          } else if (parseInt(metTranslate.Visibility) < 1) {
            metTranslate.FlightCat.Visibility = 0;
          } else {
            metTranslate.FlightCat.Visibility = 3;
          }
        }
          metTranslate.Visibility = metTranslate.Visibility + "SM";
          //metTranslate.Visibility['Metric'] = metTranslate.Visibility['Metric'] + "KM"
          metMETAR = metMETAR.replace(metTranslate.Visibility, "");
      } else {
          metTranslate.Visibility = metMETAR.split(' ')[0];
          metMETAR = metMETAR.replace(metTranslate.Visibility, "");
          if (metTranslate.Visibility.indexOf("9999") != -1) {
              metTranslate.Visibility = ">10 KM";
              metTranslate.FlightCat.Visibility = 3;
          } else if (metTranslate.Visibility.indexOf("0000") != -1) {
              metTranslate.Visibility = "<50 metres";
              metTranslate.FlightCat.Visibility = 0;
          } else if (metTranslate.Visibility.slice(1) == "000") {
              metTranslate.Visibility = metTranslate.Visibility.charAt(0);

              if ((parseInt(metTranslate.Visibility) <= 8) && (parseInt(metTranslate.Visibility) >= 4.8)) {
                metTranslate.FlightCat.Visibility = 2;
              } else if ((parseInt(metTranslate.Visibility) < 4.8) && (parseInt(metTranslate.Visibility) >= 1.6)) {
                metTranslate.FlightCat.Visibility = 1;
              } else if (parseInt(metTranslate.Visibility) < 1.6) {
                metTranslate.FlightCat.Visibility = 0;
              } else {
                metTranslate.FlightCat.Visibility = 3;
              }

              metTranslate.Visibility = metTranslate.Visibility + "KM";
          } else {
              metTranslate.Visibility = metTranslate.Visibility + " metres";
              metTranslate.FlightCat.Visibility = 0;
          }
        };
      };
    metMETAR = metMETAR.trim();

    //RVR
    metTranslate.RVR = "";
    if ((metMETAR.split(' ')[0].indexOf('/') != -1) && (metMETAR.split(' ')[0].indexOf('R') != -1)){
        metTranslate.RVR = {};
        metTranslate.FlightCat.RVR = 0;
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
    metTranslate.Vicinity = "";
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

    metTranslate.FlightCat.Ceiling = 3;
    if (metMETAR.split(' ')[0].indexOf("NSC") != -1) {
        metTranslate.Clouds = "No Significant Clouds";
        metMETAR = metMETAR.replace('NSC', "");
        metTranslate.FlightCat.Ceiling = 3;
    } else if (metMETAR.split(' ')[0].indexOf("NCD") != -1) {
        metTranslate.Clouds = "No Cloud Detected";
        metMETAR = metMETAR.replace('NCD', "");
        metTranslate.FlightCat.Ceiling = 3;
    }
    var x = 0;
    if (metMETAR.split(' ')[0].slice(0,3) in dictClouds) {
      metTranslate.Clouds = {};
    }
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

        if (((parseInt(metTranslate.Clouds[x].Height) <= 3000) && (parseInt(metTranslate.Clouds[x].Height) >= 1000)) && ((metTranslate.Clouds[x].Layer == 'Broken Clouds') || (metTranslate.Clouds[x].Layer == 'Overcast Clouds'))) {
          if (metTranslate.FlightCat.Ceiling > 2) {
            metTranslate.FlightCat.Ceiling = 2;
          }
        } else if (((parseInt(metTranslate.Clouds[x].Height) < 1000) && (parseInt(metTranslate.Clouds[x].Height) >= 500)) && ((metTranslate.Clouds[x].Layer == 'Broken Clouds') || (metTranslate.Clouds[x].Layer == 'Overcast Clouds'))) {
          if (metTranslate.FlightCat.Ceiling > 1) {
            metTranslate.FlightCat.Ceiling = 1;
          }
        } else if (((parseInt(metTranslate.Clouds[x].Height) < 500)) && ((metTranslate.Clouds[x].Layer == 'Broken Clouds') || (metTranslate.Clouds[x].Layer == 'Overcast Clouds'))) {
          if (metTranslate.FlightCat.Ceiling > 0) {
            metTranslate.FlightCat.Ceiling = 0;
          }
        } else {
          if (metTranslate.FlightCat.Ceiling > 3) {
            metTranslate.FlightCat.Ceiling = 3;
          }
        }
        x++;
    };
    metMETAR = metMETAR.trim();

    //VV
    metTranslate.VV = "";
    if (metMETAR.split(' ')[0].slice(0,2).indexOf('VV') != -1) {
        metTranslate.FlightCat.Ceiling = 0;
        metTranslate.VV = metMETAR.split(' ')[0];
        metMETAR = metMETAR.replace(metTranslate.VV, "");
        metTranslate.VV = metTranslate.VV.slice(2);
        while (metTranslate.VV.charAt(0) === '0') {
            metTranslate.VV = metTranslate.VV.substr(1);
        };
        metTranslate.VV = metTranslate.VV + "00ft";
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
        if (metTranslate.Altimeter.indexOf('Q') != -1) {
            metTranslate.Altimeter = metTranslate.Altimeter.slice(1) + "hPa";
        } else {
            metTranslate.Altimeter = metTranslate.Altimeter.slice(1,3) + '.' + metTranslate.Altimeter.slice(3) + '"Hg'
        }
    } else {
        metTranslate.Altimeter = metMETAR.split(' ')[0];
        metMETAR = metMETAR.replace(metTranslate.Altimeter, '');
        if (metTranslate.Altimeter.indexOf('Q') != -1) {
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
    metMETAR = metMETAR.trim();
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
    if (metRMK != "") {
       while (metRMK.split(' ')[0] in dictCloudType) {
           if (metRMK.split(' ')[1] === "TR") {
               CloudDet = metRMK.split(' ')[0];
               metTranslate.CloudDet[x] = {}
               metTranslate.CloudDet[x].Type = dictCloudType[CloudDet]
               metTranslate.CloudDet[x].Coverage = 'Trace';
               metRMK = metRMK.replace(CloudDet + " TR", "");
               x++;
               metRMK = metRMK.trim();
           }
       }
    }
    metRMK = metRMK.trim();

    //Sea Level Pressure
    if (metRMK != "") {
        if (metRMK.indexOf('SLP') != -1) {
            SLPIndex = metRMK.indexOf('SLP')
            metTranslate.SLP = metRMK.slice(SLPIndex,SLPIndex+6)
            metRMK = metRMK.replace(metTranslate.SLP, '');
            metTranslate.SLP = metTranslate.SLP.slice(3);
            if ((parseInt(metTranslate.SLP.charAt(0)) <= 5)) {
                metTranslate.SLP = '10' + metTranslate.SLP.slice(0,-1) + '.' + metTranslate.SLP.slice(-1) + 'hPa';
            } else {
                metTranslate.SLP = '9' + metTranslate.SLP.slice(0,-1) + '.' + metTranslate.SLP.slice(-1) + 'hPa';
            };
        }

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
    if (metRMK != "") {
      if (metRMK.indexOf('PRESFR') != -1) {
        metRMK = metRMK.replace("PRESFR", "Pressure Falling Rapidly")
      } else if (metRMK.indexOf('PRESRR') != -1) {
        metRMK = metRMK.replace("PRESRR", "Pressure Rising Rapidly")
      } else if (metRMK.indexOf('NOSIG') != -1) {
        metRMK = metRMK.replace("NOSIG", "No Significant Weather")
      }
    }
    if (metMETAR != "") {
      if (metMETAR.indexOf('NOSIG') != -1) {
        metMETAR = metMETAR.replace("NOSIG", "No Significant Weather")
      }
    }
    //Flight Categories
    metTranslate.FlightCat.Overall = 3;
    for (var key in metTranslate.FlightCat) {
      if (metTranslate.FlightCat[key] < metTranslate.FlightCat.Overall) {
        metTranslate.FlightCat.Overall = metTranslate.FlightCat[key];
      }
    }


    metRMK = metRMK.trim();
    metTranslate.Metar = metMETAR;
    metTranslate.Remarks = metRMK;
    console.log(metTranslate);

    showResult(metTranslate);
    function showResult(obj) {
      $('#ResultBox').remove()
      $('#metResults').append(
        '<div id="ResultBox" class="row box">' +
          '<div id="metStation" class="col-md-6 metResults"><strong>Station: </strong></div>' +
          '<div id="metTime" class="col-md-6 metResults"><strong>Time: </strong></div>' +
          '<div id="metWinds" class="col-md-4 metResults"><strong>Winds: </strong></div>' +
          '<div id="metVisibility" class="col-md-4 metResults"><strong>Visibility: </strong></div>' +
          '<div id="metRVR" class="col-md-4 metResults"><strong>Runway Visual Range: </strong></div>' +
          '<div id="metWx" class="col-md-4 metResults"><strong>Weather Phenomena: </strong></div>' +
          '<div id="metClouds" class="col-md-4 metResults"><strong>Clouds: </strong></div>' +
          '<div id="metTempDew" class="col-md-4 metResults"><strong>Temperature/Dewpoint: </strong></div>' +
          '<div id="metPressure" class="col-md-4 metResults"><strong>Pressure: </strong></div>' +
          '<div id="metWS" class="col-md-4 metResults"><strong>Wind Shear: </strong></div>' +
          '<div id="metRemarks" class="col-md-4 metResults"><strong>Remarks: </strong></div>' +
          '<div id="metFlightCat" class="col-md-4 metResults"><strong>Flight Category: </strong></div>' +
        '</div>')
        printValues(obj)
        function printValues(obj) {
          for (var key in obj) {
                if (typeof obj[key] === "object") {
                    printValues(obj[key])
                }
                else {
                	if (obj[key] === "") {
                    obj[key] = undefined;
                  }
                }
          }
        }
      $('#metStation').html($('#metStation').html() + "<br>" + obj['Station']);
      if (obj.ReportMod !== undefined) {
        $('#metStation').html($('#metStation').html() + " " + obj['ReportMod']);
      }
      var metTime = new Date()
      var TimeZone = metTime.getTimezoneOffset()/60
      if (metTime.getUTCDate() !== metTime.getDate()) {
      	if (TimeZone > 0) {
      		obj.Time['Displacement'] = " (Tomorrow) ";
      	} else {
      		obj.Time['Displacement'] = " (Yesterday) ";
      	};
      } else {
      	obj.Time['Displacement'] = " (Today) ";
      };
      if ((metTime.getUTCMonth()+1).toString.length == 1) {
        TimeMonth = "0" + (metTime.getUTCMonth()+1)
      } else {
        TimeMonth = metTime.getUTCMonth()+1
      }
      $('#metTime').html($('#metTime').html()  + "<br>" + obj.Time['Day'] + "/" + (TimeMonth) + "/" + (metTime.getUTCFullYear()) + " " + obj.Time['Hour'] + 'GMT' + obj.Time['Displacement'] + ' Retrieved: ' + obj.RetrieveTime + ' Local');
      if (obj.Winds['Gust'] !== undefined) {
        $('#metWinds').html($('#metWinds').html() + "<br>From " + obj.Winds['Direction'] + " degrees" + " @ " + obj.Winds['Speed'] + " gusting to " + obj.Winds['Gust'] + " " + obj.Winds['Units']);
      } else {
      	if (obj.Winds === "Calm") {
        	$('#metWinds').html($('#metWinds').html() + "Calm");
        } else {
        	$('#metWinds').html($('#metWinds').html() + "<br>From " + obj.Winds['Direction'] + " degrees" + " @ " + obj.Winds['Speed'] + " " + obj.Winds['Units']);
        }
    }
    if (obj.Winds['Var'] !== undefined) {
      $('#metWinds').html($('#metWinds').html() + "<br>" + obj.Winds.Var + " degrees")
    }
      $('#metVisibility').html($('#metVisibility').html() + "<br>" + obj['Visibility']);
      if (obj.FlightCat.Visibility == 0) {
        $('#metVisibility').addClass('metLIFR');
      } else if (obj.FlightCat.Visibility == 2) {
        $('#metVisibility').addClass('metMVFR');
      } else if (obj.FlightCat.Visibility == 1) {
        $('#metVisibility').addClass('metIFR');
      } else {
        $('#metVisibility').addClass('metVFR');
      }
      if (obj.RVR !== undefined) {
        for (var rwy in obj['RVR']) {
          $('#metRVR').html($('#metRVR').html() + "<br>Runway: " + obj.RVR[rwy]['Runway'] + ", Visibility: " + obj.RVR[rwy]['Visibility'] + ", Tendency: " + obj.RVR[rwy]['Tendency']);
        }
        $('#metRVR').addClass('metLIFR');
      } else {
        $('#metRVR').remove()
      };
      if ((obj.Weather !== undefined) || (obj.Vicinity !== undefined) || (obj.Recent !== undefined)) {
        if (obj.Weather !== undefined) {
          for (var wx in obj['Weather']) {
            $('#metWx').html($('#metWx').html() + "<br>" + obj.Weather[wx]);
          }
        }

        if (obj.Vicinity !== undefined) {
            $('#metWx').html($('#metWx').html() + "<br>Vicinity: " + obj.Vicinity);
        }

        if (obj.Recent !== undefined) {
            $('#metWx').html($('#metWx').html() + "<br>Recent: " + obj.Recent)
        }

    } else {
      $('#metWx').remove();
    }
    if ((obj.Clouds !== undefined) || (obj.VV !== undefined)) {
      if ((obj.Clouds === "No Significant Clouds") || (obj.Clouds === "No Cloud Detected") || (obj.Clouds === "Clouds OK" )) {
        $('#metClouds').html($('#metClouds').html() + "<br>" + obj.Clouds);
      } else if (obj.Clouds[0].Layer === "Sky Clear") {
        $('#metClouds').html($('#metClouds').html() + "<br>" + obj.Clouds[0].Layer);
      } else {
        if (obj.Clouds !== undefined) {
          for (var cld in obj['Clouds']) {
          $('#metClouds').html($('#metClouds').html() + "<br>" + obj.Clouds[cld]['Layer'] + " @ " + obj.Clouds[cld]['Height'] + "ft");
          }
        }
      }

      if (obj.VV !== undefined) {
        $('#metClouds').html($('#metClouds').html() + "<br>Vertical Visibility: " + obj['VV']);
      }
      for (var cdet in obj['CloudDet']) {
        $('#metClouds').html($('#metClouds').html() + "<br>" + obj.CloudDet[cdet]['Coverage'] + " of " + obj.CloudDet[cdet]['Type']);
      }
      if (obj.FlightCat.Ceiling == 0) {
        $('#metClouds').addClass('metLIFR');
      } else if (obj.FlightCat.Ceiling == 2) {
        $('#metClouds').addClass('metMVFR');
      } else if (obj.FlightCat.Ceiling == 1) {
        $('#metClouds').addClass('metIFR');
      } else {
        $('#metClouds').addClass('metVFR');
      }
    } else {
      $('#metClouds').remove()
    }

    $('#metTempDew').html($('#metTempDew').html() + "<br>" + "Temperature: " + obj.Temperature + "<br>Dewpoint: " + obj.Dewpoint);

    $('#metPressure').html($('#metPressure').html() + "<br>" + obj.Altimeter);
    if (obj.SLP !== undefined) {
      $('#metPressure').html($('#metPressure').html() + "/" + obj.SLP);
    }

    if (obj.WindShear !== undefined) {
      $('#metWS').html($('#metWS').html() + "<br>" + obj.WindShear);
    } else {
      $('#metWS').remove()
    }

    if (obj.Remarks !== undefined) {
      $('#metRemarks').html($('#metRemarks').html() + "<br>" + obj.Remarks);
    } else if (obj.Metar !== undefined) {
    } else {
      $('#metRemarks').remove()
    }

    if (obj.Metar !== undefined) {
      $('#metRemarks').html($('#metRemarks').html() + "<br>" + obj.Metar);
    } else if (obj.Remarks !== undefined){
    } else {
      $('#metRemarks').remove()
    }

    if (obj.FlightCat.Overall == 0) {
      obj.FlightCat.Overall = "LIFR";
      $('#metFlightCat').addClass('metLIFR');
    } else if (obj.FlightCat.Overall == 1) {
      obj.FlightCat.Overall = "IFR";
      $('#metFlightCat').addClass('metIFR');
    } else if (obj.FlightCat.Overall == 2) {
      obj.FlightCat.Overall = "MVFR";
      $('#metFlightCat').addClass('metMVFR');
    } else {
      obj.FlightCat.Overall = "VFR";
      $('#metFlightCat').addClass('metVFR');
    }
    if (obj.FlightCat !== undefined) {
      $('#metFlightCat').html($('#metFlightCat').html() + "<br>" + obj.FlightCat.Overall);
    } else {
      $('#metFlightCat').remove()
    }
  }
}
