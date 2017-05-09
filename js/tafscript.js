console.log("Running JS");
var getTAFbtn = document.getElementById("getTAF");
var getTAFLocbtn = document.getElementById("getTAFLoc");
var promise

getTAFbtn.addEventListener('click', function(event) {
    $('#tafResultBox').remove()
    var station = document.getElementById("tafStationID").value;
    getTAF(station);
})

getTAFLocbtn.addEventListener('click', function(event) {
    getLocation();

})

document.getElementById('tafStationID').onkeypress=function(e){
	if (e.keyCode == 13){
		document.getElementById('getTAF').click();
		document.getElementById('tafStationID').blur(); // To hide the software keyboard after user presses enter
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


function getTAF(params) {
    showLoading();
    url = "https://avwx.rest/api/taf/" + params + "?options=info,translate";
    console.log(url);
    onlineRequest(url).then(function(result) {
        result = JSON.parse(result);
        if (result["Raw-Report"] !== undefined) {
            var retrievedTAF = result["Raw-Report"];
            $("#tafMain").append(
              '<div id="airportTitle"></div>' +
              '<div id="airportInfo"></div>' +
              '<div id="RawTAF"></div>' +
              '<div id="demo"><strong></strong><br></div>'
            )
            if (result.Info["Name"].split(' ')[0] === result.Info["City"]){
              document.getElementById("airportTitle").innerHTML = result.Info["Name"];
            } else {
              document.getElementById("airportTitle").innerHTML = result.Info["City"] + " " + result.Info["Name"];

            }
            document.getElementById("airportInfo").innerHTML = "Location: " + result.Info["City"] + ", " + result.Info["State"] + ", " + result.Info["Country"] + "<br>" + "Elevation: " + Math.round(parseInt(result.Info["Elevation"])*3.28) + "ft";
            document.getElementById("RawTAF").innerHTML = retrievedTAF;
            document.getElementById("demo").innerHTML = "";
            //translateTAF(retrievedTAF);
            translateTAF(retrievedTAF);
            hideLoading();
        } else {
            addAlert("Invalid ICAO Code");
            $('#tafResultBox').remove();
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
    getTAF(position.coords.latitude + "," + position.coords.longitude);
}


function showError(error) {
  $('#tafResultBox').remove()
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
    $('#tafMain').prepend(
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

function showLoading(){
  $('#tafResultBox').remove();
  $('#tafMain').empty();
  $('#loading').empty();
  $('#loading').append(
    '<div class="sk-cube-grid">' +
      '<div class="sk-cube sk-cube1"></div>' +
      '<div class="sk-cube sk-cube2"></div>' +
      '<div class="sk-cube sk-cube3"></div>' +
      '<div class="sk-cube sk-cube4"></div>' +
      '<div class="sk-cube sk-cube5"></div>' +
      '<div class="sk-cube sk-cube6"></div>' +
      '<div class="sk-cube sk-cube7"></div>' +
      '<div class="sk-cube sk-cube8"></div>' +
      '<div class="sk-cube sk-cube9"></div>' +
    '</div>'
  );
}

function hideLoading(){
  $('#loading').empty();
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



function translateTAF(TAF) {
  //var TAF = "TAF CYOW 062338Z 0700/0724 25006KT 6SM -RA BR BKN010 OVC025 TEMPO 0700/0704 3SM SHRA BR BKN005 OVC010 FM070400 29010KT 4SM -RA BR OVC005 TEMPO 0704/0713 P6SM -DZ OVC010 FM071300 28015KT P6SM -DZ OVC012 TEMPO 0713/0716 3SM -RA BR OVC006 FM071600 28012KT P6SM -SHRA OVC020 FM071900 29010KT P6SM BKN030 BECMG 0720/0723 04010KT RMK NXT FCST BY 070300Z"
  var TAFarr = TAF.split(' ');
  var x = 0;
  var TAFsplit = [];
  var tafTranslate = {};

  for(var i=0; i < TAFarr.length; i++){
    if (TAFarr[i].indexOf('FM') != -1 || TAFarr[i].indexOf('BECMG') != -1 || TAFarr[i] === 'TEMPO'|| TAFarr[i] === 'RMK'){
      x++;
    };
    if(TAFsplit[x] == undefined){
      TAFsplit[x] = TAFarr[i];
    } else {
      TAFsplit[x] += " " + TAFarr[i];
    };
  }
  TAFsplit[0] = TAFsplit[0].replace('TAF', "");
  TAFsplit[0] = TAFsplit[0].replace('AMD', "");
  TAFsplit[0] = TAFsplit[0].slice(5);
  TAFsplit[0] = TAFsplit[0].trim();

  //Publish time and validity period
  tafTranslate.Publish = {}
  tafTranslate.Publish.Date = TAFsplit[0].slice(0,2);
  tafTranslate.Publish.Time = TAFsplit[0].slice(2,4) + ":" + TAFsplit[0].slice(4,6) + " Z";
  tafTranslate.Validity = {}
  tafTranslate.Validity.Start = {}
  tafTranslate.Validity.Start.Date = TAFsplit[0].slice(8,10);
  tafTranslate.Validity.Start.Time = TAFsplit[0].slice(10,12) + ":00 Z";
  tafTranslate.Validity.End = {};
  tafTranslate.Validity.End.Date = TAFsplit[0].slice(13,15);
  tafTranslate.Validity.End.Time = TAFsplit[0].slice(15,17) + ":00 Z";
  TAFsplit[0] = TAFsplit[0].slice(18);
  TAFsplit[0] = TAFsplit[0].trim();
  var a = 0;

  for(var i=0; i < TAFsplit.length; i++) {
    tafTranslate[a] = {};
    tafTranslate[a].FlightCat = {};
    if(TAFsplit[a].indexOf('FM') != -1) {
      tafTranslate[a].From = {};
      tafTranslate[a].From.Date = TAFsplit[a].slice(2,4);
      tafTranslate[a].From.Time = TAFsplit[a].slice(4,8);
      TAFsplit[a] = TAFsplit[a].slice(9);
    } else if(TAFsplit[a].indexOf('BECMG') != -1) {
      tafTranslate[a]['BECMG'] = {};
      tafTranslate[a]['BECMG'].Date1 = TAFsplit[a].slice(6,8);
      tafTranslate[a]['BECMG'].Time1 = TAFsplit[a].slice(8,10);
      tafTranslate[a]['BECMG'].Date2 = TAFsplit[a].slice(11,13);
      tafTranslate[a]['BECMG'].Time2 = TAFsplit[a].slice(13,15);
      TAFsplit[a] = TAFsplit[a].slice(16);
    } else if(TAFsplit[a].indexOf('TEMPO') != -1){
      tafTranslate[a]['TEMPO'] = {};
      tafTranslate[a]['TEMPO'].Date1 = TAFsplit[a].slice(6,8);
      tafTranslate[a]['TEMPO'].Time1 = TAFsplit[a].slice(8,10);
      tafTranslate[a]['TEMPO'].Date2 = TAFsplit[a].slice(11,13);
      tafTranslate[a]['TEMPO'].Time2 = TAFsplit[a].slice(13,15);
      TAFsplit[a] = TAFsplit[a].slice(16);
    } else if(TAFsplit[a].indexOf('RMK') != -1 ){
      tafTranslate[a]['Next FCST'] = {};
      tafTranslate[a]['Next FCST'].Date = TAFsplit[a].slice(-7,-5);
      tafTranslate[a]['Next FCST'].Time = TAFsplit[a].slice(-5);
    }
    //TODO:decode
    if(TAFsplit[a].split(' ')[0].indexOf('MPS') != -1 || TAFsplit[a].split(' ')[0].indexOf('KT') != -1){
      tafTranslate[a].Winds = {};
      var tafWinds = TAFsplit[a].split(' ')[0];
      TAFsplit[a] = TAFsplit[a].replace(tafWinds, "");
      if (tafWinds == "00000KT") {
          tafTranslate[a].Winds = "Calm";
      }else if (tafWinds.indexOf("VRB") != -1) {
          tafTranslate[a].Winds.Direction = "Variable";
          tafTranslate[a].Winds.Speed = tafWinds.slice(3,5);
      } else {
          tafTranslate[a].Winds.Direction = tafWinds.slice(0,3);
          tafTranslate[a].Winds.Direction = parseInt(tafTranslate[a].Winds.Direction, 10)
          function degToCompass(num) {
              var val = Math.floor((num / 22.5) + 0.5);
              var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
              return arr[(val % 16)];
          }
          tafTranslate[a].Winds.Cardinal = degToCompass(parseInt(tafTranslate[a].Winds.Direction))
          tafTranslate[a].Winds.Speed = tafWinds.slice(3,5);
          if (tafWinds.indexOf("G") != -1) {
              tafTranslate[a].Winds.Gust = tafWinds.slice(6,8);
          }
      }
      if (tafWinds.indexOf('MPS') != -1) {
        tafTranslate[a].Winds.Units = "m/s";
      } else {
        tafTranslate[a].Winds.Units = "KTS"
      }
      TAFsplit[a] = TAFsplit[a].trim();
      if (TAFsplit[a].split(' ')[0].length == 7) {
          tafTranslate[a].Winds.Var = TAFsplit[a].split(' ')[0]
          TAFsplit[a] = TAFsplit[a].replace(tafTranslate.Winds.Var, '')
          tafTranslate[a].Winds.Var = "Variable Between: " + TAFsplit[a].Winds.Var.slice(0,3) + " and " + TAFsplit[a].Winds.Var.slice(4)
      }
    }
    TAFsplit[a] = TAFsplit[a].trim()
    //Visibility
    if(TAFsplit[a].split(' ')[0].indexOf('SM') != -1 || TAFsplit[a].split(' ')[0].length == 4){
      tafTranslate[a].Visibility = {}
      tafTranslate[a].FlightCat.Visibility = 3;
      if (TAFsplit[a].indexOf("CAVOK") != -1) {
        tafTranslate[a].Visibility = "Visibility OK"
        tafTranslate[a].FlightCat.Visibility = 3;
        TAFsplit[a] = TAFsplit[a].replace("CAVOK", "")
        tafTranslate[a].Clouds = 'Clouds OK'
      } else {
        if (TAFsplit[a].indexOf("SM") != -1 && TAFsplit[a].indexOf("P") == -1) {
          tafTranslate[a].Visibility = TAFsplit[a].split('SM')[0];
          tafTranslate[a].VisibilityOtherUnit = Math.round(parseInt(tafTranslate[a].Visibility)*1.61) + 'KM'
          if ((tafTranslate[a].Visibility.indexOf("/") != -1) && (tafTranslate[a].Visibility.indexOf("1 ") != 0)) {
            tafTranslate[a].FlightCat.Visibility = 0;
          } else {
            if ((parseInt(tafTranslate[a].Visibility) <= 5) && (parseInt(tafTranslate[a].Visibility) >= 3)) {
              tafTranslate[a].FlightCat.Visibility = 2;
            } else if ((parseInt(tafTranslate[a].Visibility) < 3) && (parseInt(tafTranslate[a].Visibility) >= 1)) {
              tafTranslate[a].FlightCat.Visibility = 1;
            } else if (parseInt(tafTranslate[a].Visibility) < 1) {
              tafTranslate[a].FlightCat.Visibility = 0;
            } else {
              tafTranslate[a].FlightCat.Visibility = 3;
            }
          }
            tafTranslate[a].Visibility = tafTranslate[a].Visibility + "SM";
            //tafTranslate[a].Visibility['tafric'] = tafTranslate[a].Visibility['tafric'] + "KM"
            TAFsplit[a] = TAFsplit[a].replace(tafTranslate[a].Visibility, "");
        } else {
            tafTranslate[a].Visibility = TAFsplit[a].split(' ')[0];
            TAFsplit[a] = TAFsplit[a].replace(tafTranslate[a].Visibility, "");
            if (tafTranslate[a].Visibility.indexOf("9999") != -1) {
                tafTranslate[a].Visibility = ">10 KM";
                tafTranslate[a].VisibilityOtherUnit = ">6.2SM"
                tafTranslate[a].FlightCat.Visibility = 3;
            } else if (tafTranslate[a].Visibility.indexOf("0000") != -1) {
                tafTranslate[a].Visibility = "<50 metres";
                tafTranslate[a].VisibilityOtherUnit = "0SM"
                tafTranslate[a].FlightCat.Visibility = 0;
            } else if (tafTranslate[a].Visibility.slice(1) == "000") {
                tafTranslate[a].Visibility = tafTranslate[a].Visibility.charAt(0);
                tafTranslate[a].VisibilityOtherUnit = Math.round(parseInt(tafTranslate[a].Visibility)*0.62) + "SM";
                if ((parseInt(tafTranslate[a].Visibility) <= 8) && (parseInt(tafTranslate[a].Visibility) >= 4.8)) {
                  tafTranslate[a].FlightCat.Visibility = 2;
                } else if ((parseInt(tafTranslate[a].Visibility) < 4.8) && (parseInt(tafTranslate[a].Visibility) >= 1.6)) {
                  tafTranslate[a].FlightCat.Visibility = 1;
                } else if (parseInt(tafTranslate[a].Visibility) < 1.6) {
                  tafTranslate[a].FlightCat.Visibility = 0;
                } else {
                  tafTranslate[a].FlightCat.Visibility = 3;
                }
                tafTranslate[a].Visibility = tafTranslate[a].Visibility + "KM";
            } else if (tafTranslate[a].Visibility.indexOf("P") != -1) {
              tafTranslate[a].Visibility = ">6SM"
              tafTranslate[a].VisibilityOtherUnit = ">9.6KM"
            }
            else {
                while (tafTranslate[a].Visibility.charAt(0) === '0') {
                    tafTranslate[a].Visibility = tafTranslate[a].Visibility.substr(1);
                }
                tafTranslate[a].VisibilityOtherUnit = Math.round(parseInt(tafTranslate[a].Visibility)*3.28) + "ft";
                tafTranslate[a].Visibility = tafTranslate[a].Visibility + " metres";
                tafTranslate[a].FlightCat.Visibility = 0;
            }
          };
        };
      };
      TAFsplit[a] =TAFsplit[a].trim()


      //Clouds

      tafTranslate[a].FlightCat.Ceiling = 3;
      if (TAFsplit[a].split(' ')[0].indexOf("NSC") != -1) {
          tafTranslate[a].Clouds = "No Significant Clouds";
          TAFsplit[a] = TAFsplit[a].replace('NSC', "");
          tafTranslate[a].FlightCat.Ceiling = 3;
      } else if (TAFsplit[a].split(' ')[0].indexOf("NCD") != -1) {
          tafTranslate[a].Clouds = "No Cloud Detected";
          TAFsplit[a] = TAFsplit[a].replace('NCD', "");
          tafTranslate[a].FlightCat.Ceiling = 3;
      }
      var x = 0;
      if (TAFsplit[a].split(' ')[0].slice(0,3) in dictClouds) {
        tafTranslate[a].Clouds = {};
      }
      while (TAFsplit[a].split(' ')[0].slice(0,3) in dictClouds) {
          tafTranslate[a].Clouds[x] = {};
          tafClouds = TAFsplit[a].split(' ')[0];
          TAFsplit[a] = TAFsplit[a].replace(tafClouds, '')
          if (tafClouds.indexOf('CB') != -1) {
              tafClouds = tafClouds.slice(0,-2)
              tafTranslate[a].Clouds[x].Layer = "Cumulonimbus"
          } else if (tafClouds.indexOf('TCU') != -1) {
              tafClouds = tafClouds.slice(0,-3)
              tafTranslate[a].Clouds[x].Layer = "Towering Cumulonimbus"
          }
          tafTranslate[a].Clouds[x].Layer = dictClouds[tafClouds.slice(0,3)]
          tafTranslate[a].Clouds[x].Height = tafClouds.slice(3,6)
          while (tafTranslate[a].Clouds[x].Height.charAt(0) === '0') {
              tafTranslate[a].Clouds[x].Height = tafTranslate[a].Clouds[x].Height.substr(1);
          }
          tafTranslate[a].Clouds[x].Height += '00';
          TAFsplit[a] = TAFsplit[a].trim()

          if (((parseInt(tafTranslate[a].Clouds[x].Height) <= 3000) && (parseInt(tafTranslate[a].Clouds[x].Height) >= 1000)) && ((tafTranslate[a].Clouds[x].Layer == 'Broken Clouds') || (tafTranslate[a].Clouds[x].Layer == 'Overcast Clouds'))) {
            if (tafTranslate[a].FlightCat.Ceiling > 2) {
              tafTranslate[a].FlightCat.Ceiling = 2;
            }
          } else if (((parseInt(tafTranslate[a].Clouds[x].Height) < 1000) && (parseInt(tafTranslate[a].Clouds[x].Height) >= 500)) && ((tafTranslate[a].Clouds[x].Layer == 'Broken Clouds') || (tafTranslate[a].Clouds[x].Layer == 'Overcast Clouds'))) {
            if (tafTranslate[a].FlightCat.Ceiling > 1) {
              tafTranslate[a].FlightCat.Ceiling = 1;
            }
          } else if (((parseInt(tafTranslate[a].Clouds[x].Height) < 500)) && ((tafTranslate[a].Clouds[x].Layer == 'Broken Clouds') || (tafTranslate[a].Clouds[x].Layer == 'Overcast Clouds'))) {
            if (tafTranslate[a].FlightCat.Ceiling > 0) {
              tafTranslate[a].FlightCat.Ceiling = 0;
            }
          } else {
            if (tafTranslate[a].FlightCat.Ceiling > 3) {
              tafTranslate[a].FlightCat.Ceiling = 3;
            }
          }
          x++;
      };
    TAFsplit[a] = TAFsplit[a].trim();

    //VV
    if (TAFsplit[a].split(' ')[0].slice(0,2).indexOf('VV') != -1) {
        tafTranslate[a].VV = "";
        tafTranslate[a].FlightCat.Ceiling = 0;
        tafTranslate[a].VV = TAFsplit[a].split(' ')[0];
        TAFsplit[a] = TAFsplit[a].replace(tafTranslate[a].VV, "");
        tafTranslate[a].VV = tafTranslate[a].VV.slice(2);
        while (tafTranslate[a].VV.charAt(0) === '0') {
            tafTranslate[a].VV = tafTranslate[a].VV.substr(1);
        };
        if (tafTranslate[a].VV.indexOf('///') != -1) {
          tafTranslate[a].VV = "Unknown"
        } else {
          tafTranslate[a].VV = tafTranslate[a].VV + "00ft";
        }

    }
    TAFsplit[a] = TAFsplit[a].trim();


    a++

  }
  console.log(tafTranslate)
  console.log(TAFsplit)
  //showResult(tafTranslate);
}
  function showResult(obj) {
    $('#ResultBox').remove();
    $('#tafResults').append(
      '<div id="ResultBox" class="row box">' +
        '<div id="tafStation" class="col-md-6 tafResults"><strong>Station: </strong></div>' +
        '<div id="tafPubTime" class="col-md-6 tafResults"><strong>Publish Time: </strong></div>' +
        '<div id="tafValidity" class="col-md-6 tafResults"><strong>Validity Period: </strong></div>' +
      '</div>')
    for(var i=0; i < Object.keys(obj).length-2; i++){
      console.log(i)
      $('#tafResults').append(
        '<div id="ResultBox" class="row box">' +
          '<div id="tafModifier" class="col-md-6 tafResults"><strong></strong></div>' +
          '<div id="tafTime" class="col-md-6 tafResults"><strong>Time: </strong></div>' +
          '<div id="tafWinds" class="col-md-4 tafResults"><strong>Winds: </strong></div>' +
          '<div id="tafVisibility" class="col-md-4 tafResults"><strong>Visibility: </strong></div>' +
          '<div id="tafWx" class="col-md-4 tafResults"><strong>Weather Phenomena: </strong></div>' +
          '<div id="tafClouds" class="col-md-4 tafResults"><strong>Clouds: </strong></div>' +
          '<div id="tafFlightCat" class="col-md-4 tafResults"><strong>Flight Category: </strong></div>' +
        '</div>')
    }
    $('#tafResults').append(
      '<div id="ResultBox" class="row box">' +
        '<div id="tafRemarks" class="col-md-6 tafResults"><strong>Remarks: </strong></div>' +
      '</div>')
    hideLoading();
  }
